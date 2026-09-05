import { useState, useMemo } from 'react'
import {
  Hash,
  Plus,
  Search,
  MessageSquare,
  Code,
  Palette,
  Sparkles,
  Users,
  Flame,
  Coffee,
  Terminal,
  Compass,
  X,
  Radio,
} from 'lucide-react'

// Icon mapping helper
const ICON_MAP = {
  MessageSquare,
  Code,
  Palette,
  Sparkles,
  Flame,
  Coffee,
  Terminal,
  Compass,
  Hash,
}

export default function Sidebar({
  rooms = [],
  activeRoomId,
  onSelectRoom,
  onOpenCreateRoom,
  isOpen,
  onClose,
  roomsLoading,
}) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredRooms = useMemo(() => {
    if (!searchQuery.trim()) return rooms
    const q = searchQuery.toLowerCase()
    return rooms.filter(
      (r) =>
        r.name?.toLowerCase().includes(q) ||
        r.topic?.toLowerCase().includes(q) ||
        r.description?.toLowerCase().includes(q)
    )
  }, [rooms, searchQuery])

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 flex w-72 flex-col border-r border-slate-800/80 bg-[#0c0e17] transition-transform duration-200 ease-in-out lg:static lg:w-80 lg:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-2xl shadow-black' : '-translate-x-full'
        }`}
      >
        {/* Header: Title & Create Room Button */}
        <div className="flex items-center justify-between border-b border-slate-800/60 p-4">
          <div className="flex items-center gap-2">
            <Radio className="h-4 w-4 text-indigo-400" />
            <h2 className="text-sm font-bold tracking-wider uppercase text-slate-200">
              Rooms ({rooms.length})
            </h2>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onOpenCreateRoom}
              className="group flex h-8 items-center gap-1.5 rounded-lg bg-indigo-600 px-2.5 text-xs font-semibold text-white shadow-md shadow-indigo-600/20 transition-all hover:bg-indigo-500 hover:shadow-indigo-500/30 active:scale-95"
              title="Create Room"
            >
              <Plus className="h-3.5 w-3.5 transition-transform group-hover:rotate-90" />
              <span>Create</span>
            </button>

            {/* Mobile close button inside drawer */}
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Search Input */}
        <div className="p-3 border-b border-slate-800/40">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Find rooms or topics..."
              className="w-full rounded-lg border border-slate-800 bg-slate-900/60 py-1.5 pl-8 pr-3 text-xs text-slate-200 placeholder-slate-500 transition focus:border-indigo-500 focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>

        {/* Rooms List */}
        <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5">
          {roomsLoading ? (
            // Skeleton loaders
            <div className="space-y-2 p-2">
              {[1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  className="h-14 w-full rounded-xl bg-slate-800/40 animate-pulse border border-slate-800/50"
                />
              ))}
            </div>
          ) : filteredRooms.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-800 p-6 text-center">
              <Compass className="mx-auto h-7 w-7 text-slate-600" />
              <p className="mt-2 text-xs font-medium text-slate-400">No rooms found</p>
              <button
                type="button"
                onClick={onOpenCreateRoom}
                className="mt-3 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
              >
                + Create this room
              </button>
            </div>
          ) : (
            filteredRooms.map((room) => {
              const isActive = room.id === activeRoomId
              const RoomIcon = ICON_MAP[room.icon] || Hash

              return (
                <button
                  key={room.id}
                  type="button"
                  onClick={() => {
                    onSelectRoom(room.id)
                    onClose()
                  }}
                  className={`group relative flex w-full items-start gap-3 rounded-xl p-3 text-left transition-all duration-150 ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-950/60 to-slate-900/90 border border-indigo-500/40 text-white shadow-lg shadow-indigo-950/40'
                      : 'border border-transparent text-slate-400 hover:border-slate-800 hover:bg-slate-900/60 hover:text-slate-200'
                  }`}
                >
                  {/* Left Accent indicator for active */}
                  {isActive && (
                    <span className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full bg-indigo-500 shadow-sm shadow-indigo-400" />
                  )}

                  {/* Icon */}
                  <div
                    className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-colors ${
                      isActive
                        ? 'border-indigo-500/40 bg-indigo-600/20 text-indigo-300'
                        : 'border-slate-800 bg-slate-900/80 text-slate-500 group-hover:border-slate-700 group-hover:text-slate-300'
                    }`}
                  >
                    <RoomIcon className="h-4 w-4" />
                  </div>

                  {/* Room Meta */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span
                        className={`truncate text-xs font-bold ${
                          isActive ? 'text-white' : 'text-slate-200 group-hover:text-white'
                        }`}
                      >
                        {room.name}
                      </span>
                      {room.topic && (
                        <span
                          className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                            isActive
                              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                              : 'bg-slate-800/80 text-slate-400 border border-slate-700/50'
                          }`}
                        >
                          {room.topic}
                        </span>
                      )}
                    </div>

                    <p className="mt-1 line-clamp-1 text-[11px] text-slate-400">
                      {room.description || 'Open chat space'}
                    </p>

                    <div className="mt-1.5 flex items-center gap-2 text-[10px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span>{room.memberCount || 1} active</span>
                      </span>
                      <span>•</span>
                      <span className="text-emerald-400 font-medium">Real time</span>
                    </div>
                  </div>
                </button>
              )
            })
          )}
        </div>

        {/* Sidebar Info Card */}
        <div className="border-t border-slate-800/80 p-3 bg-slate-950/40">
          <div className="rounded-xl border border-slate-800/80 bg-slate-900/50 p-3 text-xs">
            <div className="flex items-center justify-between text-slate-400">
              <span className="font-semibold text-slate-300">Live Channels</span>
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
              Messages sync instantly across all devices and browser tabs.
            </p>
          </div>
        </div>
      </aside>
    </>
  )
}
