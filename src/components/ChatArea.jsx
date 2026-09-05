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

  const scrollToBottom = (behavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior })
  }

  useEffect(() => {
    scrollToBottom('smooth')
  }, [messages])

  const handleScroll = () => {
    if (!containerRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current
    const isScrolledUp = scrollHeight - scrollTop - clientHeight > 150
    setShowScrollBottom(isScrolledUp)
  }

  if (!activeRoom) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center bg-slate-50 p-8 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-xs">
          <MessageSquare className="h-6 w-6 text-slate-400" />
        </div>
        <h2 className="mt-3 text-base font-semibold text-slate-800">No Channel Selected</h2>
        <p className="mt-1 text-xs text-slate-500">
          Select a channel from the left sidebar to start reading and messaging.
        </p>
      </div>
    )
  }

  return (
    <section className="relative flex flex-1 flex-col bg-white overflow-hidden">
      {/* Room Header */}
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-indigo-100 bg-indigo-50 text-indigo-600">
            <RoomIcon className="h-4 w-4" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="truncate text-sm sm:text-base font-bold text-slate-900">
                {activeRoom.name}
              </h1>
              {activeRoom.topic && (
                <span className="hidden xs:inline rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 border border-slate-200">
                  {activeRoom.topic}
                </span>
              )}
            </div>
            {activeRoom.description && (
              <p className="truncate text-[11px] text-slate-500">
                {activeRoom.description}
              </p>
            )}
          </div>
        </div>

        {/* Right Info Badges */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] text-slate-600">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span>{messages.length} messages</span>
          </div>
        </div>
      </div>

      {/* Messages Stream */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="relative flex flex-1 flex-col overflow-y-auto bg-slate-50/50"
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
            className="absolute bottom-4 right-6 z-20 flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-md transition hover:bg-slate-50 active:scale-95 animate-in fade-in duration-150"
          >
            <ArrowDown className="h-3.5 w-3.5 text-indigo-600" />
            <span>Latest messages</span>
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
