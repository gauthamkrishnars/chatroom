import { Fragment } from 'react'
import { MessageSquare } from 'lucide-react'
import MessageItem from './MessageItem'
import { formatDateHeader } from '../utils/helpers'

export default function MessageList({
  messages = [],
  currentUserId,
  onReact,
  messagesLoading,
  roomName = 'Channel',
}) {
  if (messagesLoading) {
    return (
      <div className="flex-1 space-y-4 p-6 overflow-y-auto">
        {[1, 2, 3, 4].map((n) => (
          <div
            key={n}
            className={`flex gap-3 ${n % 2 === 0 ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div className="h-8 w-8 rounded-full bg-slate-200 animate-pulse" />
            <div className="space-y-1.5 max-w-[50%] w-full">
              <div className="h-3 w-20 rounded bg-slate-200 animate-pulse" />
              <div
                className={`h-10 rounded-xl bg-slate-200/80 animate-pulse ${
                  n % 2 === 0 ? 'bg-indigo-100' : ''
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
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 shadow-xs">
          <MessageSquare className="h-6 w-6" />
        </div>
        <h3 className="mt-3 text-sm font-bold text-slate-900">Welcome to #{roomName}</h3>
        <p className="mt-1 max-w-sm text-xs text-slate-500 leading-normal">
          There are no messages in this channel yet. Post a note below to start the thread.
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
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative rounded-full border border-slate-200 bg-white px-3 py-0.5 text-[10px] font-semibold tracking-wider text-slate-500 shadow-2xs">
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
