import { useState, useCallback } from 'react'
import api from '../services/api'
import { Comment, ApiError } from '../types'

export const useComments = () => {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const cargarComentarios = useCallback(async (postId: string): Promise<void> => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.get(`/comments/post/${postId}`)
      if (response.data.success) {
        setComments(response.data.data)
      } else {
        setComments([])
      }
    } catch (err) {
      const apiError = err as ApiError
      console.error('Error al cargar comentarios:', err)
      setError(apiError.response?.data?.message || 'Error al cargar comentarios')
      setComments([])
    } finally {
      setLoading(false)
    }
  }, [])

  const crearComentario = useCallback(async (postId: string, content: string): Promise<Comment | undefined> => {
    try {
      console.log(`📝 Creando comentario para post ${postId}`)
      const response = await api.post('/comments', { postId, content })
      if (response.data.success) {
        const newComment = response.data.data
        console.log('✅ Comentario creado:', newComment)
        return newComment
      }
    } catch (err) {
      const apiError = err as ApiError
      console.error('Error al crear comentario:', err)
      setError(apiError.response?.data?.message || 'Error al crear comentario')
      throw err
    }
  }, [])

  // 👇 toggleLikeComentario - ACTUALIZAR LOCALMENTE
  const toggleLikeComentario = useCallback(async (commentId: string): Promise<void> => {
    try {
      console.log(`❤️ Dando/quitar like al comentario ${commentId}`)
      const response = await api.post(`/comments/${commentId}/like`)
      
      if (response.data.success) {
        console.log('📡 Respuesta del like:', response.data)
        
        // 👇 ACTUALIZAR LOCALMENTE (el socket también actualizará)
        setComments((prev) =>
          prev.map((comment) =>
            comment._id === commentId
              ? { ...comment, likes: response.data.data.likes }
              : comment
          )
        )
      }
    } catch (err) {
      console.error('Error al dar like a comentario:', err)
    }
  }, [])

  const eliminarComentario = useCallback(async (commentId: string): Promise<void> => {
    try {
      await api.delete(`/comments/${commentId}`)
      setComments((prev) => prev.filter((comment) => comment._id !== commentId))
    } catch (err) {
      const apiError = err as ApiError
      console.error('Error al eliminar comentario:', err)
      setError(apiError.response?.data?.message || 'Error al eliminar comentario')
      throw err
    }
  }, [])

  return {
    comments,
    setComments,
    loading,
    error,
    cargarComentarios,
    crearComentario,
    toggleLikeComentario,
    eliminarComentario
  }
}