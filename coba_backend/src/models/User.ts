import { Schema, model, Document } from 'mongoose'

export interface IUser extends Document {
  username: string
  password: string
  role: 'admin' | 'user'
  region: string
  stations: string[]
  disable_stations: string[]
  createdAt: Date
  updatedAt: Date
}

const userSchema = new Schema<IUser>(
  {
    username: { type: String, unique: true, required: true, index: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'user'], default: 'admin' },
    region: { type: String, required: true },
    stations: { type: [String], default: [] },
    disable_stations: { type: [String], default: [] }
  },
  { timestamps: true }
)

export const UserModel = model<IUser>('User', userSchema)
