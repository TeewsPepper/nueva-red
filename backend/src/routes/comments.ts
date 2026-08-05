import express, { Response } from "express";
import { protect } from "../middleware/auth.js";
import Comment from "../models/Comment.js";
import Post from "../models/Post.js";
import Notification from "../models/Notification.js";
import { AuthRequest } from "../types/index.js";
import { getIO } from "../server.js";

const router = express.Router();

// ========================================
// GET /api/comments/post/:postId - Obtener comentarios con anidación
// ========================================
router.get(
  "/post/:postId",
  protect,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const allComments = await Comment.find({
        postId: req.params.postId,
        isActive: true,
      })
        .populate("author", "name email role")
        .sort({ createdAt: 1 })
        .lean();

      interface CommentWithReplies {
        _id: string;
        postId: string;
        author: {
          _id: string;
          name: string;
          email: string;
          role: string;
        };
        content: string;
        parentId: string | null;
        likes: string[];
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        replies: CommentWithReplies[];
      }

      const commentMap: Record<string, CommentWithReplies> = {};
      const roots: CommentWithReplies[] = [];

      allComments.forEach((comment: any) => {
        commentMap[comment._id.toString()] = {
          ...comment,
          replies: [],
        };
      });

      allComments.forEach((comment: any) => {
        const commentId = comment._id.toString();
        const parentId = comment.parentId?.toString();

        if (parentId && commentMap[parentId]) {
          commentMap[parentId].replies.push(commentMap[commentId]);
        } else {
          roots.push(commentMap[commentId]);
        }
      });

      const totalComments = await Comment.countDocuments({
        postId: req.params.postId,
        isActive: true,
      });

      res.json({
        success: true,
        data: roots,
        total: totalComments,
      });
    } catch (error) {
      console.error("Error al obtener comentarios:", error);
      res
        .status(500)
        .json({ success: false, message: "Error al obtener comentarios" });
    }
  },
);

// ========================================
// POST /api/comments - Crear comentario (con soporte para respuestas)
// ========================================
router.post(
  "/",
  protect,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const user = req.user;
      if (!user) {
        res
          .status(401)
          .json({ success: false, message: "Usuario no autenticado" });
        return;
      }

      const { postId, content, parentId } = req.body;

      if (!content || !content.trim()) {
        res
          .status(400)
          .json({ success: false, message: "El contenido es requerido" });
        return;
      }

      const post = await Post.findById(postId);
      if (!post) {
        res
          .status(404)
          .json({ success: false, message: "Publicación no encontrada" });
        return;
      }

      if (parentId) {
        const parentComment = await Comment.findById(parentId);
        if (!parentComment || !parentComment.isActive) {
          res.status(404).json({
            success: false,
            message: "Comentario padre no encontrado",
          });
          return;
        }

        if (parentComment.postId.toString() !== postId) {
          res.status(400).json({
            success: false,
            message: "El comentario padre no pertenece a este post",
          });
          return;
        }
      }

      const comment = await Comment.create({
        postId,
        author: user._id,
        content: content.trim(),
        parentId: parentId || null,
      });

      if (!parentId) {
        post.comments.push(comment._id);
        await post.save();
      }

      await Post.findByIdAndUpdate(postId, {
        $inc: { commentCount: 1 },
      });

      await comment.populate("author", "name email role");

      let targetUserId = post.author;
      let notificationMessage = `${user.name} comentó en tu publicación`;
      let notificationTitle = "Nuevo comentario";

      if (parentId) {
        const parentComment = await Comment.findById(parentId);
        if (parentComment) {
          targetUserId = parentComment.author;
          notificationMessage = `${user.name} respondió a tu comentario`;
          notificationTitle = "Nueva respuesta";
        }
      }

      if (targetUserId.toString() !== user._id.toString()) {
        await Notification.create({
          user: targetUserId,
          type: "comment",
          title: notificationTitle,
          message: notificationMessage,
          link: `/feed#post-${post._id}`,
        });

        console.log("📊 DIAGNÓSTICO DE NOTIFICACIÓN:");
        console.log("  - user._id:", user._id);
        console.log("  - user.name:", user.name);
        console.log("  - post.author:", post.author);
        console.log("  - targetUserId:", targetUserId);
        console.log(
          "  - Es el mismo usuario?",
          targetUserId.toString() === user._id.toString(),
        );

        const io = getIO();
        io.emit("nueva_notificacion", {
          userId: targetUserId.toString(),
          type: "comment",
          message: notificationMessage,
          link: `/feed#post-${post._id}`,
        });
      }

      const updatedPost = await Post.findById(postId);
      const totalComments = await Comment.countDocuments({
        postId: post._id,
        isActive: true,
      });

      const io = getIO();
      console.log(
        `💬 Emitiendo nuevo_comentario para post ${post._id}${parentId ? ` (respuesta a ${parentId})` : ""}`,
      );
      io.emit("nuevo_comentario", {
        postId: post._id,
        comment: comment,
        parentId: parentId || null,
        totalComments: updatedPost?.commentCount || totalComments,
      });

      res.status(201).json({ success: true, data: comment });
    } catch (error) {
      console.error("Error al crear comentario:", error);
      res
        .status(500)
        .json({ success: false, message: "Error al crear comentario" });
    }
  },
);

