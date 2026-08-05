// frontend/src/hooks/useComments.ts
import { useState, useCallback } from "react";
import api from "../services/api";
import { Comment, ApiError } from "../types";

export const useComments = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargarComentarios = useCallback(
    async (postId: string): Promise<void> => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get(`/comments/post/${postId}`);
        if (response.data.success) {
          setComments(response.data.data);
        } else {
          setComments([]);
        }
      } catch (err) {
        const apiError = err as ApiError;
        console.error("Error al cargar comentarios:", err);
        setError(
          apiError.response?.data?.message || "Error al cargar comentarios",
        );
        setComments([]);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const crearComentario = useCallback(
    async (
      postId: string,
      content: string,
      parentId?: string | null,
    ): Promise<Comment | undefined> => {
      try {
        console.log(
          `📝 Creando comentario para post ${postId}${parentId ? ` (respuesta a ${parentId})` : ""}`,
        );
        const response = await api.post("/comments", {
          postId,
          content,
          parentId: parentId || null,
        });
        if (response.data.success) {
          const newComment = response.data.data;
          console.log("✅ Comentario creado:", newComment);

          // ❌ ELIMINAR esta actualización local
          // El socket se encargará de actualizar a TODOS los usuarios
          // setComments((prev) => { ... })

          return newComment;
        }
      } catch (err) {
        const apiError = err as ApiError;
        console.error("Error al crear comentario:", err);
        setError(
          apiError.response?.data?.message || "Error al crear comentario",
        );
        throw err;
      }
    },
    [],
  );

  const toggleLikeComentario = useCallback(
    async (commentId: string): Promise<void> => {
      try {
        console.log(`❤️ Dando/quitar like al comentario ${commentId}`);
        const response = await api.post(`/comments/${commentId}/like`);

        if (response.data.success) {
          const updatedLikes = response.data.data?.likes || [];

          // 👇 FUNCIÓN RECURSIVA PARA BUSCAR EN CUALQUIER NIVEL
          setComments((prev) => {
            const updateRecursive = (comments: any[]): any[] => {
              return comments.map((c) => {
                if (c._id === commentId) {
                  return { ...c, likes: updatedLikes };
                }
                if (c.replies && c.replies.length > 0) {
                  return {
                    ...c,
                    replies: updateRecursive(c.replies),
                  };
                }
                return c;
              });
            };
            return updateRecursive(prev);
          });
        }
      } catch (err) {
        console.error("Error al dar like a comentario:", err);
      }
    },
    [setComments],
  );

  const eliminarComentario = useCallback(
    async (commentId: string): Promise<void> => {
      try {
        await api.delete(`/comments/${commentId}`);

        setComments((prev) => {
          const removeComment = (comments: Comment[]): Comment[] => {
            return comments
              .map((c) => {
                if (c._id === commentId) {
                  return null;
                }
                if (c.replies && c.replies.length > 0) {
                  return {
                    ...c,
                    replies: removeComment(c.replies).filter(
                      (r): r is Comment => r !== null,
                    ),
                  };
                }
                return c;
              })
              .filter((c): c is Comment => c !== null);
          };
          return removeComment(prev);
        });
      } catch (err) {
        const apiError = err as ApiError;
        console.error("Error al eliminar comentario:", err);
        setError(
          apiError.response?.data?.message || "Error al eliminar comentario",
        );
        throw err;
      }
    },
    [],
  );

  return {
    comments,
    setComments,
    loading,
    error,
    cargarComentarios,
    crearComentario,
    toggleLikeComentario,
    eliminarComentario,
  };
};
