import { useState } from 'react'
import { X, Loader2 } from 'lucide-react'

export default function CreateRoomModal({
  isOpen,
  onClose,
  onCreateRoom,
}) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const formattedName = name
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-_]/g, '')

    if (!formattedName || formattedName.length < 2) {
      setError('Channel name must be at least 2 characters.')
      return
    }

    setSubmitting(true)
    try {
      await onCreateRoom({
        name: formattedName,
        description: description.trim(),
        topic: 'General',
        icon: 'Hash',
      })
      setName('')
      setDescription('')
      onClose()
    } catch (err) {
      setError(err.message || 'Failed to create channel.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-2xs">
      <div
        className="relative w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          disabled={submitting}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-700"
        >
          <X className="h-4 w-4" />
        </button>

        <h2 className="text-sm font-bold text-slate-900">Create a channel</h2>
        <p className="mt-1 text-xs text-slate-500">
          Channels are where your team communicates on specific topics.
        </p>

        {error && (
          <div className="mt-3 rounded-md bg-rose-50 p-2 text-xs text-rose-700 border border-rose-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Name
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-slate-400 text-xs font-semibold">#</span>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. plan-launch"
                maxLength={40}
                className="w-full rounded-lg border border-slate-200 py-2 pl-7 pr-3 text-xs text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description <span className="font-normal text-slate-400">(optional)</span>
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this channel about?"
              maxLength={120}
              className="w-full resize-none rounded-lg border border-slate-200 p-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
            />
          </div>

          <div className="mt-4 flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting || !name.trim()}
              className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-40 transition"
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
