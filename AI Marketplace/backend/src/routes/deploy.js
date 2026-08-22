import { Router } from 'express'
import { supabase, supabaseAdmin } from '../index.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

// Apply auth middleware to all deployment routes
router.use(authenticate)

// POST /api/deploy - Create a new deployment
router.post('/', async (req, res, next) => {
    try {
        const {
            model_id,
            model_version_id,
            deployment_type,
            configuration,
            region
        } = req.body

        const user_id = req.user.id

        if (!model_id || !deployment_type) {
            return res.status(400).json({ error: 'model_id and deployment_type are required' })
        }

        // Verify model exists and is public
        const { data: model, error: modelError } = await supabase
            .from('models')
            .select('id, name, is_public')
            .eq('id', model_id)
            .single()

        if (modelError || !model) {
            return res.status(404).json({ error: 'Model not found' })
        }

        if (!model.is_public) {
            return res.status(403).json({ error: 'Model is not available for deployment' })
        }

        // Validate deployment type
        const validTypes = ['docker', 'serverless', 'edge_binary', 'api_endpoint', 'local']
        if (!validTypes.includes(deployment_type)) {
            return res.status(400).json({ error: 'Invalid deployment type' })
        }

        // Create deployment record (use admin client to bypass RLS since user is already authenticated)
        const { data: deployment, error } = await supabaseAdmin
            .from('deployments')
            .insert({
                user_id,
                model_id,
                model_version_id,
                deployment_type,
                configuration: configuration || {},
                region: region || 'us-east-1',
                status: 'pending'
            })
            .select()
            .single()

        if (error) throw error

        // Simulate deployment process (in production, this would trigger actual deployment)
        // For hackathon, we'll simulate with a timeout
        simulateDeployment(deployment.id, deployment_type)

        res.status(201).json({
            deployment: {
                ...deployment,
                message: 'Deployment initiated. This is a demo - actual deployment would provision infrastructure.'
            }
        })
    } catch (err) {
        next(err)
    }
})

// GET /api/deploy/:id - Get deployment status
router.get('/:id', async (req, res, next) => {
    try {
        const { id } = req.params

        const { data, error } = await supabase
            .from('deployments')
            .select('*, models(name, task_type)')
            .eq('id', id)
            .eq('user_id', req.user.id)
            .single()

        if (error || !data) {
            return res.status(404).json({ error: 'Deployment not found' })
        }

        res.json({ deployment: data })
    } catch (err) {
        next(err)
    }
})

// GET /api/deploy - List user's deployments
router.get('/', async (req, res, next) => {
    try {
        const { status, limit = 20, offset = 0 } = req.query

        let query = supabase
            .from('deployments')
            .select('*, models(name, task_type)', { count: 'exact' })
            .eq('user_id', req.user.id)
            .order('created_at', { ascending: false })
            .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1)

        if (status) query = query.eq('status', status)

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

// POST /api/deploy/:id/stop - Stop a deployment
router.post('/:id/stop', async (req, res, next) => {
    try {
        const { id } = req.params

        const { data, error } = await supabase
            .from('deployments')
            .update({ status: 'stopped', stopped_at: new Date().toISOString() })
            .eq('id', id)
            .eq('user_id', req.user.id)
            .select()
            .single()

        if (error || !data) {
            return res.status(404).json({ error: 'Deployment not found' })
        }

        res.json({ deployment: data })
    } catch (err) {
        next(err)
    }
})

// DELETE /api/deploy/:id - Delete a deployment
router.delete('/:id', async (req, res, next) => {
    try {
        const { id } = req.params

        const { error } = await supabase
            .from('deployments')
            .update({ status: 'deleted' })
            .eq('id', id)
            .eq('user_id', req.user.id)

        if (error) throw error

        res.json({ success: true })
    } catch (err) {
        next(err)
    }
})

// Demo simulation function
function simulateDeployment(deploymentId, type) {
    const statuses = ['building', 'running']
    let currentStep = 0

    const interval = setInterval(async () => {
        if (currentStep >= statuses.length) {
            clearInterval(interval)
            // Mark as running after "deployment"
            await supabase
                .from('deployments')
                .update({
                    status: 'running',
                    started_at: new Date().toISOString(),
                    endpoint_url: `https://demo-${deploymentId.slice(0, 8)}.ai-marketplace.example.com`,
                    docker_image: `ai-marketplace/${deploymentId}:latest`
                })
                .eq('id', deploymentId)
            return
        }

        await supabase
            .from('deployments')
            .update({ status: statuses[currentStep] })
            .eq('id', deploymentId)

        currentStep++
    }, 3000)
}

export default router