import React, { useState } from 'react'
import { Conversation, Message } from '../types'

function createBotReply(userText: string): Message {
  return {
    id: Date.now().toString() + '-bot',
    from: 'bot',
    text: `Respuesta automática: Gracias por tu mensaje. (Eco: ${userText})`,
    time: Date.now(),
  }
}

export default function Chat({
  conversation,
  onCreateConversation,
  onUpdateConversation,
}: {
  conversation: Conversation | null
  onCreateConversation: (title?: string) => void
  onUpdateConversation: (id: string, messages: Message[]) => void
}) {
  const [input, setInput] = useState('')

  const send = () => {
    if (!input.trim()) return
    if (!conversation) {
      onCreateConversation('Chat ' + new Date().toLocaleString())
      setInput('')
      return
    }

    const userMsg: Message = { id: Date.now().toString() + '-u', from: 'user', text: input, time: Date.now() }
    const botMsg = createBotReply(input)
    const newMessages = [...conversation.messages, userMsg, botMsg]
    onUpdateConversation(conversation.id, newMessages)
    setInput('')
  }

  return (
    <main className="chat-root">
      {!conversation ? (
        <div className="no-conv">Selecciona o crea una conversación desde la izquierda.</div>
      ) : (
        <div className="messages">
          {conversation.messages.map((m) => (
            <div key={m.id} className={`msg ${m.from}`}>
              <div className="text">{m.text}</div>
            </div>
          ))}
        </div>
      )}

      <div className="chat-input">
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Escribe tu mensaje..." />
        <button onClick={send}>Enviar</button>
      </div>
    </main>
  )
}
