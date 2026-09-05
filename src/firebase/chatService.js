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
    name: 'General Chat',
    description: 'Casual community discussions, introductions, and everyday banter.',
    topic: 'Community',
    icon: 'MessageSquare',
    memberCount: 42,
  },
  {
    id: 'tech-talk',
    name: 'Tech & Code',
    description: 'JavaScript, React, backend engines, architectures, and dev tools.',
    topic: 'Development',
    icon: 'Code',
    memberCount: 28,
  },
  {
    id: 'design-critique',
    name: 'Product Design',
    description: 'UI typography, design systems, layouts, and interaction patterns.',
    topic: 'Design',
    icon: 'Palette',
    memberCount: 19,
  },
  {
    id: 'random-fun',
    name: 'Random & Memes',
    description: 'Off-topic chatter, funny clips, hobbies, music, and gaming.',
    topic: 'Social',
    icon: 'Sparkles',
    memberCount: 35,
  },
]

const DEFAULT_MESSAGES = {
  general: [
    {
      id: 'm1',
      text: 'Welcome to PulseChat! This space is built with React and Firebase.',
      userId: 'system-bot',
      userName: 'System Bot',
      userAvatar: '',
      createdAt: new Date(Date.now() - 3600000 * 2),
      reactions: { '🔥': 4, '👍': 7 },
    },
    {
      id: 'm2',
      text: 'Feel free to pick any chat room from the sidebar or create your own topic room.',
      userId: 'sarah-connor',
      userName: 'Sarah Jenkins',
      userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
      createdAt: new Date(Date.now() - 3600000 * 1.5),
      reactions: { '🚀': 3 },
    },
    {
      id: 'm3',
      text: 'Real time updates are synced live. Try opening this app in a second tab to see instant messaging!',
      userId: 'marcus-vane',
      userName: 'Marcus Vance',
      userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      createdAt: new Date(Date.now() - 1800000),
      reactions: { '❤️': 5 },
    },
  ],
  'tech-talk': [
    {
      id: 't1',
      text: 'Anyone deploying Vite with Firebase Hosting lately? Fast build times make a huge difference.',
      userId: 'elena-rostova',
      userName: 'Elena Rostova',
      userAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80',
      createdAt: new Date(Date.now() - 5400000),
      reactions: { '🔥': 2 },
    },
    {
      id: 't2',
      text: 'Yes! Sub 400ms bundling is standard with Vite. Plus Tailwind utility classes keep CSS bundles tiny.',
      userId: 'dev-dave',
      userName: 'David Miller',
      userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      createdAt: new Date(Date.now() - 2700000),
      reactions: { '🚀': 4, '👍': 3 },
    },
  ],
  'design-critique': [
    {
      id: 'd1',
      text: 'Remember: high contrast palettes improve accessibility and give web apps a sharp, confident personality.',
      userId: 'claire-design',
      userName: 'Claire Dupont',
      userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
      createdAt: new Date(Date.now() - 7200000),
      reactions: { '✨': 6 },
    },
  ],
  'random-fun': [
    {
      id: 'r1',
      text: 'Weekend gaming tournament starts at 8 PM. Who is dropping in?',
      userId: 'jake-streamer',
      userName: 'Jake Sterling',
      userAvatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&auto=format&fit=crop&q=80',
      createdAt: new Date(Date.now() - 9000000),
      reactions: { '🎮': 8 },
    },
  ],
}

// Local mock storage helpers for fallback mode
const MOCK_STORAGE_KEY_ROOMS = 'pulsechat_mock_rooms_v1'
const MOCK_STORAGE_KEY_MESSAGES = 'pulsechat_mock_messages_v1'
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
    const raw = localStorage.getItem(MOCK_STORAGE_KEY_ROOMS)
    if (raw) return JSON.parse(raw)
  } catch {
    // fallback
  }
  return DEFAULT_ROOMS
}

function saveLocalRooms(rooms) {
  try {
    localStorage.setItem(MOCK_STORAGE_KEY_ROOMS, JSON.stringify(rooms))
    broadcastChannel?.postMessage({ type: 'ROOMS_UPDATED' })
  } catch {
    // ignore
  }
}

function getLocalMessages(roomId) {
  try {
    const raw = localStorage.getItem(`${MOCK_STORAGE_KEY_MESSAGES}_${roomId}`)
    if (raw) return JSON.parse(raw)
  } catch {
    // fallback
  }
  return DEFAULT_MESSAGES[roomId] || []
}

function saveLocalMessages(roomId, messages) {
  try {
    localStorage.setItem(`${MOCK_STORAGE_KEY_MESSAGES}_${roomId}`, JSON.stringify(messages))
    broadcastChannel?.postMessage({ type: 'MESSAGES_UPDATED', roomId })
  } catch {
    // ignore
  }
}

/**
 * Seed initial rooms into Firestore if empty
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

  // Fallback demo storage mode
  onUpdate(getLocalRooms())

  const handleBroadcast = (event) => {
    if (event.data?.type === 'ROOMS_UPDATED') {
      onUpdate(getLocalRooms())
    }
  }

  const handleStorage = (e) => {
    if (e.key === MOCK_STORAGE_KEY_ROOMS) {
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
      memberCount: 1,
      createdBy: {
        uid: user?.uid || 'anonymous',
        displayName: user?.displayName || 'Anonymous',
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
    memberCount: 1,
    createdAt: new Date(),
    createdBy: {
      uid: user?.uid || 'demo-user',
      displayName: user?.displayName || 'Guest User',
    },
  }
  const updatedRooms = [newRoom, ...rooms]
  saveLocalRooms(updatedRooms)
  return newRoomId
}

/**
 * Subscribe to real time messages for a specific room
 */
export function subscribeToRoomMessages(roomId, onUpdate, onError) {
  if (!roomId) return () => {}

  if (isFirebaseConfigured && db) {
    try {
      const messagesRef = collection(db, 'rooms', roomId, 'messages')
      const q = query(messagesRef, orderBy('createdAt', 'asc'), limit(150))

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

  // Fallback demo storage mode
  onUpdate(getLocalMessages(roomId))

  const handleBroadcast = (event) => {
    if (event.data?.type === 'MESSAGES_UPDATED' && event.data.roomId === roomId) {
      onUpdate(getLocalMessages(roomId))
    }
  }

  const handleStorage = (e) => {
    if (e.key === `${MOCK_STORAGE_KEY_MESSAGES}_${roomId}`) {
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
 * Send a new message to a specific room
 */
export async function sendRoomMessage({ roomId, text, user }) {
  if (!roomId || !text?.trim()) return

  const messagePayload = {
    text: text.trim(),
    userId: user?.uid || 'guest-user',
    userName: user?.displayName || 'Guest Explorer',
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
 * Add or toggle an emoji reaction on a message
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
