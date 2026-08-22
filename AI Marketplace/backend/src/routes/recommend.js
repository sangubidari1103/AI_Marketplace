import { Router } from 'express'
import { supabase } from '../index.js'
import { getNemotronRecommendation, extractRequirements, testAiHealth } from '../services/nemotron.js'

const router = Router()

// POST /api/recommend - Get AI recommendation
router.post('/', async (req, res, next) => {
    try {
        const { requirement, task_type, budget, hardware, latency_ms, accuracy_priority } = req.body

        if (!requirement || requirement.trim().length < 10) {
            return res.status(400).json({ error: 'Requirement must be at least 10 characters' })
        }

        // Step 1: Extract structured requirements from natural language using Nemotron
        const extracted = await extractRequirements(requirement)
        const extractedRequirements = {
            task_type: extracted.task_type,
            budget: extracted.budget,
            hardware: extracted.hardware,
            latency: extracted.latency,
            languages: extracted.languages,
            accuracy_requirement: extracted.accuracy_requirement,
            deployment_target: extracted.deployment_target,
            context_window: extracted.context_window,
            use_case: extracted.use_case,
            other_requirements: extracted.other_requirements
        }

        // Track if AI was used for extraction
        const extractionAiPowered = extracted._aiPowered === true
        const extractionFallbackReason = extracted._fallbackReason || null

        // Step 2: Build Supabase query from extracted requirements
        let query = supabase
            .from('public_models')
            .select(`
                id, name, creator_name, task_type, description,
                latest_version, latest_framework, min_vram_mb, supported_hardware,
                pricing_model, price_value, price_currency, billing_unit, free_tier_limit,
                trust_score, total_deployments, average_rating
            `)
            .eq('is_public', true)

        // Apply filters from extracted requirements
        if (extractedRequirements.task_type) {
            query = query.eq('task_type', extractedRequirements.task_type)
        }

        if (extractedRequirements.hardware) {
            query = query.contains('supported_hardware', [extractedRequirements.hardware])
        }

        if (extractedRequirements.budget === 'free') {
            query = query.eq('pricing_model', 'free')
        } else if (extractedRequirements.budget === 'low') {
            query = query.or('pricing_model.eq.free,price_value.lte.0.01')
        } else if (extractedRequirements.budget === 'medium') {
            query = query.or('pricing_model.eq.free,price_value.lte.0.1')
        }

        // Step 3: Get top candidates (limit to 10 for Nemotron context)
        // Only use candidates matching the requested task_type - NEVER cross-task fallback
        let candidates = null
        let usedFallback = false

        const { data: taskCandidates, error: taskError } = await query
            .order('trust_score', { ascending: false })
            .limit(10)

        if (taskError) throw taskError

        candidates = taskCandidates

        if (!candidates || candidates.length === 0) {
            // No models match the requested task_type - return empty result
            return res.json({
                ai_powered: false,
                ai_model: null,
                requirements: extractedRequirements,
                primary: null,
                alternatives: [],
                reasoning: `No compatible models found for task type: ${extractedRequirements.task_type || 'unknown'}`,
                matched_requirements: extractedRequirements,
                fallback_used: false
            })
        }

        // Step 4: Get Nemotron recommendation (ranking)
        const recommendation = await getNemotronRecommendation(requirement, candidates)
        const recommendationAiPowered = recommendation._aiPowered === true
        const recommendationFallbackReason = recommendation._fallbackReason || null

        // Overall AI powered status
        const aiPowered = extractionAiPowered && recommendationAiPowered

        // Step 5: Filter alternatives to same task_type as primary (or requested task_type)
        const targetTaskType = extractedRequirements.task_type || recommendation.primary?.task
        let filteredAlternatives = []
        if (recommendation.alternatives && recommendation.alternatives.length > 0) {
            if (targetTaskType) {
                filteredAlternatives = recommendation.alternatives.filter(
                    alt => alt.task === targetTaskType
                ).slice(0, 3)
            } else {
                filteredAlternatives = recommendation.alternatives.slice(0, 3)
            }
        }

        // Step 5: Format response
        const formatPricing = (model) => {
            if (!model) return null
            if (model.pricing_model === 'free') return 'Free'
            if (model.price_value !== undefined && model.price_currency && model.billing_unit) {
                return `${model.price_value} ${model.price_currency}/${model.billing_unit}`
            }
            return null
        }

        const response = {
            ai_powered: true,
            ai_model: 'nvidia/nemotron-3-ultra-550b-a55b',
            requirements: extractedRequirements,
            primary: recommendation.primary ? {
                model_id: recommendation.primary.id,
                name: recommendation.primary.name,
                reason: recommendation.primary.reasoning,
                confidence: recommendation.primary.confidence || 0,
                task_type: recommendation.primary.task_type,
                pricing: formatPricing(recommendation.primary),
                trust_score: recommendation.primary.trust_score,
                supported_hardware: recommendation.primary.supported_hardware,
                creator: recommendation.primary.creator_name,
                total_deployments: recommendation.primary.total_deployments,
                average_rating: recommendation.primary.average_rating
            } : null,
            alternatives: (recommendation.alternatives || []).map(alt => ({
                model_id: alt.id,
                name: alt.name,
                reason: alt.reason,
                confidence: alt.confidence || 0,
                task_type: alt.task_type,
                pricing: formatPricing(alt),
                trust_score: alt.trust_score,
                supported_hardware: alt.supported_hardware,
                creator: alt.creator_name
            })),
            reasoning: recommendation.primary?.reasoning || 'No suitable model found',
            matched_requirements: extractedRequirements,
            summary: recommendation.summary,
            keyFactors: recommendation.keyFactors,
            fallback_used: recommendation._fallbackReason !== null,
            ai_powered: recommendation._aiPowered === true,
            ai_model: 'nvidia/nemotron-3-ultra-550b-a55b',
            extraction: {
                ai_powered: extractionAiPowered,
                fallback_reason: extractionFallbackReason
            },
            ranking: {
                ai_powered: recommendationAiPowered,
                fallback_reason: recommendationFallbackReason
            }
        }

        // Log query for analytics
        await supabase.from('advisor_queries').insert({
            user_id: req.user?.id || null,
            query_text: requirement,
            parsed_requirements: extractedRequirements,
            recommended_model_ids: recommendation.primary ? [recommendation.primary.id] : [],
            response_summary: recommendation.primary?.reasoning || 'No match'
        })

        res.json(response)
    } catch (err) {
        next(err)
    }
})

// GET /api/ai-test - Health check for Nemotron AI
router.get('/ai-test', async (req, res, next) => {
    try {
        const { testAiHealth } = await import('../services/nemotron.js')
        const result = await testAiHealth()
        
        // Determine HTTP status based on success
        const statusCode = result.success ? 200 : 503
        
        res.status(statusCode).json({
            success: result.success,
            ai_powered: result.ai_powered,
            model: result.model,
            baseUrl: result.baseUrl,
            message: result.message,
            response: result.response || null,
            error: result.error || null,
            durationMs: result.durationMs,
            timestamp: new Date().toISOString()
        })
    } catch (err) {
        next(err)
    }
})

export default router