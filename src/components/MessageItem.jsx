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
      className={`group relative flex gap-3 px-4 py-2 transition-colors hover:bg-slate-100/60 sm:px-6 ${
        isOwn ? 'flex-row-reverse' : 'flex-row'
      }`}
    >
      {/* User Avatar */}
      <div className="shrink-0 mt-0.5">
        {message.userAvatar ? (
          <img
            src={message.userAvatar}
            alt={message.userName}
            className="h-8 w-8 sm:h-8.5 sm:w-8.5 rounded-full object-cover ring-1 ring-slate-200"
          />
        ) : (
          <div
            className={`flex h-8 w-8 sm:h-8.5 sm:w-8.5 items-center justify-center rounded-full ${getAvatarGradient(
              message.userId || message.userName
            )} text-xs font-bold shadow-xs`}
          >
            {getInitials(message.userName)}
          </div>
        )}
      </div>

      {/* Message Content & Metadata */}
      <div className={`flex flex-col max-w-[85%] sm:max-w-[75%] ${isOwn ? 'items-end' : 'items-start'}`}>
        {/* Header: Name & Timestamp */}
        <div className={`flex items-center gap-2 mb-1 text-xs ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
          <span className="font-semibold text-slate-800">{message.userName || 'Member'}</span>
          {isOwn && (
            <span className="rounded bg-slate-100 px-1.5 py-0.2 text-[10px] font-medium text-slate-600 border border-slate-200">
              You
            </span>
          )}
          <span className="text-[11px] text-slate-400">{formatTime(message.createdAt)}</span>
        </div>

        {/* Text Bubble */}
        <div
          className={`relative rounded-2xl px-4 py-2.5 text-sm leading-relaxed transition-all ${
            isOwn
              ? 'rounded-tr-xs bg-slate-900 text-white shadow-xs'
              : 'rounded-tl-xs border border-slate-200 bg-white text-slate-900 shadow-2xs'
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
                  className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-xs text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 shadow-2xs"
                >
                  <span>{emoji}</span>
                  <span className="text-[10px] font-semibold text-slate-500">{count}</span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Floating Action Menu on Hover */}
      <div
        className={`absolute top-1 hidden items-center gap-0.5 rounded-lg border border-slate-200 bg-white p-1 shadow-md group-hover:flex z-10 ${
          isOwn ? 'left-4' : 'right-4'
        }`}
      >
        {QUICK_EMOJIS.slice(0, 4).map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => handleReact(emoji)}
            className="flex h-6 w-6 items-center justify-center rounded text-xs transition hover:bg-slate-100 active:scale-110"
            title={`React with ${emoji}`}
          >
            {emoji}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setShowPicker((p) => !p)}
          className="flex h-6 w-6 items-center justify-center rounded text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          title="More reactions"
        >
          <Smile className="h-3 w-3" />
        </button>

        {showPicker && (
          <div className="absolute top-8 right-0 flex gap-1 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg ring-1 ring-black/5 z-20">
            {QUICK_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => handleReact(emoji)}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-sm hover:bg-slate-100"
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
