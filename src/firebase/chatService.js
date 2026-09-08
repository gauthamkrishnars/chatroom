import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  getDocs,
  limit,
  doc,
  setDoc,
} from 'firebase/firestore'
import { db, isFirebaseConfigured } from './config.js'

const DEFAULT_ROOMS = [
  {
    id: 'general',
    name: 'General',
    description: 'Team wide announcements, general discussions, and team updates.',
    topic: 'General',
    icon: 'MessageSquare',
  },
  {
    id: 'engineering',
    name: 'Engineering',
    description: 'Technical discussions, code architecture, deployments, and PR reviews.',
    topic: 'Tech',
    icon: 'Code',
  },
  {
    id: 'product-design',
    name: 'Product & Design',
    description: 'UI/UX mockups, user research, wireframes, and design systems.',
    topic: 'Design',
    icon: 'Palette',
  },
  {
    id: 'announcements',
    name: 'Announcements',
    description: 'Company updates, releases, and key milestones.',
    topic: 'Official',
    icon: 'Sparkles',
  },
]

// Local storage keys for offline/fallback caching
const STORAGE_KEY_ROOMS = 'pulsechat_rooms'
const STORAGE_KEY_MESSAGES = 'pulsechat_messages'

// Track whether Firestore is currently healthy and accessible
let isFirestoreHealthy = true

function withTimeout(promise, ms = 2500) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Firestore operation timed out')), ms)
    ),
  ])
}

let broadcastChannel = null
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel('pulsechat_sync')
  }
} catch {
  // BroadcastChannel unavailable
}

// Notification helpers that notify both other tabs and current window
function notifyRoomsUpdated() {
  try {
    broadcastChannel?.postMessage({ type: 'ROOMS_UPDATED' })
  } catch {}
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('pulsechat_local_rooms_updated'))
  }
}

function notifyMessagesUpdated(roomId) {
  try {
    broadcastChannel?.postMessage({ type: 'MESSAGES_UPDATED', roomId })
  } catch {}
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('pulsechat_local_messages_updated', { detail: { roomId } })
    )
  }
}

export function notifyFirestoreStatus(healthy, reason = '') {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('pulsechat_firestore_status', {
        detail: { healthy, reason },
      })
    )
  }
}

export function getLocalRooms() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ROOMS)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Ensure all default rooms remain present alongside user created channels
        const map = new Map()
        DEFAULT_ROOMS.forEach((r) => map.set(r.id, r))
        parsed.forEach((r) => {
          if (r && r.id) {
            map.set(r.id, { ...(map.get(r.id) || {}), ...r })
          }
        })
        return Array.from(map.values())
      }
    }
  } catch {}
  return DEFAULT_ROOMS
}

export function saveLocalRooms(rooms, shouldNotify = true) {
  try {
    localStorage.setItem(STORAGE_KEY_ROOMS, JSON.stringify(rooms))
    if (shouldNotify) {
      notifyRoomsUpdated()
    }
  } catch {}
}

