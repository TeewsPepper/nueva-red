import React, { useEffect } from 'react'
import { useFeed } from '../../hooks/useFeed'
import { useSocket } from '../../context/SocketContext'
import { PostForm } from './PostForm'
import { PostCard } from './PostCard'
import { FolderOpen } from 'lucide-react'
import './Feed.css'

interface NuevoPostData {
  postId: string
  author: string
  content: string
}

export const Feed: React.FC = () => {
  const { posts, loading, cargarPosts, setPosts } = useFeed()  // 👈 OBTENER setPosts
  const { socket } = useSocket()

  useEffect(() => {
    cargarPosts()
  }, [])

  // 👇 ESCUCHAR NUEVOS POSTS
  useEffect(() => {
    if (!socket) return

    console.log('📢 Escuchando nuevos posts en tiempo real...')

    const handleNuevoPost = (data: NuevoPostData) => {
      console.log('📢 Nuevo post en tiempo real:', data)
      cargarPosts()
    }

    socket.on('nuevo_post', handleNuevoPost)

    return () => {
      socket.off('nuevo_post', handleNuevoPost)
    }
  }, [socket, cargarPosts])

  // 👇 FUNCIÓN PARA ACTUALIZAR LIKES DE UN POST
  const handleLikeUpdate = (postId: string, likes: string[]) => {
    console.log(`🔄 Actualizando likes del post ${postId}`)
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post._id === postId
          ? { ...post, likes }
          : post
      )
    )
  }

  if (loading && posts.length === 0) {
    return (
      <div className="feed-loading">
        <div className="spinner"></div>
        <p>Cargando publicaciones...</p>
      </div>
    )
  }

  return (
    <div className="feed">
      <PostForm onPostCreated={cargarPosts} />
      
      {posts.length === 0 ? (
        <div className="feed-empty">
          <FolderOpen size={48} className="empty-icon" />
          <p>No hay publicaciones aún</p>
          <p className="feed-empty-sub">Sé el primero en compartir algo con tu iglesia</p>
        </div>
      ) : (
        <div className="feed-posts">
          {posts.map((post) => (
            <PostCard 
              key={post._id} 
              post={post} 
              onLikeUpdate={handleLikeUpdate}
            />
          ))}
        </div>
      )}
    </div>
  )
}