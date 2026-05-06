import React, { useState, useEffect } from 'react'

export default function ProfileModal({ open, profile, onClose, onSave }) {
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
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-40">
      <div className="bg-[#071125] p-4 rounded w-96">
        <h3 className="text-lg font-medium mb-2">Editar perfil</h3>
        <label className="block mb-2">
          <div className="text-sm mb-1">Nombre</div>
          <input className="w-full p-2 rounded bg-transparent border border-white/5" value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label className="block mb-2">
          <div className="text-sm mb-1">Bio</div>
          <textarea className="w-full p-2 rounded bg-transparent border border-white/5" value={bio} onChange={(e) => setBio(e.target.value)} />
        </label>
        <div className="flex justify-end gap-2 mt-3">
          <button className="px-3 py-1" onClick={onClose}>Cancelar</button>
          <button className="px-3 py-1 bg-indigo-600 rounded" onClick={save}>Guardar</button>
        </div>
      </div>
    </div>
  )
}
