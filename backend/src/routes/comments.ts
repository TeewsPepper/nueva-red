import express, { Response } from 'express'
import { protect } from '../middleware/auth.js'
import Comment from '../models/Comment.js'
import Post from '../models/Post.js'
import Notification from '../models/Notification.js'
import { AuthRequest } from '../types/index.js'
import { getIO } from '../server.js'

const router = express.Router()

// ========================================
// GET /api/comments/post/:postId - Obtener comentarios de un post
// ========================================
router.get('/post/:postId', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const comments = await Comment.find({ 
      postId: req.params.postId,
      isActive: true 
    })
      .populate('author', 'name email role')
      .sort({ createdAt: 1 })

    res.json({ success: true, data: comments })
  } catch (error) {
    console.error('Error al obtener comentarios:', error)
    res.status(500).json({ success: false, message: 'Error al obtener comentarios' })
  }
})

// ========================================
// POST /api/comments - Crear comentario
// ========================================
router.post('/', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user
    if (!user) {
      res.status(401).json({ success: false, message: 'Usuario no autenticado' })
      return
    }

    const { postId, content } = req.body

    if (!content || !content.trim()) {
      res.status(400).json({ success: false, message: 'El contenido es requerido' })
      return
    }

    const post = await Post.findById(postId)
    if (!post) {
      res.status(404).json({ success: false, message: 'Publicación no encontrada' })
      return
    }

    const comment = await Comment.create({
      postId,
      author: user._id,
      content: content.trim()
    })

    post.comments.push(comment._id)
    await post.save()

    await comment.populate('author', 'name email role')

    // Crear notificación si no es el autor del post
    if (post.author.toString() !== user._id.toString()) {
      await Notification.create({
        user: post.author,
        type: 'comment',
        title: 'Nuevo comentario',
        message: `${user.name} comentó en tu publicación`,
        link: `/posts/${post._id}`
      })

      // EMITIR NOTIFICACIÓN EN TIEMPO REAL
      const io = getIO()
      io.emit('nueva_notificacion', {
        userId: post.author.toString(),
        type: 'comment',
        message: `${user.name} comentó en tu publicación`,
        link: `/posts/${post._id}`
      })
    }

    // EMITIR EVENTO DE NUEVO COMENTARIO EN TIEMPO REAL
    const io = getIO()
    console.log(`💬 Emitiendo nuevo_comentario para post ${post._id}`)
    io.emit('nuevo_comentario', {
      postId: post._id,
      comment: comment
    })

    res.status(201).json({ success: true, data: comment })
  } catch (error) {
    console.error('Error al crear comentario:', error)
    res.status(500).json({ success: false, message: 'Error al crear comentario' })
  }
})

// ========================================
// DELETE /api/comments/:id - Eliminar comentario
// ========================================
router.delete('/:id', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user
    if (!user) {
      res.status(401).json({ success: false, message: 'Usuario no autenticado' })
      return
    }

    const comment = await Comment.findById(req.params.id)

    if (!comment) {
      res.status(404).json({ success: false, message: 'Comentario no encontrado' })
      return
    }

    if (comment.author.toString() !== user._id.toString() && user.role !== 'pastor') {
      res.status(403).json({ success: false, message: 'No autorizado' })
      return
    }

    await Post.findByIdAndUpdate(comment.postId, {
      $pull: { comments: comment._id }
    })

    comment.isActive = false
    await comment.save()

    res.json({ success: true, message: 'Comentario eliminado' })
  } catch (error) {
    console.error('Error al eliminar comentario:', error)
    res.status(500).json({ success: false, message: 'Error al eliminar comentario' })
  }
})

// ========================================
// POST /api/comments/:id/like - Dar/Quitar like a un comentario
// ========================================
router.post('/:id/like', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user
    if (!user) {
      res.status(401).json({ success: false, message: 'Usuario no autenticado' })
      return
    }

    const comment = await Comment.findById(req.params.id)

    if (!comment) {
      res.status(404).json({ success: false, message: 'Comentario no encontrado' })
      return
    }

    const hasLiked = comment.likes.some(id => id.toString() === user._id.toString())

    if (hasLiked) {
      comment.likes = comment.likes.filter(id => id.toString() !== user._id.toString())
    } else {
      comment.likes.push(user._id)
    }

    await comment.save()

    // EMITIR EVENTO DE LIKE ACTUALIZADO EN TIEMPO REAL
    const io = getIO()
    console.log(`❤️ Like actualizado para comentario ${comment._id}: ${comment.likes.length} likes`)
    io.emit('comentario_like_updated', {
      commentId: comment._id,
      likes: comment.likes
    })

    res.json({ success: true, data: comment, liked: !hasLiked })
  } catch (error) {
    console.error('Error al dar like a comentario:', error)
    res.status(500).json({ success: false, message: 'Error al dar like' })
  }
})

export default router