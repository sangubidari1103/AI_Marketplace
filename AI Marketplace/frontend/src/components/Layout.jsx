import { Outlet, Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { path: '/marketplace', label: 'Marketplace' },
  { path: '/advisor', label: 'AI Advisor' },
  { path: '/creator', label: 'Creator Hub' },
  { path: '/pricing', label: 'Pricing' },
  { path: '/dashboard', label: 'Dashboard' },
]

export default function Layout() {
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, isAuthenticated, signOut, loading } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    setMobileMenuOpen(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-surface-200">
          <nav className="section-container" aria-label="Main navigation">
            <div className="flex items-center justify-between h-16">
              <Link to="/" className="flex items-center gap-2 text-xl font-bold text-surface-900" aria-label="AI Marketplace Home">
                <svg className="w-8 h-8 text-primary-600" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                </svg>
                <span className="hidden sm:block">AI Marketplace</span>
              </Link>
            </div>
          </nav>
        </header>
        <main className="flex-1 pt-16">
          <Outlet />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-surface-200">
        <nav className="section-container" aria-label="Main navigation">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2 text-xl font-bold text-surface-900" aria-label="AI Marketplace Home">
              <svg className="w-8 h-8 text-primary-600" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              </svg>
              <span className="hidden sm:block">AI Marketplace</span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === item.path
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-surface-600 hover:bg-surface-100 hover:text-surface-900'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard" className="btn-secondary hidden sm:inline-flex">
                    Dashboard
                  </Link>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-surface-700 hidden sm:block">
                      {user?.user_metadata?.full_name || user?.email}
                    </span>
                    <button
                      onClick={handleSignOut}
                      className="btn-secondary text-sm"
                    >
                      Sign Out
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Link to="/auth" className="btn-secondary hidden sm:inline-flex">
                    Sign In
                  </Link>
                  <Link to="/auth" className="btn-primary">
                    Get Started
                  </Link>
                </>
              )}
            </div>

            <button
              className="md:hidden p-2 rounded-lg text-surface-600 hover:bg-surface-100"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {mobileMenuOpen && (
            <div id="mobile-menu" className="md:hidden py-4 border-t border-surface-200 animate-slide-up">
              <div className="flex flex-col gap-2">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-4 py-3 rounded-lg text-base font-medium ${
                      location.pathname === item.path
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-surface-600 hover:bg-surface-100 hover:text-surface-900'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="pt-4 flex flex-col gap-2">
                  {isAuthenticated ? (
                    <>
                      <Link to="/dashboard" className="btn-secondary" onClick={() => setMobileMenuOpen(false)}>
                        Dashboard
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="btn-secondary"
                      >
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link to="/auth" className="btn-secondary" onClick={() => setMobileMenuOpen(false)}>
                        Sign In
                      </Link>
                      <Link to="/auth" className="btn-primary" onClick={() => setMobileMenuOpen(false)}>
                        Get Started
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </nav>
      </header>

      <main className="flex-1 pt-16">
        <Outlet />
      </main>

      <footer className="bg-surface-900 text-surface-400 py-12">
        <div className="section-container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <Link to="/" className="flex items-center gap-2 text-lg font-bold text-white" aria-label="AI Marketplace Home">
                <svg className="w-7 h-7 text-primary-400" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                </svg>
                <span>AI Marketplace</span>
              </Link>
              <p className="mt-4 text-sm max-w-xs">The trusted marketplace for discovering, evaluating, and deploying AI models.</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/marketplace" className="hover:text-white transition-colors">Marketplace</Link></li>
                <li><Link to="/advisor" className="hover:text-white transition-colors">AI Advisor</Link></li>
                <li><Link to="/comparison" className="hover:text-white transition-colors">Model Comparison</Link></li>
                <li><Link to="/trust" className="hover:text-white transition-colors">Trust & Verification</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">For Creators</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/creator" className="hover:text-white transition-colors">Publish Models</Link></li>
                <li><Link to="/pricing" className="hover:text-white transition-colors">Monetization</Link></li>
                <li><Link to="/dashboard" className="hover:text-white transition-colors">Analytics</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-surface-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm">© 2024 AI Marketplace. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <a href="#" className="hover:text-white transition-colors" aria-label="Twitter">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/></svg>
              </a>
              <a href="#" className="hover:text-white transition-colors" aria-label="GitHub">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
              </a>
              <a href="#" className="hover:text-white transition-colors" aria-label="Discord">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.992 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.007-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.1.257.208.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.364 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.005-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.676-3.548-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333 1.007-2.419 2.157-2.419 1.164 0 2.157 1.094 2.157 2.42 0 1.333-.994 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333 1.007-2.419 2.157-2.419 1.164 0 2.157 1.094 2.157 2.42 0 1.333-.994 2.418-2.157 2.418z"/></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}