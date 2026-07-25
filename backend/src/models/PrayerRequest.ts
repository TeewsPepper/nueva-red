import mongoose, { Schema, Document } from 'mongoose'

export interface IPrayerRequest extends Document {
  author: mongoose.Types.ObjectId
  title: string
  description: string
  isAnonymous: boolean
  prayers: mongoose.Types.ObjectId[]
  isAnswered: boolean
  answeredAt?: Date
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const PrayerRequestSchema = new Schema<IPrayerRequest>(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'El autor es requerido']
    },
    title: {
      type: String,
      required: [true, 'El título es requerido'],
      maxlength: [100, 'El título no puede exceder 100 caracteres'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'La descripción es requerida'],
      maxlength: [500, 'La descripción no puede exceder 500 caracteres'],
      trim: true
    },
    isAnonymous: {
      type: Boolean,
      default: false
    },
    prayers: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: []
    }],
    isAnswered: {
      type: Boolean,
      default: false
    },
    answeredAt: {
      type: Date
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
PrayerRequestSchema.index({ author: 1, createdAt: -1 })
PrayerRequestSchema.index({ isActive: 1 })
PrayerRequestSchema.index({ isAnswered: 1 })

export default mongoose.model<IPrayerRequest>('PrayerRequest', PrayerRequestSchema)