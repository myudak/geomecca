import { Schema, model, Document } from 'mongoose'

export interface IEvent extends Document {
  name: string
  origin_ids: string[]
  preferred_origin_id?: string
  createdAt: Date
  updatedAt: Date
}

const eventSchema = new Schema<IEvent>(
  {
    name: { type: String, required: true },
    origin_ids: { type: [String], default: [] },
    preferred_origin_id: { type: String }
  },
  { timestamps: true }
)

export const EventModel = model<IEvent>('Event', eventSchema)
