import { Schema, model, Document } from 'mongoose'

export interface IOrigin extends Document {
  name: string
  origin_time: Date
  arrival_ids: string[]
  longitude: number
  latitude: number
  depth: number
  region?: string
  sub_region?: string
  terrain?: string
  country?: string
  magnitude_ids: string[]
  station_magnitude_ids_per_type: unknown[]
  modified_by?: unknown
  auto_origin_ref_id?: unknown
  magnitudes: unknown[]
  err_epicenter?: number
  gap?: number
  rms?: number
  createdAt: Date
  updatedAt: Date
}

const originSchema = new Schema<IOrigin>(
  {
    name: { type: String, required: true },
    origin_time: { type: Date, required: true },
    arrival_ids: { type: [String], default: [] },
    longitude: { type: Number, required: true },
    latitude: { type: Number, required: true },
    depth: { type: Number, required: true },
    region: { type: String },
    sub_region: { type: String },
    terrain: { type: String },
    country: { type: String },
    magnitude_ids: { type: [String], default: [] },
    station_magnitude_ids_per_type: { type: [Schema.Types.Mixed], default: [] },
    modified_by: { type: Schema.Types.Mixed },
    auto_origin_ref_id: { type: Schema.Types.Mixed },
    magnitudes: { type: [Schema.Types.Mixed], default: [] },
    err_epicenter: { type: Number },
    gap: { type: Number },
    rms: { type: Number }
  },
  { timestamps: true }
)

export const OriginModel = model<IOrigin>('Origin', originSchema)
