import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getAnalytics, isSupported } from 'firebase/analytics'

const clean = (val) =>
  typeof val === 'string' ? val.trim().replace(/^['"]|['"]$/g, '') : val

const firebaseConfig = {
  apiKey: clean(import.meta.env.VITE_FIREBASE_API_KEY),
  authDomain: clean(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN),
  projectId: clean(import.meta.env.VITE_FIREBASE_PROJECT_ID),
  storageBucket: clean(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET),
  messagingSenderId: clean(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID),
  appId: clean(import.meta.env.VITE_FIREBASE_APP_ID),
  measurementId: clean(import.meta.env.VITE_FIREBASE_MEASUREMENT_ID),
}

// Check if Firebase environment variables are provided and not dummy placeholders
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.apiKey !== 'your_api_key_here' &&
  firebaseConfig.projectId &&
  firebaseConfig.projectId !== 'your_project_id'
)

if (!isFirebaseConfigured && typeof window !== 'undefined') {
  console.warn(
    '[Firebase Config] Environment variables not detected. If you recently edited .env, please restart your Vite dev server (Ctrl+C then npm run dev).'
  )
}


let app = null
let auth = null
let db = null
let googleProvider = null
let analytics = null

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()
    auth = getAuth(app)
    db = getFirestore(app)
    googleProvider = new GoogleAuthProvider()
    googleProvider.setCustomParameters({ prompt: 'select_account' })

    // Optional Firebase Analytics
    if (typeof window !== 'undefined' && firebaseConfig.measurementId) {
      isSupported().then((supported) => {
        if (supported) {
          analytics = getAnalytics(app)
        }
      }).catch(() => {})
    }
  } catch (error) {
    console.error('Firebase initialization error:', error)
  }
}

export { app, auth, db, googleProvider, analytics }
