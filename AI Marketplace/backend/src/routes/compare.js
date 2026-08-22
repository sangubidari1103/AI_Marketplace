import { Router } from 'express'
import { supabase } from '../index.js'

const router = Router()

// POST /api/compare - Compare multiple models
router.post('/', async (req, res, next) => {
    try {
        const { model_ids } = req.body

        if (!model_ids || !Array.isArray(model_ids) || model_ids.length < 2 || model_ids.length > 4) {
            return res.status(400).json({ error: 'Provide 2-4 model IDs to compare' })
        }

        // Fetch models with details
        const { data: models, error } = await supabase
            .from('public_models')
            .select(`
                id, name, creator_name, task_type, description,
                latest_version, latest_framework, min_vram_mb, supported_hardware,
                pricing_model, price_value, price_currency, billing_unit, free_tier_limit,
                trust_score, total_deployments, average_rating, review_count
            `)
            .in('id', model_ids)

        if (error) throw error

        if (!models || models.length !== model_ids.length) {
            return res.status(404).json({ error: 'One or more models not found' })
        }

        // Get benchmarks for each model's latest version
        const modelIdsWithVersions = models.filter(m => m.latest_version).map(m => ({
            id: m.id,
            version_id: m.latest_version
        }))

        let benchmarks = {}
        if (modelIdsWithVersions.length > 0) {
            const versionIds = modelIdsWithVersions.map(m => m.version_id)
            const { data } = await supabase
                .from('benchmarks')
                .select('*')
                .in('model_version_id', versionIds)
                .eq('verified', true)

            if (data) {
                for (const b of data) {
                    const modelInfo = modelIdsWithVersions.find(m => m.version_id === b.model_version_id)
                    if (modelInfo) {
                        if (!benchmarks[modelInfo.id]) benchmarks[modelInfo.id] = []
                        benchmarks[modelInfo.id].push(b)
                    }
                }
            }
        }

        // Get pricing for each model
        const { data: pricing } = await supabase
            .from('pricing')
            .select('*')
            .in('model_id', model_ids)
            .eq('is_active', true)

        // Get trust scores
        const { data: trustScores } = await supabase
            .from('trust_scores')
            .select('*')
            .in('model_id', model_ids)

        // Combine all data
        const comparison = models.map(model => ({
            ...model,
            benchmarks: benchmarks[model.id] || [],
            pricing: pricing?.find(p => p.model_id === model.id) || null,
            trust: trustScores?.find(t => t.model_id === model.id) || null
        }))

        // Determine winners for each metric
        const metrics = {
            trust_score: { higher: true },
            average_rating: { higher: true },
            total_deployments: { higher: true },
            price_value: { higher: false }
        }

        const winners = {}
        for (const [metric, { higher }] of Object.entries(metrics)) {
            const validModels = comparison.filter(m => m[metric] != null)
            if (validModels.length > 0) {
                const winner = higher
                    ? validModels.reduce((a, b) => a[metric] > b[metric] ? a : b)
                    : validModels.reduce((a, b) => a[metric] < b[metric] ? a : b)
                winners[metric] = winner.id
            }
        }

        res.json({
            models: comparison,
            winners,
            summary: {
                count: comparison.length,
                tasks: [...new Set(comparison.map(m => m.task_type))],
                priceRange: {
                    min: Math.min(...comparison.filter(m => m.pricing_model !== 'free').map(m => m.price_value || Infinity)),
                    max: Math.max(...comparison.filter(m => m.pricing_model !== 'free').map(m => m.price_value || -Infinity))
                }
            }
        })
    } catch (err) {
        next(err)
    }
})

export default router