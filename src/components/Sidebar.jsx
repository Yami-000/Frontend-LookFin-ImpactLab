import React from 'react'

export default function Sidebar({ open, conversations, onCreate, onSelect, onClose }) {
  const commonProblems = [
    'Mi Primer Sueldo',
    'Mi Primera tarjeta de crédito',
    'Mi primera inversión',
    'Mi primer crédito de consumo',
    'Mi primer ahorro',
    'Mi primera vez en los registros financieros',
    'Mi primera vez planificando',
    'Necesidades vs deseos',
    'Mi primer vehículo',
    'Mi primer seguro',
  ]

  const formatTimeAgo = (value) => {
    if (!value) return 'Hace un momento'

    const timestamp = typeof value === 'number' ? value : new Date(value).getTime()
    if (Number.isNaN(timestamp)) return 'Hace un momento'

    const diffMs = Date.now() - timestamp
    const diffMinutes = Math.max(0, Math.floor(diffMs / 60000))

    if (diffMinutes < 1) return 'Hace un momento'
    if (diffMinutes < 60) return `Hace ${diffMinutes} min`

    const diffHours = Math.floor(diffMinutes / 60)
    if (diffHours < 24) return `Hace ${diffHours} h`

    const diffDays = Math.floor(diffHours / 24)
    return `Hace ${diffDays} d`
  }

  const getChatPreview = (conversation) => {
    const userMessage = [...(conversation.messages || [])].reverse().find((message) => message.from === 'user')
    const previewSource = userMessage?.text || conversation.messages?.[conversation.messages.length - 1]?.text || conversation.title || 'Conversación'
    return previewSource.trim().split(/\s+/).slice(0, 5).join(' ')
  }

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/40 z-20" onClick={onClose} />}
      <aside className={`z-30 left-0 top-0 bottom-0 w-88 transform ${open ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-200 fixed`}>
        <div className="w-88 rounded-tr-3xl rounded-br-3xl border-r border-white/10 bg-[#07101f]/95 p-4 shadow-2xl shadow-black/40 backdrop-blur-xl h-full flex flex-col text-white">
          <header className="flex items-center justify-between pb-4 border-b border-white/10">
            <div>
              <h3 className="text-2xl font-semibold tracking-tight text-white">LookFin</h3>
            </div>
            <button
              onClick={onClose}
              className="h-10 w-10 rounded-full border border-white/10 bg-white/5 text-white text-lg leading-none hover:bg-white/10 transition text-center"
              aria-label="Cerrar sidebar"
              title="Cerrar"
            >
              ×
            </button>
          </header>

          <div className="flex-1 min-h-0 overflow-hidden py-4 flex flex-col gap-5">
            <section className="space-y-3">
              <h4 className="text-sm font-semibold uppercase tracking-[0.22em] text-white/80">Problemas comunes</h4>
              <div className="overflow-x-auto pb-2 hide-scrollbar">
                <div className="flex gap-4 min-w-max pr-2">
                  {commonProblems.map((problem, index) => (
                    <button
                      key={problem}
                      type="button"
                      className="group flex w-24 flex-col items-center gap-2 text-center"
                      title={problem}
                    >
                      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#155DFC] text-lg font-semibold text-white shadow-lg shadow-cyan-500/20 transition group-hover:scale-105 group-hover:brightness-110">
                        {index + 1}
                      </span>
                      <span className="text-xs font-medium leading-tight text-white/90">
                        {problem}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </section>

            <section className="min-h-0 flex-1 flex flex-col">
              <h4 className="mb-3 text-sm font-semibold uppercase tracking-[0.22em] text-white/80">Historial de chats</h4>
              <div className="min-h-0 flex-1 overflow-y-auto space-y-2 pr-1">
                {conversations.map((conversation) => (
                  <button
                    key={conversation.id}
                    type="button"
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left transition hover:bg-white/10 hover:border-white/20"
                    onClick={() => onSelect(conversation.id)}
                  >
                    <div className="text-sm font-medium text-white line-clamp-1">
                      {getChatPreview(conversation)}
                    </div>
                    <div className="mt-1 text-xs text-white/60">
                      {formatTimeAgo(conversation.messages?.[conversation.messages.length - 1]?.time)}
                    </div>
                  </button>
                ))}
                {conversations.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-white/10 bg-white/3 px-4 py-6 text-sm text-white/60">
                    No hay conversaciones aún
                  </div>
                )}
              </div>
            </section>
          </div>

          <footer className="pt-4 border-t border-white/10">
            <button
              className="w-full rounded-2xl bg-[#155DFC] px-4 py-3 font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:brightness-110"
              onClick={onCreate}
            >
              Nueva conversación
            </button>
          </footer>
        </div>
      </aside>
    </>
  )
}
