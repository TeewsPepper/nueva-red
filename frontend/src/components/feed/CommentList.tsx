// frontend/src/components/feed/CommentList.tsx
import React, { useEffect, useRef } from 'react'
import { useComments } from '../../hooks/useComments'
import { useSocket } from '../../context/SocketContext'
import { CommentItem } from './CommentItem'
import { CommentForm } from './CommentForm'
import { Comment, NuevoComentarioData } from '../../types'
import './CommentList.css'

interface CommentListProps {
  postId: string
  onCommentCountChange?: (count: number) => void
}

export const CommentList: React.FC<CommentListProps> = ({ postId, onCommentCountChange }) => {
  const { comments, loading, cargarComentarios, crearComentario, toggleLikeComentario, eliminarComentario, setComments } = useComments()
  const { socket, on, off } = useSocket()
  const commentsRef = useRef<Comment[]>(comments)
  const processingIds = useRef<Set<string>>(new Set()) // 👈 Para evitar duplicados

  useEffect(() => {
    commentsRef.current = comments
  }, [comments])

  useEffect(() => {
    cargarComentarios(postId)
  }, [postId, cargarComentarios])

  useEffect(() => {
    if (!socket) return

    const handleNuevoComentario = (data: NuevoComentarioData) => {
      if (data.postId === postId) {
        const commentId = data.comment._id
        
        // 👇 Si ya estamos procesando este comentario, ignorar
        if (processingIds.current.has(commentId)) {
          console.log('⚠️ Comentario ya en proceso, ignorando:', commentId)
          return
        }
        
        // 👇 Marcar como en proceso
        processingIds.current.add(commentId)
        
        setComments((prev: Comment[]) => {
          // Verificar si el comentario ya existe
          const exists = (commentList: Comment[]): boolean => {
            return commentList.some(c => c._id === commentId)
          }
          
          if (exists(prev)) {
            console.log('⚠️ Comentario ya existe en el estado, ignorando:', commentId)
            processingIds.current.delete(commentId)
            return prev
          }
          
          let newComments: Comment[]
          
          // Si tiene parentId, es una respuesta
          if (data.comment.parentId) {
            const addReply = (commentList: Comment[]): Comment[] => {
              return commentList.map((c) => {
                if (c._id === data.comment.parentId) {
                  return {
                    ...c,
                    replies: [...(c.replies || []), data.comment]
                  }
                }
                if (c.replies && c.replies.length > 0) {
                  return {
                    ...c,
                    replies: addReply(c.replies)
                  }
                }
                return c
              })
            }
            newComments = addReply(prev)
          } else {
            // Comentario raíz
            newComments = [...prev, data.comment]
          }
          
          // Limpiar el marcador de procesamiento después de un tiempo
          setTimeout(() => {
            processingIds.current.delete(commentId)
          }, 1000)
          
          return newComments
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

  const rootComments = comments.filter((c: Comment) => !c.parentId)

  const handleCrearComentario = async (content: string) => {
    const nuevoComentario = await crearComentario(postId, content)
    // 👇 El socket actualizará el estado, no necesitamos hacer nada aquí
    if (nuevoComentario && onCommentCountChange) {
      // El contador se actualizará cuando llegue el evento de socket
    }
  }

  const handleReply = async (parentId: string, content: string) => {
    const nuevaRespuesta = await crearComentario(postId, content, parentId)
    // 👇 El socket actualizará el estado, no necesitamos hacer nada aquí
    if (nuevaRespuesta && onCommentCountChange) {
      // El contador se actualizará cuando llegue el evento de socket
    }
  }

  if (loading) {
    return <div className="comment-loading">Cargando comentarios...</div>
  }

  return (
    <div className="comment-list">
      <CommentForm onSubmit={handleCrearComentario} />
      
      {rootComments.length === 0 ? (
        <p className="comment-empty">No hay comentarios aún. Sé el primero en comentar.</p>
      ) : (
        <div className="comment-items">
          {rootComments.map((comment: Comment) => (
            <CommentItem
              key={comment._id}
              comment={comment}
              onLike={toggleLikeComentario}
              onDelete={eliminarComentario}
              onReply={handleReply}
            />
          ))}
        </div>
      )}
    </div>
  )
}