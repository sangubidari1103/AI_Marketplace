import { useState } from 'react'

export default function Creator() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    name: '',
    task: '',
    description: '',
    license: '',
    repoUrl: '',
    hardware: [],
    priceType: 'free',
    priceValue: '',
  })

  const tasks = ['Object Detection', 'Image Classification', 'Segmentation', 'Text Generation', 'Speech Recognition', 'Other']
  const licenses = ['Apache-2.0', 'MIT', 'AGPL-3.0', 'BSD-3-Clause', 'Custom']
  const hardwareOptions = ['RTX 3050+', 'RTX 3060+', 'RTX 3070+', 'RTX 4080+', 'A10G', 'A100', 'CPU Only', 'Mobile/Edge', 'Jetson']

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        hardware: checked ? [...prev.hardware, value] : prev.hardware.filter(h => h !== value)
      }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const steps = [
    { num: 1, title: 'Basic Info', desc: 'Model name, task, description' },
    { num: 2, title: 'Technical', desc: 'Hardware, license, repository' },
    { num: 3, title: 'Pricing', desc: 'Monetization model' },
    { num: 4, title: 'Review', desc: 'Verify and publish' },
  ]

  return (
    <div className="min-h-screen py-12">
      <div className="section-container max-w-3xl">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-surface-900 mb-2">Publish Your Model</h1>
          <p className="text-lg text-surface-600">Share your model with the community and earn revenue</p>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((s, i) => (
              <div key={i} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium ${
                  i + 1 < step ? 'bg-primary-600 text-white' :
                  i + 1 === step ? 'bg-primary-100 text-primary-700' :
                  'bg-surface-200 text-surface-500'
                }`}>
                  {i + 1 < step ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                  ) : i + 1}
                </div>
                <div className="hidden md:block ml-3">
                  <p className="text-sm font-medium text-surface-900">{s.title}</p>
                  <p className="text-xs text-surface-500">{s.desc}</p>
                </div>
                {i < steps.length - 1 && (
                  <div className={`hidden md:block w-16 h-0.5 ml-3 ${i + 1 < step ? 'bg-primary-600' : 'bg-surface-200'}`}></div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bento-card">
          {step === 1 && (
            <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); setStep(2) }}>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-surface-700 mb-2">Model Name *</label>
                <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className="input-field" required placeholder="e.g., MyAwesomeDetector" />
              </div>
              <div>
                <label htmlFor="task" className="block text-sm font-medium text-surface-700 mb-2">Task Type *</label>
                <select id="task" name="task" value={formData.task} onChange={handleChange} className="input-field" required>
                  <option value="">Select task type</option>
                  {tasks.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-surface-700 mb-2">Description *</label>
                <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={5} className="input-field resize-none" required placeholder="Describe your model's capabilities, architecture, training data, and use cases..." />
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" className="btn-secondary" disabled>Back</button>
                <button type="submit" className="btn-primary" disabled={!formData.name || !formData.task || !formData.description}>Continue</button>
              </div>
            </form>
          )}

          {step === 2 && (
            <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); setStep(3) }}>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-2">License *</label>
                <select name="license" value={formData.license} onChange={handleChange} className="input-field" required>
                  <option value="">Select license</option>
                  {licenses.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="repoUrl" className="block text-sm font-medium text-surface-700 mb-2">Repository URL *</label>
                <input type="url" id="repoUrl" name="repoUrl" value={formData.repoUrl} onChange={handleChange} className="input-field" required placeholder="https://github.com/username/repo" />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-3">Supported Hardware *</label>
                <div className="flex flex-wrap gap-2">
                  {hardwareOptions.map(hw => (
                    <label key={hw} className="inline-flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer hover:bg-surface-50 transition-colors">
                      <input type="checkbox" name="hardware" value={hw} checked={formData.hardware.includes(hw)} onChange={handleChange} className="rounded border-surface-300 text-primary-600 focus:ring-primary-500" />
                      <span className="text-sm text-surface-700">{hw}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" className="btn-secondary" onClick={() => setStep(1)}>Back</button>
                <button type="submit" className="btn-primary" disabled={!formData.license || !formData.repoUrl || formData.hardware.length === 0}>Continue</button>
              </div>
            </form>
          )}

          {step === 3 && (
            <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); setStep(4) }}>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-3">Pricing Model *</label>
                <div className="space-y-3">
                  {[
                    { value: 'free', label: 'Free / Open Source', desc: 'No cost, community supported' },
                    { value: 'per_inference', label: 'Per Inference', desc: 'Pay per API call or inference' },
                    { value: 'subscription', label: 'Monthly Subscription', desc: 'Fixed monthly fee for unlimited use' },
                    { value: 'revenue_share', label: 'Revenue Share', desc: 'Percentage of customer revenue' },
                  ].map(opt => (
                    <label key={opt.value} className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all ${
                      formData.priceType === opt.value ? 'border-primary-500 bg-primary-50' : 'border-surface-200 hover:border-surface-300'
                    }`}>
                      <input type="radio" name="priceType" value={opt.value} checked={formData.priceType === opt.value} onChange={handleChange} className="text-primary-600 focus:ring-primary-500" />
                      <div>
                        <p className="font-medium text-surface-900">{opt.label}</p>
                        <p className="text-sm text-surface-500">{opt.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              {formData.priceType !== 'free' && (
                <div>
                  <label htmlFor="priceValue" className="block text-sm font-medium text-surface-700 mb-2">Price Value *</label>
                  <input type="text" id="priceValue" name="priceValue" value={formData.priceValue} onChange={handleChange} className="input-field" placeholder={formData.priceType === 'per_inference' ? 'e.g., 0.001' : formData.priceType === 'subscription' ? 'e.g., 99' : 'e.g., 10'} required disabled={formData.priceType === 'free'} />
                  <p className="text-sm text-surface-500 mt-1">
                    {formData.priceType === 'per_inference' && 'USD per inference'}
                    {formData.priceType === 'subscription' && 'USD per month'}
                    {formData.priceType === 'revenue_share' && '% of revenue'}
                  </p>
                </div>
              )}
              <div className="flex justify-end gap-3">
                <button type="button" className="btn-secondary" onClick={() => setStep(2)}>Back</button>
                <button type="submit" className="btn-primary" disabled={formData.priceType !== 'free' && !formData.priceValue}>Continue</button>
              </div>
            </form>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div className="p-4 bg-primary-50 rounded-xl border border-primary-200">
                <h3 className="font-semibold text-primary-900 mb-3">Ready to Publish</h3>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between"><dt className="text-surface-600">Name</dt><dd className="font-medium text-surface-900">{formData.name || '—'}</dd></div>
                  <div className="flex justify-between"><dt className="text-surface-600">Task</dt><dd className="font-medium text-surface-900">{formData.task || '—'}</dd></div>
                  <div className="flex justify-between"><dt className="text-surface-600">License</dt><dd className="font-medium text-surface-900">{formData.license || '—'}</dd></div>
                  <div className="flex justify-between"><dt className="text-surface-600">Hardware</dt><dd className="font-medium text-surface-900">{formData.hardware.join(', ') || '—'}</dd></div>
                  <div className="flex justify-between"><dt className="text-surface-600">Pricing</dt><dd className="font-medium text-surface-900">{formData.priceType === 'free' ? 'Free' : `${formData.priceValue} (${formData.priceType})`}</dd></div>
                </dl>
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" className="btn-secondary" onClick={() => setStep(3)}>Back</button>
                <button type="button" className="btn-primary" onClick={() => alert('Model published! (Demo)')}>
                  Publish Model
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}