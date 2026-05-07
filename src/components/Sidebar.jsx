import React from 'react'

export default function Sidebar({ open, conversations, onCreate, onSelect, onClose }) {
  return (
    <>
      {open && <div className="fixed inset-0 bg-black/40 z-20" onClick={onClose} />}
      <aside className={`z-30 left-0 top-0 bottom-0 w-72 transform ${open ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-200 fixed`}>
        <div className="w-72 rounded-tr-3xl rounded-br-3xl border-r border-white/10 bg-[#0b1224]/80 p-4 shadow-2xl shadow-black/30 backdrop-blur-xl h-full">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-medium">Conversaciones</h3>
            <button onClick={onClose}>✕</button>
          </div>
          <div className="space-y-3">
            <button className="w-full py-2 rounded-2xl border border-white/10 bg-white/5" onClick={onCreate}>+ Nueva conversación</button>
            <div className="mt-2 space-y-2">
              {conversations.map((c) => (
                <div key={c.id} className="p-3 rounded-xl border border-white/6 bg-white/3 cursor-pointer" onClick={() => onSelect(c.id)}>{c.title}</div>
              ))}
              {conversations.length === 0 && <div className="text-sm text-white/60">No hay conversaciones aún</div>}
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
