import { useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import api from '../services/api'

export default function Trust() {
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchTrust = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await api.get(`/trust/${id}`)
        setData(response.data)
      } catch (err) {
        setError(err.message || 'Failed to load trust report')
        console.error('Trust fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    if (id) fetchTrust()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen py-12">
        <div className="section-container max-w-4xl">
          <div className="animate-pulse space-y-8">
            <div className="flex items-center justify-between">
              <div className="h-10 bg-surface-200 rounded w-1/3"></div>
              <div className="h-16 bg-surface-200 rounded w-24"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-32 bg-surface-200 rounded-xl"></div>
              <div className="h-32 bg-surface-200 rounded-xl"></div>
            </div>
            <div className="h-64 bg-surface-200 rounded-xl"></div>
            <div className="h-48 bg-surface-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen py-12 flex items-center justify-center">
        <div className="text-center">
          <svg className="w-16 h-16 mx-auto text-surface-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-2xl font-bold text-surface-900 mb-2">Trust Report Not Found</h2>
          <p className="text-surface-600 mb-6">{error || 'The requested trust report could not be found.'}</p>
        </div>
      </div>
    )
  }

  const { trust, verifications, sbom, community } = data
  const breakdown = trust?.breakdown || {}

  return (
    <div className="min-h-screen py-12">
      <div className="section-container max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-surface-900 mb-2">Trust & Verification Report</h1>
            <p className="text-lg text-surface-600">
              {trust?.model_name || 'Model'} • Last calculated: {trust?.lastCalculated ? new Date(trust.lastCalculated).toLocaleDateString() : 'Unknown'}
            </p>
          </div>
          <div className="text-center">
            <div className="text-5xl font-bold text-primary-600">{trust?.overall || '—'}</div>
            <div className="text-sm text-surface-500">Overall Trust Score</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {Object.entries(breakdown).map(([key, value]) => (
            <div key={key} className="bento-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-surface-900 capitalize">{key}</h3>
                <span className="text-2xl font-bold text-primary-600">{value || '—'}/100</span>
              </div>
              <div className="h-3 bg-surface-200 rounded-full overflow-hidden mb-3">
                <div className="h-full bg-primary-500 rounded-full" style={{ width: `${value || 0}%` }}></div>
              </div>
              <p className="text-sm text-surface-600">
                {trust?.details?.[key] || 'No details available'}
              </p>
            </div>
          ))}
        </div>

        <div className="bento-card mb-8">
          <h2 className="text-xl font-semibold text-surface-900 mb-6">Verification History</h2>
          {verifications?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full" role="table">
                <thead>
                  <tr className="border-b border-surface-200">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider">Verifier</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-200">
                  {verifications.map(v => (
                    <tr key={v.id} className="hover:bg-surface-50">
                      <td className="px-4 py-3 text-sm font-medium text-surface-900">{v.type}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          v.status === 'Passed' || v.status === 'Verified'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {v.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-surface-600">{v.date ? new Date(v.date).toLocaleDateString() : '—'}</td>
                      <td className="px-4 py-3 text-sm text-surface-600">{v.verifier || '—'}</td>
                      <td className="px-4 py-3 text-sm text-surface-500">{v.details || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-surface-500 text-center py-8">No verification history available</p>
          )}
        </div>

        <div className="bento-card">
          <h2 className="text-xl font-semibold text-surface-900 mb-6">Software Bill of Materials (SBOM)</h2>
          <p className="text-sm text-surface-600 mb-4">Dependencies verified via Sigstore. All packages from official registries.</p>
          {sbom?.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {sbom.map(dep => (
                <span key={dep} className="px-3 py-1 text-sm bg-surface-100 text-surface-700 rounded-lg border border-surface-200 font-mono">
                  {dep}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-surface-500">SBOM not available for this model</p>
          )}
        </div>

        {community && (
          <div className="mt-6 bento-card">
            <h2 className="text-xl font-semibold text-surface-900 mb-4">Community Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-surface-50 rounded-xl">
                <p className="text-3xl font-bold text-surface-900">{community.reviewCount || 0}</p>
                <p className="text-sm text-surface-500">Total Reviews</p>
              </div>
              <div className="text-center p-4 bg-surface-50 rounded-xl">
                <p className="text-3xl font-bold text-surface-900">{community.averageRating || '—'}/5.0</p>
                <p className="text-sm text-surface-500">Average Rating</p>
              </div>
              <div className="text-center p-4 bg-surface-50 rounded-xl">
                <p className="text-3xl font-bold text-surface-900">{community.verifiedPurchases || 0}</p>
                <p className="text-sm text-surface-500">Verified Purchases</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}