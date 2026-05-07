import React, { useState, useEffect } from 'react'

export default function ProfileModal({ open, profile, onClose, onSave }) {
  const [name, setName] = useState(profile.name || '')
  const [bio, setBio] = useState(profile.bio || '')
  const [email, setEmail] = useState(profile.email || '')
  const [fullName, setFullName] = useState(profile.fullName || '')
  const [profession, setProfession] = useState(profile.profession || '')
  const [dob, setDob] = useState(profile.dob || '')
  const [city, setCity] = useState(profile.city || '')
  const [monthlyIncome, setMonthlyIncome] = useState(profile.monthlyIncome || '')
  const [rshPercent, setRshPercent] = useState(profile.rshPercent || '')

  useEffect(() => {
    setName(profile.name || '')
    setBio(profile.bio || '')
    setEmail(profile.email || '')
    setFullName(profile.fullName || '')
    setProfession(profile.profession || '')
    setDob(profile.dob || '')
    setCity(profile.city || '')
    setMonthlyIncome(profile.monthlyIncome || '')
    setRshPercent(profile.rshPercent || '')
  }, [profile, open])

  if (!open) return null

  const save = () => {
    // minimal normalization for numeric fields
    const normalizedIncome = monthlyIncome === '' ? '' : Number(monthlyIncome)
    const normalizedRsh = rshPercent === '' ? '' : Number(rshPercent)

    onSave({
      name,
      bio,
      email,
      fullName,
      profession,
      dob,
      city,
      monthlyIncome: normalizedIncome,
      rshPercent: normalizedRsh,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-40">
      <div className="w-96 rounded-3xl border border-white/10 bg-[#0b1224]/80 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl">
        <div className="flex items-center gap-4 pb-4 border-b border-white/5">
          <div className="w-14 h-14 rounded-full bg-blue-500 flex items-center justify-center text-white flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-7 h-7" aria-hidden>
              <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z" />
              <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M4 20c0-3.3137 2.6863-6 6-6h4c3.3137 0 6 2.6863 6 6" />
            </svg>
          </div>
          <h3 className="text-lg text-white font-medium">Editar perfil</h3>
        </div>

        <div className="pt-4">

        <label className="block mb-3">
          <div className="text-sm mb-1 text-slate-200">Correo</div>
          <input type="email" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>

        <label className="block mb-3">
          <div className="text-sm mb-1 text-slate-200">Nombre completo</div>
          <input className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </label>

        <label className="block mb-3">
          <div className="text-sm mb-1 text-slate-200">Profesión</div>
          <input className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500" value={profession} onChange={(e) => setProfession(e.target.value)} />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block mb-3">
            <div className="text-sm mb-1 text-slate-200">Fecha de nacimiento</div>
            <input type="date" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition" value={dob} onChange={(e) => setDob(e.target.value)} />
          </label>

          <label className="block mb-3">
            <div className="text-sm mb-1 text-slate-200">Ciudad</div>
            <input className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition" value={city} onChange={(e) => setCity(e.target.value)} />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="block mb-3">
            <div className="text-sm mb-1 text-slate-200">Ingresos mensuales</div>
            <input type="number" min="0" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition" value={monthlyIncome} onChange={(e) => setMonthlyIncome(e.target.value)} />
          </label>

          <label className="block mb-3">
            <div className="text-sm mb-1 text-slate-200">% RSH</div>
            <input type="number" min="0" max="100" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition" value={rshPercent} onChange={(e) => setRshPercent(e.target.value)} />
          </label>
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <button className="px-4 py-2 rounded-2xl" onClick={onClose}>Cancelar</button>
          <button className="px-4 py-2 rounded-2xl bg-linear-to-r from-cyan-500 to-indigo-600 text-white shadow-lg shadow-cyan-500/20" onClick={save}>Guardar</button>
        </div>
      </div>
    </div>
  </div>
  )
}
