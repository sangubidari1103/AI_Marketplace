import { Router } from 'express'
import { supabase } from '../index.js'

const router = Router()

// GET /api/models - List models with filters
router.get('/', async (req, res, next) => {
    try {
        const {
            task_type,
            framework,
            hardware,
            pricing_model,
            min_trust,
            max_price,
            sort = 'trust_score',
            order = 'desc',
            limit = 20,
            offset = 0,
            featured
        } = req.query

        let query = supabase
            .from('public_models')
            .select('*', { count: 'exact' })

        if (task_type) query = query.eq('task_type', task_type)
        if (framework) query = query.eq('latest_framework', framework)
        if (hardware) query = query.contains('supported_hardware', [hardware])
        if (pricing_model) query = query.eq('pricing_model', pricing_model)
        if (min_trust) query = query.gte('trust_score', parseInt(min_trust))
        if (max_price && pricing_model !== 'free') query = query.lte('price_value', parseFloat(max_price))
        if (featured === 'true') query = query.eq('is_featured', true)

        const validSorts = ['trust_score', 'total_deployments', 'average_rating', 'created_at', 'price_value']
        const sortCol = validSorts.includes(sort) ? sort : 'trust_score'
        const sortOrder = order === 'asc' ? { ascending: true } : { ascending: false }

        query = query.order(sortCol, sortOrder).range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1)

        const { data, error, count } = await query

        if (error) throw error

        res.json({
            data: data || [],
            pagination: {
                total: count || 0,
                limit: parseInt(limit),
                offset: parseInt(offset),
                hasMore: (parseInt(offset) + parseInt(limit)) < (count || 0)
            }
        })
    } catch (err) {
        next(err)
    }
})

// GET /api/models/:id - Get single model with details
router.get('/:id', async (req, res, next) => {
    try {
        const { id } = req.params

        // Get model with creator info
        const { data: model, error: modelError } = await supabase
            .from('public_models')
            .select('*')
            .eq('id', id)
            .single()

        if (modelError || !model) {
            return res.status(404).json({ error: 'Model not found' })
        }

        // Get all versions
        const { data: versions } = await supabase
            .from('model_versions')
            .select('*')
            .eq('model_id', id)
            .eq('status', 'published')
            .order('published_at', { ascending: false })

        // Get benchmarks for latest version
        const latestVersion = versions?.[0]
        let benchmarks = []
        if (latestVersion) {
            const { data } = await supabase
                .from('benchmarks')
                .select('*')
                .eq('model_version_id', latestVersion.id)
                .eq('verified', true)
            benchmarks = data || []
        }

        // Get pricing
        const { data: pricing } = await supabase
            .from('pricing')
            .select('*')
            .eq('model_id', id)
            .eq('is_active', true)

        // Get trust score
        const { data: trust } = await supabase
            .from('trust_scores')
            .select('*')
            .eq('model_id', id)
            .single()

        // Get recent reviews
        const { data: reviews } = await supabase
            .from('reviews')
            .select('*, users(full_name, avatar_url)')
            .eq('model_id', id)
            .order('created_at', { ascending: false })
            .limit(10)

        res.json({
            model,
            versions: versions || [],
            benchmarks,
            pricing: pricing || [],
            trust,
            reviews: reviews || []
        })
    } catch (err) {
        next(err)
    }
})

// GET /api/models/:id/versions - Get all versions for a model
router.get('/:id/versions', async (req, res, next) => {
    try {
        const { id } = req.params
        const { status } = req.query

        let query = supabase
            .from('model_versions')
            .select('*')
            .eq('model_id', id)

        if (status) query = query.eq('status', status)
        else query = query.neq('status', 'draft')

        query = query.order('created_at', { ascending: false })

        const { data, error } = await query

        if (error) throw error

        res.json({ data: data || [] })
    } catch (err) {
        next(err)
    }
})

export default router