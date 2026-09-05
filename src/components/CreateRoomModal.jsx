import { useState } from 'react'
import {
  X,
  MessageSquare,
  Code,
  Palette,
  Sparkles,
  Flame,
  Coffee,
  Terminal,
  Compass,
  Loader2,
  Plus,
} from 'lucide-react'

const AVAILABLE_ICONS = [
  { id: 'MessageSquare', label: 'Chat', icon: MessageSquare },
  { id: 'Code', label: 'Code', icon: Code },
  { id: 'Palette', label: 'Design', icon: Palette },
  { id: 'Sparkles', label: 'Ideas', icon: Sparkles },
  { id: 'Flame', label: 'Hot', icon: Flame },
  { id: 'Coffee', label: 'Lounge', icon: Coffee },
  { id: 'Terminal', label: 'Tech', icon: Terminal },
  { id: 'Compass', label: 'Explore', icon: Compass },
]

export default function CreateRoomModal({
  isOpen,
  onClose,
  onCreateRoom,
}) {
  const [name, setName] = useState('')
  const [topic, setTopic] = useState('General')
  const [description, setDescription] = useState('')
  const [icon, setIcon] = useState('MessageSquare')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const trimmedName = name.trim()
    if (!trimmedName || trimmedName.length < 3) {
      setError('Room name must be at least 3 characters.')
      return
    }

    setSubmitting(true)
    try {
      await onCreateRoom({
        name: trimmedName,
        topic: topic.trim() || 'General',
        description: description.trim(),
        icon,
      })
      // Reset
      setName('')
      setTopic('General')
      setDescription('')
      setIcon('MessageSquare')
      onClose()
    } catch (err) {
      setError(err.message || 'Failed to create room. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-[#0f121d] p-6 shadow-2xl shadow-black/80 ring-1 ring-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={submitting}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Title */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
            <Plus className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Create New Chat Room</h2>
            <p className="text-xs text-slate-400">Launch a real time room for your team or community.</p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Room Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Room Name <span className="text-indigo-400">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Frontend Engineers"
              maxLength={40}
              className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Topic Tag */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Topic or Category
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Engineering, Design, Gaming"
              maxLength={24}
              className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Short Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this channel about?"
              maxLength={140}
              className="w-full resize-none rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Icon Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Select Room Icon
            </label>
            <div className="grid grid-cols-4 gap-2">
              {AVAILABLE_ICONS.map((item) => {
                const IconComp = item.icon
                const isSelected = icon === item.id
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setIcon(item.id)}
                    className={`flex flex-col items-center gap-1 rounded-xl border p-2.5 transition ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-600/20 text-indigo-300'
                        : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <IconComp className="h-4 w-4" />
                    <span className="text-[10px] font-medium">{item.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting || !name.trim()}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-500 disabled:opacity-40 active:scale-95"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Creating Room...</span>
                </>
              ) : (
                <span>Create Room</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
