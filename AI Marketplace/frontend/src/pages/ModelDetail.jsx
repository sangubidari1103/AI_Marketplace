import { useParams, Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import api from '../services/api'
import { formatPrice } from '../utils/helpers'

export default function ModelDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [model, setModel] = useState(null)
  const [versions, setVersions] = useState([])
  const [benchmarks, setBenchmarks] = useState([])
  const [pricing, setPricing] = useState([])
  const [trust, setTrust] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchModel = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await api.get(`/models/${id}`)
        setModel(response.data.model)
        setVersions(response.data.versions || [])
        setBenchmarks(response.data.benchmarks || [])
        setPricing(response.data.pricing || [])
        setTrust(response.data.trust)
        setReviews(response.data.reviews || [])
      } catch (err) {
        setError(err.message || 'Failed to load model details')
        console.error('ModelDetail fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    if (id) fetchModel()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen py-12">
        <div className="section-container max-w-6xl">
          <div className="animate-pulse space-y-8">
            <div className="h-12 bg-surface-200 rounded w-1/4"></div>
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-64 bg-surface-200 rounded-xl"></div>
                <div className="h-64 bg-surface-200 rounded-xl"></div>
                <div className="h-64 bg-surface-200 rounded-xl"></div>
              </div>
              <div className="space-y-6">
                <div className="h-96 bg-surface-200 rounded-xl"></div>
                <div className="h-48 bg-surface-200 rounded-xl"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !model) {
    return (
      <div className="min-h-screen py-12 flex items-center justify-center">
        <div className="text-center">
          <svg className="w-16 h-16 mx-auto text-surface-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-2xl font-bold text-surface-900 mb-2">Model Not Found</h2>
          <p className="text-surface-600 mb-6">{error || 'The requested model could not be found.'}</p>
          <Link to="/marketplace" className="btn-primary">Browse Marketplace</Link>
        </div>
      </div>
    )
  }

  const activePricing = pricing[0]
  const latestVersion = versions[0]
  const trustBreakdown = trust ? {
    benchmarks: trust.benchmark_score,
    verification: trust.verification_score,
    community: trust.community_score,
    security: trust.security_score
  } : {}

  return (
    <div className="min-h-screen py-12">
      <div className="section-container max-w-6xl">
        <Link to="/marketplace" className="inline-flex items-center gap-2 text-sm text-surface-600 hover:text-surface-900 mb-6">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Marketplace
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bento-card">
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-surface-900">{model.name}</h1>
                    {model.creator_verified && (
                      <svg className="w-5 h-5 text-primary-600" fill="currentColor" viewBox="0 0 20 20" aria-label="Verified creator">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                      </svg>
                    )}
                  </div>
                  <p className="text-surface-600">by <span className="font-medium text-surface-900">{model.creator_name}</span></p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-surface-900">{model.trust_score || '—'}</div>
                    <div className="text-xs text-surface-500">Trust Score</div>
                  </div>
                  <div className="h-10 w-px bg-surface-200"></div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-surface-900">{model.average_rating || '—'}</div>
                    <div className="text-xs text-surface-500">Rating ({model.review_count || 0})</div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {(model.tags || []).map(tag => (
                  <span key={tag} className="px-3 py-1 text-sm bg-primary-50 text-primary-700 rounded-full">{tag}</span>
                ))}
              </div>

              <p className="text-surface-600 leading-relaxed mb-6">{model.description}</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-surface-50 rounded-xl">
                <div>
                  <p className="text-xs text-surface-500 uppercase tracking-wide">Version</p>
                  <p className="font-medium text-surface-900">{latestVersion?.version || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-surface-500 uppercase tracking-wide">Updated</p>
                  <p className="font-medium text-surface-900">{model.updated_at ? new Date(model.updated_at).toLocaleDateString() : '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-surface-500 uppercase tracking-wide">License</p>
                  <p className="font-medium text-surface-900">{model.license}</p>
                </div>
                <div>
                  <p className="text-xs text-surface-500 uppercase tracking-wide">Deployments</p>
                  <p className="font-medium text-surface-900">{(model.total_deployments || 0).toLocaleString()}+</p>
                </div>
              </div>
            </div>

            <div className="bento-card">
              <h2 className="text-xl font-semibold text-surface-900 mb-6">Performance Metrics</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {benchmarks.length > 0 ? benchmarks.slice(0, 4).map((b, i) => (
                  <div key={i} className="text-center p-4 bg-surface-50 rounded-xl">
                    <p className="text-2xl font-bold text-surface-900">{b.metric_value} {b.metric_unit || ''}</p>
                    <p className="text-sm text-surface-500 mt-1">{b.metric_name} ({b.dataset_name})</p>
                  </div>
                )) : [
                  { label: 'mAP@50', value: '—' },
                  { label: 'mAP@50-95', value: '—' },
                  { label: 'Parameters', value: '—' },
                  { label: 'FLOPs', value: '—' },
                ].map((m, i) => (
                  <div key={i} className="text-center p-4 bg-surface-50 rounded-xl">
                    <p className="text-2xl font-bold text-surface-900">{m.value}</p>
                    <p className="text-sm text-surface-500 mt-1">{m.label}</p>
                  </div>
                ))}
              </div>

              {benchmarks.length > 0 && (
                <div className="mt-8 pt-8 border-t border-surface-200">
                  <h3 className="text-lg font-medium text-surface-900 mb-4">Latency Benchmarks</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {benchmarks.filter(b => b.latency_ms).slice(0, 2).map((b, i) => (
                      <div key={i} className="p-4 bg-surface-50 rounded-xl text-center">
                        <p className="text-3xl font-bold text-primary-600">{b.latency_ms} ms</p>
                        <p className="text-sm text-surface-500">Batch {b.batch_size} on {b.hardware}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="bento-card">
              <h2 className="text-xl font-semibold text-surface-900 mb-6">Supported Hardware</h2>
              <div className="flex flex-wrap gap-3">
                {(latestVersion?.supported_hardware || []).map(hw => (
                  <span key={hw} className="px-4 py-2 bg-surface-100 text-surface-700 rounded-lg border border-surface-200">
                    {hw}
                  </span>
                ))}
                {(latestVersion?.supported_hardware || []).length === 0 && (
                  <span className="px-4 py-2 bg-surface-100 text-surface-500 rounded-lg border border-surface-200">Not specified</span>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bento-card sticky top-24">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-surface-500">Price</span>
                  <span className="text-2xl font-bold text-surface-900">
                    {activePricing?.pricing_model === 'free' ? 'Free' : formatPrice(activePricing?.price_value || 0, activePricing?.price_currency || 'USD') + (activePricing?.billing_unit ? ` / ${activePricing.billing_unit}` : '')}
                  </span>
                </div>
                <p className="text-sm text-surface-500">
                  {activePricing?.pricing_model === 'free' ? 'Open source • No cost' : `Per ${activePricing?.billing_unit || 'inference'} • No minimum commitment`}
                </p>
              </div>

              <Link to={`/deploy/${id}`} className="btn-primary w-full justify-center mb-3">
                Deploy Model
              </Link>
              <button className="btn-secondary w-full justify-center mb-3">
                Add to Comparison
              </button>
              <Link to={`/trust/${id}`} className="btn-ghost w-full justify-center">
                View Trust Report
              </Link>

              <div className="mt-6 pt-6 border-t border-surface-200 space-y-3 text-sm">
                <div className="flex justify-between text-surface-600">
                  <span>Trust Score</span>
                  <span className="font-semibold text-surface-900">{model.trust_score || '—'}/100</span>
                </div>
                <div className="flex justify-between text-surface-600">
                  <span>Verified Benchmarks</span>
                  <span className="font-semibold text-surface-900">{benchmarks.filter(b => b.verified).length > 0 ? 'Yes' : 'No'}</span>
                </div>
                <div className="flex justify-between text-surface-600">
                  <span>Security Audit</span>
                  <span className="font-semibold text-surface-900">{trust?.security_score ? 'Passed' : 'Unknown'}</span>
                </div>
                <div className="flex justify-between text-surface-600">
                  <span>Creator Verified</span>
                  <span className="font-semibold text-surface-900">{model.creator_verified ? 'Yes' : 'No'}</span>
                </div>
              </div>
            </div>

            <div className="bento-card">
              <h3 className="font-semibold text-surface-900 mb-4">Trust Breakdown</h3>
              <div className="space-y-4">
                {Object.entries(trustBreakdown).map(([key, value]) => (
                  <div key={key}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="capitalize text-surface-600">{key}</span>
                      <span className="font-medium text-surface-900">{value || '—'}/100</span>
                    </div>
                    <div className="h-2 bg-surface-200 rounded-full overflow-hidden">
                      <div className="h-full bg-primary-500 rounded-full" style={{ width: `${value || 0}%` }}></div>
                    </div>
                  </div>
                ))}
                {Object.keys(trustBreakdown).length === 0 && (
                  <p className="text-surface-500 text-sm">Trust score details not available</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}