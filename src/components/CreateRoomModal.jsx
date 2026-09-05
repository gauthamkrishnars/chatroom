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
      setName('')
      setTopic('General')
      setDescription('')
      setIcon('MessageSquare')
      onClose()
    } catch (err) {
      setError(err.message || 'Failed to create channel.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl ring-1 ring-black/5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={submitting}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Modal Title */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-800 border border-slate-200">
            <Plus className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Create New Channel</h2>
            <p className="text-xs text-slate-500">Add a dedicated channel for your team topic.</p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Room Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Channel Name <span className="text-indigo-600">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Frontend Engineering"
              maxLength={40}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Topic Tag */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Category
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Engineering, Design, Product"
              maxLength={24}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this channel about?"
              maxLength={140}
              className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Icon Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Select Icon
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
                    className={`flex flex-col items-center gap-1 rounded-xl border p-2 transition ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-600'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-slate-100'
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
          <div className="mt-5 flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-lg px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting || !name.trim()}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-slate-800 disabled:opacity-40 active:scale-95"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <span>Create Channel</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
