// components/feed/Feed.tsx
import React, { useEffect, useRef } from "react";
import { Location } from "react-router-dom";
import { useFeed } from "../../hooks/useFeed";
import { useSocket } from "../../context/SocketContext";
import { PostForm } from "./PostForm";
import { PostCard } from "./PostCard";
import { FolderOpen } from "lucide-react";
import { NuevoPostData, NuevoComentarioData } from "../../types";
import "./Feed.css";

interface FeedProps {
  location?: Location;
}

export const Feed: React.FC<FeedProps> = ({ location }) => {
  const { posts, loading, cargarPosts, setPosts } = useFeed();
  const { socket } = useSocket();
  const hasScrolled = useRef(false);

  useEffect(() => {
    cargarPosts();
  }, []);

  // 👇 SCROLL AL POST DESDE NOTIFICACIÓN - CON CLASES CSS
  useEffect(() => {
    if (posts.length === 0 || !location) return;
    if (hasScrolled.current) return;

    const hash = location.hash;
    if (hash && hash.startsWith("#post-")) {
      const postId = hash.replace("#post-", "");

      setTimeout(() => {
        const postElement = document.getElementById(`post-${postId}`);
        if (postElement) {
          postElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });

          // ✅ USAR CLASE CSS EN LUGAR DE ESTILOS EN LÍNEA
          postElement.classList.add("post-highlight");

          setTimeout(() => {
            postElement.classList.remove("post-highlight");
          }, 3000);

          hasScrolled.current = true;
        }
      }, 500);
    }
  }, [posts, location]);

  // 👇 ESCUCHAR NUEVOS POSTS
  useEffect(() => {
    if (!socket) return;

    console.log("📢 Escuchando nuevos posts en tiempo real...");

    const handleNuevoPost = (data: NuevoPostData) => {
      console.log("📢 Nuevo post en tiempo real:", data);
      cargarPosts();
    };

    socket.on("nuevo_post", handleNuevoPost);

    return () => {
      socket.off("nuevo_post", handleNuevoPost);
    };
  }, [socket, cargarPosts]);

  // 👇 ESCUCHAR NUEVOS COMENTARIOS
  useEffect(() => {
    if (!socket) return;

    console.log("💬 Escuchando nuevos comentarios en tiempo real...");

    const handleNuevoComentario = (data: NuevoComentarioData) => {
      console.log("💬 [Feed] 🎯 nuevo_comentario RECIBIDO:", data);

      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post._id === data.postId) {
            const newComments = [...(post.comments || []), data.comment];
            return {
              ...post,
              comments: newComments,
              commentCount: data.totalComments,
            };
          }
          return post;
        }),
      );
    };

    socket.on("nuevo_comentario", handleNuevoComentario);

    return () => {
      socket.off("nuevo_comentario", handleNuevoComentario);
    };
  }, [socket, setPosts]);

  // 👇 FUNCIÓN PARA ACTUALIZAR LIKES DE UN POST
  const handleLikeUpdate = (postId: string, likes: string[]) => {
    console.log(`🔄 Actualizando likes del post ${postId}`);
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post._id === postId ? { ...post, likes } : post,
      ),
    );
  };

  if (loading && posts.length === 0) {
    return (
      <div className="feed-loading">
        <div className="spinner"></div>
        <p>Cargando publicaciones...</p>
      </div>
    );
  }

  return (
    <div className="feed">
      <PostForm onPostCreated={cargarPosts} />

      {posts.length === 0 ? (
        <div className="feed-empty">
          <FolderOpen size={48} className="empty-icon" />
          <p>No hay publicaciones aún</p>
          <p className="feed-empty-sub">
            Sé el primero en compartir algo con tu iglesia
          </p>
        </div>
      ) : (
        <div className="feed-posts">
          {posts.map((post) => (
            <PostCard
              key={post._id}
              post={{
                ...post,
                commentCount: post.commentCount || post.comments?.length || 0,
              }}
              onLikeUpdate={handleLikeUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
};