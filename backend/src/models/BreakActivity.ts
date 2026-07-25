import mongoose, { Schema, Document } from 'mongoose'

export interface IBreakActivity extends Document {
  titulo: string
  descripcion: string
  fecha: string
  horaInicio: string
  horaFin: string
  ubicacion: string
  maxParticipantes?: number
  participantes: mongoose.Types.ObjectId[]
  creadoPor: mongoose.Types.ObjectId
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const BreakActivitySchema = new Schema<IBreakActivity>(
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
    fecha: {
      type: String,
      required: [true, 'La fecha es requerida'],
    },
    horaInicio: {
      type: String,
      required: [true, 'La hora de inicio es requerida'],
    },
    horaFin: {
      type: String,
      required: [true, 'La hora de fin es requerida'],
    },
    ubicacion: {
      type: String,
      required: [true, 'La ubicación es requerida'],
      trim: true,
    },
    maxParticipantes: {
      type: Number,
      min: [1, 'El máximo de participantes debe ser al menos 1'],
    },
    participantes: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: [],
    }],
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

// Validar que horaFin sea después de horaInicio
BreakActivitySchema.pre('save', function(next) {
  if (this.horaInicio >= this.horaFin) {
    next(new Error('La hora de fin debe ser después de la hora de inicio'))
  }
  next()
})

export default mongoose.model<IBreakActivity>('BreakActivity', BreakActivitySchema)