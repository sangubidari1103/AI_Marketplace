import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { createClient } from '@supabase/supabase-js'
import modelsRouter from './routes/models.js'
import searchRouter from './routes/search.js'
import recommendRouter from './routes/recommend.js'
import compareRouter from './routes/compare.js'
import trustRouter from './routes/trust.js'
import deployRouter from './routes/deploy.js'

const app = express()
const PORT = process.env.PORT || 3001

// Supabase clients
export const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
)

export const supabaseAdmin = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
)

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}))
app.use(express.json())

// Request logging
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`)
    next()
})

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// API Routes
app.use('/api/models', modelsRouter)
app.use('/api/search', searchRouter)
app.use('/api/recommend', recommendRouter)
app.use('/api/compare', compareRouter)
app.use('/api/trust', trustRouter)
app.use('/api/deploy', deployRouter)

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Not found', path: req.path })
})

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err)
    const status = err.status || 500
    res.status(status).json({
        error: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    })
})

app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`)
})

export default app