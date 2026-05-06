import React, { useEffect, useState } from 'react'
import { gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from './lib/firebase.js'
import Login from './views/Login.tsx'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import Chat from './components/Chat'
import ProfileModal from './components/ProfileModal'

const ADD_CHAT = gql`
  mutation AddChat($input: ChatInput!) {
    addChat(input: $input) {
      id
      nombre
    }
  }
`;

const STORAGE_CONV = 'lf_conversations'
const STORAGE_PROFILE = 'lf_profile'

export default function App() {
  const [authReady, setAuthReady] = useState(false)
  const [authUser, setAuthUser] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [conversations, setConversations] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [profile, setProfile] = useState({ name: 'Usuario', bio: '' })
  const [addChatMutation] = useMutation(ADD_CHAT)

  useEffect(() => {
    if (!auth) {
      setAuthReady(true)
      return undefined
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setAuthUser(user)

      if (user) {
        const token = await user.getIdToken()
        localStorage.setItem('lf_firebase_token', token)
        localStorage.setItem(
          'lf_firebase_user',
          JSON.stringify({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
          }),
        )
      } else {
        localStorage.removeItem('lf_firebase_token')
        localStorage.removeItem('lf_firebase_user')
      }

      setAuthReady(true)
    })

    return () => unsubscribe()
  }, [])

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_CONV)
    if (raw) setConversations(JSON.parse(raw))
    const p = localStorage.getItem(STORAGE_PROFILE)
    if (p) setProfile(JSON.parse(p))
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_CONV, JSON.stringify(conversations))
  }, [conversations])

  useEffect(() => {
    localStorage.setItem(STORAGE_PROFILE, JSON.stringify(profile))
  }, [profile])

  const handleLogout = async () => {
    if (!auth) return

    await signOut(auth)
    setSidebarOpen(false)
    setProfileOpen(false)
    setActiveId(null)
  }

  const addConversation = async (title, existingConversationId = null) => {
    const response = await addChatMutation({
      variables: {
        input: {
          nombre: title || 'Nueva conversación',
        },
      },
    })

    const createdChat = response.data?.addChat
    if (!createdChat?.id) {
      throw new Error('No se pudo crear la conversación en la base de datos')
    }

    setConversations((current) => {
      if (existingConversationId) {
        return current.map((conversation) => (
          conversation.id === existingConversationId
            ? { ...conversation, id: createdChat.id, title: createdChat.nombre || conversation.title }
            : conversation
        ))
      }

      const conv = { id: createdChat.id, title: createdChat.nombre || title || 'Nueva conversación', messages: [] }
      return [conv, ...current]
    })

    setActiveId(createdChat.id)
    setSidebarOpen(false)

    return {
      id: createdChat.id,
      title: createdChat.nombre || title || 'Nueva conversación',
    }
  }

  const updateConversation = (id, messages) => {
    setConversations((s) => s.map((c) => (c.id === id ? { ...c, messages } : c)))
  }

  const activeConv = conversations.find((c) => c.id === activeId) || null

  if (!authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050816] text-slate-300">
        Cargando LookFin...
      </div>
    )
  }

  if (!authUser) {
    return <Login onAuthenticated={(user) => setAuthUser(user)} />
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        onMenu={() => setSidebarOpen((s) => !s)}
        onProfile={() => setProfileOpen(true)}
        onLogout={handleLogout}
        profile={profile}
        user={authUser}
      />

      <div className="flex-1 relative flex bg-gray-900">
        <Sidebar open={sidebarOpen} conversations={conversations} onCreate={() => addConversation()} onSelect={(id) => setActiveId(id)} onClose={() => setSidebarOpen(false)} />
        <Chat conversation={activeConv} onCreateConversation={addConversation} onUpdateConversation={updateConversation} />
      </div>

      <ProfileModal open={profileOpen} profile={profile} onClose={() => setProfileOpen(false)} onSave={(p) => setProfile(p)} />
    </div>
  )
}