import mongoose, { Schema, Document } from 'mongoose'

export interface ITarea extends Document {
  titulo: string
  descripcion: string
  prioridad: 'baja' | 'media' | 'alta'
  estado: 'pendiente' | 'en_progreso' | 'completada'
  fechaEntrega: string
  asignadoA: mongoose.Types.ObjectId
  creadoPor: mongoose.Types.ObjectId
  completada: boolean
  completadaEn?: Date
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const TareaSchema = new Schema<ITarea>(
  {
    titulo: {
      type: String,
      required: [true, 'El título es requerido'],
      trim: true,
      maxlength: [100, 'El título no puede exceder 100 caracteres'],
    },
    descripcion: {
      type: String,
      required: [true, 'La descripción es requerida'],
      trim: true,
      maxlength: [500, 'La descripción no puede exceder 500 caracteres'],
    },
    prioridad: {
      type: String,
      enum: ['baja', 'media', 'alta'],
      default: 'media',
    },
    estado: {
      type: String,
      enum: ['pendiente', 'en_progreso', 'completada'],
      default: 'pendiente',
    },
    fechaEntrega: {
      type: String,
      required: [true, 'La fecha de entrega es requerida'],
    },
    asignadoA: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'El asignado es requerido'],
    },
    creadoPor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'El creador es requerido'],
    },
    completada: {
      type: Boolean,
      default: false,
    },
    completadaEn: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
)

export default mongoose.model<ITarea>('Tarea', TareaSchema)