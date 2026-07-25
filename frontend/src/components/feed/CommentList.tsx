import React, { useEffect, useRef } from 'react'
import { useComments } from '../../hooks/useComments'
import { useSocket } from '../../context/SocketContext'
import { CommentItem } from './CommentItem'
import { CommentForm } from './CommentForm'
import { NuevoComentarioData } from '../../types'
import './CommentList.css'

interface CommentListProps {
  postId: string
  onCommentCountChange?: (count: number) => void
}

export const CommentList: React.FC<CommentListProps> = ({ postId, onCommentCountChange }) => {
  const { comments, loading, cargarComentarios, crearComentario, toggleLikeComentario, eliminarComentario, setComments } = useComments()
  const { socket, on, off } = useSocket()
  const commentsRef = useRef(comments)

  useEffect(() => {
    commentsRef.current = comments
  }, [comments])

  useEffect(() => {
    cargarComentarios(postId)
  }, [postId])

  // 👇 ESCUCHAR NUEVOS COMENTARIOS
  useEffect(() => {
    if (!socket) return

    console.log(`💬 CommentList ${postId} escuchando nuevo_comentario`)

    const handleNuevoComentario = (data: NuevoComentarioData) => {
      if (data.postId === postId) {
        console.log(`✅ Agregando comentario al post ${postId}`)
        setComments((prev) => {
          const exists = prev.some(c => c._id === data.comment._id)
          if (exists) {
            console.log('⚠️ Comentario ya existe, no se duplica')
            return prev
          }
          return [...prev, data.comment]
        })
        
        if (onCommentCountChange) {
          onCommentCountChange(commentsRef.current.length + 1)
        }
      }
    }

    on('nuevo_comentario', handleNuevoComentario)

    return () => {
      off('nuevo_comentario', handleNuevoComentario)
    }
  }, [socket, postId, onCommentCountChange, setComments, on, off])

  const handleCrearComentario = async (content: string) => {
    const nuevoComentario = await crearComentario(postId, content)
    if (nuevoComentario && onCommentCountChange) {
      onCommentCountChange(commentsRef.current.length + 1)
    }
  }

  if (loading) {
    return <div className="comment-loading">Cargando comentarios...</div>
  }

  return (
    <div className="comment-list">
      <CommentForm onSubmit={handleCrearComentario} />
      
      {comments.length === 0 ? (
        <p className="comment-empty">No hay comentarios aún. Sé el primero en comentar.</p>
      ) : (
        <div className="comment-items">
          {comments.map((comment) => (
            <CommentItem
              key={comment._id}
              comment={comment}
              onLike={toggleLikeComentario}
              onDelete={eliminarComentario}
            />
          ))}
        </div>
      )}
    </div>
  )
}