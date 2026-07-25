import mongoose, { Schema, Document } from 'mongoose'

export interface IMinisterio extends Document {
  nombre: string
  descripcion: string
  liderId: mongoose.Types.ObjectId
  miembros: mongoose.Types.ObjectId[]
  horarios?: Array<{        // 👈 AÑADIR
    dia: string
    horaInicio: string
    horaFin: string
  }>
  ubicacion?: string        // 👈 AÑADIR
  creadoPor: mongoose.Types.ObjectId
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const MinisterioSchema = new Schema<IMinisterio>(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre es requerido'],
      trim: true,
      unique: true,
      maxlength: [100, 'El nombre no puede exceder 100 caracteres'],
    },
    descripcion: {
      type: String,
      required: [true, 'La descripción es requerida'],
      trim: true,
      maxlength: [500, 'La descripción no puede exceder 500 caracteres'],
    },
    liderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'El líder es requerido'],
    },
    miembros: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: [],
    }],
    horarios: [{             // 👈 AÑADIR
      dia: { type: String },
      horaInicio: { type: String },
      horaFin: { type: String }
    }],
    ubicacion: {             // 👈 AÑADIR
      type: String,
      trim: true
    },
    creadoPor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'El creador es requerido'],
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

export default mongoose.model<IMinisterio>('Ministerio', MinisterioSchema)