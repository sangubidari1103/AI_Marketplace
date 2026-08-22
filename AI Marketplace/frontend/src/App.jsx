import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/Layout.jsx'
import Landing from './pages/Landing.jsx'
import Advisor from './pages/Advisor.jsx'
import Marketplace from './pages/Marketplace.jsx'
import ModelDetail from './pages/ModelDetail.jsx'
import Comparison from './pages/Comparison.jsx'
import Trust from './pages/Trust.jsx'
import Creator from './pages/Creator.jsx'
import Pricing from './pages/Pricing.jsx'
import Deployment from './pages/Deployment.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Auth from './pages/Auth.jsx'

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return null
  return isAuthenticated ? children : <Navigate to="/auth" replace />
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Landing />} />
            <Route path="advisor" element={<Advisor />} />
            <Route path="marketplace" element={<Marketplace />} />
            <Route path="model/:id" element={<ModelDetail />} />
            <Route path="compare" element={<Comparison />} />
            <Route path="trust/:id" element={<Trust />} />
            <Route path="creator" element={<Creator />} />
            <Route path="pricing" element={<Pricing />} />
            <Route
              path="deploy/:id"
              element={
                <ProtectedRoute>
                  <Deployment />
                </ProtectedRoute>
              }
            />
            <Route
              path="dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App