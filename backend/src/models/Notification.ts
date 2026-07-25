import mongoose, { Schema, Document } from 'mongoose'

export type NotificationType = 'like' | 'comment' | 'prayer' | 'event' | 'system'

export interface INotification extends Document {
  user: mongoose.Types.ObjectId
  type: NotificationType
  title: string
  message: string
  link?: string
  isRead: boolean
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const NotificationSchema = new Schema<INotification>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'El usuario es requerido']
    },
    type: {
      type: String,
      enum: ['like', 'comment', 'prayer', 'event', 'system'],
      required: [true, 'El tipo es requerido']
    },
    title: {
      type: String,
      required: [true, 'El título es requerido'],
      maxlength: [100, 'El título no puede exceder 100 caracteres'],
      trim: true
    },
    message: {
      type: String,
      required: [true, 'El mensaje es requerido'],
      maxlength: [200, 'El mensaje no puede exceder 200 caracteres'],
      trim: true
    },
    link: {
      type: String,
      trim: true
    },
    isRead: {
      type: Boolean,
      default: false
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
NotificationSchema.index({ user: 1, createdAt: -1 })
NotificationSchema.index({ user: 1, isRead: 1 })
NotificationSchema.index({ isActive: 1 })

export default mongoose.model<INotification>('Notification', NotificationSchema)