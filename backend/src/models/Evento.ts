import mongoose, { Schema, Document } from 'mongoose'

export interface IEvento extends Document {
  titulo: string
  descripcion: string
  fecha: string  // 👈 STRING, no Date
  horaInicio: string
  horaFin: string
  ubicacion: string
  ministerioId?: mongoose.Types.ObjectId
  creadoPor: mongoose.Types.ObjectId
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const EventoSchema = new Schema<IEvento>(
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
      type: String,  // 👈 STRING, no Date
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
    ministerioId: {
      type: Schema.Types.ObjectId,
      ref: 'Ministerio',
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

export default mongoose.model<IEvento>('Evento', EventoSchema)