/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { account } from '../lib/appwriteClient'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchUser = useCallback(async () => {
    try {
      const u = await account.get()
      setUser(u)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // Handle OAuth callback path; after Google redirects back
    const path = window.location.pathname
    if (path === '/oauth' || path === '/auth' || path === '/auth/oauth') {
      fetchUser().then(() => {
        // replace history to root so app renders main UI
        window.history.replaceState(null, '', '/')
      })
    } else {
      fetchUser()
    }
  }, [fetchUser])

  const register = async (email, password, name) => {
    setError(null)
    try {
      const newUser = await account.create('unique()', email, password, name)
      // auto login after registration
      await account.createEmailSession(email, password)
      await fetchUser()
      return newUser
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const login = async (email, password) => {
    setError(null)
    try {
      await account.createEmailSession(email, password)
      await fetchUser()
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const loginWithGoogle = () => {
    // Redirect-based OAuth flow. Ensure redirect URL is whitelisted in Appwrite console.
    const success = window.location.origin + '/oauth'
    const failure = window.location.origin + '/login'
    account.createOAuth2Session('google', success, failure)
  }

  const logout = async () => {
    try {
      await account.deleteSessions()
    } catch {
      // ignore
    }
    setUser(null)
  }

  const value = {
    user,
    loading,
    error,
    register,
    login,
    loginWithGoogle,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
