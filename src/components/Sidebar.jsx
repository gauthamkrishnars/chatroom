import { useState, useMemo } from 'react'
import {
  Hash,
  Plus,
  Search,
  MessageSquare,
  Code,
  Palette,
  Sparkles,
  Flame,
  Coffee,
  Terminal,
  Compass,
  X,
  Layers,
} from 'lucide-react'

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
          className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 flex w-72 flex-col border-r border-slate-200 bg-slate-50 transition-transform duration-200 ease-in-out lg:static lg:w-72 xl:w-80 lg:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-xl shadow-slate-300/40' : '-translate-x-full'
        }`}
      >
        {/* Header: Section Title & Create Room Button */}
        <div className="flex items-center justify-between border-b border-slate-200 p-4 bg-white/50">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-slate-500" />
            <h2 className="text-xs font-bold tracking-wider uppercase text-slate-700">
              Channels ({rooms.length})
            </h2>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onOpenCreateRoom}
              className="flex h-7 items-center gap-1 rounded-md bg-slate-900 px-2.5 text-xs font-medium text-white shadow-xs transition hover:bg-slate-800 active:scale-95"
              title="Create Room"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>New</span>
            </button>

            {/* Mobile close button inside drawer */}
            <button
              type="button"
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-800 lg:hidden"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Search Input */}
        <div className="p-3 border-b border-slate-200 bg-white/30">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search channels..."
              className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-xs text-slate-800 placeholder-slate-400 shadow-2xs transition focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>

        {/* Rooms List */}
        <div className="flex-1 overflow-y-auto p-2.5 space-y-1">
          {roomsLoading ? (
            <div className="space-y-2 p-2">
              {[1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  className="h-12 w-full rounded-lg bg-slate-200/60 animate-pulse border border-slate-200"
                />
              ))}
            </div>
          ) : filteredRooms.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-200 p-6 text-center bg-white">
              <Compass className="mx-auto h-6 w-6 text-slate-400" />
              <p className="mt-2 text-xs font-medium text-slate-600">No channels found</p>
              <button
                type="button"
                onClick={onOpenCreateRoom}
                className="mt-2 text-xs font-semibold text-indigo-600 hover:text-indigo-500"
              >
                + Create this channel
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
                  className={`group relative flex w-full items-start gap-2.5 rounded-lg p-2.5 text-left transition-colors ${
                    isActive
                      ? 'bg-white border border-slate-200 text-slate-900 shadow-2xs'
                      : 'border border-transparent text-slate-600 hover:bg-slate-200/50 hover:text-slate-900'
                  }`}
                >
                  {/* Left Accent indicator for active */}
                  {isActive && (
                    <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-indigo-600" />
                  )}

                  {/* Icon */}
                  <div
                    className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border transition-colors ${
                      isActive
                        ? 'border-indigo-200 bg-indigo-50 text-indigo-600'
                        : 'border-slate-200 bg-white text-slate-400 group-hover:border-slate-300 group-hover:text-slate-600'
                    }`}
                  >
                    <RoomIcon className="h-3.5 w-3.5" />
                  </div>

                  {/* Room Meta */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span
                        className={`truncate text-xs font-semibold ${
                          isActive ? 'text-slate-900' : 'text-slate-700 group-hover:text-slate-900'
                        }`}
                      >
                        {room.name}
                      </span>
                      {room.topic && (
                        <span className="shrink-0 rounded bg-slate-100 px-1.5 py-0.2 text-[9px] font-medium text-slate-500 border border-slate-200">
                          {room.topic}
                        </span>
                      )}
                    </div>

                    {room.description && (
                      <p className="mt-0.5 line-clamp-1 text-[11px] text-slate-500">
                        {room.description}
                      </p>
                    )}
                  </div>
                </button>
              )
            })
          )}
        </div>

        {/* Sidebar Footer Info */}
        <div className="border-t border-slate-200 p-3 bg-white">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-600">
            <div className="flex items-center justify-between font-medium text-slate-700">
              <span>Real Time Sync</span>
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
            </div>
            <p className="mt-1 text-[11px] text-slate-500 leading-normal">
              Firestore updates are distributed to all connected clients live.
            </p>
          </div>
        </div>
      </aside>
    </>
  )
}
