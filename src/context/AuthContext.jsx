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

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedGuest = typeof window !== 'undefined' ? localStorage.getItem('pulsechat_guest_user') : null
      return savedGuest ? JSON.parse(savedGuest) : null
    } catch {
      return null
    }
  })
  const [loading, setLoading] = useState(() => Boolean(isFirebaseConfigured && auth))
  const [authActionLoading, setAuthActionLoading] = useState(false)
  const [authError, setAuthError] = useState(null)

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      return () => {}
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Member',
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL || '',
        })
        try {
          localStorage.removeItem('pulsechat_guest_user')
        } catch {}
      } else {
        try {
          const savedGuest = localStorage.getItem('pulsechat_guest_user')
          if (savedGuest) {
            setUser(JSON.parse(savedGuest))
          } else {
            setUser(null)
          }
        } catch {
          setUser(null)
        }
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const clearError = () => setAuthError(null)

  const handleGuestSignIn = (customName) => {
    setAuthActionLoading(true)
    setAuthError(null)
    try {
      const name = (customName || '').trim() || 'Guest User'
      const guestUser = {
        uid: 'guest_' + Date.now().toString(36),
        displayName: name,
        email: `${name.toLowerCase().replace(/[^a-z0-9]/g, '')}@guest.local`,
        photoURL: '',
        isGuest: true,
      }
      try {
        localStorage.setItem('pulsechat_guest_user', JSON.stringify(guestUser))
      } catch {}
      setUser(guestUser)
      return guestUser
    } catch (err) {
      setAuthError(err.message || 'Guest sign in failed')
      throw err
    } finally {
      setAuthActionLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setAuthActionLoading(true)
    setAuthError(null)
    try {
      if (isFirebaseConfigured) {
        const loggedUser = await loginWithGoogle()
        return loggedUser
      } else {
        return handleGuestSignIn('Google Guest')
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
        const fallbackName = email.split('@')[0] || 'User'
        return handleGuestSignIn(fallbackName)
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
        if (newUser) {
          setUser({
            uid: newUser.uid,
            displayName: displayName?.trim() || newUser.displayName || email.split('@')[0],
            email: newUser.email,
            photoURL: newUser.photoURL || '',
          })
        }
        return newUser
      } else {
        return handleGuestSignIn(displayName || email.split('@')[0])
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
      if (isFirebaseConfigured && auth) {
        await logoutUser()
      }
      try {
        localStorage.removeItem('pulsechat_guest_user')
      } catch {}
      setUser(null)
    } catch (err) {
      console.error('Sign out failed:', err)
    } finally {
      setAuthActionLoading(false)
    }
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
    signInAsGuest: handleGuestSignIn,
    signOutUser: handleSignOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
