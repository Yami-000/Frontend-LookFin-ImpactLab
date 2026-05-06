import React from 'react'
import { Conversation } from '../types'

export default function Sidebar({
  open,
  conversations,
  onCreate,
  onSelect,
  onClose,
}: {
  open: boolean
  conversations: Conversation[]
  onCreate: () => void
  onSelect: (id: string) => void
  onClose: () => void
}) {
  return (
    <aside className={`sidebar ${open ? 'open' : ''}`}>
      <div className="sidebar-header">
        <h3>Conversaciones</h3>
        <button onClick={onClose}>✕</button>
      </div>
      <div className="sidebar-list">
        <button className="create-btn" onClick={onCreate}>
          + Nueva conversación
        </button>
        {conversations.map((c) => (
          <div key={c.id} className="conv-item" onClick={() => onSelect(c.id)}>
            {c.title}
          </div>
        ))}
        {conversations.length === 0 && <div className="empty">No hay conversaciones aún</div>}
      </div>
    </aside>
  )
}
