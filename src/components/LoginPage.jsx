import { useState } from 'react'
import { MessageSquare, Mail, Lock, User, Eye, EyeOff, Loader2 } from 'lucide-react'
import { useAuth } from '../context/useAuth'

export default function LoginPage({ onOpenLegal }) {
  const {
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    authActionLoading,
    authError,
    clearError,
  } = useAuth()

  const [mode, setMode] = useState('signin') // 'signin' or 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [localError, setLocalError] = useState('')

  const switchMode = (nextMode) => {
    setMode(nextMode)
    clearError()
    setLocalError('')
  }

  const handleGoogleSignIn = async () => {
    setLocalError('')
    try {
      await signInWithGoogle()
    } catch (err) {
      setLocalError(err.message || 'Google sign in failed.')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLocalError('')

    if (!email || !password) {
      setLocalError('Please enter both email and password.')
      return
    }

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters.')
      return
    }

    try {
      if (mode === 'signup') {
        if (!displayName.trim()) {
          setLocalError('Please provide your name.')
          return
        }
        await signUpWithEmail(email, password, displayName)
      } else {
        await signInWithEmail(email, password)
      }
    } catch (err) {
      setLocalError(err.message || 'Authentication failed.')
    }
  }

  const activeError = localError || authError

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Centered Auth Card */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-sm bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8">
          {/* Logo & Title */}
          <div className="text-center mb-6">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white mb-3 shadow-xs">
              <MessageSquare className="h-5 w-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              {mode === 'signin' ? 'Sign in to Chatroom' : 'Create your account'}
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              {mode === 'signin'
                ? 'Sign in to connect to the database and view channels.'
                : 'Join with your email to start chatting with your team.'}
            </p>
          </div>

          {/* Error Banner */}
          {activeError && (
            <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-700">
              {activeError}
            </div>
          )}

          {/* Google Sign In */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={authActionLoading}
            className="w-full flex items-center justify-center gap-2.5 rounded-lg border border-slate-200 bg-white py-2.5 px-4 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition shadow-2xs disabled:opacity-50"
          >
            {authActionLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-slate-600" />
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

          {/* Divider */}
          <div className="relative my-4 flex items-center justify-center">
            <div className="w-full border-t border-slate-200" />
            <span className="absolute bg-white px-2 text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
              or
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your Name"
                    maxLength={40}
                    className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-8 text-xs text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={authActionLoading}
              className="w-full mt-1 flex items-center justify-center rounded-lg bg-slate-900 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 transition disabled:opacity-50 cursor-pointer"
            >
              {authActionLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-white" />
              ) : (
                <span>{mode === 'signin' ? 'Sign In' : 'Create Account'}</span>
              )}
            </button>
          </form>

          {/* Switch mode */}
          <div className="mt-5 text-center text-xs text-slate-500">
            {mode === 'signin' ? (
              <p>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('signup')}
                  className="font-semibold text-slate-900 hover:underline cursor-pointer"
                >
                  Sign up
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('signin')}
                  className="font-semibold text-slate-900 hover:underline cursor-pointer"
                >
                  Sign in
                </button>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Simple Footer */}
      <footer className="py-4 text-center text-xs text-slate-400 border-t border-slate-200 bg-white">
        <div className="flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => onOpenLegal('terms')}
            className="hover:text-slate-600 transition"
          >
            Terms of Service
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={() => onOpenLegal('privacy')}
            className="hover:text-slate-600 transition"
          >
            Privacy Policy
          </button>
        </div>
      </footer>
    </div>
  )
}
