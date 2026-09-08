import { formatTime, getAvatarGradient, getInitials } from '../utils/helpers'

const QUICK_REACTIONS = ['👍', '❤️', '🔥', '🎉']

export default function MessageItem({ message, onToggleReaction }) {
  const reactions = message.reactions || {}
  const activeReactions = Object.entries(reactions).filter(([, count]) => count > 0)

  return (
    <div className="group relative flex gap-3 px-4 py-2 hover:bg-slate-50/80 transition-colors">
      {/* Quick Reaction Bar (on hover) */}
      {onToggleReaction && (
        <div className="absolute right-4 -top-3 hidden group-hover:flex items-center gap-0.5 rounded-lg border border-slate-200 bg-white px-1.5 py-0.5 shadow-xs z-10">
          {QUICK_REACTIONS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => onToggleReaction(message.id, emoji)}
              className="rounded p-1 text-xs hover:scale-125 transition cursor-pointer"
              title={`React with ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Avatar */}
      <div className="shrink-0 mt-0.5">
        {message.userAvatar ? (
          <img
            src={message.userAvatar}
            alt={message.userName}
            className="h-8 w-8 rounded-md object-cover"
          />
        ) : (
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-md ${getAvatarGradient(
              message.userId || message.userName
            )} text-xs font-semibold`}
          >
            {getInitials(message.userName)}
          </div>
        )}
      </div>

      {/* Message Body */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="text-xs font-bold text-slate-900">
            {message.userName || 'Member'}
          </span>
          <span className="text-[11px] text-slate-400">
            {formatTime(message.createdAt)}
          </span>
        </div>

        <p className="mt-0.5 text-xs text-slate-800 leading-relaxed whitespace-pre-wrap break-words">
          {message.text}
        </p>

        {/* Reactions List */}
        {activeReactions.length > 0 && (
          <div className="mt-1.5 flex flex-wrap items-center gap-1">
            {activeReactions.map(([emoji, count]) => (
              <button
                key={emoji}
                type="button"
                onClick={() => onToggleReaction?.(message.id, emoji)}
                className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[11px] font-medium text-slate-600 hover:bg-slate-100 hover:border-slate-300 transition cursor-pointer"
              >
                <span>{emoji}</span>
                <span className="text-[10px] font-semibold text-slate-500">{count}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
