import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'

const metrics = [
  { key: 'name', label: 'Model Name', type: 'text' },
  { key: 'creator_name', label: 'Creator', type: 'text' },
  { key: 'task_type', label: 'Task', type: 'text' },
  { key: 'pricing_model', label: 'Price', type: 'price' },
  { key: 'supported_hardware', label: 'Min Hardware', type: 'hardware' },
  { key: 'latency', label: 'Latency', type: 'text' },
  { key: 'trust_score', label: 'Trust Score', type: 'score', higherBetter: true },
  { key: 'average_rating', label: 'Rating', type: 'score', higherBetter: true },
  { key: 'total_deployments', label: 'Deployments', type: 'score', higherBetter: true },
]

export default function Comparison() {
  const [selectedIds, setSelectedIds] = useState([])
  const [models, setModels] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchModel = async (id) => {
    if (models[id]) return models[id]
    setLoading(true)
    try {
      const response = await api.get(`/models/${id}`)
      setModels(prev => ({ ...prev, [id]: response.data.model }))
      return response.data.model
    } catch (err) {
      console.error(`Failed to fetch model ${id}:`, err)
      return null
    } finally {
      setLoading(false)
    }
  }

  const toggleModel = (id) => {
    if (selectedIds.includes(id)) {
      if (selectedIds.length > 1) {
        setSelectedIds(selectedIds.filter(i => i !== id))
      }
    } else if (selectedIds.length < 4) {
      setSelectedIds([...selectedIds, id])
      fetchModel(id)
    }
  }

  const getModelValue = (model, key) => {
    if (!model) return '—'
    switch (key) {
      case 'pricing_model':
        if (model.pricing_model === 'free') return 'Free'
        return `${model.price_value} ${model.price_currency}/${model.billing_unit}`
      case 'supported_hardware':
        return (model.supported_hardware || []).slice(0, 2).join(', ') || '—'
      case 'latency':
        return '—'
      case 'task_type':
        return model.task_type?.replace('_', ' ') || '—'
      default:
        return model[key] || '—'
    }
  }

  const getBestValue = (key, higherBetter = true) => {
    const values = selectedIds.map(id => models[id]?.[key]).filter(v => v != null)
    if (values.length === 0) return null
    if (typeof values[0] === 'number') {
      return higherBetter ? Math.max(...values) : Math.min(...values)
    }
    return values[0]
  }

  const selectedModels = selectedIds.map(id => models[id]).filter(Boolean)

  return (
    <div className="min-h-screen py-12">
      <div className="section-container max-w-7xl">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-8">
          <div>
            <h1 className="text-4xl lg:text-5xl font-bold text-surface-900 mb-2">Model Comparison</h1>
            <p className="text-lg text-surface-600">Compare up to 4 models side-by-side across benchmarks, pricing, and trust</p>
          </div>
        </div>

        <div className="bento-card mb-6">
          <h3 className="font-semibold text-surface-900 mb-4">Select Models to Compare</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {selectedIds.map((id, index) => (
              <div key={id} className="flex items-center gap-3 p-3 bg-surface-50 rounded-lg">
                <span className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-medium text-sm">
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-surface-900 truncate">{models[id]?.name || 'Loading...'}</p>
                  <p className="text-xs text-surface-500 truncate">{models[id]?.creator_name || ''}</p>
                </div>
                <button
                  onClick={() => toggleModel(id)}
                  className="text-surface-400 hover:text-surface-600 p-1"
                  disabled={selectedIds.length <= 1}
                  aria-label={`Remove ${models[id]?.name || 'model'}`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
            {selectedIds.length < 4 && (
              <button
                onClick={() => {
                  api.get('/models', { params: { limit: 20 } }).then(res => {
                    const available = (res.data.data || []).find(m => !selectedIds.includes(m.id))
                    if (available) toggleModel(available.id)
                  })
                }}
                className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-surface-300 rounded-xl text-surface-500 hover:border-primary-400 hover:bg-primary-50 hover:text-primary-600 transition-all"
                disabled={loading}
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="text-sm">Add Model</span>
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="bento-card">
          <div className="overflow-x-auto">
            <table className="w-full" role="table">
              <thead>
                <tr className="border-b border-surface-200">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider w-48 sticky left-0 bg-white z-10">Metric</th>
                  {selectedIds.map((id, index) => (
                    <th key={id} className="px-4 py-3 text-left text-sm font-medium text-surface-900 min-w-[200px]">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-xs font-medium">
                          {index + 1}
                        </span>
                        <span>{models[id]?.name || 'Loading...'}</span>
                        <button
                          onClick={() => toggleModel(id)}
                          className="text-surface-400 hover:text-surface-600 p-1"
                          disabled={selectedIds.length <= 1}
                          aria-label={`Remove ${models[id]?.name || 'model'}`}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </th>
                  ))}
                  {selectedIds.length < 4 && (
                    <th className="px-4 py-3 text-left">
                      <button
                        onClick={() => {
                          api.get('/models', { params: { limit: 20 } }).then(res => {
                            const available = (res.data.data || []).find(m => !selectedIds.includes(m.id))
                            if (available) toggleModel(available.id)
                          })
                        }}
                        className="w-full h-full flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-surface-300 rounded-xl text-surface-500 hover:border-primary-400 hover:bg-primary-50 hover:text-primary-600 transition-all"
                        disabled={loading}
                      >
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span className="text-sm">Add Model</span>
                      </button>
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-200">
                {metrics.map(metric => {
                  const bestValue = getBestValue(metric.key, metric.higherBetter)
                  return (
                    <tr key={metric.key}>
                      <td className="px-4 py-3 text-sm font-medium text-surface-600 sticky left-0 bg-white z-10">{metric.label}</td>
                      {selectedIds.map((id, index) => {
                        const model = models[id]
                        const value = getModelValue(model, metric.key)
                        const isBest = metric.type === 'score' && model?.[metric.key] === bestValue && selectedIds.length > 1
                        return (
                          <td key={id} className="px-4 py-3 text-sm text-surface-700 min-w-[200px]">
                            <div className={`flex items-center gap-2 ${isBest ? 'text-primary-600 font-medium' : ''}`}>
                              {metric.type === 'score' && typeof model?.[metric.key] === 'number' && (
                                <div className="flex items-center gap-2">
                                  <div className="w-24 h-2 bg-surface-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-primary-500 rounded-full transition-all" style={{ width: `${Math.min(model[metric.key], 100)}%` }}></div>
                                  </div>
                                  <span>{model[metric.key]}</span>
                                </div>
                              )}
                              {metric.type !== 'score' && <span>{value}</span>}
                              {isBest && (
                                <svg className="w-4 h-4 text-primary-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                                </svg>
                              )}
                            </div>
                          </td>
                        )
                      })}
                      {selectedIds.length < 4 && <td className="px-4 py-3"></td>}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {selectedModels.length > 0 && (
            <div className="mt-6 pt-6 border-t border-surface-200 flex flex-wrap gap-3 justify-end">
              <button className="btn-secondary">Export Comparison</button>
              <Link to="/advisor" className="btn-primary">
                Get AI Recommendation
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          )}
        </div>

        {selectedModels.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-surface-900 mb-4">AI Analysis</h2>
            <div className="bento-card">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.734-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div className="prose text-surface-600">
                  {selectedModels.length >= 2 && (
                    <>
                      <p className="mb-3">
                        Based on your selection, <strong className="text-surface-900">{selectedModels[0].name}</strong> offers the best balance of trust score ({selectedModels[0].trust_score || '—'}/100) and deployment popularity ({(selectedModels[0].total_deployments || 0).toLocaleString()}+).
                      </p>
                      <p className="mb-3">
                        <strong className="text-surface-900">{selectedModels[1].name}</strong> provides a trust score of {selectedModels[1].trust_score || '—'}/100 with {(selectedModels[1].total_deployments || 0).toLocaleString()}+ deployments.
                      </p>
                      <p>
                        For deployment with budget constraints, <strong className="text-surface-900">{selectedModels[0].name}</strong> is recommended. If trust score is critical, compare the detailed breakdowns.
                      </p>
                    </>
                  )}
                  {selectedModels.length === 1 && (
                    <p>Add more models to see AI-powered comparison analysis.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}