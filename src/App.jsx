import { useState, useEffect } from 'react'
import { AuthProvider } from './context/AuthContext'
import { useAuth } from './context/useAuth'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import ChatArea from './components/ChatArea'
import LoginPage from './components/LoginPage'
import CreateRoomModal from './components/CreateRoomModal'
import LegalModal from './components/LegalModal'
import {
  subscribeToRooms,
  subscribeToRoomMessages,
  sendRoomMessage,
  createChatRoom,
  toggleMessageReaction,
} from './firebase/chatService'

function ChatWorkspace({ user }) {
  const [rooms, setRooms] = useState([])
  const [roomsLoading, setRoomsLoading] = useState(true)
  const [activeRoomId, setActiveRoomId] = useState('general')

  const [messages, setMessages] = useState([])
  const [messagesLoading, setMessagesLoading] = useState(true)
  const [firestoreNotice, setFirestoreNotice] = useState(false)

  // Mobile drawer state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false)

  // Listen for firestore status updates
  useEffect(() => {
    const handleFirestoreStatus = (e) => {
      if (e.detail && !e.detail.healthy) {
        setFirestoreNotice(true)
      }
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('pulsechat_firestore_status', handleFirestoreStatus)
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('pulsechat_firestore_status', handleFirestoreStatus)
      }
    }
  }, [])

  // Connect to Firestore rooms upon workspace mount
  useEffect(() => {
    const unsubscribe = subscribeToRooms(
      (newRooms) => {
        setRooms(newRooms)
        setRoomsLoading(false)
        if (newRooms.length > 0) {
          setActiveRoomId((currentId) => {
            const exists = newRooms.some((r) => r.id === currentId)
            return exists ? currentId : newRooms[0].id
          })
        }
      },
      (err) => {
        console.warn('Rooms subscription notice:', err?.message)
        setRoomsLoading(false)
        if (err?.code === 'permission-denied') {
          setFirestoreNotice(true)
        }
      }
    )

    return () => unsubscribe()
  }, [])

  const activeRoom = rooms.find((r) => r.id === activeRoomId) || rooms[0]
  const currentRoomId = activeRoom?.id || activeRoomId || 'general'

  // Subscribe to room messages
  useEffect(() => {
    if (!currentRoomId) return

    const unsubscribe = subscribeToRoomMessages(
      currentRoomId,
      (newMessages) => {
        setMessages(newMessages)
        setMessagesLoading(false)
      },
      (err) => {
        console.warn('Messages subscription notice:', err?.message)
        setMessagesLoading(false)
        if (err?.code === 'permission-denied') {
          setFirestoreNotice(true)
        }
      }
    )

    return () => unsubscribe()
  }, [currentRoomId])

  const handleSelectRoom = (roomId) => {
    if (roomId !== activeRoomId) {
      setMessagesLoading(true)
      setActiveRoomId(roomId)
    }
  }

  const handleSendMessage = async (text) => {
    const sentMsg = await sendRoomMessage({
      roomId: currentRoomId,
      text,
      user,
    })
    if (sentMsg) {
      setMessages((prev) => {
        if (prev.some((m) => m.id === sentMsg.id)) return prev
        return [...prev, sentMsg]
      })
    }
  }

  const handleToggleReaction = async (messageId, emoji) => {
    await toggleMessageReaction({
      roomId: currentRoomId,
      messageId,
      emoji,
    })
  }

  const handleCreateRoom = async (roomData) => {
    setRoomsLoading(true)
    const newRoomId = await createChatRoom({
      ...roomData,
      user,
    })
    if (newRoomId) {
      setMessagesLoading(true)
      setActiveRoomId(newRoomId)
    }
  }

  return (
    <div className="flex h-screen flex-col bg-white text-slate-900 font-sans overflow-hidden">
      {/* Cloud Sync Notice (if remote Firestore rules are locked) */}
      {firestoreNotice && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-1.5 text-[11px] text-amber-800 flex items-center justify-between gap-2 z-50">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="inline-block h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="font-semibold">Local Multi-Tab Sync Active:</span>
            <span>
              Messages sync instantly across browser tabs. To enable cloud database persistence, deploy <code className="bg-amber-100 px-1 py-0.2 rounded font-mono">firestore.rules</code> in your Firebase Console.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setFirestoreNotice(false)}
            className="text-amber-700 hover:text-amber-900 font-bold px-1.5 cursor-pointer shrink-0"
            title="Dismiss notice"
          >
            &times;
          </button>
        </div>
      )}

      {/* Top Bar */}
      <Navbar
        activeRoom={activeRoom}
        onOpenMobileSidebar={() => setIsMobileSidebarOpen((prev) => !prev)}
        isMobileSidebarOpen={isMobileSidebarOpen}
        onOpenCreateRoom={() => setIsCreateRoomOpen(true)}
      />

      {/* Main Chat Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          rooms={rooms}
          activeRoomId={activeRoom?.id}
          onSelectRoom={handleSelectRoom}
          onOpenCreateRoom={() => setIsCreateRoomOpen(true)}
          isOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
          roomsLoading={roomsLoading}
        />

        {/* Chat Feed */}
        <main className="flex flex-1 flex-col overflow-hidden">
          <ChatArea
            activeRoom={activeRoom}
            messages={messages}
            messagesLoading={messagesLoading}
            onSendMessage={handleSendMessage}
            onToggleReaction={handleToggleReaction}
          />
        </main>
      </div>

      {/* Channel Creation Modal */}
      <CreateRoomModal
        isOpen={isCreateRoomOpen}
        onClose={() => setIsCreateRoomOpen(false)}
        onCreateRoom={handleCreateRoom}
      />
    </div>
  )
}

function MainChatApp() {
  const { user, loading } = useAuth()
  const [legalModalType, setLegalModalType] = useState(null)

  // Initial Auth Loading Screen
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 text-xs">
        <div className="flex flex-col items-center gap-2">
          <div className="h-5 w-5 border-2 border-slate-300 border-t-slate-800 rounded-full animate-spin" />
          <span>Loading workspace...</span>
        </div>
      </div>
    )
  }

  // Gate: User must log in first before connecting to database
  if (!user) {
    return (
      <>
        <LoginPage onOpenLegal={(type) => setLegalModalType(type)} />
        <LegalModal
          type={legalModalType}
          isOpen={Boolean(legalModalType)}
          onClose={() => setLegalModalType(null)}
        />
      </>
    )
  }

  return (
    <>
      <ChatWorkspace user={user} />
      <LegalModal
        type={legalModalType}
        isOpen={Boolean(legalModalType)}
        onClose={() => setLegalModalType(null)}
      />
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <MainChatApp />
    </AuthProvider>
  )
}
