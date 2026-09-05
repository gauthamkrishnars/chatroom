import { useState } from 'react'
import {
  Menu,
  X,
  Sparkles,
  LogIn,
  LogOut,
  Radio,
  Zap,
} from 'lucide-react'
import { useAuth } from '../context/useAuth'
import { getAvatarGradient, getInitials } from '../utils/helpers'

export default function Navbar({
  activeRoom,
  onOpenMobileSidebar,
  isMobileSidebarOpen,
  onOpenAuthModal,
  onOpenCreateRoom,
}) {
  const { user, signOutUser, authActionLoading, isFirebaseConfigured } = useAuth()
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)

  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-800/80 bg-[#0c0e17]/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Mobile Toggle & Brand Logo */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenMobileSidebar}
            aria-label="Toggle navigation rooms"
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-800 bg-slate-900/80 text-slate-300 transition-all hover:border-slate-700 hover:bg-slate-800 hover:text-white lg:hidden"
          >
            {isMobileSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <a
            href="/"
            className="group flex items-center gap-2.5 transition-transform duration-150 hover:scale-[1.02]"
          >
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/20">
              <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-[#0c0e17]">
                <Radio className="h-4 w-4 text-indigo-400 animate-pulse" />
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-black tracking-tight text-white">PulseChat</span>
                <span className="rounded bg-indigo-500/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-400 border border-indigo-500/20">
                  Live
                </span>
              </div>
            </div>
          </a>
        </div>

        {/* Center: Active Channel Breadcrumb on medium+ screens */}
        <div className="hidden md:flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/60 px-3.5 py-1.5 text-xs text-slate-400">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-slate-300 font-semibold">{activeRoom?.name || 'Community Hub'}</span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-400">{activeRoom?.topic || 'Discussion'}</span>
        </div>

        {/* Right: Actions & User Auth */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Environment Status Badge */}
          <div className="hidden xl:flex items-center gap-1.5 rounded-md border border-slate-800/80 bg-slate-900/40 px-2.5 py-1 text-[11px] text-slate-400 font-mono">
            <Zap className={`h-3 w-3 ${isFirebaseConfigured ? 'text-emerald-400' : 'text-amber-400'}`} />
            <span>{isFirebaseConfigured ? 'Firebase Live' : 'Demo Mode (Sync Ready)'}</span>
          </div>

          <button
            type="button"
            onClick={onOpenCreateRoom}
            className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-3 py-1.5 text-xs font-semibold text-indigo-300 transition-all hover:border-indigo-500/60 hover:bg-indigo-500/20 hover:text-white"
          >
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            <span>New Room</span>
          </button>

          {user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/80 p-1 pr-2.5 transition-all hover:border-indigo-500/50 hover:bg-slate-800/90"
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName}
                    className="h-7 w-7 rounded-full object-cover ring-1 ring-indigo-500/40"
                  />
                ) : (
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br ${getAvatarGradient(
                      user.uid || user.displayName
                    )} text-xs font-bold ring-1 ring-white/10`}
                  >
                    {getInitials(user.displayName)}
                  </div>
                )}
                <span className="hidden sm:inline max-w-[110px] truncate text-xs font-medium text-slate-200">
                  {user.displayName}
                </span>
              </button>

              {/* Profile Dropdown */}
              {profileDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-800 bg-[#121522] p-2 shadow-2xl shadow-black/80 ring-1 ring-white/5 animate-in fade-in zoom-in-95 duration-100"
                  onClick={() => setProfileDropdownOpen(false)}
                >
                  <div className="border-b border-slate-800 px-3 py-2 text-left">
                    <p className="truncate text-xs font-bold text-white">{user.displayName}</p>
                    <p className="truncate text-[11px] text-slate-400">{user.email || 'Guest Profile'}</p>
                    {user.isDemo && (
                      <span className="mt-1 inline-block rounded bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-amber-300 border border-amber-500/20">
                        Demo Account
                      </span>
                    )}
                  </div>

                  <div className="pt-1.5">
                    <button
                      type="button"
                      onClick={onOpenCreateRoom}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs text-slate-300 transition hover:bg-slate-800 hover:text-white sm:hidden"
                    >
                      <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                      Create Room
                    </button>

                    <button
                      type="button"
                      onClick={signOutUser}
                      disabled={authActionLoading}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-rose-400 transition hover:bg-rose-500/10 hover:text-rose-300"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenAuthModal}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-md shadow-indigo-600/30 transition-all hover:bg-indigo-500 hover:shadow-indigo-500/40 active:scale-95"
            >
              <LogIn className="h-3.5 w-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
