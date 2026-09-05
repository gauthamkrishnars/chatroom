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
import { db, isFirebaseConfigured } from './config'

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
let broadcastChannel = null

try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel('pulsechat_sync')
  }
} catch {
  // BroadcastChannel unavailable
}

function getLocalRooms() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ROOMS)
    if (raw) return JSON.parse(raw)
  } catch {
    // fallback
  }
  return DEFAULT_ROOMS
}

function saveLocalRooms(rooms) {
  try {
    localStorage.setItem(STORAGE_KEY_ROOMS, JSON.stringify(rooms))
    broadcastChannel?.postMessage({ type: 'ROOMS_UPDATED' })
  } catch {
    // ignore
  }
}

function getLocalMessages(roomId) {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY_MESSAGES}_${roomId}`)
    if (raw) return JSON.parse(raw)
  } catch {
    // fallback
  }
  return []
}

function saveLocalMessages(roomId, messages) {
  try {
    localStorage.setItem(`${STORAGE_KEY_MESSAGES}_${roomId}`, JSON.stringify(messages))
    broadcastChannel?.postMessage({ type: 'MESSAGES_UPDATED', roomId })
  } catch {
    // ignore
  }
}

/**
 * Seed initial clean rooms into Firestore if the database is newly initialized
 */
export async function seedInitialFirestoreRooms() {
  if (!isFirebaseConfigured || !db) return
  try {
    const roomsSnap = await getDocs(collection(db, 'rooms'))
    if (roomsSnap.empty) {
      for (const room of DEFAULT_ROOMS) {
        await addDoc(collection(db, 'rooms'), {
          ...room,
          createdAt: serverTimestamp(),
        })
      }
    }
  } catch (error) {
    console.warn('Could not auto-seed rooms:', error.message)
  }
}

/**
 * Subscribe to real time rooms list
 */
export function subscribeToRooms(onUpdate, onError) {
  if (isFirebaseConfigured && db) {
    try {
      const q = query(collection(db, 'rooms'))
      return onSnapshot(
        q,
        (snapshot) => {
          if (snapshot.empty) {
            seedInitialFirestoreRooms()
            onUpdate(DEFAULT_ROOMS)
            return
          }
          const rooms = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
          }))
          onUpdate(rooms)
        },
        (error) => {
          console.error('Rooms subscription error:', error)
          if (onError) onError(error)
          onUpdate(getLocalRooms())
        }
      )
    } catch (err) {
      console.warn('Firestore room query failed, using local storage:', err)
    }
  }

  // Fallback local storage mode
  onUpdate(getLocalRooms())

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
  window.addEventListener('storage', handleStorage)

  return () => {
    broadcastChannel?.removeEventListener('message', handleBroadcast)
    window.removeEventListener('storage', handleStorage)
  }
}

/**
 * Create a new chat room
 */
export async function createChatRoom({ name, description, topic, icon, user }) {
  const cleanName = name.trim()
  const cleanTopic = (topic || 'General').trim()
  const cleanDesc = (description || '').trim()
  const roomIcon = icon || 'MessageSquare'

  if (isFirebaseConfigured && db) {
    const docRef = await addDoc(collection(db, 'rooms'), {
      name: cleanName,
      description: cleanDesc,
      topic: cleanTopic,
      icon: roomIcon,
      createdBy: {
        uid: user?.uid || 'anonymous',
        displayName: user?.displayName || 'User',
      },
      createdAt: serverTimestamp(),
    })
    return docRef.id
  }

  // Local fallback
  const rooms = getLocalRooms()
  const newRoomId = 'room_' + Date.now().toString(36)
  const newRoom = {
    id: newRoomId,
    name: cleanName,
    description: cleanDesc,
    topic: cleanTopic,
    icon: roomIcon,
    createdAt: new Date(),
    createdBy: {
      uid: user?.uid || 'anonymous',
      displayName: user?.displayName || 'User',
    },
  }
  const updatedRooms = [newRoom, ...rooms]
  saveLocalRooms(updatedRooms)
  return newRoomId
}

/**
 * Subscribe to real time messages for a specific room (Zero fake messages)
 */
export function subscribeToRoomMessages(roomId, onUpdate, onError) {
  if (!roomId) return () => {}

  if (isFirebaseConfigured && db) {
    try {
      const messagesRef = collection(db, 'rooms', roomId, 'messages')
      const q = query(messagesRef, orderBy('createdAt', 'asc'), limit(200))

      return onSnapshot(
        q,
        (snapshot) => {
          const messages = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
          }))
          onUpdate(messages)
        },
        (error) => {
          console.error(`Messages snapshot error for room ${roomId}:`, error)
          if (onError) onError(error)
          onUpdate(getLocalMessages(roomId))
        }
      )
    } catch (err) {
      console.warn('Firestore message query failed, using local storage:', err)
    }
  }

  // Fallback local storage mode
  onUpdate(getLocalMessages(roomId))

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
  window.addEventListener('storage', handleStorage)

  return () => {
    broadcastChannel?.removeEventListener('message', handleBroadcast)
    window.removeEventListener('storage', handleStorage)
  }
}

/**
 * Send a new message to a specific room from a real user
 */
export async function sendRoomMessage({ roomId, text, user }) {
  if (!roomId || !text?.trim()) return

  const messagePayload = {
    text: text.trim(),
    userId: user?.uid || 'anonymous-user',
    userName: user?.displayName || 'Anonymous Member',
    userAvatar: user?.photoURL || '',
    userEmail: user?.email || '',
    reactions: {},
  }

  if (isFirebaseConfigured && db) {
    const messagesRef = collection(db, 'rooms', roomId, 'messages')
    return await addDoc(messagesRef, {
      ...messagePayload,
      createdAt: serverTimestamp(),
    })
  }

  // Local fallback
  const currentMessages = getLocalMessages(roomId)
  const newMsg = {
    id: 'msg_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
    ...messagePayload,
    createdAt: new Date(),
  }
  saveLocalMessages(roomId, [...currentMessages, newMsg])
  return newMsg
}

/**
 * Toggle an emoji reaction on a message
 */
export async function toggleMessageReaction({ roomId, messageId, emoji }) {
  if (!roomId || !messageId || !emoji) return

  if (isFirebaseConfigured && db) {
    try {
      const msgDocRef = doc(db, 'rooms', roomId, 'messages', messageId)
      await setDoc(
        msgDocRef,
        {
          reactions: {
            [emoji]: 1,
          },
        },
        { merge: true }
      )
    } catch (err) {
      console.warn('Reaction update error:', err)
    }
  }

  // Local fallback
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
  saveLocalMessages(roomId, updated)
}
