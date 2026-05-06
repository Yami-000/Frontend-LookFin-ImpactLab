import React, { useState, useEffect, useRef } from 'react'

function createBotReply(userText) {
  return { id: Date.now().toString() + '-bot', from: 'bot', text: `Respuesta automática: Gracias por tu mensaje. (Eco: ${userText})`, time: Date.now() }
}

export default function Chat({ conversation, onCreateConversation, onUpdateConversation }) {
  const [input, setInput] = useState('')
  const wrapperRef = useRef(null)

  const send = () => {
    if (!input.trim()) return
    if (!conversation) {
      onCreateConversation('Chat ' + new Date().toLocaleString())
      setInput('')
      return
    }

    const userMsg = { id: Date.now().toString() + '-u', from: 'user', text: input, time: Date.now() }
    const botMsg = createBotReply(input)
    const newMessages = [...conversation.messages, userMsg, botMsg]
    onUpdateConversation(conversation.id, newMessages)
    setInput('')
  }

  // scroll to bottom whenever messages change
  useEffect(() => {
    if (!conversation || !wrapperRef.current) return
    // small timeout to wait render
    const t = setTimeout(() => {
      try {
        wrapperRef.current.scrollTo({ top: wrapperRef.current.scrollHeight, behavior: 'smooth' })
      } catch (e) {}
    }, 50)
    return () => clearTimeout(t)
  }, [conversation?.messages?.length])

  return (
    <main className="flex-1 flex flex-col">
      {!conversation ? (
        <div className="flex-1 flex items-center justify-center text-white/60">Selecciona o crea una conversación desde la izquierda.</div>
      ) : (
        <div ref={wrapperRef} className="flex-1 p-6 overflow-auto transition-all duration-300">
          <div className={`max-w-4xl mx-auto min-h-full flex flex-col ${conversation.messages.length === 1 && conversation.messages[0].from === 'bot' ? 'justify-center items-center' : 'justify-start items-stretch'} gap-6`}>
            {/* Show welcome banner if conversation currently only has the initial bot message */}
            {conversation.messages.length === 1 && conversation.messages[0].from === 'bot' && (
              <div className="text-center">
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Bienvenido a LookFin</h2>
                <p className="mt-3 text-lg text-slate-300">Tu compañero inteligente en finanzas personales</p>
              </div>
            )}

            <div className="w-full">
              {conversation.messages.map((m) => (
                <div key={m.id} className={`max-w-[60%] p-4 rounded-xl my-4 ${m.from === 'user' ? 'bg-indigo-700 ml-auto text-white' : 'bg-white/5 text-white'}`}>
                  <div className="text-sm">{m.text}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="p-6 border-t border-white/5 bg-[#050816]/40 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto flex items-center">
          <input
            className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-white outline-none placeholder:text-slate-500"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe tu mensaje..."
          />
          <button
            className="ml-3 px-4 py-3 rounded-2xl bg-[#155DFC] text-white shadow-lg shadow-cyan-500/20"
            onClick={send}
            aria-label="Enviar"
            title="Enviar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 transform rotate-315">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </div>
      </div>
    </main>
  )
}
