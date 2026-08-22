import { Link } from 'react-router-dom'

export default function Landing() {
  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden bg-gradient-to-b from-primary-50 via-white to-surface-50 py-20 lg:py-32">
        <div className="section-container">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 text-primary-700 text-sm font-medium mb-8 animate-fade-in">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
              </span>
              <span>AI Model Advisor now in beta</span>
            </div>

            <h1 className="text-5xl lg:text-7xl font-bold text-surface-900 tracking-tight text-balance mb-8 animate-slide-up">
              Find the right AI model
              <br />
              <span className="text-gradient">in seconds, not weeks</span>
            </h1>

            <p className="text-lg lg:text-xl text-surface-600 max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: '100ms' }}>
              Describe what you're building. Our AI Advisor analyzes your requirements, compares models across benchmarks, pricing, and hardware compatibility, then recommends the best fit with clear reasoning.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '200ms' }}>
              <Link to="/advisor" className="btn-primary text-base px-8 py-3 w-full sm:w-auto">
                Try AI Advisor
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link to="/marketplace" className="btn-secondary text-base px-8 py-3 w-full sm:w-auto">
                Browse Models
              </Link>
            </div>

            <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-sm text-surface-500 animate-fade-in" style={{ animationDelay: '300ms' }}>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4 text-primary-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                No credit card required
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4 text-primary-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                500+ verified models
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4 text-primary-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                Deploy in minutes
              </span>
            </div>
          </div>
        </div>

        <div className="absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-200/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary-300/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
      </section>

      <section className="py-20 lg:py-28 bg-white border-y border-surface-200">
        <div className="section-container">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-surface-900 mb-4">Why AI Marketplace?</h2>
            <p className="text-lg text-surface-600 max-w-2xl mx-auto">Everything you need to go from idea to production AI</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.734-.988-2.386l-.548-.547z" />
                  </svg>
                ),
                title: 'AI-Powered Discovery',
                desc: 'Describe your use case in plain English. Our Nemotron-powered advisor understands requirements and matches you with compatible models.'
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                ),
                title: 'Trust & Verification',
                desc: 'Every model gets a trust score based on benchmark verification, creator reputation, community reviews, and security audits.'
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                ),
                title: 'Instant Deployment',
                desc: 'One-click deployment to your infrastructure. Docker images, serverless endpoints, or edge-optimized binaries.'
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                title: 'Transparent Pricing',
                desc: 'Per-inference, subscription, or revenue-share models. No hidden fees. Cost estimates before you deploy.'
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                ),
                title: 'Creator Ecosystem',
                desc: 'Publish your models, earn revenue, build reputation. Tools for versioning, benchmarking, and customer support.'
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                  </svg>
                ),
                title: 'Hardware Compatibility',
                desc: 'Filter by GPU, CPU, memory, and edge device constraints. Know exactly what runs on your hardware before downloading.'
              },
            ].map((feature, i) => (
              <article key={i} className="bento-card-hover group">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary-100 text-primary-600 mb-4 group-hover:bg-primary-600 group-hover:text-white transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-surface-900 mb-2">{feature.title}</h3>
                <p className="text-surface-600 text-sm leading-relaxed">{feature.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-28 bg-surface-50">
        <div className="section-container">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-surface-900 mb-4">How it works</h2>
            <p className="text-lg text-surface-600 max-w-2xl mx-auto">From requirement to deployment in 4 steps</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: '01', title: 'Describe', desc: 'Tell the AI Advisor what you need: "cheap vision model for defect detection on RTX 4050"' },
              { step: '02', title: 'Match', desc: 'Our engine filters 500+ models by hardware, budget, latency, and task compatibility' },
              { step: '03', title: 'Compare', desc: 'Side-by-side benchmarks, trust scores, pricing, and AI-generated reasoning' },
              { step: '04', title: 'Deploy', desc: 'One-click deploy to cloud, edge, or local. Get Docker images, API endpoints, or binaries' },
            ].map((item, i) => (
              <div key={i} className="relative bento-card flex flex-col">
                <span className="text-3xl font-bold text-primary-200 mb-2">{item.step}</span>
                <h3 className="text-lg font-semibold text-surface-900 mb-2">{item.title}</h3>
                <p className="text-surface-600 text-sm flex-1">{item.desc}</p>
                {i < 3 && (
                  <div className="absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2 hidden lg:block">
                    <svg className="w-6 h-6 text-surface-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-28 bg-surface-900">
        <div className="section-container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">Ready to find your model?</h2>
            <p className="text-lg text-surface-300 mb-8">Join thousands of developers building with confidence on AI Marketplace</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/advisor" className="btn-primary text-base px-8 py-3 w-full sm:w-auto">
                Start Free
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link to="/marketplace" className="btn-secondary bg-surface-800 text-surface-100 border-surface-700 hover:bg-surface-700 text-base px-8 py-3 w-full sm:w-auto">
                Explore Marketplace
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}