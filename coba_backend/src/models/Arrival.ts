import { Schema, model, Document } from 'mongoose'

export interface IArrival extends Document {
  pick_source_id: string
  station_id: string
  timestamp: Date
  phase_type: 'P' | 'S'
  createdAt: Date
  updatedAt: Date
}

const arrivalSchema = new Schema<IArrival>(
  {
    pick_source_id: { type: String, required: true, index: true },
    station_id: { type: String, required: true, index: true },
    timestamp: { type: Date, required: true },
    phase_type: { type: String, enum: ['P', 'S'], required: true }
  },
  { timestamps: true }
)

export const ArrivalModel = model<IArrival>('Arrival', arrivalSchema)
