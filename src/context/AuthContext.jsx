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
  const [user, setUser] = useState(null)
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
            displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Member',
            email: firebaseUser.email,
            photoURL: firebaseUser.photoURL || '',
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
        throw new Error('Firebase is not configured. Please add your credentials in .env')
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
        throw new Error('Firebase is not configured. Please add your credentials in .env')
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
        throw new Error('Firebase is not configured. Please add your credentials in .env')
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
      }
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
    signOutUser: handleSignOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
