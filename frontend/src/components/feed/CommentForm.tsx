import React, { useState } from 'react'
import { Send } from 'lucide-react'
import './CommentForm.css'

interface CommentFormProps {
  onSubmit: (content: string) => Promise<void>
}

export const CommentForm: React.FC<CommentFormProps> = ({ onSubmit }) => {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || loading) return

    setLoading(true)
    try {
      await onSubmit(content.trim())
      setContent('')
    } catch (error) {
      console.error('Error al enviar comentario:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="comment-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Escribe un comentario..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        maxLength={500}
        disabled={loading}
      />
      <button type="submit" disabled={!content.trim() || loading}>
        <Send size={16} />
      </button>
    </form>
  )
}