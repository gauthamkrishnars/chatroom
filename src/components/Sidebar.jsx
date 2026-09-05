import { useState, useMemo } from 'react'
import {
  Hash,
  Plus,
  Search,
  X,
  LogOut,
} from 'lucide-react'
import { useAuth } from '../context/useAuth'
import { getAvatarGradient, getInitials } from '../utils/helpers'

export default function Sidebar({
  rooms = [],
  activeRoomId,
  onSelectRoom,
  onOpenCreateRoom,
  isOpen,
  onClose,
  roomsLoading,
}) {
  const { user, signOutUser } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')

  const filteredRooms = useMemo(() => {
    if (!searchQuery.trim()) return rooms
    const q = searchQuery.toLowerCase()
    return rooms.filter(
      (r) =>
        r.name?.toLowerCase().includes(q) ||
        r.description?.toLowerCase().includes(q)
    )
  }, [rooms, searchQuery])

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/30 lg:hidden transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-14 bottom-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-slate-50 transition-transform duration-200 ease-in-out lg:static lg:w-64 lg:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-lg shadow-slate-300/40' : '-translate-x-full'
        }`}
      >
        {/* Workspace Brand Header */}
        <div className="flex h-14 items-center justify-between border-b border-slate-200 px-4 bg-white">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-bold text-slate-900 tracking-tight">Team Workspace</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded text-slate-400 hover:text-slate-700 lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Channel Search */}
        <div className="p-3 border-b border-slate-200 bg-white/40">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Find a channel..."
              className="w-full rounded-md border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-xs text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:outline-none"
            />
          </div>
        </div>

        {/* Channels Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          <span>Channels</span>
          <button
            type="button"
            onClick={onOpenCreateRoom}
            className="rounded p-1 hover:bg-slate-200 hover:text-slate-800 transition"
            title="Create Channel"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Channels List */}
        <div className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5">
          {roomsLoading ? (
            <div className="space-y-1 p-2">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-7 rounded bg-slate-200/60 animate-pulse" />
              ))}
            </div>
          ) : filteredRooms.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-400">
              No channels found
            </div>
          ) : (
            filteredRooms.map((room) => {
              const isActive = room.id === activeRoomId

              return (
                <button
                  key={room.id}
                  type="button"
                  onClick={() => {
                    onSelectRoom(room.id)
                    onClose()
                  }}
                  className={`flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-xs transition-colors ${
                    isActive
                      ? 'bg-slate-200/80 font-semibold text-slate-900'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Hash className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{room.name}</span>
                </button>
              )
            })
          )}
        </div>

        {/* User Profile Footer */}
        {user && (
          <div className="border-t border-slate-200 p-3 bg-white flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName}
                  className="h-7 w-7 rounded-full object-cover shrink-0"
                />
              ) : (
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full shrink-0 ${getAvatarGradient(
                    user.uid || user.displayName
                  )} text-xs font-semibold`}
                >
                  {getInitials(user.displayName)}
                </div>
              )}
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-slate-900 leading-tight">
                  {user.displayName}
                </p>
                <p className="truncate text-[10px] text-slate-500">
                  {user.email}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={signOutUser}
              className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition shrink-0"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </aside>
    </>
  )
}
