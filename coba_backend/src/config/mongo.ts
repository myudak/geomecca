import mongoose from 'mongoose'
import { env } from './env'
import { logger } from './logger'

export const connectMongo = async () => {
  try {
    await mongoose.connect(env.mongoUri)
    logger.info({ uri: env.mongoUri }, 'connected to mongo')
  } catch (err) {
    logger.error({ err }, 'failed to connect mongo')
    throw err
  }
}
