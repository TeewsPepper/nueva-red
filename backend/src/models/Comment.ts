import mongoose, { Schema, Document } from 'mongoose'

export interface IComment extends Document {
  postId: mongoose.Types.ObjectId
  author: mongoose.Types.ObjectId
  content: string
  likes: mongoose.Types.ObjectId[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const CommentSchema = new Schema<IComment>(
  {
    postId: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
      required: [true, 'El post es requerido']
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'El autor es requerido']
    },
    content: {
      type: String,
      required: [true, 'El contenido es requerido'],
      maxlength: [500, 'El comentario no puede exceder 500 caracteres'],
      trim: true
    },
    likes: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: []
    }],
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
)

// Índices para mejorar performance
CommentSchema.index({ postId: 1, createdAt: -1 })
CommentSchema.index({ author: 1 })

export default mongoose.model<IComment>('Comment', CommentSchema)