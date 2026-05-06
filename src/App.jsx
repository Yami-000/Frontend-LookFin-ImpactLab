import React, { useState, useEffect } from 'react'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import Chat from './components/Chat'
import ProfileModal from './components/ProfileModal'

const STORAGE_CONV = 'lf_conversations'
const STORAGE_PROFILE = 'lf_profile'

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [conversations, setConversations] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [profile, setProfile] = useState({ name: 'Usuario', bio: '' })

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

  const addConversation = (title) => {
    const id = Date.now().toString()
    const conv = { id, title: title || 'Nueva conversación', messages: [] }
    setConversations((s) => [conv, ...s])
    setActiveId(id)
    setSidebarOpen(false)
  }

  const updateConversation = (id, messages) => {
    setConversations((s) => s.map((c) => (c.id === id ? { ...c, messages } : c)))
  }

  const activeConv = conversations.find((c) => c.id === activeId) || null

  return (
    <div className="min-h-screen flex flex-col">
      <Header onMenu={() => setSidebarOpen((s) => !s)} onProfile={() => setProfileOpen(true)} profile={profile} />

      <div className="flex-1 relative flex">
        <Sidebar open={sidebarOpen} conversations={conversations} onCreate={() => addConversation()} onSelect={(id) => setActiveId(id)} onClose={() => setSidebarOpen(false)} />
        <Chat conversation={activeConv} onCreateConversation={addConversation} onUpdateConversation={updateConversation} />
      </div>

      <ProfileModal open={profileOpen} profile={profile} onClose={() => setProfileOpen(false)} onSave={(p) => setProfile(p)} />
    </div>
  )
}