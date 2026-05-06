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
        <div className="flex-1 p-3 overflow-auto space-y-3">
          {conversation.messages.map((m) => (
            <div key={m.id} className={`max-w-[60%] p-2 rounded ${m.from === 'user' ? 'bg-indigo-700 ml-auto' : 'bg-white/5'}`}>
              <div className="text-sm">{m.text}</div>
            </div>
          ))}
        </div>
      )}

      <div className="flex p-3 border-t border-white/5">
        <input className="flex-1 p-2 rounded bg-transparent border border-white/5 mr-2" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Escribe tu mensaje..." />
        <button className="px-3 py-2 bg-indigo-600 rounded" onClick={send}>Enviar</button>
      </div>
    </main>
  )
}
