import { Schema, model, Document } from 'mongoose'

export interface IStation extends Document {
  name: string
  code: string
  network: string
  location?: string
  channel: string[]
  longitude: number
  latitude: number
  elevation: number
  server_seedlink?: string
  server_fdsn?: string
  status: 'enabled' | 'disabled'
  createdAt: Date
  updatedAt: Date
}

const stationSchema = new Schema<IStation>(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true, index: true },
    network: { type: String, required: true },
    location: { type: String, default: '00' },
    channel: { type: [String], default: [] },
    longitude: { type: Number, required: true },
    latitude: { type: Number, required: true },
    elevation: { type: Number, required: true },
    server_seedlink: { type: String, default: '' },
    server_fdsn: { type: String, default: '' },
    status: { type: String, enum: ['enabled', 'disabled'], default: 'enabled' }
  },
  { timestamps: true }
)

export const StationModel = model<IStation>('Station', stationSchema)
