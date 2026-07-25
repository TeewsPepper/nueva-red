import React, { useState } from 'react'
import { Send, Image, X } from 'lucide-react'
import { useFeed } from '../../hooks/useFeed'
import './PostForm.css'

interface PostFormProps {
  onPostCreated?: () => void
}

export const PostForm: React.FC<PostFormProps> = ({ onPostCreated }) => {
  const [content, setContent] = useState('')
  const [image, setImage] = useState('')
  const [loading, setLoading] = useState(false)
  const { crearPost } = useFeed()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    if (!content.trim() || loading) return

    setLoading(true)
    try {
      await crearPost(content.trim(), image)
      setContent('')
      setImage('')
      if (onPostCreated) onPostCreated()
    } catch (error) {
      console.error('Error al crear post:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = (): void => {
    const url = prompt('Pega la URL de la imagen (opcional):')
    if (url) setImage(url)
  }

  return (
    <form className="post-form" onSubmit={handleSubmit}>
      <div className="post-form-input">
        <textarea
          placeholder="¿Qué está pasando en la iglesia?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={1000}
          rows={3}
          disabled={loading}
        />
        <div className="post-form-counter">{content.length}/1000</div>
      </div>

      {image && (
        <div className="post-form-image-preview">
          <img src={image} alt="Preview" />
          <button type="button" className="btn-remove-image" onClick={() => setImage('')}>
            <X size={16} />
          </button>
        </div>
      )}
      
      <div className="post-form-actions">
        <button type="button" className="btn-image" onClick={handleImageUpload} disabled={loading}>
          <Image size={20} />
          Imagen
        </button>
        <button type="submit" className="btn-post" disabled={!content.trim() || loading}>
          <Send size={18} />
          {loading ? 'Publicando...' : 'Publicar'}
        </button>
      </div>
    </form>
  )
}