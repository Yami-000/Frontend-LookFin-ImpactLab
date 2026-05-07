import React, { useRef, useState } from 'react'
import { gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'

const UPLOAD_FILE = gql`
  mutation UploadFile($input: UploadFileInput!) {
    uploadFile(input: $input) {
      success
      message
      fileUrl
    }
  }
`;

const MAX_UPLOAD_FILE_SIZE_BYTES = 8 * 1024 * 1024
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export default function Chat({ conversation, onCreateConversation, onUpdateConversation }) {
  const [input, setInput] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const fileInputRef = useRef(null)
  const [uploadFileMutation] = useMutation(UPLOAD_FILE)

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

  const send = async () => {
    if (!input.trim() && !selectedFile) return

    if (!conversation) {
      await onCreateConversation('Chat ' + new Date().toLocaleString())
      setInput('')
      clearFileSelection()
      return
    }

    let fileUrl = null
    let targetConversationId = conversation.id

    if (selectedFile) {
      if (selectedFile.size > MAX_UPLOAD_FILE_SIZE_BYTES) {
        setUploadError('El archivo supera el límite de 8 MB.')
        return
      }

      if (!UUID_PATTERN.test(conversation.id)) {
        try {
          const createdConversation = await onCreateConversation(conversation.title)
          if (!createdConversation?.id || !UUID_PATTERN.test(createdConversation.id)) {
            throw new Error('No se pudo preparar la conversación para subir archivos')
          }

          targetConversationId = createdConversation.id
        } catch (error) {
          setUploadError(error.message || 'No se pudo preparar la conversación para subir archivos')
          return
        }
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

    const userMsg = {
      id: Date.now().toString() + '-u',
      from: 'user',
      text: input,
      time: Date.now(),
      archivoAdjuntoURL: fileUrl,
    }
    const botMsg = {
      id: Date.now().toString() + '-bot',
      from: 'bot',
      text: `Respuesta automática: Gracias por tu mensaje. (Eco: ${input})`,
      time: Date.now(),
    }
    const newMessages = [...conversation.messages, userMsg, botMsg]
    onUpdateConversation(targetConversationId, newMessages)
    setInput('')
    clearFileSelection()
    setUploading(false)
  }

  return (
    <main className="flex-1 flex flex-col">
      {!conversation ? (
        <div className="flex-1 flex items-center justify-center text-white/60">Selecciona o crea una conversación desde la izquierda.</div>
      ) : (
        <div className="flex-1 p-3 overflow-auto space-y-3">
          {conversation.messages.map((m) => (
            <div key={m.id} className={`max-w-[60%] p-3 rounded ${m.from === 'user' ? 'bg-indigo-700 ml-auto' : 'bg-white/5'}`}>
              {m.text && <div className="text-sm">{m.text}</div>}
              {m.archivoAdjuntoURL && (
                <div className="mt-2">
                  <a
                    href={m.archivoAdjuntoURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-cyan-300 underline break-all"
                  >
                    📎 Ver archivo adjunto
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="p-3 border-t border-white/5 space-y-2">
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

        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="px-3 py-2 bg-white/10 hover:bg-white/20 rounded text-sm disabled:opacity-50"
            title="Adjuntar archivo"
          >
            📎
          </button>
          <input
            className="flex-1 p-2 rounded bg-transparent border border-white/5 text-white"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                send()
              }
            }}
            placeholder="Escribe tu mensaje..."
            disabled={uploading}
          />
          <button
            onClick={send}
            disabled={uploading || (!input.trim() && !selectedFile)}
            className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 rounded disabled:opacity-50"
          >
            {uploading ? 'Subiendo...' : 'Enviar'}
          </button>
        </div>
      </div>
    </main>
  )
}