export function getLocalMessages(roomId) {
  if (!roomId) return []
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY_MESSAGES}_${roomId}`)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed
    }
  } catch {}
  return []
}

export function saveLocalMessages(roomId, messages, shouldNotify = true) {
  if (!roomId) return
  try {
    localStorage.setItem(`${STORAGE_KEY_MESSAGES}_${roomId}`, JSON.stringify(messages))
    if (shouldNotify) {
      notifyMessagesUpdated(roomId)
    }
  } catch {}
}

/**
 * Seed initial clean rooms into Firestore if the database is newly initialized
 */
export async function seedInitialFirestoreRooms() {
  if (!isFirebaseConfigured || !db || !isFirestoreHealthy) return
  try {
    const roomsSnap = await withTimeout(getDocs(collection(db, 'rooms')), 2500)
    if (roomsSnap.empty) {
      for (const room of DEFAULT_ROOMS) {
        await withTimeout(
          setDoc(doc(db, 'rooms', room.id), {
            ...room,
            createdAt: serverTimestamp(),
          }),
          2500
        )
      }
    }
  } catch (error) {
    console.warn('Could not auto-seed rooms in Firestore:', error.message)
    if (error?.code === 'permission-denied') {
      isFirestoreHealthy = false
      notifyFirestoreStatus(false, 'permission-denied')
    }
  }
}

/**
 * Subscribe to real time rooms list
 */
export function subscribeToRooms(onUpdate, onError) {
  // Always emit local / cached rooms immediately so UI is never blank
  onUpdate(getLocalRooms())

  const handleLocalRoomsEvent = () => {
    onUpdate(getLocalRooms())
  }

  const handleBroadcast = (event) => {
    if (event.data?.type === 'ROOMS_UPDATED') {
      onUpdate(getLocalRooms())
    }
  }

  const handleStorage = (e) => {
    if (e.key === STORAGE_KEY_ROOMS) {
      onUpdate(getLocalRooms())
    }
  }

  broadcastChannel?.addEventListener('message', handleBroadcast)
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', handleStorage)
    window.addEventListener('pulsechat_local_rooms_updated', handleLocalRoomsEvent)
  }

  let unsubscribeFirestore = null

  if (isFirebaseConfigured && db && isFirestoreHealthy) {
    try {
      const q = query(collection(db, 'rooms'))
      unsubscribeFirestore = onSnapshot(
        q,
        (snapshot) => {
          if (snapshot.empty) {
            seedInitialFirestoreRooms()
            onUpdate(DEFAULT_ROOMS)
            return
          }
          const remoteRooms = snapshot.docs.map((docSnap) => ({
            ...docSnap.data(),
            id: docSnap.id,
          }))
          // Merge with default rooms and deduplicate
          const map = new Map()
          DEFAULT_ROOMS.forEach((r) => map.set(r.id, r))
          remoteRooms.forEach((r) => {
            if (r && r.id) map.set(r.id, { ...(map.get(r.id) || {}), ...r })
          })
          const mergedRooms = Array.from(map.values())
          saveLocalRooms(mergedRooms, false)
          onUpdate(mergedRooms)
        },
        (error) => {
          console.warn('Firestore rooms query unavailable, using local rooms:', error.message)
          if (error?.code === 'permission-denied') {
            isFirestoreHealthy = false
            notifyFirestoreStatus(false, 'permission-denied')
          }
          if (onError) onError(error)
          onUpdate(getLocalRooms())
        }
      )
    } catch (err) {
      console.warn('Firestore room query setup failed, using local rooms:', err)
      if (onError) onError(err)
    }
  }

  return () => {
    if (unsubscribeFirestore) {
      try {
        unsubscribeFirestore()
      } catch {}
    }
    broadcastChannel?.removeEventListener('message', handleBroadcast)
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener('pulsechat_local_rooms_updated', handleLocalRoomsEvent)
    }
  }
}

/**
 * Create a new chat room
 */
export async function createChatRoom({ name, description, topic, icon, user }) {
  const cleanName = (name || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-_]/g, '')
  const cleanTopic = (topic || 'General').trim()
  const cleanDesc = (description || '').trim()
  const roomIcon = icon || 'Hash'

  const roomData = {
    name: cleanName,
    description: cleanDesc,
    topic: cleanTopic,
    icon: roomIcon,
    createdBy: {
      uid: user?.uid || 'anonymous',
      displayName: user?.displayName || 'User',
    },
    createdAt: new Date().toISOString(),
  }

  // 1. Instantly save locally (optimistic)
  const localRoomId = cleanName || 'room_' + Date.now().toString(36)
  const newRoom = {
    id: localRoomId,
    ...roomData,
  }
  const currentRooms = getLocalRooms()
  saveLocalRooms([newRoom, ...currentRooms.filter((r) => r.id !== localRoomId)], true)

  // 2. In background, attempt cloud sync if Firestore is healthy
  if (isFirebaseConfigured && db && isFirestoreHealthy) {
    withTimeout(
      setDoc(doc(db, 'rooms', localRoomId), {
        ...roomData,
        createdAt: serverTimestamp(),
      }),
      2500
    ).catch((err) => {
      console.warn(
        '[ChatService] Firestore room write failed or timed out, continuing on local storage:',
        err.message
      )
      if (err?.code === 'permission-denied') {
        isFirestoreHealthy = false
        notifyFirestoreStatus(false, 'permission-denied')
      }
    })
  }

  return localRoomId
}

/**
 * Subscribe to real time messages for a specific room
 */
export function subscribeToRoomMessages(roomId, onUpdate, onError) {
  if (!roomId) return () => {}

  // Immediately load cached messages
  onUpdate(getLocalMessages(roomId))

  const handleLocalMessagesEvent = (e) => {
    if (!e.detail || e.detail.roomId === roomId) {
      onUpdate(getLocalMessages(roomId))
    }
  }

  const handleBroadcast = (event) => {
    if (event.data?.type === 'MESSAGES_UPDATED' && event.data.roomId === roomId) {
      onUpdate(getLocalMessages(roomId))
    }
  }

  const handleStorage = (e) => {
    if (e.key === `${STORAGE_KEY_MESSAGES}_${roomId}`) {
      onUpdate(getLocalMessages(roomId))
    }
  }

  broadcastChannel?.addEventListener('message', handleBroadcast)
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', handleStorage)
    window.addEventListener('pulsechat_local_messages_updated', handleLocalMessagesEvent)
  }

  let unsubscribeFirestore = null

  if (isFirebaseConfigured && db && isFirestoreHealthy) {
    try {
      const messagesRef = collection(db, 'rooms', roomId, 'messages')
      const q = query(messagesRef, orderBy('createdAt', 'asc'), limit(200))

      unsubscribeFirestore = onSnapshot(
        q,
        (snapshot) => {
          const remoteMessages = snapshot.docs.map((docSnap) => ({
            ...docSnap.data(),
            id: docSnap.id,
          }))
          saveLocalMessages(roomId, remoteMessages, false)
          onUpdate(remoteMessages)
        },
        (error) => {
          console.warn(`Firestore messages snapshot notice for room ${roomId}:`, error.message)
          if (error?.code === 'permission-denied') {
            isFirestoreHealthy = false
            notifyFirestoreStatus(false, 'permission-denied')
          }
          if (onError) onError(error)
          onUpdate(getLocalMessages(roomId))
        }
      )
    } catch (err) {
      console.warn('Firestore message query setup failed, using local storage:', err)
      if (onError) onError(err)
    }
  }

  return () => {
    if (unsubscribeFirestore) {
      try {
        unsubscribeFirestore()
      } catch {}
    }
    broadcastChannel?.removeEventListener('message', handleBroadcast)
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener('pulsechat_local_messages_updated', handleLocalMessagesEvent)
    }
  }
}

/**
 * Send a new message to a specific room
 */
export async function sendRoomMessage({ roomId, text, user }) {
  if (!roomId || !text?.trim()) return null

  const trimmedText = text.trim()
  const nowIso = new Date().toISOString()
  const localMsgId =
    'msg_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 7)

  const messagePayload = {
    text: trimmedText,
    userId: user?.uid || 'anonymous-user',
    userName: user?.displayName || 'Anonymous Member',
    userAvatar: user?.photoURL || '',
    userEmail: user?.email || '',
    reactions: {},
    createdAt: nowIso,
  }

  const localMsg = {
    id: localMsgId,
    ...messagePayload,
  }

  // 1. Optimistic local delivery: Save instantly & notify listeners
  const currentMessages = getLocalMessages(roomId)
  const updatedMessages = [
    ...currentMessages.filter((m) => m.id !== localMsgId),
    localMsg,
  ]
  saveLocalMessages(roomId, updatedMessages, true)

  // 2. In background, attempt cloud sync if Firestore is configured & healthy
  if (isFirebaseConfigured && db && isFirestoreHealthy) {
    const messagesRef = collection(db, 'rooms', roomId, 'messages')
    withTimeout(
      addDoc(messagesRef, {
        ...messagePayload,
        createdAt: serverTimestamp(),
      }),
      2500
    )
      .then((docRef) => {
        // Map local temporary ID to remote Firestore document ID
        const msgs = getLocalMessages(roomId)
        const mapped = msgs.map((m) =>
          m.id === localMsgId ? { ...m, id: docRef.id } : m
        )
        saveLocalMessages(roomId, mapped, false)
      })
      .catch((err) => {
        console.warn(
          '[ChatService] Firestore message send failed or timed out, syncing locally:',
          err.message
        )
        if (err?.code === 'permission-denied') {
          isFirestoreHealthy = false
          notifyFirestoreStatus(false, 'permission-denied')
        }
      })
  }

  // Return the sent message immediately so the UI is 100% responsive
  return localMsg
}

/**
 * Toggle an emoji reaction on a message
 */
export async function toggleMessageReaction({ roomId, messageId, emoji }) {
  if (!roomId || !messageId || !emoji) return

  // 1. Instantly update locally
  const messages = getLocalMessages(roomId)
  const updated = messages.map((m) => {
    if (m.id === messageId) {
      const currentReactions = { ...(m.reactions || {}) }
      const count = currentReactions[emoji] || 0
      currentReactions[emoji] = count + 1
      return { ...m, reactions: currentReactions }
    }
    return m
  })
  saveLocalMessages(roomId, updated, true)

  // 2. In background, sync to Firestore if healthy
  if (isFirebaseConfigured && db && isFirestoreHealthy) {
    try {
      const msgDocRef = doc(db, 'rooms', roomId, 'messages', messageId)
      withTimeout(
        setDoc(
          msgDocRef,
          {
            reactions: {
              [emoji]: 1,
            },
          },
          { merge: true }
        ),
        2500
      ).catch((err) => {
        console.warn('Reaction update error:', err.message)
      })
    } catch (err) {
      console.warn('Reaction setup error:', err.message)
    }
  }
}
