import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'

const exampleQueries = [
  '"Cheap NLP model for sentiment analysis on CPU"',
  '"Best LLM for code generation under $200/month"',
  '"Real-time speech-to-text for mobile app"',
  '"Object detection for Raspberry Pi 4"',
]

export default function Advisor() {
  const [formData, setFormData] = useState({
    requirement: '',
  })
  const [recommendation, setRecommendation] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.requirement.trim()) return

    setLoading(true)
    setError(null)
    setRecommendation(null)

    try {
      const response = await api.post('/recommend', formData)
      setRecommendation(response.data)
    } catch (err) {
      setError(err.message || 'Failed to get recommendation. Please try again.')
      console.error('Advisor error:', err)
    } finally {
      setLoading(false)
    }
  }

  const fillExample = (query) => {
    setFormData(prev => ({ ...prev, requirement: query }))
  }

  const formatPrice = (model) => {
    if (!model) return '—'
    if (model.pricing === 'Free') return 'Free'
    if (model.pricing_model === 'free') return 'Free'
    return model.pricing || `${model.price_value} ${model.price_currency}/${model.billing_unit}`
  }

  const formatHardware = (model) => {
    const hw = model.supported_hardware || model.supportedHardware
    if (!hw?.length) return '—'
    return hw.slice(0, 3).join(', ')
  }

  const formatTaskType = (task) => {
    if (!task) return '—'
    return task.replace('_', ' ')
  }

  const renderRequirements = (req) => {
    if (!req) return null
    const items = []
    if (req.task_type) items.push({ label: 'Task Type', value: formatTaskType(req.task_type) })
    if (req.budget) items.push({ label: 'Budget', value: req.budget })
    if (req.hardware) items.push({ label: 'Hardware', value: req.hardware })
    if (req.latency) items.push({ label: 'Latency', value: req.latency })
    if (req.languages) items.push({ label: 'Languages', value: req.languages })
    if (req.context_window) items.push({ label: 'Context Window', value: req.context_window })
    if (req.deployment_target) items.push({ label: 'Deployment', value: req.deployment_target })
    if (req.use_case) items.push({ label: 'Use Case', value: req.use_case })

    if (items.length === 0) return null

    return (
      <div className="bento-card bg-primary-50 border-primary-200 mb-6">
        <h4 className="font-semibold text-primary-800 mb-3">Extracted Requirements</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {items.map((item, i) => (
            <div key={i} className="p-3 bg-white rounded-lg border border-primary-100">
              <p className="text-xs text-primary-600 font-medium">{item.label}</p>
              <p className="text-sm text-primary-800 font-medium">{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const PrimaryRecommendation = ({ primary }) => {
    if (!primary) return null

    return (
      <div className="bento-card">
        <h2 className="text-xl font-semibold text-surface-900 mb-4">Recommendation</h2>

        <div className="space-y-4">
          <div className="p-4 bg-primary-50 rounded-xl border border-primary-200">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-surface-900">{primary.name}</h3>
                <p className="text-sm text-surface-600">Task: {formatTaskType(primary.task_type)}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="px-2 py-1 text-xs bg-primary-100 text-primary-700 rounded">
                    {formatTaskType(primary.task_type)}
                  </span>
                  <span className="px-2 py-1 text-xs bg-surface-100 text-surface-600 rounded">
                    {formatPrice(primary)}
                  </span>
                  <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">
                    Trust: {primary.trust_score || '—'}/100
                  </span>
                  <span className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded">
                    Confidence: {primary.confidence || 0}%
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-primary-600">{primary.confidence || 0}%</div>
                <div className="text-xs text-surface-500">Confidence</div>
              </div>
            </div>
          </div>

          <div className="mt-4 p-4 bg-white rounded-xl border border-surface-200">
            <p className="text-sm text-surface-700"><strong>Reasoning:</strong> {primary.reason}</p>
          </div>

          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="p-3 bg-surface-50 rounded-lg">
              <p className="text-surface-500">Hardware</p>
              <p className="font-medium text-surface-900">{formatHardware(primary)}</p>
            </div>
            <div className="p-3 bg-surface-50 rounded-lg">
              <p className="text-surface-500">Task</p>
              <p className="font-medium text-surface-900">{formatTaskType(primary.task_type)}</p>
            </div>
            <div className="p-3 bg-surface-50 rounded-lg">
              <p className="text-surface-500">Trust Score</p>
              <p className="font-medium text-surface-900">{primary.trust_score || '—'}/100</p>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-surface-200">
            <Link to={`/model/${primary.model_id}`} className="btn-primary flex-1 justify-center">
              View Details
            </Link>
            <Link to={`/deploy/${primary.model_id}`} className="btn-secondary flex-1 justify-center">
              Deploy
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const Alternatives = ({ alternatives }) => {
    if (!alternatives?.length) return null

    return (
      <div className="bento-card">
        <h2 className="text-xl font-semibold text-surface-900 mb-4">Alternatives</h2>
        <div className="grid gap-4">
          {alternatives.map((alt, i) => (
            <div key={i} className="p-4 bg-surface-50 rounded-xl border border-surface-200">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h4 className="font-medium text-surface-900">{alt.name}</h4>
                  <p className="text-sm text-surface-500">{formatTaskType(alt.task_type)}</p>
                  <p className="text-xs text-surface-500 mt-1">{alt.reason}</p>
                  <p className="text-xs text-surface-500 mt-1">Tradeoff: {alt.tradeoffs || '—'}</p>
                </div>
                <div className="text-right">
                  <div className="font-medium text-primary-600">Trust: {alt.trust_score || '—'}</div>
                  <div className="text-xs text-surface-500">{formatPrice(alt)}</div>
                  <div className="text-xs text-purple-600 font-medium">Confidence: {alt.confidence || 0}%</div>
                  <div className="mt-2">
                    <Link to={`/model/${alt.model_id}`} className="btn-secondary text-sm">View Details</Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const NoMatch = ({ message }) => (
    <div className="bento-card text-center py-8">
      <svg className="w-16 h-16 mx-auto text-surface-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <h3 className="text-lg font-medium text-surface-900 mb-2">No Exact Match Found</h3>
      <p className="text-surface-600 mb-6">{message || 'No compatible models found for your requirements.'}</p>
      <Link to="/marketplace" className="btn-primary">Browse All Models</Link>
    </div>
  )

  return (
    <div className="min-h-screen py-12">
      <div className="section-container max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold text-surface-900 mb-4">AI Model Advisor</h1>
          <p className="text-lg text-surface-600">Describe what you need. Get a reasoned recommendation in seconds.</p>
        </div>

        <div className="bento-card">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="requirement" className="block text-sm font-medium text-surface-700 mb-2">
                What are you building?
              </label>
              <textarea
                id="requirement"
                name="requirement"
                rows={4}
                className="input-field resize-none"
                placeholder="e.g., I need an inexpensive computer vision model for manufacturing defect detection that can run on an RTX 4050 with under 50ms latency."
                value={formData.requirement}
                onChange={handleChange}
                aria-describedby="requirement-help"
                disabled={loading}
              />
              <p id="requirement-help" className="mt-1 text-sm text-surface-500">
                Include: task type, budget, hardware, latency needs, accuracy requirements, deployment target
              </p>
            </div>

            <button
              type="submit"
              className="btn-primary w-full sm:w-auto"
              disabled={loading || !formData.requirement.trim()}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analyzing...
                </>
              ) : (
                <>
                  Get Recommendation
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </button>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm text-center">
                {error}
              </div>
            )}

            <p className="text-sm text-surface-500 text-center">
              Powered by NVIDIA Nemotron 3 Ultra · Results from verified models only
            </p>
          </form>
        </div>

        {recommendation && (
          <div className="mt-8 space-y-6 animate-slide-up">
            {renderRequirements(recommendation.requirements)}

            {recommendation.primary ? (
              <PrimaryRecommendation primary={recommendation.primary} />
            ) : (
              <NoMatch message={recommendation.reasoning} />
            )}

            {recommendation.alternatives && (
              <Alternatives alternatives={recommendation.alternatives} />
            )}

            {recommendation.summary && (
              <div className="bento-card bg-primary-50 border-primary-200">
                <p className="text-sm text-primary-800">{recommendation.summary}</p>
              </div>
            )}

            {recommendation.keyFactors && recommendation.keyFactors.length > 0 && (
              <div className="bento-card">
                <h4 className="font-medium text-surface-900 mb-2">Key Factors Considered</h4>
                <div className="flex flex-wrap gap-2">
                  {recommendation.keyFactors.map((factor, i) => (
                    <span key={i} className="px-2 py-1 text-xs bg-primary-50 text-primary-700 rounded">{factor}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3 justify-center">
              <Link to="/compare" className="btn-primary">Compare Models</Link>
              <Link to="/marketplace" className="btn-secondary">Browse All Models</Link>
            </div>
          </div>
        )}

        <div className="mt-12 bento-card">
          <h2 className="text-xl font-semibold text-surface-900 mb-6">Example queries</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {exampleQueries.map((q, i) => (
              <button
                key={i}
                type="button"
                onClick={() => fillExample(q)}
                className="text-left p-4 rounded-lg bg-surface-50 hover:bg-surface-100 border border-surface-200 transition-colors text-sm text-surface-700"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}