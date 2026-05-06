import React from 'react'

export default function Header({ onMenu, onProfile, profile }) {
  return (
    <header className="h-14 flex items-center px-3 border-b border-white/5">
      <button className="text-white text-xl bg-transparent" onClick={onMenu} aria-label="Abrir menú">☰</button>
      <h1 className="ml-3 text-lg font-semibold">Impact Lab Chat</h1>
      <div className="flex-1" />
      <button className="bg-transparent" onClick={onProfile} aria-label="Perfil">
        <span className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center">{profile.name.charAt(0)}</span>
      </button>
    </header>
  )
}
