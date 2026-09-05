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
} from './firebase/chatService'

function ChatWorkspace({ user }) {
  const [rooms, setRooms] = useState([])
  const [roomsLoading, setRoomsLoading] = useState(true)
  const [activeRoomId, setActiveRoomId] = useState('general')

  const [messages, setMessages] = useState([])
  const [messagesLoading, setMessagesLoading] = useState(true)

  // Mobile drawer state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false)

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
        console.error('Rooms subscription error:', err)
        setRoomsLoading(false)
      }
    )

    return () => unsubscribe()
  }, [])

  // Subscribe to room messages
  useEffect(() => {
    if (!activeRoomId) return

    const unsubscribe = subscribeToRoomMessages(
      activeRoomId,
      (newMessages) => {
        setMessages(newMessages)
        setMessagesLoading(false)
      },
      (err) => {
        console.error('Messages subscription error:', err)
        setMessagesLoading(false)
      }
    )

    return () => unsubscribe()
  }, [activeRoomId])

  const activeRoom = rooms.find((r) => r.id === activeRoomId) || rooms[0]

  const handleSelectRoom = (roomId) => {
    if (roomId !== activeRoomId) {
      setMessagesLoading(true)
      setActiveRoomId(roomId)
    }
  }

  const handleSendMessage = async (text) => {
    await sendRoomMessage({
      roomId: activeRoomId,
      text,
      user,
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
