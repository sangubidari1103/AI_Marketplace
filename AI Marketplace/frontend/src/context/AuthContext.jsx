import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '../services/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchUser = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser(session.user)
        localStorage.setItem('auth_token', session.access_token)
      } else {
        setUser(null)
        localStorage.removeItem('auth_token')
      }
    } catch (err) {
      console.error('Error fetching user:', err)
      setUser(null)
      localStorage.removeItem('auth_token')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user)
        localStorage.setItem('auth_token', session.access_token)
      } else {
        setUser(null)
        localStorage.removeItem('auth_token')
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [fetchUser])

  const signIn = async (email, password) => {
    setError(null)
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      if (data.user) {
        setUser(data.user)
        localStorage.setItem('auth_token', data.session.access_token)
        return { success: true }
      }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email, password, fullName) => {
    setError(null)
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } }
      })
      if (error) throw error
      if (data.user) {
        setUser(data.user)
        if (data.session) {
          localStorage.setItem('auth_token', data.session.access_token)
        }
        return { success: true }
      }
    } catch (err) {
      // Handle "user already exists" error from Supabase
      const message = err.message || ''
      if (message.includes('already registered') || message.includes('already exists') || message.includes('User already registered')) {
        setError('An account with this email already exists. Please sign in.')
        return { success: false, error: 'An account with this email already exists. Please sign in.' }
      }
      setError(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setError(null)
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (err) {
      setError(err.message)
    } finally {
      setUser(null)
      localStorage.removeItem('auth_token')
    }
  }

  const value = {
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    isAuthenticated: !!user,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}