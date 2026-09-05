import { Fragment } from 'react'
import { Sparkles } from 'lucide-react'
import MessageItem from './MessageItem'
import { formatDateHeader } from '../utils/helpers'

export default function MessageList({
  messages = [],
  currentUserId,
  onReact,
  messagesLoading,
  roomName = 'Room',
}) {
  if (messagesLoading) {
    return (
      <div className="flex-1 space-y-4 p-6 overflow-y-auto">
        {[1, 2, 3, 4, 5].map((n) => (
          <div
            key={n}
            className={`flex gap-3 ${n % 2 === 0 ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div className="h-8 w-8 rounded-full bg-slate-800 animate-pulse" />
            <div className="space-y-1.5 max-w-[60%] w-full">
              <div className="h-3 w-24 rounded bg-slate-800 animate-pulse" />
              <div
                className={`h-12 rounded-2xl bg-slate-800/60 animate-pulse ${
                  n % 2 === 0 ? 'bg-indigo-900/30' : ''
                }`}
              />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-indigo-500/30 bg-indigo-500/10 shadow-lg shadow-indigo-500/10">
          <Sparkles className="h-7 w-7 text-indigo-400" />
        </div>
        <h3 className="mt-4 text-base font-bold text-white">Welcome to {roomName}</h3>
        <p className="mt-1 max-w-sm text-xs leading-relaxed text-slate-400">
          This is the start of this channel. Start the conversation and send the first message.
        </p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto py-4">
      {messages.map((message, index) => {
        const currentDateHeader = formatDateHeader(message.createdAt)
        const previousDateHeader =
          index > 0 ? formatDateHeader(messages[index - 1].createdAt) : null
        const showDateSeparator = currentDateHeader !== previousDateHeader

        return (
          <Fragment key={message.id}>
            {showDateSeparator && (
              <div className="relative my-4 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-slate-800/80" />
                </div>
                <div className="relative rounded-full border border-slate-800 bg-[#0c0e17] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-400 shadow-sm">
                  {currentDateHeader}
                </div>
              </div>
            )}
            <MessageItem
              message={message}
              currentUserId={currentUserId}
              onReact={onReact}
            />
          </Fragment>
        )
      })}
    </div>
  )
}
