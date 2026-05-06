import React from 'react'

export default function Header({ onMenu, onProfile, onLogout, profile, user }) {
  const label = user?.displayName || user?.email || profile.name

  return (
    <header className="h-14 flex items-center px-3 border-b border-white/5 bg-[#050816]/80 backdrop-blur-md">
      <button className="text-white text-xl bg-transparent" onClick={onMenu} aria-label="Abrir menú">☰</button>
      <h1 className="ml-3 text-lg font-semibold tracking-wide">LookFin</h1>
      <div className="flex-1" />
      <div className="hidden sm:flex flex-col items-end mr-3 text-right">
        <span className="text-sm font-medium text-white">{label}</span>
        <span className="text-xs text-white/55">Sesión activa</span>
      </div>
      <button className="bg-transparent mr-2" onClick={onProfile} aria-label="Perfil">
        <span className="w-8 h-8 rounded-full bg-linear-to-br from-cyan-500 to-indigo-600 flex items-center justify-center font-semibold">{label.charAt(0).toUpperCase()}</span>
      </button>
      <button className="rounded-full border border-white/10 px-3 py-1.5 text-sm text-white/80 transition hover:bg-white/5" onClick={onLogout} aria-label="Cerrar sesión">
        Salir
      </button>
    </header>
  )
}
