import React, { useRef, useState, useEffect } from 'react'
import { gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'
import ReactMarkdown from 'react-markdown'

const UPLOAD_FILE = gql`
  mutation UploadFile($input: UploadFileInput!) {
    uploadFile(input: $input) {
      success
      message
      fileUrl
    }
  }
`;

const PROCESAR_MENSAJE_CON_IA = gql`
  mutation ProcesarMensajeConIA($input: ProcessMensajeConIAInput!) {
    procesarMensajeConIA(input: $input) {
      mensajeUsuario {
        id
        chatID
        texto
        usuario {
          id
          nombre
        }
        createdAt
      }
      mensajeIA {
        id
        chatID
        texto
        createdAt
      }
    }
  }
`;

const MAX_UPLOAD_FILE_SIZE_BYTES = 8 * 1024 * 1024
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export default function Chat({ conversation, onCreateConversation, onUpdateConversation }) {
  const [input, setInput] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [processingIA, setProcessingIA] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const fileInputRef = useRef(null)
  const [uploadFileMutation] = useMutation(UPLOAD_FILE)
  const [procesarMensajeConIAMutation] = useMutation(PROCESAR_MENSAJE_CON_IA)
  const wrapperRef = useRef(null)

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setUploadError('')
    }
  }

  const clearFileSelection = () => {
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const readFileAsBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const base64String = e.target.result.split(',')[1]
        resolve(base64String)
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

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

  const send = async () => {
    if (!input.trim() && !selectedFile) return
    setUploadError('')

    const normalizedText = input.trim()

    let targetConversationId = conversation?.id ?? null
    let existingMessages = conversation?.messages ?? []

    if (!targetConversationId) {
      const createdConversation = await onCreateConversation('Chat ' + new Date().toLocaleString())
      if (!createdConversation?.id) {
        setUploadError('No se pudo crear la conversación para enviar el mensaje')
        return
      }
      targetConversationId = createdConversation.id
      existingMessages = []
    }

    if (!UUID_PATTERN.test(targetConversationId)) {
      try {
        const createdConversation = await onCreateConversation(
          conversation?.title || 'Nueva conversación',
          conversation?.id || null,
        )

        if (!createdConversation?.id || !UUID_PATTERN.test(createdConversation.id)) {
          throw new Error('No se pudo preparar la conversación para enviar mensajes')
        }

        targetConversationId = createdConversation.id
      } catch (error) {
        setUploadError(error.message || 'No se pudo preparar la conversación para enviar mensajes')
        return
      }
    }

    let fileUrl = null

    if (selectedFile) {
      if (selectedFile.size > MAX_UPLOAD_FILE_SIZE_BYTES) {
        setUploadError('El archivo supera el límite de 8 MB.')
        return
      }

      setUploading(true)
      try {
        const base64String = await readFileAsBase64(selectedFile)

        const response = await uploadFileMutation({
          variables: {
            input: {
              file: base64String,
              fileName: selectedFile.name,
              chatID: targetConversationId,
            },
          },
        })

        if (!response.data?.uploadFile?.success) {
          throw new Error(response.data?.uploadFile?.message || 'Error al subir archivo')
        }

        fileUrl = response.data.uploadFile.fileUrl
      } catch (error) {
        setUploading(false)
        setUploadError(error.message || 'Error al subir archivo')
        return
      }
    }
      // scroll to bottom whenever messages change
    

    try {
      setProcessingIA(true)
      const response = await procesarMensajeConIAMutation({
        variables: {
          input: {
            chatID: targetConversationId,
            texto: normalizedText,
          },
        },
      })

      const { mensajeUsuario, mensajeIA } = response?.data?.procesarMensajeConIA
      if (!mensajeUsuario?.id || !mensajeIA?.id) {
        throw new Error('No se pudo procesar el mensaje con el agente de IA')
      }

      const userMsg = {
        id: mensajeUsuario.id,
        from: 'user',
        text: mensajeUsuario.texto,
        time: new Date(mensajeUsuario.createdAt || Date.now()).getTime(),
        archivoAdjuntoURL: fileUrl || null,
      }

      const botMsg = {
        id: mensajeIA.id,
        from: 'bot',
        text: mensajeIA.texto,
        time: new Date(mensajeIA.createdAt || Date.now()).getTime(),
      }

      const newMessages = [...existingMessages, userMsg, botMsg]
      onUpdateConversation(targetConversationId, newMessages)
      setInput('')
      clearFileSelection()
    } catch (error) {
      setUploadError(error.message || 'No se pudo guardar el mensaje')
    } finally {
      setUploading(false)
      setProcessingIA(false)
    }
  }

  return (
    <main className="flex-1 flex flex-col">
      {!conversation ? (
        <div className="flex-1 flex items-center justify-center text-white/60">Selecciona o crea una conversación desde la izquierda.</div>
      ) : (
        <div ref={wrapperRef} className="flex-1 p-3 overflow-auto space-y-3">
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
                  <div className="text-sm prose prose-invert max-w-none">
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => <p className="m-0 mb-2 last:mb-0">{children}</p>,
                        ul: ({ children }) => <ul className="list-disc list-inside mb-2">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal list-inside mb-2">{children}</ol>,
                        li: ({ children }) => <li className="mb-1">{children}</li>,
                        code: ({ children }) => <code className="bg-black/30 px-2 py-1 rounded text-xs">{children}</code>,
                        pre: ({ children }) => <pre className="bg-black/30 p-2 rounded mb-2 overflow-x-auto">{children}</pre>,
                        strong: ({ children }) => <strong className="font-bold">{children}</strong>,
                        em: ({ children }) => <em className="italic">{children}</em>,
                        a: ({ children, href }) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-cyan-300 underline">{children}</a>,
                        blockquote: ({ children }) => <blockquote className="border-l-4 border-cyan-400 pl-4 italic my-2">{children}</blockquote>,
                      }}
                    >
                      {m.text}
                    </ReactMarkdown>
                  </div>
                  {m.archivoAdjuntoURL && (
                    <div className="mt-2">
                      <a
                        href={m.archivoAdjuntoURL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-cyan-300 underline break-all"
                      >
                        Ver archivo adjunto
                      </a>
                    </div>
                  )}
                </div>
              ))}
              
              {processingIA && (
                <div className="max-w-[60%] p-4 rounded-xl my-4 bg-white/5 text-white flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                  <span className="text-sm text-cyan-300">LookFin está escribiendo...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="p-6 border-t border-white/5 bg-[#050816]/40 backdrop-blur-sm">
        {selectedFile && (
          <div className="flex items-center gap-2 bg-white/10 p-2 rounded text-sm">
            <span className="flex-1 text-white/80">📎 {selectedFile.name}</span>
            <button
              onClick={clearFileSelection}
              className="text-xs text-red-400 hover:text-red-300"
            >
              Descartar
            </button>
          </div>
        )}

        {uploadError && (
          <div className="text-xs text-red-300 bg-red-500/20 p-2 rounded">
            {uploadError}
          </div>
        )}

        <div className="max-w-4xl mx-auto flex items-center">
          {/* Botón de enviar archivo */}
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading || processingIA}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || processingIA}
            className="mr-3 px-4 py-3 rounded-2xl bg-[#155DFC] text-white shadow-lg shadow-cyan-500/20 hover:brightness-200 transition disabled:opacity-50"
            title="Adjuntar archivo"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5"
              aria-hidden="true"
            >
              <path d="M21.44 11.05 12.25 20.24a5.5 5.5 0 0 1-7.78-7.78l9.19-9.19a3.5 3.5 0 0 1 4.95 4.95l-9.2 9.19a1.5 1.5 0 0 1-2.12-2.12l8.49-8.49" />
            </svg>
          </button>
          <input
            className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-white outline-none placeholder:text-slate-500 disabled:opacity-50"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                send()
              }
            }}
            placeholder="Escribe tu mensaje..."
            disabled={uploading || processingIA}
          />
          {/* Botón de enviar mensaje */}
          <button
            className="ml-3 px-4 py-3 rounded-2xl bg-[#155DFC] text-white shadow-lg shadow-cyan-500/20 hover:brightness-200 transition disabled:opacity-50"
            onClick={send}
            disabled={uploading || processingIA}
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
