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
      <div className="w-96 rounded-3xl border border-white/10 bg-[#0b1224]/80 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl">
        <h3 className="text-lg font-medium mb-2">Editar perfil</h3>
        <label className="block mb-3">
          <div className="text-sm mb-1 text-slate-200">Nombre</div>
          <input className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500" value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label className="block mb-3">
          <div className="text-sm mb-1 text-slate-200">Bio</div>
          <textarea className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500" value={bio} onChange={(e) => setBio(e.target.value)} />
        </label>
        <div className="flex justify-end gap-3 mt-4">
          <button className="px-4 py-2 rounded-2xl" onClick={onClose}>Cancelar</button>
          <button className="px-4 py-2 rounded-2xl bg-linear-to-r from-cyan-500 to-indigo-600 text-white shadow-lg shadow-cyan-500/20" onClick={save}>Guardar</button>
        </div>
      </div>
    </div>
  )
}
