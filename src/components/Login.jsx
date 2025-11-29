import { useState } from 'react'
import { useAuth } from './AuthProvider'

export default function Login() {
  const { login, register, loginWithGoogle, error } = useAuth()
  const [mode, setMode] = useState('login') // or 'register'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [localError, setLocalError] = useState(null)

  const onSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setLocalError(null)
    try {
      if (mode === 'login') {
        await login(email, password)
      } else {
        await register(email, password, name)
      }
    } catch (err) {
      setLocalError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black px-4">
      <div className="w-full max-w-md space-y-6 bg-white dark:bg-brand-card shadow rounded-lg p-6 border border-gray-200 dark:border-brand-border">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">{mode === 'login' ? 'Sign in' : 'Create account'}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Access the Policy Manager</p>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300" htmlFor="name">Name</label>
              <input id="name" type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300" htmlFor="email">Email</label>
            <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300" htmlFor="password">Password</label>
            <input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          {(error || localError) && (
            <div className="text-sm text-red-600 dark:text-red-400">{error || localError}</div>
          )}
          <button type="submit" disabled={submitting} className="w-full inline-flex justify-center items-center gap-2 rounded-md bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-4 py-2 text-sm font-medium transition-colors">
            {submitting ? 'Please wait…' : (mode === 'login' ? 'Sign in' : 'Register')}
          </button>
        </form>
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
          <span className="text-xs text-gray-500 dark:text-gray-400">or</span>
          <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
        </div>
        <button onClick={loginWithGoogle} className="w-full inline-flex justify-center items-center gap-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-100 px-4 py-2 text-sm font-medium">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5"><path fill="#EA4335" d="M24 9.5c3.54 0 6.72 1.22 9.21 3.61l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.05 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.14-3.08-.39-4.55H24v9.02h12.92c-.56 2.99-2.25 5.53-4.79 7.22l7.73 6c4.51-4.17 7.12-10.32 7.12-17.69z"/><path fill="#FBBC05" d="M10.54 28.41A14.5 14.5 0 019.5 24c0-1.53.26-3.01.73-4.41l-7.98-6.19A23.915 23.915 0 000 24c0 3.86.9 7.51 2.47 10.75l8.07-6.34z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.91-5.79l-7.73-6c-2.15 1.36-4.92 2.16-8.18 2.16-6.26 0-11.57-3.55-14.46-8.72l-8.07 6.34C6.51 42.62 14.62 48 24 48z"/><path fill="none" d="M0 0h48v48H0z"/></svg>
          <span>Continue with Google</span>
        </button>
        <div className="text-center text-sm">
          {mode === 'login' ? (
            <button onClick={() => setMode('register')} className="text-blue-600 dark:text-blue-400 hover:underline">Need an account? Register</button>
          ) : (
            <button onClick={() => setMode('login')} className="text-blue-600 dark:text-blue-400 hover:underline">Have an account? Sign in</button>
          )}
        </div>
      </div>
    </div>
  )
}
