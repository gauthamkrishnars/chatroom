import { useState, useRef, useEffect } from 'react'
import {
  Hash,
  MessageSquare,
  Code,
  Palette,
  Sparkles,
  Flame,
  Coffee,
  Terminal,
  Compass,
  ArrowDown,
} from 'lucide-react'
import MessageList from './MessageList'
import MessageInput from './MessageInput'
import { useAuth } from '../context/useAuth'

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

export default function ChatArea({
  activeRoom,
  messages = [],
  messagesLoading = false,
  onSendMessage,
  onReact,
  onOpenAuth,
}) {
  const { user } = useAuth()
  const messagesEndRef = useRef(null)
  const containerRef = useRef(null)
  const [showScrollBottom, setShowScrollBottom] = useState(false)

  const RoomIcon = ICON_MAP[activeRoom?.icon] || Hash

  // Scroll to bottom helper
  const scrollToBottom = (behavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior })
  }

  // Auto-scroll when new messages arrive
  useEffect(() => {
    scrollToBottom('smooth')
  }, [messages])

  // Track scroll position to display "Scroll to bottom" button
  const handleScroll = () => {
    if (!containerRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current
    const isScrolledUp = scrollHeight - scrollTop - clientHeight > 150
    setShowScrollBottom(isScrolledUp)
  }

  if (!activeRoom) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center bg-[#08090e] p-8 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900 shadow-xl">
          <MessageSquare className="h-8 w-8 text-slate-500" />
        </div>
        <h2 className="mt-4 text-lg font-bold text-white">No Room Selected</h2>
        <p className="mt-1 text-xs text-slate-400">
          Pick a chat channel from the left sidebar to start messaging.
        </p>
      </div>
    )
  }

  return (
    <section className="relative flex flex-1 flex-col bg-[#08090e] overflow-hidden">
      {/* Room Header */}
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-800/80 bg-[#0c0e17]/80 px-4 sm:px-6 backdrop-blur-md">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-indigo-500/30 bg-indigo-500/10 text-indigo-300">
            <RoomIcon className="h-4 w-4" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="truncate text-sm sm:text-base font-bold text-white tracking-tight">
                {activeRoom.name}
              </h1>
              {activeRoom.topic && (
                <span className="hidden xs:inline rounded bg-slate-800 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-300 border border-slate-700/60">
                  {activeRoom.topic}
                </span>
              )}
            </div>
            <p className="truncate text-[11px] text-slate-400">
              {activeRoom.description || 'Open community discussion'}
            </p>
          </div>
        </div>

        {/* Right Info Badges */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-slate-800 bg-slate-900/80 px-2.5 py-1 text-[11px] text-slate-400 font-mono">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{messages.length} messages</span>
          </div>
        </div>
      </div>

      {/* Messages Stream */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="relative flex flex-1 flex-col overflow-y-auto"
      >
        <MessageList
          messages={messages}
          currentUserId={user?.uid}
          onReact={onReact}
          messagesLoading={messagesLoading}
          roomName={activeRoom.name}
        />
        <div ref={messagesEndRef} />

        {/* Floating Jump to Bottom Button */}
        {showScrollBottom && (
          <button
            type="button"
            onClick={() => scrollToBottom('smooth')}
            className="absolute bottom-4 right-6 z-20 flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-900/90 px-3 py-1.5 text-xs font-semibold text-white shadow-xl backdrop-blur-md transition hover:bg-slate-800 hover:border-indigo-500 active:scale-95 animate-in fade-in zoom-in-95 duration-150"
          >
            <ArrowDown className="h-3.5 w-3.5 text-indigo-400" />
            <span>New messages</span>
          </button>
        )}
      </div>

      {/* Message Input Box */}
      <MessageInput
        onSendMessage={onSendMessage}
        activeRoomName={activeRoom.name}
        user={user}
        onOpenAuth={onOpenAuth}
      />
    </section>
  )
}
