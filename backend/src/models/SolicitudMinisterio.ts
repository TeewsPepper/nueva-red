import mongoose, { Schema, Document } from 'mongoose'

export interface ISolicitudMinisterio extends Document {
  nombre: string
  descripcion: string
  liderPropuesto: mongoose.Types.ObjectId
  creadorId: mongoose.Types.ObjectId
  estado: 'pendiente' | 'aprobada' | 'rechazada'
  rechazoMotivo?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const SolicitudMinisterioSchema = new Schema<ISolicitudMinisterio>(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre es requerido'],
      trim: true,
      maxlength: [100, 'El nombre no puede exceder 100 caracteres'],
    },
    descripcion: {
      type: String,
      required: [true, 'La descripción es requerida'],
      trim: true,
      maxlength: [500, 'La descripción no puede exceder 500 caracteres'],
    },
    liderPropuesto: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'El líder propuesto es requerido'],
    },
    creadorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'El creador es requerido'],
    },
    estado: {
      type: String,
      enum: ['pendiente', 'aprobada', 'rechazada'],
      default: 'pendiente',
    },
    rechazoMotivo: {
      type: String,
      trim: true,
      maxlength: [200, 'El motivo de rechazo no puede exceder 200 caracteres'],
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

export default mongoose.model<ISolicitudMinisterio>('SolicitudMinisterio', SolicitudMinisterioSchema)