import { useAuth } from './AuthProvider'

export default function Navbar({ onToggleSidebar }) {
  const { user, logout } = useAuth()
  return (
	<header className="bg-white dark:bg-surface-dark border-b border-gray-200 dark:border-brand-border sticky top-0 z-40 transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button className="lg:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800" onClick={onToggleSidebar} aria-label="Open menu">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-gray-700 dark:text-gray-300"><path fillRule="evenodd" d="M3.75 5.25a.75.75 0 01.75-.75h15a.75.75 0 010 1.5h-15a.75.75 0 01-.75-.75zm0 6a.75.75 0 01.75-.75h15a.75.75 0 010 1.5h-15a.75.75 0 01-.75-.75zm0 6a.75.75 0 01.75-.75h15a.75.75 0 010 1.5h-15a.75.75 0 01-.75-.75z" clipRule="evenodd"/></svg>
          </button>
          <span className="font-semibold text-lg text-gray-800 dark:text-gray-100 transition-colors">Policy Manager</span>
        </div>
        <div className="flex items-center gap-4">
          {/* External apps */}
          <div className="hidden md:flex items-center gap-2">
            <a
              href="https://mohidul-hq.github.io/DigitalRefundMS/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-md border border-gray-200 dark:border-brand-border bg-white dark:bg-brand-card text-gray-700 dark:text-brand-text hover:bg-gray-50 dark:hover:bg-brand-hover px-3 py-1.5 text-sm"
            >
              Refund MS
            </a>
            <a
              href="https://mohidul-hq.github.io/DigitalSevaService_Invoice/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-md border border-gray-200 dark:border-brand-border bg-white dark:bg-brand-card text-gray-700 dark:text-brand-text hover:bg-gray-50 dark:hover:bg-brand-hover px-3 py-1.5 text-sm"
            >
              Invoice
            </a>
            <a
              href="https://mohidul-hq.github.io/Deposit-MS/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-md border border-gray-200 dark:border-brand-border bg-white dark:bg-brand-card text-gray-700 dark:text-brand-text hover:bg-gray-50 dark:hover:bg-brand-hover px-3 py-1.5 text-sm"
            >
              Deposit MS
            </a>
          </div>
          {user && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium">
                {user.name?.[0] || user.email[0].toUpperCase()}
              </div>
              <span className="hidden sm:inline text-sm text-gray-700 dark:text-gray-300 max-w-[160px] truncate" title={user.email}>{user.email}</span>
            </div>
          )}
          <button className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800" title="Logout" onClick={logout}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5 text-gray-600 dark:text-gray-300"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6A2.25 2.25 0 005.25 5.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"/></svg>
          </button>
          <button
            type="button"
            aria-label="Toggle theme"
            onClick={() => import('../utils/theme').then(m => m.toggleTheme())}
            className="p-2 rounded-md border border-gray-200 dark:border-brand-border bg-gray-50 dark:bg-brand-card text-gray-700 dark:text-brand-text hover:bg-gray-100 dark:hover:bg-brand-hover transition-colors"
          >
            <span className="dark:hidden">☀️</span>
            <span className="hidden dark:inline">🌙</span>
          </button>
        </div>
      </div>
      <div className="h-1 bg-gradient-to-r from-blue-500 via-sky-400 to-cyan-500" />
    </header>
  )
}
