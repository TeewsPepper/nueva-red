import mongoose, { Schema, Document } from 'mongoose'

export interface IComment extends Document {
  postId: mongoose.Types.ObjectId
  author: mongoose.Types.ObjectId
  content: string
  parentId: mongoose.Types.ObjectId | null
  likes: mongoose.Types.ObjectId[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const CommentSchema = new Schema<IComment>({
  postId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Post', 
    required: true 
  },
  author: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  content: { 
    type: String, 
    required: true 
  },
  parentId: {
    type: Schema.Types.ObjectId,
    ref: 'Comment',
    default: null
  },
  likes: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  isActive: { 
    type: Boolean, 
    default: true 
  }
}, {
  timestamps: true
})

CommentSchema.index({ parentId: 1 })
CommentSchema.index({ postId: 1, parentId: 1 })

export default mongoose.model<IComment>('Comment', CommentSchema)