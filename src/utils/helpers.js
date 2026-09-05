/**
 * Helper utilities for formatting timestamps, avatars, and text
 */

const AVATAR_PALETTES = [
  'from-indigo-600 to-purple-600 text-white',
  'from-emerald-600 to-teal-600 text-white',
  'from-amber-500 to-orange-600 text-white',
  'from-rose-600 to-pink-600 text-white',
  'from-cyan-600 to-blue-600 text-white',
  'from-fuchsia-600 to-rose-600 text-white',
  'from-violet-600 to-indigo-600 text-white',
  'from-teal-500 to-cyan-600 text-white',
]

/**
 * Returns a stable color gradient based on a string seed (e.g. name or uid)
 */
export function getAvatarGradient(seed = '') {
  if (!seed) return AVATAR_PALETTES[0]
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash)
  }
  const index = Math.abs(hash) % AVATAR_PALETTES.length
  return AVATAR_PALETTES[index]
}

/**
 * Extracts 1-2 initials from a user's display name
 */
export function getInitials(name = '') {
  if (!name || typeof name !== 'string') return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase()
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

/**
 * Formats a Firestore Timestamp, JS Date, or timestamp number into a clean time string
 */
export function formatTime(timestamp) {
  if (!timestamp) return 'Just now'

  let date
  if (typeof timestamp.toDate === 'function') {
    date = timestamp.toDate()
  } else if (timestamp instanceof Date) {
    date = timestamp
  } else if (typeof timestamp === 'number') {
    date = new Date(timestamp)
  } else if (typeof timestamp === 'string') {
    date = new Date(timestamp)
  } else if (timestamp.seconds) {
    date = new Date(timestamp.seconds * 1000)
  } else {
    return 'Just now'
  }

  if (isNaN(date.getTime())) return 'Just now'

  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

/**
 * Formats a timestamp into a friendly grouping header (e.g. "Today", "Yesterday", "Sep 5, 2026")
 */
export function formatDateHeader(timestamp) {
  if (!timestamp) return 'Today'

  let date
  if (typeof timestamp.toDate === 'function') {
    date = timestamp.toDate()
  } else if (timestamp instanceof Date) {
    date = timestamp
  } else if (typeof timestamp === 'number') {
    date = new Date(timestamp)
  } else if (typeof timestamp === 'string') {
    date = new Date(timestamp)
  } else if (timestamp.seconds) {
    date = new Date(timestamp.seconds * 1000)
  } else {
    return 'Today'
  }

  if (isNaN(date.getTime())) return 'Today'

  const now = new Date()
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()

  if (isToday) return 'Today'

  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()

  if (isYesterday) return 'Yesterday'

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  })
}
