import React, { useState, useEffect } from 'react'
import { Profile } from '../types'

export default function ProfileModal({ open, profile, onClose, onSave }: { open: boolean; profile: Profile; onClose: () => void; onSave: (p: Profile) => void }) {
  const [name, setName] = useState(profile.name)
  const [bio, setBio] = useState(profile.bio || '')

  useEffect(() => {
    setName(profile.name)
    setBio(profile.bio || '')
  }, [profile, open])

  if (!open) return null

  const save = () => {
    onSave({ name, bio })
    onClose()
  }

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>Editar perfil</h3>
        <label>
          Nombre
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label>
          Bio
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} />
        </label>
        <div className="modal-actions">
          <button onClick={onClose}>Cancelar</button>
          <button onClick={save}>Guardar</button>
        </div>
      </div>
    </div>
  )
}
