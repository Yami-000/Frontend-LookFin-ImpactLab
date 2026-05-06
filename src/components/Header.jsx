import React from 'react'

export default function Header({ onMenu, onProfile, onLogout, profile, user }) {
  const label = user?.displayName || user?.email || profile.name

    return (
        <header className="w-full h-14 flex items-center justify-between px-4 border-b border-white/6 bg-[#101828] text-[#e9f1ff] backdrop-blur-md">
            <div className="flex items-center">
                <button className="text-white text-xl bg-transparent" onClick={onMenu} aria-label="Abrir menú">☰</button>
            </div>

            <div className="flex-1 flex justify-center">
                <h1 className="text-white text-lg font-semibold tracking-wide">LookFin</h1>
            </div>

            <div className="flex items-center">
                <div className="hidden sm:flex flex-col items-end mr-3 text-right">
                    <span className="text-sm font-medium text-white">{label}</span>
                    <span className="text-xs text-white/55">Sesión activa</span>
                </div>
                <button className="bg-transparent mr-3" onClick={onProfile} aria-label="Perfil">
                    <span className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center font-semibold text-sm text-white shadow">{label.charAt(0).toUpperCase()}</span>
                </button>
                <button className="rounded-full border border-white/10 px-3 py-1.5 text-sm text-white/80 transition hover:bg-white/5 bg-transparent" onClick={onLogout} aria-label="Cerrar sesión">
                    Salir
                </button>
            </div>
        </header>
    )
}
