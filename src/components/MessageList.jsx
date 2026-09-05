import { Fragment } from 'react'
import { Hash } from 'lucide-react'
import MessageItem from './MessageItem'
import { formatDateHeader } from '../utils/helpers'

export default function MessageList({
  messages = [],
  messagesLoading,
  roomName = 'general',
}) {
  if (messagesLoading) {
    return (
      <div className="flex-1 space-y-4 p-4 overflow-y-auto">
        {[1, 2, 3].map((n) => (
          <div key={n} className="flex gap-3">
            <div className="h-8 w-8 rounded-md bg-slate-200 animate-pulse shrink-0" />
            <div className="space-y-1.5 w-48">
              <div className="h-3 w-20 rounded bg-slate-200 animate-pulse" />
              <div className="h-3.5 w-full rounded bg-slate-200 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-400 mb-2">
          <Hash className="h-5 w-5" />
        </div>
        <h3 className="text-sm font-semibold text-slate-800">
          This is the start of #{roomName}
        </h3>
        <p className="mt-1 text-xs text-slate-500">
          No messages posted yet. Send a message below to start the conversation.
        </p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto py-2">
      {messages.map((message, index) => {
        const currentDateHeader = formatDateHeader(message.createdAt)
        const previousDateHeader =
          index > 0 ? formatDateHeader(messages[index - 1].createdAt) : null
        const showDateSeparator = currentDateHeader !== previousDateHeader

        return (
          <Fragment key={message.id}>
            {showDateSeparator && (
              <div className="relative my-3 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative bg-white px-3 text-[11px] font-semibold text-slate-400">
                  {currentDateHeader}
                </div>
              </div>
            )}
            <MessageItem message={message} />
          </Fragment>
        )
      })}
    </div>
  )
}
