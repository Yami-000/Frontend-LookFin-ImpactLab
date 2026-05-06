import React from 'react'
import { Profile } from '../types'

export default function Header({ onMenu, onProfile, profile }: { onMenu: () => void; onProfile: () => void; profile: Profile }) {
  return (
    <header className="app-header">
      <button className="menu-btn" onClick={onMenu} aria-label="Abrir menú">
        ☰
      </button>
      <h1 className="title">ImpactLab Chat</h1>
      <div className="spacer" />
      <button className="profile-btn" onClick={onProfile} aria-label="Perfil">
        <span className="avatar">{profile.name.charAt(0)}</span>
      </button>
    </header>
  )
}
