import mongoose, { Schema, Document } from 'mongoose'

export interface IPost extends Document {
  author: mongoose.Types.ObjectId
  content: string
  image?: string
  ministryId?: mongoose.Types.ObjectId
  likes: mongoose.Types.ObjectId[]
  comments: mongoose.Types.ObjectId[]
  isPublic: boolean
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const PostSchema = new Schema<IPost>(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'El autor es requerido']
    },
    content: {
      type: String,
      required: [true, 'El contenido es requerido'],
      maxlength: [1000, 'El contenido no puede exceder 1000 caracteres'],
      trim: true
    },
    image: {
      type: String,
      trim: true
    },
    ministryId: {
      type: Schema.Types.ObjectId,
      ref: 'Ministerio'
    },
    likes: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: []
    }],
    comments: [{
      type: Schema.Types.ObjectId,
      ref: 'Comment',
      default: []
    }],
    isPublic: {
      type: Boolean,
      default: true
    },
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
PostSchema.index({ author: 1, createdAt: -1 })
PostSchema.index({ ministryId: 1 })
PostSchema.index({ isActive: 1 })

export default mongoose.model<IPost>('Post', PostSchema)