import { Router } from 'express'
import { supabase } from '../index.js'

const router = Router()

// GET /api/trust/:id - Get trust score and details for a model
router.get('/:id', async (req, res, next) => {
    try {
        const { id } = req.params

        // Get trust score
        const { data: trust, error: trustError } = await supabase
            .from('trust_scores')
            .select('*')
            .eq('model_id', id)
            .single()

        if (trustError || !trust) {
            return res.status(404).json({ error: 'Trust score not found' })
        }

        // Get verifications (from benchmarks + custom verification table if exists)
        const { data: verifications } = await supabase
            .from('benchmarks')
            .select('dataset_name, metric_name, metric_value, hardware, verified, verified_at, created_at')
            .eq('model_version_id', (
                supabase.from('model_versions').select('id').eq('model_id', id).eq('status', 'published').order('published_at', { ascending: false }).limit(1)
            ))
            .eq('verified', true)

        // Get SBOM from latest version
        const { data: latestVersion } = await supabase
            .from('model_versions')
            .select('dependencies, framework, framework_version')
            .eq('model_id', id)
            .eq('status', 'published')
            .order('published_at', { ascending: false })
            .limit(1)
            .single()

        // Get review stats
        const { data: reviewStats } = await supabase
            .from('reviews')
            .select('rating, verified_purchase')
            .eq('model_id', id)

        const avgRating = reviewStats?.length
            ? reviewStats.reduce((sum, r) => sum + r.rating, 0) / reviewStats.length
            : 0

        const verifiedPurchases = reviewStats?.filter(r => r.verified_purchase).length || 0

        res.json({
            trust: {
                overall: trust.overall_score,
                breakdown: {
                    benchmarks: trust.benchmark_score,
                    verification: trust.verification_score,
                    community: trust.community_score,
                    security: trust.security_score
                },
                details: {
                    benchmarks: trust.benchmark_details,
                    verification: trust.verification_details,
                    community: trust.community_details,
                    security: trust.security_details
                },
                lastCalculated: trust.last_calculated_at
            },
            verifications: (verifications || []).map(v => ({
                type: 'Benchmark',
                dataset: v.dataset_name,
                metric: `${v.metric_name}: ${v.metric_value}`,
                hardware: v.hardware,
                status: v.verified ? 'Passed' : 'Pending',
                date: v.verified_at || v.created_at
            })),
            sbom: latestVersion?.dependencies ? Object.entries(latestVersion.dependencies).map(([name, version]) => `${name}@${version}`) : [],
            community: {
                reviewCount: reviewStats?.length || 0,
                averageRating: Math.round(avgRating * 10) / 10,
                verifiedPurchases
            }
        })
    } catch (err) {
        next(err)
    }
})

export default router