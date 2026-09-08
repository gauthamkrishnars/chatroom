import { useRef, useEffect } from 'react'
import MessageList from './MessageList'
import MessageInput from './MessageInput'

export default function ChatArea({
  activeRoom,
  messages = [],
  messagesLoading = false,
  onSendMessage,
  onToggleReaction,
}) {
  const messagesEndRef = useRef(null)

  const scrollToBottom = (behavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior })
  }

  useEffect(() => {
    scrollToBottom('smooth')
  }, [messages])

  return (
    <section className="relative flex flex-1 flex-col bg-white overflow-hidden">
      {/* Messages Stream */}
      <div className="relative flex flex-1 flex-col overflow-y-auto">
        <MessageList
          messages={messages}
          messagesLoading={messagesLoading}
          roomName={activeRoom?.name || 'general'}
          onToggleReaction={onToggleReaction}
        />
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Box */}
      <MessageInput
        onSendMessage={onSendMessage}
        activeRoomName={activeRoom?.name || 'general'}
      />
    </section>
  )
}
