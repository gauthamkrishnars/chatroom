import { useState } from 'react'
import {
  Menu,
  X,
  Plus,
  LogIn,
  LogOut,
  Radio,
  CheckCircle2,
  ChevronDown,
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
    <header className="sticky top-0 z-30 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Mobile Toggle & Brand Logo */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenMobileSidebar}
            aria-label="Toggle navigation rooms"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 transition hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900 lg:hidden"
          >
            {isMobileSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <a
            href="/"
            className="group flex items-center gap-2.5 transition-opacity hover:opacity-90"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-600/20">
              <Radio className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-base font-bold tracking-tight text-slate-900">PulseChat</span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 border border-slate-200">
                  v2.0
                </span>
              </div>
            </div>
          </a>
        </div>

        {/* Center: Active Channel Breadcrumb on medium+ screens */}
        <div className="hidden md:flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1 text-xs text-slate-600 shadow-xs">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span className="font-semibold text-slate-800">{activeRoom?.name || 'Channel'}</span>
          <span className="text-slate-300">•</span>
          <span className="text-slate-500">{activeRoom?.topic || 'Discussion'}</span>
        </div>

        {/* Right: Actions & User Auth */}
        <div className="flex items-center gap-2.5">
          {/* Connection Status Badge */}
          <div className="hidden xl:flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] text-slate-600">
            <CheckCircle2 className={`h-3 w-3 ${isFirebaseConfigured ? 'text-emerald-500' : 'text-slate-400'}`} />
            <span>{isFirebaseConfigured ? 'Firebase Active' : 'Offline Storage'}</span>
          </div>

          <button
            type="button"
            onClick={onOpenCreateRoom}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 active:scale-95"
          >
            <Plus className="h-3.5 w-3.5 text-slate-500" />
            <span>New Room</span>
          </button>

          {user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 py-1 pl-1 pr-2.5 transition hover:border-slate-300 hover:bg-slate-100"
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName}
                    className="h-7 w-7 rounded-full object-cover ring-1 ring-slate-200"
                  />
                ) : (
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-full ${getAvatarGradient(
                      user.uid || user.displayName
                    )} text-xs font-bold shadow-xs`}
                  >
                    {getInitials(user.displayName)}
                  </div>
                )}
                <span className="hidden sm:inline max-w-[120px] truncate text-xs font-medium text-slate-800">
                  {user.displayName}
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </button>

              {/* Profile Dropdown */}
              {profileDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg shadow-slate-200/50 ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-100 z-50"
                  onClick={() => setProfileDropdownOpen(false)}
                >
                  <div className="border-b border-slate-100 px-3 py-2 text-left">
                    <p className="truncate text-xs font-bold text-slate-900">{user.displayName}</p>
                    <p className="truncate text-[11px] text-slate-500">{user.email || 'Authenticated User'}</p>
                  </div>

                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={signOutUser}
                      disabled={authActionLoading}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-rose-600 transition hover:bg-rose-50"
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
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:bg-slate-800 active:scale-95"
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
