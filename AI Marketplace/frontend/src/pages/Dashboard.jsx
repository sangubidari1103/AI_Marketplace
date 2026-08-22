import { useState, useEffect } from 'react'
import api from '../services/api'

export default function Dashboard() {
  const [deployments, setDeployments] = useState([])
  const [models, setModels] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('deployments')

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const [deploymentsRes, modelsRes] = await Promise.all([
          api.get('/deploy'),
          api.get('/models', { params: { limit: 50 } })
        ])
        setDeployments(deploymentsRes.data.data || [])
        setModels(modelsRes.data.data || [])
      } catch (err) {
        setError(err.message || 'Failed to load dashboard data')
        console.error('Dashboard fetch error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const getStatusColor = (status) => {
    switch (status) {
      case 'running': return 'bg-green-100 text-green-700'
      case 'building': return 'bg-blue-100 text-blue-700'
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      case 'stopped': return 'bg-surface-100 text-surface-700'
      case 'failed': return 'bg-red-100 text-red-700'
      case 'deleted': return 'bg-surface-100 text-surface-500'
      default: return 'bg-surface-100 text-surface-700'
    }
  }

  const stats = {
    totalDeployments: deployments.length,
    runningDeployments: deployments.filter(d => d.status === 'running').length,
    totalModels: models.length,
    totalInferences: deployments.reduce((sum, d) => sum + (d.inference_count || 0), 0)
  }

  if (loading) {
    return (
      <div className="min-h-screen py-12">
        <div className="section-container max-w-7xl">
          <div className="animate-pulse space-y-8">
            <div className="h-10 bg-surface-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-surface-200 rounded-xl"></div>
              ))}
            </div>
            <div className="h-64 bg-surface-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12">
      <div className="section-container max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-surface-900 mb-2">Dashboard</h1>
          <p className="text-lg text-surface-600">Overview of your deployments and models</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center justify-between">
            {error}
            <button onClick={() => window.location.reload()} className="text-red-700 hover:text-red-900 underline">Retry</button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bento-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-surface-500">Total Deployments</p>
                <p className="text-3xl font-bold text-surface-900">{stats.totalDeployments}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bento-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-surface-500">Running</p>
                <p className="text-3xl font-bold text-surface-900">{stats.runningDeployments}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bento-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-surface-500">Models Accessed</p>
                <p className="text-3xl font-bold text-surface-900">{stats.totalModels}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bento-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-surface-500">Total Inferences</p>
                <p className="text-3xl font-bold text-surface-900">{stats.totalInferences.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="bento-card">
          <div className="border-b border-surface-200 mb-6">
            <nav className="flex gap-8" aria-label="Dashboard tabs">
              <button
                onClick={() => setActiveTab('deployments')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'deployments' ? 'border-primary-500 text-primary-600' : 'border-transparent text-surface-500 hover:text-surface-700'
                }`}
              >
                Deployments
              </button>
              <button
                onClick={() => setActiveTab('models')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'models' ? 'border-primary-500 text-primary-600' : 'border-transparent text-surface-500 hover:text-surface-700'
                }`}
              >
                Models
              </button>
            </nav>
          </div>

          {activeTab === 'deployments' && (
            <div>
              {deployments.length > 0 ? (
                <div className="space-y-4">
                  {deployments.map(d => (
                    <div key={d.id} className="p-4 bg-surface-50 rounded-xl border border-surface-200 hover:border-surface-300 transition-colors">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
                            <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="font-semibold text-surface-900">{d.models?.name || 'Unknown Model'}</h3>
                            <p className="text-sm text-surface-500">{d.deployment_type} • {d.region}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(d.status)}`}>
                            {d.status}
                          </span>
                          {d.endpoint_url && (
                            <a href={d.endpoint_url} target="_blank" rel="noopener noreferrer" className="btn-secondary text-sm">
                              Open Endpoint
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 mx-auto text-surface-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <h3 className="text-lg font-medium text-surface-900 mb-1">No deployments yet</h3>
                  <p className="text-surface-500 mb-6">Deploy a model to see it here</p>
                  <a href="/marketplace" className="btn-primary">Browse Models</a>
                </div>
              )}
            </div>
          )}

          {activeTab === 'models' && (
            <div>
              {models.length > 0 ? (
                <div className="space-y-4">
                  {models.map(m => (
                    <div key={m.id} className="p-4 bg-surface-50 rounded-xl border border-surface-200 hover:border-surface-300 transition-colors">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="font-semibold text-surface-900">{m.name}</h3>
                            <p className="text-sm text-surface-500">{m.task_type?.replace('_', ' ')} • {m.creator_name}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                            m.pricing_model === 'free' ? 'bg-green-100 text-green-700' : 'bg-primary-100 text-primary-700'
                          }`}>
                            {m.pricing_model === 'free' ? 'Free' : `${m.price_value} ${m.price_currency}/${m.billing_unit}`}
                          </span>
                          <a href={`/model/${m.id}`} className="btn-secondary text-sm">View Details</a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 mx-auto text-surface-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-lg font-medium text-surface-900 mb-1">No models found</h3>
                  <p className="text-surface-500 mb-6">Models will appear here after you deploy them</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}