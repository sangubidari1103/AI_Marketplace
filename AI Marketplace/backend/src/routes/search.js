import { Router } from 'express'
import { supabase } from '../index.js'

const router = Router()

// GET /api/search - Search models
router.get('/', async (req, res, next) => {
    try {
        const { q, task_type, hardware, pricing_model, min_trust, limit = 20 } = req.query

        if (!q || q.trim().length < 2) {
            return res.json({ data: [], message: 'Query too short' })
        }

        const searchTerm = q.trim()

        // Use text search on models
        let query = supabase
            .from('public_models')
            .select('*')
            .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,creator_name.ilike.%${searchTerm}%,tags.cs.{${searchTerm}}`)

        if (task_type) query = query.eq('task_type', task_type)
        if (hardware) query = query.contains('supported_hardware', [hardware])
        if (pricing_model) query = query.eq('pricing_model', pricing_model)
        if (min_trust) query = query.gte('trust_score', parseInt(min_trust))

        query = query.order('trust_score', { ascending: false }).limit(parseInt(limit))

        const { data, error } = await query

        if (error) throw error

        res.json({ data: data || [] })
    } catch (err) {
        next(err)
    }
})

// GET /api/search/suggestions - Get search suggestions
router.get('/suggestions', async (req, res, next) => {
    try {
        const { q } = req.query

        if (!q || q.trim().length < 2) {
            return res.json({ data: [] })
        }

        const searchTerm = q.trim()

        const { data, error } = await supabase
            .from('public_models')
            .select('id, name, task_type')
            .or(`name.ilike.%${searchTerm}%,tags.cs.{${searchTerm}}`)
            .limit(10)

        if (error) throw error

        res.json({ data: data || [] })
    } catch (err) {
        next(err)
    }
})

export default router