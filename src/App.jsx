import { useState, useEffect } from 'react'
import { AuthProvider } from './context/AuthContext'
import { useAuth } from './context/useAuth'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import ChatArea from './components/ChatArea'
import Footer from './components/Footer'
import CreateRoomModal from './components/CreateRoomModal'
import AuthModal from './components/AuthModal'
import LegalModal from './components/LegalModal'
import {
  subscribeToRooms,
  subscribeToRoomMessages,
  sendRoomMessage,
  createChatRoom,
  toggleMessageReaction,
} from './firebase/chatService'

function MainChatApp() {
  const { user } = useAuth()
  const [rooms, setRooms] = useState([])
  const [roomsLoading, setRoomsLoading] = useState(true)
  const [activeRoomId, setActiveRoomId] = useState('general')

  const [messages, setMessages] = useState([])
  const [messagesLoading, setMessagesLoading] = useState(true)

  // Mobile drawer state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  // Modals state
  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [legalModalType, setLegalModalType] = useState(null) // 'terms' | 'privacy' | null

  // Subscribe to rooms in real time
  useEffect(() => {
    const unsubscribe = subscribeToRooms(
      (newRooms) => {
        setRooms(newRooms)
        setRoomsLoading(false)
        // If active room not set or no longer exists, select first room
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

  // Subscribe to messages in real time for the active room
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

  // Get the active room object
  const activeRoom = rooms.find((r) => r.id === activeRoomId) || rooms[0]

  // Handlers
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

  const handleReact = async (messageId, emoji) => {
    await toggleMessageReaction({
      roomId: activeRoomId,
      messageId,
      emoji,
      user,
    })
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#08090e] text-slate-100 selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Top Navigation */}
      <Navbar
        activeRoom={activeRoom}
        onOpenMobileSidebar={() => setIsMobileSidebarOpen((prev) => !prev)}
        isMobileSidebarOpen={isMobileSidebarOpen}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenCreateRoom={() => setIsCreateRoomOpen(true)}
      />

      {/* Main App Workspace */}
      <div className="flex flex-1 overflow-hidden" style={{ height: 'calc(100vh - 64px - 53px)' }}>
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

        {/* Real Time Chat Area */}
        <main className="flex flex-1 flex-col overflow-hidden">
          <ChatArea
            activeRoom={activeRoom}
            messages={messages}
            messagesLoading={messagesLoading}
            onSendMessage={handleSendMessage}
            onReact={handleReact}
            onOpenAuth={() => setIsAuthModalOpen(true)}
          />
        </main>
      </div>

      {/* Footer */}
      <Footer onOpenLegal={(type) => setLegalModalType(type)} />

      {/* Create Room Modal */}
      <CreateRoomModal
        isOpen={isCreateRoomOpen}
        onClose={() => setIsCreateRoomOpen(false)}
        onCreateRoom={handleCreateRoom}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Legal Modal (Terms of Service / Privacy Policy) */}
      <LegalModal
        type={legalModalType}
        isOpen={Boolean(legalModalType)}
        onClose={() => setLegalModalType(null)}
      />
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <MainChatApp />
    </AuthProvider>
  )
}
