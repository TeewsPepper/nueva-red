import express, { Response } from "express";
import { protect } from "../middleware/auth.js";
import Post from "../models/Post.js";
import Notification from "../models/Notification.js";
import { IUser } from "../models/User.js";
import { AuthRequest, CloudinaryUploadResult } from "../types/index.js"; // ✅ IMPORTAR
import { getIO } from "../server.js";
import { Readable } from "stream";
import cloudinary from "../config/cloudinary.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// ========================================
// GET /api/posts - Obtener todas las publicaciones
// ========================================
router.get(
  "/",
  protect,
  async (_req: AuthRequest, res: Response): Promise<void> => {
    try {
      const posts = await Post.find({ isActive: true })
        .populate("author", "name email role")
        .populate({
          path: "comments",
          populate: { path: "author", select: "name email role" },
        })
        .sort({ createdAt: -1 })
        .limit(50);

      const postsWithCount = posts.map((post) => {
        const postObj = post.toObject();
        return {
          ...postObj,
          commentCount: postObj.commentCount || 0,
        };
      });

      res.json({ success: true, data: postsWithCount });
    } catch (error) {
      console.error("Error al obtener posts:", error);
      res
        .status(500)
        .json({ success: false, message: "Error al obtener publicaciones" });
    }
  },
);

// ========================================
// POST /api/posts - Crear publicación CON IMAGEN
// ========================================
// POST /api/posts - Crear publicación CON IMAGEN
router.post(
  "/",
  protect,
  upload.single("image"),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const user = req.user as IUser;
      const { content, ministryId, isPublic } = req.body;

      if (!content || !content.trim()) {
        res
          .status(400)
          .json({ success: false, message: "El contenido es requerido" });
        return;
      }

      let imageUrl: string | undefined = undefined;

      if (req.file) {
        try {
          // ✅ USAR EL TIPO QUE CLOUDINARY ESPERA
          const result = await new Promise<CloudinaryUploadResult>(
            (resolve, reject) => {
              const uploadStream = cloudinary.uploader.upload_stream(
                {
                  folder: "church_posts",
                  resource_type: "image",
                  transformation: [
                    { width: 1200, crop: "limit" }, // Redimensionar
                    { quality: "auto:best" }, // ✅ Mejor compresión
                    { fetch_format: "auto" }, // ✅ Formato óptimo (WebP si es compatible)
                    { effect: "sharpen:100" }, // ✅ Mantener nitidez
                  ],
                },
                (error, result) => {
                  // ✅ SIN TIPOS EXPLÍCITOS - Cloudinary lo infiere
                  if (error) {
                    reject(error);
                  } else {
                    resolve(result as CloudinaryUploadResult);
                  }
                },
              );

            
              const stream = Readable.from(req.file!.buffer);
              stream.pipe(uploadStream);
            },
          );

          imageUrl = result.secure_url;
        } catch (error) {
          console.error("Error subiendo a Cloudinary:", error);
          res.status(500).json({
            success: false,
            message: "Error al subir la imagen",
          });
          return;
        }
      }

      // Crear post
      const post = await Post.create({
        author: user._id,
        content: content.trim(),
        isPublic: isPublic ?? true,
        ...(imageUrl && { image: imageUrl }),
        ...(ministryId && { ministryId }),
      });

      await post.populate("author", "name email role");

      const io = getIO();
      io.emit("nuevo_post", {
        postId: post._id,
        author: user.name,
        content: post.content.substring(0, 100),
      });

      res.status(201).json({ success: true, data: post });
    } catch (error) {
      console.error("Error al crear post:", error);
      res
        .status(500)
        .json({ success: false, message: "Error al crear publicación" });
    }
  },
);

// ========================================
// GET /api/posts/:id - Obtener una publicación
// ========================================
router.get(
  "/:id",
  protect,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const post = await Post.findById(req.params.id)
        .populate("author", "name email role")
        .populate({
          path: "comments",
          populate: { path: "author", select: "name email role" },
        });

      if (!post) {
        res
          .status(404)
          .json({ success: false, message: "Publicación no encontrada" });
        return;
      }

      res.json({ success: true, data: post });
    } catch (error) {
      console.error("Error al obtener post:", error);
      res
        .status(500)
        .json({ success: false, message: "Error al obtener publicación" });
    }
  },
);

// ========================================
// PUT /api/posts/:id - Editar publicación
// ========================================
router.put(
  "/:id",
  protect,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const user = req.user as IUser;
      const { content, image, isPublic } = req.body;

      const post = await Post.findById(req.params.id);
      if (!post) {
        res
          .status(404)
          .json({ success: false, message: "Publicación no encontrada" });
        return;
      }

      if (
        post.author.toString() !== user._id.toString() &&
        user.role !== "pastor"
      ) {
        res.status(403).json({ success: false, message: "No autorizado" });
        return;
      }

      if (content) post.content = content.trim();
      if (image !== undefined) post.image = image;
      if (isPublic !== undefined) post.isPublic = isPublic;

      await post.save();
      await post.populate("author", "name email role");

      res.json({ success: true, data: post });
    } catch (error) {
      console.error("Error al actualizar post:", error);
      res
        .status(500)
        .json({ success: false, message: "Error al actualizar publicación" });
    }
  },
);

// ========================================
// DELETE /api/posts/:id - Eliminar publicación
// ========================================
router.delete(
  "/:id",
  protect,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const user = req.user as IUser;
      const post = await Post.findById(req.params.id);

      if (!post) {
        res
          .status(404)
          .json({ success: false, message: "Publicación no encontrada" });
        return;
      }

      if (
        post.author.toString() !== user._id.toString() &&
        user.role !== "pastor"
      ) {
        res.status(403).json({ success: false, message: "No autorizado" });
        return;
      }

      post.isActive = false;
      await post.save();

      res.json({ success: true, message: "Publicación eliminada" });
    } catch (error) {
      console.error("Error al eliminar post:", error);
      res
        .status(500)
        .json({ success: false, message: "Error al eliminar publicación" });
    }
  },
);

// ========================================
// POST /api/posts/:id/like - Dar/Quitar like
// ========================================
router.post(
  "/:id/like",
  protect,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const user = req.user as IUser;
      const post = await Post.findById(req.params.id);

      if (!post) {
        res
          .status(404)
          .json({ success: false, message: "Publicación no encontrada" });
        return;
      }

      const hasLiked = post.likes.some(
        (id) => id.toString() === user._id.toString(),
      );

      const io = getIO();

      if (hasLiked) {
        post.likes = post.likes.filter(
          (id) => id.toString() !== user._id.toString(),
        );
      } else {
        post.likes.push(user._id);

        if (post.author.toString() !== user._id.toString()) {
          await Notification.create({
            user: post.author,
            type: "like",
            title: "Nuevo like",
            message: `${user.name} le dio like a tu publicación`,
            link: `/feed#post-${post._id}`,
          });

          io.emit("nueva_notificacion", {
            userId: post.author.toString(),
            type: "like",
            message: `${user.name} le dio like a tu publicación`,
            link: `/feed#post-${post._id}`,
          });
        }
      }

      await post.save();

      const postActualizado = await Post.findById(post._id)
        .populate("author", "name email role")
        .populate({
          path: "comments",
          populate: { path: "author", select: "name email role" },
        });

      io.emit("like_updated", {
        postId: post._id,
        likes: postActualizado?.likes || [],
      });

      res.json({ success: true, data: postActualizado, liked: !hasLiked });
    } catch (error) {
      console.error("Error al dar like:", error);
      res.status(500).json({ success: false, message: "Error al dar like" });
    }
  },
);

export default router;
