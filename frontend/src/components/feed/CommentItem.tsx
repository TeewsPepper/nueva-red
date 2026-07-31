import React, { useEffect, useState } from "react"
import { Heart, Trash2, User, MessageCircle } from "lucide-react"
import { useAuth } from "../../hooks/useAuth"
import { useSocket } from "../../context/SocketContext"
import { Comment, ComentarioLikeUpdateData } from "../../types"
import "./CommentItem.css"

interface CommentItemProps {
  comment: Comment
  onLike: (id: string) => void
  onDelete?: (id: string) => void
  onReply?: (parentId: string, content: string) => Promise<void>
}

export const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  onLike,
  onDelete,
  onReply,
}) => {
  const { user } = useAuth()
  const { socket, on, off } = useSocket()
  const [likes, setLikes] = useState<string[]>(comment.likes || [])
  const [showReplies, setShowReplies] = useState(false)
  const [replyContent, setReplyContent] = useState("")
  const [isReplying, setIsReplying] = useState(false)
  
  const isLiked = likes.includes(user?._id || "")
  const isAuthor = comment.author._id === user?._id
  const isPastor = user?.role === "pastor"
  const canDelete = isAuthor || isPastor
  const hasReplies = comment.replies && comment.replies.length > 0

  useEffect(() => {
    if (!socket) return

    const handleLikeUpdate = (data: ComentarioLikeUpdateData) => {
      if (data.commentId === comment._id) {
        setLikes(data.likes)
      }
    }

    on("comentario_like_updated", handleLikeUpdate)

    return () => {
      off("comentario_like_updated", handleLikeUpdate)
    }
  }, [socket, comment._id, on, off])

  const handleLike = () => {
    onLike(comment._id)
  }

  const handleDelete = () => {
    if (confirm("¿Estás seguro de eliminar este comentario?")) {
      onDelete?.(comment._id)
    }
  }

  const handleReplySubmit = async () => {
    if (!replyContent.trim() || !onReply) return
    try {
      await onReply(comment._id, replyContent)
      setReplyContent("")
      setIsReplying(false)
    } catch (error) {
      console.error("Error al responder:", error)
    }
  }

  return (
    <div className="comment-item">
      <div className="comment-avatar">
        <User size={16} />
      </div>
      <div className="comment-content">
        <div className="comment-header">
          <span className="comment-author">{comment.author.name}</span>
          <span className="comment-date">
            {new Date(comment.createdAt).toLocaleDateString("es-ES", {
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
        <p className="comment-text">{comment.content}</p>
        <div className="comment-actions">
          <button
            className={`comment-like ${isLiked ? "liked" : ""}`}
            onClick={handleLike}
          >
            <Heart size={14} fill={isLiked ? "#ef4444" : "none"} />
            <span>{likes.length}</span>
          </button>
          
          {onReply && (
            <button
              className="comment-reply-btn"
              onClick={() => setIsReplying(!isReplying)}
            >
              <MessageCircle size={14} />
              Responder
            </button>
          )}
          
          {canDelete && (
            <button
              className="comment-delete"
              onClick={handleDelete}
              title="Eliminar"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>

        {isReplying && onReply && (
          <div className="reply-form">
            <input
              type="text"
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Escribe tu respuesta..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleReplySubmit()
                if (e.key === 'Escape') setIsReplying(false)
              }}
            />
            <button onClick={handleReplySubmit} disabled={!replyContent.trim()}>
              Responder
            </button>
            <button onClick={() => setIsReplying(false)}>Cancelar</button>
          </div>
        )}

        {hasReplies && (
          <button
            className="show-replies-btn"
            onClick={() => setShowReplies(!showReplies)}
          >
            {showReplies ? 'Ocultar' : 'Ver'} {comment.replies!.length} respuestas
          </button>
        )}

        {hasReplies && showReplies && (
          <div className="comment-replies">
            {comment.replies!.map((reply) => (
              <CommentItem
                key={reply._id}
                comment={reply}
                onLike={onLike}
                onDelete={onDelete}
                onReply={onReply}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}