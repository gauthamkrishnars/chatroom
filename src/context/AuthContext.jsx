import { useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, isFirebaseConfigured } from '../firebase/config'
import {
  loginWithGoogle,
  loginWithEmail,
  registerWithEmail,
  logoutUser,
} from '../firebase/authService'
import { AuthContext } from './authContextDef'

const LOCAL_USER_STORAGE_KEY = 'pulsechat_demo_user_v1'

function getInitialDemoUser() {
  try {
    const saved = localStorage.getItem(LOCAL_USER_STORAGE_KEY)
    if (saved) return JSON.parse(saved)
  } catch {
    // fallback
  }
  return {
    uid: 'demo_user_1',
    displayName: 'Guest Explorer',
    email: 'guest@pulsechat.app',
    photoURL: '',
    isDemo: true,
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => (isFirebaseConfigured ? null : getInitialDemoUser()))
  const [loading, setLoading] = useState(isFirebaseConfigured)
  const [authActionLoading, setAuthActionLoading] = useState(false)
  const [authError, setAuthError] = useState(null)

  useEffect(() => {
    let unsubscribe = () => {}

    if (isFirebaseConfigured && auth) {
      unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        if (firebaseUser) {
          setUser({
            uid: firebaseUser.uid,
            displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
            email: firebaseUser.email,
            photoURL: firebaseUser.photoURL || '',
            isDemo: false,
          })
        } else {
          setUser(null)
        }
        setLoading(false)
      })
    }

    return () => unsubscribe()
  }, [])

  const clearError = () => setAuthError(null)

  const handleGoogleSignIn = async () => {
    setAuthActionLoading(true)
    setAuthError(null)
    try {
      if (isFirebaseConfigured) {
        const loggedUser = await loginWithGoogle()
        return loggedUser
      } else {
        const demoUser = {
          uid: 'google_demo_' + Date.now().toString(36),
          displayName: 'Google Member',
          email: 'google.user@example.com',
          photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
          isDemo: true,
        }
        setUser(demoUser)
        localStorage.setItem(LOCAL_USER_STORAGE_KEY, JSON.stringify(demoUser))
        return demoUser
      }
    } catch (err) {
      setAuthError(err.message || 'Google sign in failed')
      throw err
    } finally {
      setAuthActionLoading(false)
    }
  }

  const handleEmailSignIn = async (email, password) => {
    setAuthActionLoading(true)
    setAuthError(null)
    try {
      if (isFirebaseConfigured) {
        const loggedUser = await loginWithEmail(email, password)
        return loggedUser
      } else {
        const demoUser = {
          uid: 'email_demo_' + Date.now().toString(36),
          displayName: email.split('@')[0] || 'Community Member',
          email,
          photoURL: '',
          isDemo: true,
        }
        setUser(demoUser)
        localStorage.setItem(LOCAL_USER_STORAGE_KEY, JSON.stringify(demoUser))
        return demoUser
      }
    } catch (err) {
      setAuthError(err.message || 'Email sign in failed')
      throw err
    } finally {
      setAuthActionLoading(false)
    }
  }

  const handleEmailSignUp = async (email, password, displayName) => {
    setAuthActionLoading(true)
    setAuthError(null)
    try {
      if (isFirebaseConfigured) {
        const newUser = await registerWithEmail(email, password, displayName)
        return newUser
      } else {
        const demoUser = {
          uid: 'signup_demo_' + Date.now().toString(36),
          displayName: displayName?.trim() || email.split('@')[0] || 'New Member',
          email,
          photoURL: '',
          isDemo: true,
        }
        setUser(demoUser)
        localStorage.setItem(LOCAL_USER_STORAGE_KEY, JSON.stringify(demoUser))
        return demoUser
      }
    } catch (err) {
      setAuthError(err.message || 'Registration failed')
      throw err
    } finally {
      setAuthActionLoading(false)
    }
  }

  const handleSignOut = async () => {
    setAuthActionLoading(true)
    try {
      if (isFirebaseConfigured) {
        await logoutUser()
      } else {
        localStorage.removeItem(LOCAL_USER_STORAGE_KEY)
        setUser(null)
      }
    } catch (err) {
      console.error('Sign out failed:', err)
    } finally {
      setAuthActionLoading(false)
    }
  }

  const handleDemoSignIn = (customName) => {
    const demoUser = {
      uid: 'demo_' + Date.now().toString(36),
      displayName: customName || 'Alex Mercer',
      email: `${(customName || 'alex').toLowerCase().replace(/\s+/g, '')}@community.io`,
      photoURL: '',
      isDemo: true,
    }
    setUser(demoUser)
    localStorage.setItem(LOCAL_USER_STORAGE_KEY, JSON.stringify(demoUser))
    return demoUser
  }

  const value = {
    user,
    loading,
    authActionLoading,
    authError,
    clearError,
    isFirebaseConfigured,
    signInWithGoogle: handleGoogleSignIn,
    signInWithEmail: handleEmailSignIn,
    signUpWithEmail: handleEmailSignUp,
    signOutUser: handleSignOut,
    signInDemoUser: handleDemoSignIn,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

