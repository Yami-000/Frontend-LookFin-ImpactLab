import React, { useState } from 'react'

function createBotReply(userText) {
  return { id: Date.now().toString() + '-bot', from: 'bot', text: `Respuesta automática: Gracias por tu mensaje. (Eco: ${userText})`, time: Date.now() }
}

export default function Chat({ conversation, onCreateConversation, onUpdateConversation }) {
  const [input, setInput] = useState('')

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

  return (
    <main className="flex-1 flex flex-col">
      {!conversation ? (
        <div className="flex-1 flex items-center justify-center text-white/60">Selecciona o crea una conversación desde la izquierda.</div>
      ) : (
        <div className="flex-1 p-4 overflow-auto space-y-4">
          <div className="max-w-4xl mx-auto">
            {conversation.messages.map((m) => (
              <div key={m.id} className={`max-w-[60%] p-3 rounded-xl ${m.from === 'user' ? 'bg-indigo-700 ml-auto text-white' : 'bg-white/5 text-white'}`}>
                <div className="text-sm">{m.text}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="p-4 border-t border-white/5 bg-[#050816]/40 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto flex">
          <input className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-500" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Escribe tu mensaje..." />
          <button className="ml-3 px-4 py-3 rounded-2xl bg-linear-to-r from-cyan-500 to-indigo-600 text-white shadow-lg shadow-cyan-500/20" onClick={send}>Enviar</button>
        </div>
      </div>
    </main>
  )
}
