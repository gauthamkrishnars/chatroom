import { formatTime, getAvatarGradient, getInitials } from '../utils/helpers'

export default function MessageItem({ message }) {
  return (
    <div className="flex gap-3 px-4 py-2 hover:bg-slate-50/80 transition-colors">
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
      </div>
    </div>
  )
}
