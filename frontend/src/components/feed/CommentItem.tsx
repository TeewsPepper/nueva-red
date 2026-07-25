import React, { useEffect, useState } from "react";
import { Heart, Trash2, User } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useSocket } from "../../context/SocketContext";
import { Comment, ComentarioLikeUpdateData } from "../../types";
import "./CommentItem.css";

interface CommentItemProps {
  comment: Comment;
  onLike: (id: string) => void;
  onDelete?: (id: string) => void;
}

export const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  onLike,
  onDelete,
}) => {
  const { user } = useAuth();
  const { socket, on, off } = useSocket(); // 👈 USAR on y off
  const [likes, setLikes] = useState<string[]>(comment.likes || []);
  const isLiked = likes.includes(user?._id || "");
  const isAuthor = comment.author._id === user?._id;
  const isPastor = user?.role === "pastor";
  const canDelete = isAuthor || isPastor;

  // 👇 ESCUCHAR ACTUALIZACIONES DE LIKES EN TIEMPO REAL
  useEffect(() => {
    if (!socket) {
      console.log("⚠️ Socket no disponible en CommentItem");
      return;
    }

    console.log(
      `❤️ CommentItem ${comment._id} escuchando comentario_like_updated`,
    );

    const handleLikeUpdate = (data: ComentarioLikeUpdateData) => {
      console.log(
        `❤️ Like update recibido para comentario ${data.commentId}`,
        data,
      );

      if (data.commentId === comment._id) {
        console.log(`✅ Actualizando likes para comentario ${comment._id}`);
        setLikes(data.likes);
      }
    };

    // 👇 USAR on y off del contexto
    on("comentario_like_updated", handleLikeUpdate);

    return () => {
      off("comentario_like_updated", handleLikeUpdate);
    };
  }, [socket, comment._id, on, off]);

  const handleLike = () => {
    console.log(`❤️ Click like en comentario ${comment._id}`);
    onLike(comment._id);
  };

  const handleDelete = () => {
    if (confirm("¿Estás seguro de eliminar este comentario?")) {
      onDelete?.(comment._id);
    }
  };

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
      </div>
    </div>
  );
};
