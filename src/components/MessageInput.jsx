import { useState, useRef, useEffect } from 'react'
import { Send, Smile, Loader2, LogIn } from 'lucide-react'

const QUICK_EMOJIS = ['😊', '👍', '🔥', '🚀', '❤️', '👏', '🎉', '✨']

export default function MessageInput({
  onSendMessage,
  activeRoomName = 'Channel',
  disabled = false,
  user,
  onOpenAuth,
}) {
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const textareaRef = useRef(null)

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
    <div className="border-t border-slate-200 bg-white p-3 sm:p-4">
      {/* Unauthenticated Prompt banner */}
      {!user && (
        <div className="mb-2.5 flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
          <span>You are viewing as a guest. Sign in to post with your verified name and profile.</span>
          <button
            type="button"
            onClick={onOpenAuth}
            className="flex items-center gap-1.5 font-semibold text-indigo-600 hover:text-indigo-500 transition"
          >
            <LogIn className="h-3.5 w-3.5" />
            <span>Sign In</span>
          </button>
        </div>
      )}

      {/* Quick emoji drawer */}
      {showEmojiPicker && (
        <div className="mb-2 flex flex-wrap items-center gap-1 rounded-xl border border-slate-200 bg-white p-2 shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-150">
          <span className="mr-1 text-[11px] font-semibold text-slate-500">Insert emoji:</span>
          {QUICK_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => addEmoji(emoji)}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-sm hover:bg-slate-100 active:scale-110 transition"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Main Input Form */}
      <form onSubmit={handleSubmit} className="relative flex items-end gap-2">
        <div className="relative flex-1 rounded-xl border border-slate-200 bg-white shadow-2xs focus-within:border-slate-400 focus-within:ring-1 focus-within:ring-slate-400 transition">
          <textarea
            ref={textareaRef}
            rows={1}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled || sending}
            placeholder={`Message #${activeRoomName}... (Enter to send)`}
            maxLength={1000}
            className="w-full resize-none bg-transparent px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none disabled:opacity-50"
          />

          {/* Bottom accessory controls inside input box */}
          <div className="flex items-center justify-between border-t border-slate-100 px-3 py-1.5 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowEmojiPicker((prev) => !prev)}
                className="flex items-center gap-1 rounded px-1.5 py-0.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition"
                title="Add emoji"
              >
                <Smile className="h-3.5 w-3.5" />
                <span className="text-[10px]">Emoji</span>
              </button>

              <span className="hidden sm:inline text-[10px] text-slate-400">
                Shift + Enter for new line
              </span>
            </div>

            <span className="text-[10px] tabular-nums font-mono text-slate-400">
              {text.length}/1000
            </span>
          </div>
        </div>

        {/* Submit button with loading state */}
        <button
          type="submit"
          disabled={!text.trim() || sending || disabled}
          aria-label="Send message"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white shadow-xs transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-slate-900 active:scale-95"
        >
          {sending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </button>
      </form>
    </div>
  )
}
