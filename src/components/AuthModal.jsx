import { useState } from 'react'
import {
  X,
  LogIn,
  UserPlus,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Loader2,
  Zap,
} from 'lucide-react'
import { useAuth } from '../context/useAuth'

export default function AuthModal({ isOpen, onClose }) {
  const {
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signInDemoUser,
    authActionLoading,
    authError,
    clearError,
    isFirebaseConfigured,
  } = useAuth()

  const [mode, setMode] = useState('signin') // 'signin' or 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [localError, setLocalError] = useState('')

  if (!isOpen) return null

  const switchMode = (nextMode) => {
    setMode(nextMode)
    clearError()
    setLocalError('')
  }

  const handleGoogleAuth = async () => {
    setLocalError('')
    try {
      await signInWithGoogle()
      onClose()
    } catch (err) {
      setLocalError(err.message)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLocalError('')

    if (!email || !password) {
      setLocalError('Please fill in both email and password.')
      return
    }

    if (password.length < 6) {
      setLocalError('Password must contain at least 6 characters.')
      return
    }

    try {
      if (mode === 'signup') {
        if (!displayName.trim()) {
          setLocalError('Please provide a display name.')
          return
        }
        await signUpWithEmail(email, password, displayName)
      } else {
        await signInWithEmail(email, password)
      }
      onClose()
    } catch (err) {
      setLocalError(err.message)
    }
  }

  const handleQuickDemo = (name) => {
    signInDemoUser(name)
    onClose()
  }

  const activeError = localError || authError

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-[#0f121d] p-6 shadow-2xl shadow-black/90 ring-1 ring-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          disabled={authActionLoading}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
            {mode === 'signin' ? <LogIn className="h-5 w-5" /> : <UserPlus className="h-5 w-5" />}
          </div>
          <h2 className="mt-3 text-lg font-bold text-white">
            {mode === 'signin' ? 'Sign In to PulseChat' : 'Create Your Account'}
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            {mode === 'signin'
              ? 'Join conversations and connect with channels in real time.'
              : 'Pick your display name and hop into active rooms.'}
          </p>
        </div>

        {/* Firebase Config Notice if in preview */}
        {!isFirebaseConfigured && (
          <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-left text-xs text-amber-200">
            <div className="flex items-center gap-1.5 font-bold text-amber-300">
              <Zap className="h-3.5 w-3.5" />
              <span>Demo Mode Active</span>
            </div>
            <p className="mt-1 text-[11px] text-amber-200/90 leading-relaxed">
              Firebase credentials are not set in <code className="rounded bg-amber-950/60 px-1 py-0.5 text-amber-300">.env</code>. You can test all features right now with instant demo accounts!
            </p>
          </div>
        )}

        {/* Error Alert */}
        {activeError && (
          <div className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-left text-xs text-rose-300">
            {activeError}
          </div>
        )}

        {/* Tab switch */}
        <div className="mt-5 grid grid-cols-2 gap-1 rounded-xl border border-slate-800 bg-slate-900/80 p-1">
          <button
            type="button"
            onClick={() => switchMode('signin')}
            className={`rounded-lg py-1.5 text-xs font-bold transition ${
              mode === 'signin'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => switchMode('signup')}
            className={`rounded-lg py-1.5 text-xs font-bold transition ${
              mode === 'signup'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Google OAuth Button */}
        <div className="mt-5">
          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={authActionLoading}
            className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-slate-700 bg-slate-900/90 px-4 py-2.5 text-xs font-bold text-slate-100 shadow-md transition hover:border-slate-600 hover:bg-slate-800 disabled:opacity-50 active:scale-95"
          >
            {authActionLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
            ) : (
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5c1.54 0 2.92.54 4.01 1.43l3.01-3.01C17.2 1.76 14.77 1 12 1 7.42 1 3.53 3.6 1.63 7.37l3.66 2.84C6.17 7.4 8.84 5 12 5z"
                />
                <path
                  fill="#4285F4"
                  d="M23.49 12.28c0-.79-.07-1.54-.19-2.28H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58l3.71 2.88c2.16-2 3.71-4.94 3.71-8.69z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.29 14.79c-.25-.74-.39-1.54-.39-2.36s.14-1.62.39-2.36L1.63 7.37C.59 9.44 0 11.68 0 14.07s.59 4.63 1.63 6.7l3.66-2.84z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c3.24 0 5.95-1.08 7.93-2.91l-3.71-2.88c-1.07.72-2.45 1.16-4.22 1.16-3.16 0-5.83-2.4-6.71-5.21L1.63 15.98C3.53 19.75 7.42 23 12 23z"
                />
              </svg>
            )}
            <span>Continue with Google</span>
          </button>
        </div>

        {/* Divider */}
        <div className="relative my-4 flex items-center justify-center">
          <div className="w-full border-t border-slate-800" />
          <span className="absolute bg-[#0f121d] px-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            or with email
          </span>
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Display Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Maya Lin"
                  maxLength={30}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 py-2 pl-9 pr-3 text-xs text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full rounded-xl border border-slate-800 bg-slate-900 py-2 pl-9 pr-3 text-xs text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full rounded-xl border border-slate-800 bg-slate-900 py-2 pl-9 pr-9 text-xs text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={authActionLoading}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-500 disabled:opacity-50 active:scale-95"
          >
            {authActionLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <span>{mode === 'signin' ? 'Sign In' : 'Create Account'}</span>
            )}
          </button>
        </form>

        {/* Quick Demo Test Profiles for instant evaluation */}
        {!isFirebaseConfigured && (
          <div className="mt-5 border-t border-slate-800/80 pt-4">
            <span className="block text-center text-[11px] font-semibold text-slate-400 mb-2">
              Quick test profiles:
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('Jordan Cole')}
                className="rounded-lg border border-slate-800 bg-slate-900/60 px-2.5 py-1.5 text-xs text-slate-300 hover:border-indigo-500/50 hover:bg-slate-800"
              >
                Jordan Cole
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('Aria Stark')}
                className="rounded-lg border border-slate-800 bg-slate-900/60 px-2.5 py-1.5 text-xs text-slate-300 hover:border-indigo-500/50 hover:bg-slate-800"
              >
                Aria Stark
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
