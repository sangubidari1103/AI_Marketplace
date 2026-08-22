import { supabaseAdmin } from '../index.js'

export async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid Authorization header' })
    }

    const token = authHeader.replace('Bearer ', '')
    
    // Verify the JWT token with Supabase
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
    
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' })
    }

    req.user = {
      id: user.id,
      email: user.email,
      ...user.user_metadata
    }

    next()
  } catch (err) {
    console.error('Auth middleware error:', err)
    return res.status(401).json({ error: 'Authentication failed' })
  }
}

export function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next()
  }

  const token = authHeader.replace('Bearer ', '')
  
  supabaseAdmin.auth.getUser(token)
    .then(({ data: { user }, error }) => {
      if (!error && user) {
        req.user = {
          id: user.id,
          email: user.email,
          ...user.user_metadata
        }
      }
      next()
    })
    .catch(() => next())
}