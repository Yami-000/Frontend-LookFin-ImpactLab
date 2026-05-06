import React from 'react'

export default function Sidebar({ open, conversations, onCreate, onSelect, onClose }) {
  return (
    <>
      {open && <div className="fixed inset-0 bg-black/40 z-20" onClick={onClose} />}
      <aside className={`z-30 left-0 top-0 bottom-0 w-72 bg-[#071125] transform ${open ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-200 fixed`}>
        <div className="flex items-center justify-between p-3 border-b border-white/5">
          <h3 className="text-lg font-medium">Conversaciones</h3>
          <button onClick={onClose}>✕</button>
        </div>
        <div className="p-3 space-y-2">
          <button className="w-full py-2 bg-white/5 rounded" onClick={onCreate}>+ Nueva conversación</button>
          {conversations.map((c) => (
            <div key={c.id} className="p-2 rounded bg-white/2 cursor-pointer" onClick={() => onSelect(c.id)}>{c.title}</div>
          ))}
          {conversations.length === 0 && <div className="text-sm text-white/60">No hay conversaciones aún</div>}
        </div>
      </aside>
    </>
  )
}
