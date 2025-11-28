import { env } from '../config/env'
import { UserModel } from '../models/User'
import { hashPassword } from './password'
import { logger } from '../config/logger'
import { StationModel } from '../models/Station'

export const ensureDefaultAdmin = async () => {
  const existing = await UserModel.findOne({ username: env.defaultAdmin.username })
  if (existing) {
    logger.info('default admin already exists')
    return existing
  }

  const hashed = await hashPassword(env.defaultAdmin.password)
  const user = await UserModel.create({
    username: env.defaultAdmin.username,
    password: hashed,
    role: 'admin',
    region: env.defaultAdmin.region
  })
  logger.info('created default admin user')
  return user
}

export const ensureDefaultAdminStations = async () => {
  const admin = await UserModel.findOne({ username: env.defaultAdmin.username })
  if (!admin) return
  if (admin.stations && admin.stations.length) return

  const stations = await StationModel.find().select('_id')
  admin.stations = stations.map((s) => s.id)
  admin.disable_stations = []
  await admin.save()
  logger.info('attached all stations to default admin')
}
