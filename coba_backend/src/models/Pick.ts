import { Schema, model, Document } from 'mongoose'

export interface IPick extends Document {
  station_id: string
  timestamp: Date
  createdAt: Date
  updatedAt: Date
}

const pickSchema = new Schema<IPick>(
  {
    station_id: { type: String, required: true, index: true },
    timestamp: { type: Date, required: true }
  },
  { timestamps: true }
)

export const PickModel = model<IPick>('Pick', pickSchema)
