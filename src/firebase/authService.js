import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
} from 'firebase/auth'
import { auth, googleProvider, isFirebaseConfigured } from './config'

/**
 * Sign in using Google OAuth Popup
 */
export async function loginWithGoogle() {
  if (!isFirebaseConfigured || !auth || !googleProvider) {
    throw new Error('Firebase configuration missing. Set your environment variables in .env')
  }
  try {
    const result = await signInWithPopup(auth, googleProvider)
    return result.user
  } catch (error) {
    if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('Sign in window was closed before completing.')
    }
    if (error.code === 'auth/cancelled-popup-request') {
      throw new Error('Multiple popups opened. Try again.')
    }
    throw new Error(error.message || 'Failed to sign in with Google.')
  }
}

/**
 * Register a new user with Email, Password, and Display Name
 */
export async function registerWithEmail(email, password, displayName) {
  if (!isFirebaseConfigured || !auth) {
    throw new Error('Firebase configuration missing. Set your environment variables in .env')
  }
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    if (displayName && userCredential.user) {
      await updateProfile(userCredential.user, {
        displayName: displayName.trim(),
      })
    }
    return userCredential.user
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      throw new Error('An account with this email already exists.')
    }
    if (error.code === 'auth/invalid-email') {
      throw new Error('Please enter a valid email address.')
    }
    if (error.code === 'auth/weak-password') {
      throw new Error('Password should be at least 6 characters long.')
    }
    throw new Error(error.message || 'Failed to create account.')
  }
}

/**
 * Sign in an existing user with Email and Password
 */
export async function loginWithEmail(email, password) {
  if (!isFirebaseConfigured || !auth) {
    throw new Error('Firebase configuration missing. Set your environment variables in .env')
  }
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    return userCredential.user
  } catch (error) {
    if (
      error.code === 'auth/user-not-found' ||
      error.code === 'auth/wrong-password' ||
      error.code === 'auth/invalid-credential'
    ) {
      throw new Error('Incorrect email or password. Please verify and try again.')
    }
    if (error.code === 'auth/too-many-requests') {
      throw new Error('Too many failed attempts. Please wait a minute and try again.')
    }
    throw new Error(error.message || 'Failed to sign in.')
  }
}

/**
 * Sign out current authenticated user
 */
export async function logoutUser() {
  if (!isFirebaseConfigured || !auth) {
    return true
  }
  try {
    await signOut(auth)
    return true
  } catch (error) {
    console.error('Sign out error:', error)
    throw new Error('Failed to sign out. Please try again.')
  }
}