// ========================================
// DELETE /api/comments/:id - Eliminar comentario
// ========================================
router.delete(
  "/:id",
  protect,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const user = req.user;
      if (!user) {
        res
          .status(401)
          .json({ success: false, message: "Usuario no autenticado" });
        return;
      }

      const comment = await Comment.findById(req.params.id);

      if (!comment) {
        res
          .status(404)
          .json({ success: false, message: "Comentario no encontrado" });
        return;
      }

      if (
        comment.author.toString() !== user._id.toString() &&
        user.role !== "pastor"
      ) {
        res.status(403).json({ success: false, message: "No autorizado" });
        return;
      }

      await Post.findByIdAndUpdate(comment.postId, {
        $pull: { comments: comment._id },
      });

      await Post.findByIdAndUpdate(comment.postId, {
        $inc: { commentCount: -1 },
      });

      comment.isActive = false;
      await comment.save();

      res.json({ success: true, message: "Comentario eliminado" });
    } catch (error) {
      console.error("Error al eliminar comentario:", error);
      res
        .status(500)
        .json({ success: false, message: "Error al eliminar comentario" });
    }
  },
);

// ========================================
// POST /api/comments/:id/like - Dar/Quitar like a un comentario
// ========================================
router.post(
  "/:id/like",
  protect,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const user = req.user;
      if (!user) {
        res
          .status(401)
          .json({ success: false, message: "Usuario no autenticado" });
        return;
      }

      const comment = await Comment.findById(req.params.id).populate('postId');

      if (!comment) {
        res
          .status(404)
          .json({ success: false, message: "Comentario no encontrado" });
        return;
      }

      const hasLiked = comment.likes.some(
        (id) => id.toString() === user._id.toString(),
      );

      if (hasLiked) {
        comment.likes = comment.likes.filter(
          (id) => id.toString() !== user._id.toString(),
        );
      } else {
        comment.likes.push(user._id);
      }

      await comment.save();

      // 👇 NOTIFICACIÓN PARA EL AUTOR DEL COMENTARIO
      if (!hasLiked && comment.author.toString() !== user._id.toString()) {
        const postId = comment.postId ? comment.postId.toString() : null;
        
        if (postId) {
          await Notification.create({
            user: comment.author,
            type: "like_comment",
            title: "Nuevo like en tu comentario",
            message: `${user.name} le dio like a tu comentario`,
            link: `/feed#post-${postId}`,
          });

          const io = getIO();
          io.emit("nueva_notificacion", {
            userId: comment.author.toString(),
            type: "like_comment",
            message: `${user.name} le dio like a tu comentario`,
            link: `/feed#post-${postId}`,
          });
        }
      }

      const io = getIO();
      console.log(
        `❤️ Like actualizado para comentario ${comment._id}: ${comment.likes.length} likes`,
      );
      io.emit("comentario_like_updated", {
        commentId: comment._id,
        likes: comment.likes,
      });

      res.json({ success: true, data: comment, liked: !hasLiked });
    } catch (error) {
      console.error("Error al dar like a comentario:", error);
      res.status(500).json({ success: false, message: "Error al dar like" });
    }
  },
);

export default router;