import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import api from '../services/api'

export default function Deployment() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [model, setModel] = useState(null)
  const [versions, setVersions] = useState([])
  const [deployment, setDeployment] = useState(null)
  const [deployments, setDeployments] = useState([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('create')

  useEffect(() => {
    const fetchModel = async () => {
      try {
        const response = await api.get(`/models/${id}`)
        setModel(response.data.model)
        setVersions(response.data.versions || [])
      } catch (err) {
        console.error('Failed to fetch model:', err)
        setError(err.message || 'Failed to load model')
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchModel()
  }, [id])

  useEffect(() => {
    const fetchDeployments = async () => {
      try {
        const response = await api.get('/deploy')
        setDeployments(response.data.data || [])
      } catch (err) {
        console.error('Failed to fetch deployments:', err)
      }
    }
    fetchDeployments()
  }, [])

  const handleDeploy = async (e) => {
    e.preventDefault()
    setCreating(true)
    setError(null)
    try {
      const formData = new FormData(e.target)
      const latestVersion = versions[0]
      const response = await api.post('/deploy', {
        model_id: id,
        model_version_id: latestVersion?.id,
        deployment_type: formData.get('deployment_type'),
        configuration: { region: formData.get('region') },
        region: formData.get('region')
      })
      setDeployment(response.data.deployment)
      setActiveTab('status')
    } catch (err) {
      setError(err.message || 'Failed to create deployment')
    } finally {
      setCreating(false)
    }
  }

  const handleStop = async (deploymentId) => {
    try {
      await api.post(`/deploy/${deploymentId}/stop`)
      setDeployments(prev => prev.map(d => d.id === deploymentId ? { ...d, status: 'stopped' } : d))
      if (deployment?.id === deploymentId) {
        setDeployment(prev => ({ ...prev, status: 'stopped' }))
      }
    } catch (err) {
      setError(err.message || 'Failed to stop deployment')
    }
  }

  const handleDelete = async (deploymentId) => {
    if (!window.confirm('Are you sure you want to delete this deployment?')) return
    try {
      await api.delete(`/deploy/${deploymentId}`)
      setDeployments(prev => prev.filter(d => d.id !== deploymentId))
      if (deployment?.id === deploymentId) {
        setDeployment(null)
        setActiveTab('create')
      }
    } catch (err) {
      setError(err.message || 'Failed to delete deployment')
    }
  }

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

  if (loading) {
    return (
      <div className="min-h-screen py-12">
        <div className="section-container max-w-4xl">
          <div className="animate-pulse space-y-8">
            <div className="h-10 bg-surface-200 rounded w-1/3"></div>
            <div className="h-64 bg-surface-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!model) {
    return (
      <div className="min-h-screen py-12 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-surface-900 mb-2">Model Not Found</h2>
          <p className="text-surface-600 mb-6">The requested model could not be found.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12">
      <div className="section-container max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-surface-900 mb-2">Deploy {model.name}</h1>
          <p className="text-lg text-surface-600">Choose deployment type and configure your deployment</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center justify-between">
            {error}
            <button onClick={() => setError(null)} className="text-red-700 hover:text-red-900 underline">Dismiss</button>
          </div>
        )}

        <div className="bento-card">
          <div className="border-b border-surface-200 mb-6">
            <nav className="flex gap-8" aria-label="Deployment tabs">
              <button
                onClick={() => setActiveTab('create')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'create' ? 'border-primary-500 text-primary-600' : 'border-transparent text-surface-500 hover:text-surface-700'
                }`}
              >
                Create Deployment
              </button>
              <button
                onClick={() => setActiveTab('status')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'status' ? 'border-primary-500 text-primary-600' : 'border-transparent text-surface-500 hover:text-surface-700'
                }`}
                disabled={!deployment && deployments.length === 0}
              >
                Deployment Status
              </button>
            </nav>
          </div>

          {activeTab === 'create' && (
            <form onSubmit={handleDeploy} className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-surface-900 mb-4">Deployment Configuration</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="deployment_type" className="block text-sm font-medium text-surface-700 mb-2">
                      Deployment Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="deployment_type"
                      name="deployment_type"
                      className="input-field"
                      required
                      disabled={creating}
                    >
                      <option value="">Select deployment type</option>
                      <option value="docker">Docker Container</option>
                      <option value="serverless">Serverless Function</option>
                      <option value="api_endpoint">API Endpoint</option>
                      <option value="edge_binary">Edge Binary</option>
                      <option value="local">Local Download</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="region" className="block text-sm font-medium text-surface-700 mb-2">
                      Region
                    </label>
                    <select
                      id="region"
                      name="region"
                      className="input-field"
                      disabled={creating}
                    >
                      <option value="us-east-1">US East (N. Virginia)</option>
                      <option value="us-west-2">US West (Oregon)</option>
                      <option value="eu-west-1">EU (Ireland)</option>
                      <option value="ap-southeast-1">Asia Pacific (Singapore)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-surface-50 rounded-xl border border-surface-200">
                <h4 className="font-medium text-surface-900 mb-2">What happens next?</h4>
                <ul className="text-sm text-surface-600 space-y-1">
                  <li>• This is a <strong>demo deployment</strong> — no real infrastructure is provisioned</li>
                  <li>• In production, this would build Docker images, provision cloud resources, or generate edge binaries</li>
                  <li>• You'll see a simulated deployment status with an endpoint URL</li>
                </ul>
              </div>

              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => navigate(-1)} className="btn-secondary" disabled={creating}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={creating}>
                  {creating ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Deploying...
                    </>
                  ) : (
                    'Create Deployment'
                  )}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'status' && (
            <div>
              {deployment ? (
                <div className="space-y-6">
                  <div className="p-4 bg-primary-50 rounded-xl border border-primary-200">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-surface-900">Active Deployment</h3>
                        <p className="text-sm text-surface-600">{model.name} • {deployment.deployment_type}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(deployment.status)}`}>
                          {deployment.status.charAt(0).toUpperCase() + deployment.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {deployment.endpoint_url && (
                    <div className="p-4 bg-surface-50 rounded-xl border border-surface-200">
                      <h4 className="font-medium text-surface-900 mb-2">Endpoint</h4>
                      <div className="flex items-center gap-3">
                        <code className="flex-1 text-sm bg-white p-3 rounded-lg border border-surface-200 break-all">
                          {deployment.endpoint_url}
                        </code>
                        <button
                          onClick={() => navigator.clipboard.writeText(deployment.endpoint_url)}
                          className="btn-secondary text-sm"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  )}

                  {deployment.docker_image && (
                    <div className="p-4 bg-surface-50 rounded-xl border border-surface-200">
                      <h4 className="font-medium text-surface-900 mb-2">Docker Image</h4>
                      <code className="text-sm bg-white p-3 rounded-lg border border-surface-200 break-all block">
                        {deployment.docker_image}
                      </code>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="p-3 bg-surface-50 rounded-lg">
                      <p className="text-surface-500">Status</p>
                      <p className="font-medium text-surface-900 capitalize">{deployment.status}</p>
                    </div>
                    <div className="p-3 bg-surface-50 rounded-lg">
                      <p className="text-surface-500">Region</p>
                      <p className="font-medium text-surface-900">{deployment.region}</p>
                    </div>
                    <div className="p-3 bg-surface-50 rounded-lg">
                      <p className="text-surface-500">Created</p>
                      <p className="font-medium text-surface-900">{deployment.created_at ? new Date(deployment.created_at).toLocaleString() : '—'}</p>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-surface-200">
                    {deployment.status === 'running' && (
                      <button onClick={() => handleStop(deployment.id)} className="btn-secondary">
                        Stop Deployment
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(deployment.id)}
                      className="btn-secondary text-red-600 border-red-300 hover:bg-red-50"
                    >
                      Delete Deployment
                    </button>
                  </div>
                </div>
              ) : deployments.length > 0 ? (
                <div>
                  <h3 className="text-lg font-semibold text-surface-900 mb-4">Your Deployments</h3>
                  <div className="space-y-4">
                    {deployments.map(d => (
                      <div key={d.id} className="p-4 bg-surface-50 rounded-xl border border-surface-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-surface-900">{d.models?.name || 'Unknown Model'}</p>
                            <p className="text-sm text-surface-500">{d.deployment_type} • {d.region}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(d.status)}`}>
                              {d.status}
                            </span>
                            <button
                              onClick={() => {
                                setDeployment(d)
                                // Could add logic to fetch full deployment details
                              }}
                              className="btn-secondary text-sm"
                            >
                              View
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 mx-auto text-surface-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <h3 className="text-lg font-medium text-surface-900 mb-1">No deployments yet</h3>
                  <p className="text-surface-500 mb-6">Create your first deployment to get started</p>
                  <button onClick={() => setActiveTab('create')} className="btn-primary">
                    Create Deployment
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}