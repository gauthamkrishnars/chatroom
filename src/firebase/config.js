import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getAnalytics, isSupported } from 'firebase/analytics'

const clean = (val) =>
  typeof val === 'string' ? val.trim().replace(/^['"]|['"]$/g, '') : val

// Use environment variables if present, or fallback to the project's Firebase credentials
const firebaseConfig = {
  apiKey: clean(import.meta.env.VITE_FIREBASE_API_KEY) || 'AIzaSyBGucbJcnvB4DrGkJlqeSW4MJhCH0IQqOE',
  authDomain: clean(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN) || 'chatroom-1e02f.firebaseapp.com',
  projectId: clean(import.meta.env.VITE_FIREBASE_PROJECT_ID) || 'chatroom-1e02f',
  storageBucket: clean(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET) || 'chatroom-1e02f.firebasestorage.app',
  messagingSenderId: clean(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID) || '209193375345',
  appId: clean(import.meta.env.VITE_FIREBASE_APP_ID) || '1:209193375345:web:ebfba0b25298a08419edd0',
  measurementId: clean(import.meta.env.VITE_FIREBASE_MEASUREMENT_ID) || 'G-D23HCBPSZV',
}

// Check if Firebase configuration is provided and valid
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
