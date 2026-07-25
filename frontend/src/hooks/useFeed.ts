import { useState, useCallback } from 'react'
import api from '../services/api'
import { Post, ApiError } from '../types'

export const useFeed = () => {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const cargarPosts = useCallback(async (): Promise<void> => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.get('/posts')
      if (response.data.success) {
        setPosts(response.data.data)
      } else {
        setPosts([])
      }
    } catch (err) {
      const apiError = err as ApiError
      console.error('Error al cargar posts:', err)
      setError(apiError.response?.data?.message || 'Error al cargar publicaciones')
      setPosts([])
    } finally {
      setLoading(false)
    }
  }, [])

  const crearPost = useCallback(async (content: string, image?: string): Promise<Post | undefined> => {
    try {
      const response = await api.post('/posts', { content, image })
      if (response.data.success) {
        const newPost = response.data.data
        setPosts((prev) => [newPost, ...prev])
        return newPost
      }
    } catch (err) {
      const apiError = err as ApiError
      console.error('Error al crear post:', err)
      setError(apiError.response?.data?.message || 'Error al crear publicación')
      throw err
    }
  }, [])

  const toggleLike = useCallback(async (postId: string): Promise<void> => {
    try {
      const response = await api.post(`/posts/${postId}/like`)
      if (response.data.success) {
        // 👇 ACTUALIZAR LOCALMENTE (el socket también lo hará)
        setPosts((prev) =>
          prev.map((post) =>
            post._id === postId
              ? { ...post, likes: response.data.data.likes }
              : post
          )
        )
      }
    } catch (err) {
      console.error('Error al dar like:', err)
    }
  }, [])

  const eliminarPost = useCallback(async (postId: string): Promise<void> => {
    try {
      await api.delete(`/posts/${postId}`)
      setPosts((prev) => prev.filter((post) => post._id !== postId))
    } catch (err) {
      const apiError = err as ApiError
      console.error('Error al eliminar post:', err)
      setError(apiError.response?.data?.message || 'Error al eliminar publicación')
      throw err
    }
  }, [])

  return { 
    posts, 
    setPosts,  // 👈 EXPORTAR setPosts
    loading, 
    error, 
    cargarPosts, 
    crearPost, 
    toggleLike, 
    eliminarPost 
  }
}