import { useState, useRef, useEffect } from 'react'
import { Send, Smile, Loader2, UserCheck } from 'lucide-react'

const QUICK_EMOJIS = ['😊', '🔥', '🚀', '❤️', '👏', '🎉', '💯', '✨']

export default function MessageInput({
  onSendMessage,
  activeRoomName = 'Room',
  disabled = false,
  user,
  onOpenAuth,
}) {
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const textareaRef = useRef(null)

  // Auto-resize textarea as user types
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        140
      )}px`
    }
  }, [text])

  const handleSubmit = async (e) => {
    e?.preventDefault()
    const trimmed = text.trim()
    if (!trimmed || sending || disabled) return

    setSending(true)
    try {
      await onSendMessage(trimmed)
      setText('')
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    } catch (err) {
      console.error('Failed to send message:', err)
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const addEmoji = (emoji) => {
    setText((prev) => prev + emoji)
    setShowEmojiPicker(false)
    textareaRef.current?.focus()
  }

  return (
    <div className="border-t border-slate-800/80 bg-[#0c0e17]/95 p-3 sm:p-4 backdrop-blur-md">
      {/* Sender identity bar */}
      <div className="mb-2 flex items-center justify-between text-[11px] text-slate-400 px-1">
        <div className="flex items-center gap-1.5">
          <UserCheck className="h-3.5 w-3.5 text-indigo-400" />
          <span>
            Posting as{' '}
            <strong className="text-slate-200">{user?.displayName || 'Guest'}</strong>
          </span>
          {user?.isDemo && (
            <span className="rounded bg-indigo-500/10 px-1.5 py-0.2 text-[9px] text-indigo-300 font-medium">
              Demo
            </span>
          )}
        </div>
        {!user && onOpenAuth && (
          <button
            type="button"
            onClick={onOpenAuth}
            className="text-indigo-400 hover:text-indigo-300 font-semibold transition"
          >
            Sign in for full access
          </button>
        )}
      </div>

      {/* Quick emoji drawer */}
      {showEmojiPicker && (
        <div className="mb-2 flex flex-wrap items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/90 p-2 shadow-lg backdrop-blur-sm animate-in fade-in slide-in-from-bottom-2 duration-150">
          <span className="mr-1 text-[11px] font-semibold text-slate-400">Quick insert:</span>
          {QUICK_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => addEmoji(emoji)}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-sm hover:bg-slate-800 active:scale-110 transition"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Main Input Form */}
      <form onSubmit={handleSubmit} className="relative flex items-end gap-2">
        <div className="relative flex-1 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-inner focus-within:border-indigo-500/80 focus-within:ring-1 focus-within:ring-indigo-500/50 transition">
          <textarea
            ref={textareaRef}
            rows={1}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled || sending}
            placeholder={`Message #${activeRoomName}... (Enter to send)`}
            maxLength={1000}
            className="w-full resize-none bg-transparent px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none disabled:opacity-50"
          />

          {/* Bottom accessory controls inside input box */}
          <div className="flex items-center justify-between border-t border-slate-800/40 px-3 py-1.5 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowEmojiPicker((prev) => !prev)}
                className="flex items-center gap-1 rounded px-1.5 py-0.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition"
                title="Add emoji"
              >
                <Smile className="h-3.5 w-3.5" />
                <span className="text-[10px]">Emoji</span>
              </button>

              <span className="hidden sm:inline text-[10px] text-slate-600">
                Shift + Enter for new line
              </span>
            </div>

            <span className="text-[10px] tabular-nums font-mono text-slate-500">
              {text.length}/1000
            </span>
          </div>
        </div>

        {/* Submit button with loading state */}
        <button
          type="submit"
          disabled={!text.trim() || sending || disabled}
          aria-label="Send message"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 transition-all hover:bg-indigo-500 hover:shadow-indigo-500/50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-indigo-600 disabled:shadow-none active:scale-95"
        >
          {sending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          )}
        </button>
      </form>
    </div>
  )
}
