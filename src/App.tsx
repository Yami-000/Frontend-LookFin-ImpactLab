import React, { useEffect, useState } from 'react'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import Chat from './components/Chat'
import ProfileModal from './components/ProfileModal'
import { Conversation, Profile } from './types'

const STORAGE_CONV = 'lf_conversations'
const STORAGE_PROFILE = 'lf_profile'

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [profile, setProfile] = useState<Profile>({ name: 'Usuario', bio: '' })

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

  const addConversation = (title?: string) => {
    const id = Date.now().toString()
    const conv: Conversation = { id, title: title || 'Nueva conversación', messages: [] }
    setConversations((s) => [conv, ...s])
    setActiveId(id)
    setSidebarOpen(false)
  }

  const updateConversation = (id: string, messages: Conversation['messages']) => {
    setConversations((s) => s.map((c) => (c.id === id ? { ...c, messages } : c)))
  }

  const activeConv = conversations.find((c) => c.id === activeId) || null

  return (
    <div className="app-root">
      <Header
        onMenu={() => setSidebarOpen((s) => !s)}
        onProfile={() => setProfileOpen(true)}
        profile={profile}
      />

      <div className="main-area">
        <Sidebar
          open={sidebarOpen}
          conversations={conversations}
          onCreate={() => addConversation()}
          onSelect={(id) => setActiveId(id)}
          onClose={() => setSidebarOpen(false)}
        />

        <Chat
          conversation={activeConv}
          onCreateConversation={addConversation}
          onUpdateConversation={updateConversation}
        />
      </div>

      <ProfileModal
        open={profileOpen}
        profile={profile}
        onClose={() => setProfileOpen(false)}
        onSave={(p) => setProfile(p)}
      />
    </div>
  )
}
