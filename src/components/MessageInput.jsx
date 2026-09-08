import { useState, useRef, useEffect } from 'react'
import { Loader2 } from 'lucide-react'

export default function MessageInput({
  onSendMessage,
  activeRoomName = 'general',
  disabled = false,
}) {
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const textareaRef = useRef(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        120
      )}px`
    }
  }, [text])

  const handleSubmit = async (e) => {
    e?.preventDefault()
    const trimmed = text.trim()
    if (!trimmed || sending || disabled) return

    setSending(true)
    const messageToSend = trimmed
    setText('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }

    try {
      await onSendMessage(messageToSend)
    } catch (err) {
      console.error('Failed to send message:', err)
      setText(messageToSend)
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      if (e.nativeEvent?.isComposing) return
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="p-3 sm:p-4 bg-white border-t border-slate-200">
      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        <div className="relative flex-1 rounded-lg border border-slate-300 bg-white shadow-2xs focus-within:border-slate-500 transition">
          <textarea
            ref={textareaRef}
            rows={1}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled || sending}
            placeholder={`Message #${activeRoomName}...`}
            maxLength={1000}
            className="w-full resize-none bg-transparent px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none disabled:opacity-50"
          />
        </div>

        <button
          type="submit"
          disabled={!text.trim() || sending || disabled}
          aria-label="Send message"
          className="flex h-9 items-center justify-center rounded-lg bg-slate-900 px-3.5 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-slate-900 transition"
        >
          {sending ? (
            <Loader2 className="h-4 w-4 animate-spin text-white" />
          ) : (
            <span>Send</span>
          )}
        </button>
      </form>
    </div>
  )
}
