import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'

export default function Marketplace() {
  const [models, setModels] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [taskFilter, setTaskFilter] = useState('')
  const [priceFilter, setPriceFilter] = useState('')
  const [hardwareFilter, setHardwareFilter] = useState('')
  const [pagination, setPagination] = useState({ total: 0, limit: 20, offset: 0, hasMore: false })
  const [tasks, setTasks] = useState([])

  const fetchModels = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = { limit: 20 }
      if (taskFilter) params.task_type = taskFilter
      if (hardwareFilter) params.hardware = hardwareFilter
      if (priceFilter) params.pricing_model = priceFilter
      if (search) params.q = search

      const response = await api.get('/models', { params })
      setModels(response.data.data || [])
      setPagination(response.data.pagination || { total: 0, limit: 20, offset: 0, hasMore: false })
    } catch (err) {
      setError(err.message || 'Failed to load models')
      console.error('Marketplace fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchTasks = async () => {
    try {
      const response = await api.get('/models', { params: { limit: 100 } })
      const allModels = response.data.data || []
      const uniqueTasks = [...new Set(allModels.map(m => m.task_type).filter(Boolean))]
      setTasks(uniqueTasks)
    } catch (err) {
      console.error('Failed to fetch tasks:', err)
    }
  }

  useEffect(() => {
    fetchModels()
    fetchTasks()
  }, [taskFilter, priceFilter, hardwareFilter, search])

  return (
    <div className="min-h-screen py-12">
      <div className="section-container">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-8">
          <div>
            <h1 className="text-4xl lg:text-5xl font-bold text-surface-900 mb-2">Model Marketplace</h1>
            <p className="text-lg text-surface-600">Discover 500+ verified AI models across tasks, budgets, and hardware</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <input
              type="text"
              placeholder="Search models..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field w-64"
              aria-label="Search models"
            />
            <select value={taskFilter} onChange={(e) => setTaskFilter(e.target.value)} className="input-field w-48" aria-label="Filter by task">
              <option value="">All Tasks</option>
              {tasks.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <select value={priceFilter} onChange={(e) => setPriceFilter(e.target.value)} className="input-field w-40" aria-label="Filter by price">
              <option value="">All Prices</option>
              <option value="free">Free</option>
              <option value="paid">Paid</option>
            </select>
          </div>
        </div>

        <div className="bento-card">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
              <button onClick={fetchModels} className="ml-3 text-sm underline hover:text-red-900">Retry</button>
            </div>
          )}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <article key={i} className="card p-5 animate-pulse">
                  <div className="h-6 bg-surface-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-surface-200 rounded w-1/2 mb-4"></div>
                  <div className="h-4 bg-surface-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-surface-200 rounded w-2/3 mb-4"></div>
                  <div className="h-4 bg-surface-200 rounded w-1/3"></div>
                </article>
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {models.map(model => (
                  <article key={model.id} className="card p-5 hover:border-primary-300 transition-colors group">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-surface-900 group-hover:text-primary-600 transition-colors">{model.name}</h3>
                        <p className="text-sm text-surface-500">{model.creator_name || 'Unknown'}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        model.pricing_model === 'free' ? 'bg-green-100 text-green-700' : 'bg-primary-100 text-primary-700'
                      }`}>
                        {model.pricing_model === 'free' ? 'Free' : `${model.price_value} ${model.price_currency}/${model.billing_unit}`}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="px-2 py-1 text-xs bg-surface-100 text-surface-600 rounded">{model.task_type?.replace('_', ' ')}</span>
                      {(model.tags || []).slice(0, 2).map(tag => (
                        <span key={tag} className="px-2 py-1 text-xs bg-primary-50 text-primary-700 rounded">{tag}</span>
                      ))}
                    </div>

                    <div className="space-y-2 mb-4 text-sm">
                      <div className="flex justify-between text-surface-600">
                        <span>Hardware</span>
                        <span className="font-medium text-surface-900">{(model.supported_hardware || []).join(', ') || '—'}</span>
                      </div>
                      <div className="flex justify-between text-surface-600">
                        <span>Trust Score</span>
                        <span className="font-medium text-surface-900">{model.trust_score || '—'}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-surface-200">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <svg className="w-5 h-5 text-primary-600" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                          </svg>
                        </div>
                        <span className="font-semibold text-surface-900">{model.trust_score || '—'}</span>
                        <span className="text-xs text-surface-500">Trust Score</span>
                      </div>
                      <Link to={`/model/${model.id}`} className="btn-secondary text-sm py-1.5 px-3">View Details</Link>
                    </div>
                  </article>
                ))}
              </div>

              {models.length === 0 && (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 mx-auto text-surface-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-lg font-medium text-surface-900 mb-1">No models found</h3>
                  <p className="text-surface-500">Try adjusting your filters or search terms</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}