import { useState } from 'react'
import { Smile } from 'lucide-react'
import { formatTime, getAvatarGradient, getInitials } from '../utils/helpers'

const QUICK_EMOJIS = ['👍', '❤️', '🔥', '🚀', '😂', '🎉']

export default function MessageItem({
  message,
  currentUserId,
  onReact,
}) {
  const [showPicker, setShowPicker] = useState(false)
  const isOwn = message.userId === currentUserId
  const reactions = message.reactions || {}

  const handleReact = (emoji) => {
    onReact?.(message.id, emoji)
    setShowPicker(false)
  }

  return (
    <div
      className={`group relative flex gap-3 px-4 py-2.5 transition-colors hover:bg-slate-900/40 sm:px-6 ${
        isOwn ? 'flex-row-reverse' : 'flex-row'
      }`}
    >
      {/* User Avatar */}
      <div className="shrink-0 mt-0.5">
        {message.userAvatar ? (
          <img
            src={message.userAvatar}
            alt={message.userName}
            className="h-8 w-8 sm:h-9 sm:w-9 rounded-full object-cover ring-1 ring-white/10"
          />
        ) : (
          <div
            className={`flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-gradient-to-br ${getAvatarGradient(
              message.userId || message.userName
            )} text-xs font-bold ring-1 ring-white/10 shadow-md`}
          >
            {getInitials(message.userName)}
          </div>
        )}
      </div>

      {/* Message Content & Metadata */}
      <div className={`flex flex-col max-w-[85%] sm:max-w-[75%] ${isOwn ? 'items-end' : 'items-start'}`}>
        {/* Header: Name & Timestamp */}
        <div className={`flex items-center gap-2 mb-1 text-xs ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
          <span className="font-bold text-slate-200">{message.userName || 'Anonymous'}</span>
          {isOwn && (
            <span className="rounded bg-indigo-500/20 px-1.5 py-0.2 text-[10px] font-semibold text-indigo-300 border border-indigo-500/30">
              You
            </span>
          )}
          <span className="text-[11px] text-slate-500">{formatTime(message.createdAt)}</span>
        </div>

        {/* Text Bubble */}
        <div
          className={`relative rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm transition-all ${
            isOwn
              ? 'rounded-tr-xs bg-indigo-600 text-white shadow-indigo-900/30 selection:bg-white selection:text-indigo-600'
              : 'rounded-tl-xs border border-slate-800 bg-[#121522] text-slate-100 shadow-black/40'
          }`}
        >
          <p className="whitespace-pre-wrap break-words">{message.text}</p>
        </div>

        {/* Existing Reactions */}
        {Object.keys(reactions).length > 0 && (
          <div className={`mt-1.5 flex flex-wrap gap-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
            {Object.entries(reactions).map(([emoji, count]) => {
              if (count <= 0) return null
              return (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => handleReact(emoji)}
                  className="inline-flex items-center gap-1 rounded-full border border-slate-800 bg-slate-900/90 px-2 py-0.5 text-xs text-slate-300 transition hover:border-slate-700 hover:bg-slate-800"
                >
                  <span>{emoji}</span>
                  <span className="text-[10px] font-bold text-slate-400">{count}</span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Floating Action Menu on Hover */}
      <div
        className={`absolute top-1 hidden items-center gap-1 rounded-lg border border-slate-800 bg-slate-900/95 p-1 shadow-lg shadow-black/60 group-hover:flex z-10 ${
          isOwn ? 'left-4' : 'right-4'
        }`}
      >
        {QUICK_EMOJIS.slice(0, 4).map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => handleReact(emoji)}
            className="flex h-7 w-7 items-center justify-center rounded text-sm transition hover:bg-slate-800 active:scale-110"
            title={`React with ${emoji}`}
          >
            {emoji}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setShowPicker((p) => !p)}
          className="flex h-7 w-7 items-center justify-center rounded text-slate-400 hover:bg-slate-800 hover:text-white"
          title="More reactions"
        >
          <Smile className="h-3.5 w-3.5" />
        </button>

        {showPicker && (
          <div className="absolute top-9 right-0 flex gap-1 rounded-xl border border-slate-700 bg-slate-900 p-2 shadow-xl ring-1 ring-white/10 z-20">
            {QUICK_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => handleReact(emoji)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-base hover:bg-slate-800"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
