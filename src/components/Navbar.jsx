import {
  Menu,
  X,
  Plus,
  Hash,
} from 'lucide-react'

export default function Navbar({
  activeRoom,
  onOpenMobileSidebar,
  isMobileSidebarOpen,
  onOpenCreateRoom,
}) {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-200 bg-white">
      <div className="flex h-14 items-center justify-between px-4">
        {/* Left: Mobile Toggle & Brand */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenMobileSidebar}
            aria-label="Toggle navigation rooms"
            className="flex h-8 w-8 items-center justify-center rounded border border-slate-200 text-slate-600 hover:bg-slate-100 lg:hidden"
          >
            {isMobileSidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>

          <span className="text-sm font-bold tracking-tight text-slate-900">
            Chatroom
          </span>
        </div>

        {/* Center: Current Channel */}
        <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
          <Hash className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-slate-900 font-semibold">{activeRoom?.name || 'general'}</span>
          {activeRoom?.description && (
            <span className="hidden md:inline text-slate-400 text-[11px] max-w-sm truncate ml-2">
              — {activeRoom.description}
            </span>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenCreateRoom}
            className="flex items-center gap-1 rounded-md bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-slate-800 transition"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">New Channel</span>
          </button>
        </div>
      </div>
    </header>
  )
}
