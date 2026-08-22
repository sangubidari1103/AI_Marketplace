export default function Pricing() {
  const plans = [
    {
      name: 'Explorer',
      price: 0,
      period: 'month',
      description: 'Perfect for trying out the platform',
      features: [
        'Browse all models',
        'AI Advisor (10 queries/month)',
        'Basic model comparison (2 models)',
        'Trust score viewing',
        'Community support',
      ],
      cta: 'Start Free',
      popular: false,
    },
    {
      name: 'Developer',
      price: 49,
      period: 'month',
      description: 'For individual developers building with AI',
      features: [
        'Everything in Explorer',
        'Unlimited AI Advisor queries',
        'Advanced comparison (4 models)',
        'Deployment to 3 environments',
        'Priority email support',
        'Usage analytics',
        'Custom model uploads (5/month)',
      ],
      cta: 'Get Started',
      popular: true,
    },
    {
      name: 'Team',
      price: 199,
      period: 'month',
      description: 'For teams collaborating on AI projects',
      features: [
        'Everything in Developer',
        'Team workspace (5 seats)',
        'Shared model registry',
        'Deployment to 10 environments',
        'SSO & audit logs',
        'Dedicated support channel',
        'Custom model uploads (unlimited)',
        'Private model hosting',
      ],
      cta: 'Contact Sales',
      popular: false,
    },
  ]

  return (
    <div className="min-h-screen py-12">
      <div className="section-container max-w-7xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-5xl font-bold text-surface-900 mb-4">Simple, Transparent Pricing</h1>
          <p className="text-lg text-surface-600 max-w-2xl mx-auto">No hidden fees. No surprises. Pay only for what you use.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {plans.map((plan, i) => (
            <article key={i} className={`relative bento-card flex flex-col ${plan.popular ? 'border-primary-300 ring-2 ring-primary-200' : ''}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary-600 text-white text-xs font-medium rounded-full">
                  Most Popular
                </div>
              )}
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-surface-900 mb-2">{plan.name}</h3>
                <p className="text-surface-600 text-sm">{plan.description}</p>
              </div>
              <div className="mb-6">
                <span className="text-5xl font-bold text-surface-900">${plan.price}</span>
                <span className="text-surface-500">/{plan.period}</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature, fi) => (
                  <li key={fi} className="flex items-start gap-3 text-sm text-surface-600">
                    <svg className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <button className={`w-full ${plan.popular ? 'btn-primary' : 'btn-secondary'}`}>
                {plan.cta}
              </button>
            </article>
          ))}
        </div>

        <div className="bento-card">
          <h2 className="text-2xl font-bold text-surface-900 mb-6">Model Pricing (Pay-per-use)</h2>
          <p className="text-surface-600 mb-8">Each model sets its own pricing. You only pay for what you inference.</p>
          <div className="overflow-x-auto">
            <table className="w-full" role="table">
              <thead>
                <tr className="border-b border-surface-200">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider">Model Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider">Typical Range</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider">Billing</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider">Free Tier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-200">
                {[
                  { type: 'Object Detection (YOLO, RT-DETR)', range: '$0.0001 - $0.01 / inference', billing: 'Per inference', free: '10,000/mo' },
                  { type: 'Image Classification (ResNet, MobileNet)', range: '$0.00005 - $0.005 / inference', billing: 'Per inference', free: '50,000/mo' },
                  { type: 'LLMs (Llama, Mistral, Qwen)', range: '$0.10 - $2.00 / 1M tokens', billing: 'Per 1M tokens', free: '100K tokens/mo' },
                  { type: 'Speech Recognition (Whisper)', range: '$0.003 - $0.01 / minute', billing: 'Per minute', free: '60 min/mo' },
                  { type: 'Text-to-Speech', range: '$0.01 - $0.05 / 1K chars', billing: 'Per 1K chars', free: '100K chars/mo' },
                  { type: 'Image Generation (SDXL, Flux)', range: '$0.001 - $0.05 / image', billing: 'Per image', free: '50 images/mo' },
                  { type: 'Embedding Models', range: '$0.0001 - $0.001 / 1K tokens', billing: 'Per 1K tokens', free: '1M tokens/mo' },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-surface-50">
                    <td className="px-4 py-3 text-sm font-medium text-surface-900">{row.type}</td>
                    <td className="px-4 py-3 text-sm text-surface-600">{row.range}</td>
                    <td className="px-4 py-3 text-sm text-surface-600">{row.billing}</td>
                    <td className="px-4 py-3 text-sm text-primary-600 font-medium">{row.free}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-12 text-center">
          <h2 className="text-2xl font-bold text-surface-900 mb-4">Enterprise needs?</h2>
          <p className="text-surface-600 mb-6 max-w-xl mx-auto">Custom contracts, dedicated infrastructure, SLA guarantees, and white-glove onboarding.</p>
          <button className="btn-primary">Contact Sales</button>
        </div>
      </div>
    </div>
  )
}