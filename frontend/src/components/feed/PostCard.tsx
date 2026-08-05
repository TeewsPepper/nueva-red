// components/feed/PostCard.tsx
import React, { useState, useEffect } from 'react'
import { Heart, MessageCircle, Trash2, User, ChevronDown, ChevronUp } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useFeed } from '../../hooks/useFeed'
import { useSocket } from '../../context/SocketContext'
import { CommentList } from './CommentList'
import './PostCard.css'

interface PostCardProps {
  post: {
    _id: string
    author: { 
      _id: string
      name: string
      email: string
      role: string
    }
    content: string
    image?: string
    likes: string[]
    comments: any[]
    commentCount?: number
    createdAt: string
  }
  onLikeUpdate?: (postId: string, likes: string[]) => void
}

interface LikeUpdateData {
  postId: string
  likes: string[]
}

export const PostCard: React.FC<PostCardProps> = ({ post, onLikeUpdate }) => {
  const { user } = useAuth()
  const { toggleLike, eliminarPost } = useFeed()
  const { socket } = useSocket()
  
  const [showComments, setShowComments] = useState(false)
  
  // 👈 USAR commentCount del post
  const commentCount = post.commentCount || post.comments?.length || 0

  // 👈 ACTUALIZAR cuando cambie el post
  useEffect(() => {
    console.log(`🔄 [PostCard] ${post._id} - Contador: ${commentCount}`)
  }, [commentCount, post._id])
  
  const isLiked = post.likes.includes(user?._id || '')
  const isAuthor = post.author._id === user?._id
  const isPastor = user?.role === 'pastor'
  const canDelete = isAuthor || isPastor

  // ESCUCHAR ACTUALIZACIONES DE LIKES
  useEffect(() => {
    if (!socket) return

    console.log(`❤️ PostCard ${post._id} escuchando like_updated`)

    const handleLikeUpdate = (data: LikeUpdateData) => {
      console.log(`❤️ Like update recibido para post ${data.postId}`, data)
      
      if (data.postId === post._id) {
        console.log(`✅ Actualizando likes para post ${post._id}`)
        if (onLikeUpdate) {
          onLikeUpdate(post._id, data.likes)
        }
      }
    }

    socket.on('like_updated', handleLikeUpdate)

    return () => {
      socket.off('like_updated', handleLikeUpdate)
    }
  }, [socket, post._id, onLikeUpdate])

  const handleLike = () => {
    console.log(`❤️ Click like en post ${post._id}`)
    toggleLike(post._id)
  }

  const handleDelete = async () => {
    if (confirm('¿Estás seguro de eliminar esta publicación?')) {
      await eliminarPost(post._id)
    }
  }

  const toggleComments = () => {
    setShowComments(!showComments)
  }

  return (
    <div id={`post-${post._id}`} className="post-card">
      <div className="post-header">
        <div className="post-author">
          <div className="post-avatar">
            <User size={24} />
          </div>
          <div className="post-author-info">
            <h4>{post.author.name}</h4>
            <span className="post-role">{post.author.role}</span>
            <span className="post-date">
              {new Date(post.createdAt).toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
        </div>
        {canDelete && (
          <button className="btn-delete" onClick={handleDelete} title="Eliminar">
            <Trash2 size={16} />
          </button>
        )}
      </div>

      <p className="post-content">{post.content}</p>

      {post.image && (
        <div className="post-image">
          <img src={post.image} alt="Publicación" />
        </div>
      )}

      <div className="post-actions">
        <button className={`btn-like ${isLiked ? 'liked' : ''}`} onClick={handleLike}>
          <Heart size={18} fill={isLiked ? '#ef4444' : 'none'} />
          <span>{post.likes.length}</span>
        </button>
        <button className="btn-comment" onClick={toggleComments}>
          <MessageCircle size={18} />
          <span>{commentCount}</span>
        </button>
      </div>

      {showComments && (
        <div className="post-comments">
          <CommentList 
            postId={post._id}
          />
          <button className="btn-toggle-comments" onClick={toggleComments}>
            <ChevronUp size={16} />
            Ocultar comentarios
          </button>
        </div>
      )}

      {!showComments && commentCount > 0 && (
        <button className="btn-show-comments" onClick={toggleComments}>
          <ChevronDown size={16} />
          Ver {commentCount} comentarios
        </button>
      )}
    </div>
  )
}