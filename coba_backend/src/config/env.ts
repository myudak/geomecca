import 'dotenv/config'
import path from 'path'

const numberFromEnv = (value: string | undefined, fallback: number) => {
  if (!value) return fallback
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

export const env = {
  port: numberFromEnv(process.env.PORT, 4000),
  mongoUri: process.env.MONGODB_URI ?? 'mongodb://localhost:27017/tews',
  jwtSecret: process.env.JWT_SECRET ?? 'change-me',
  mseedPath:
    process.env.MSEED_PATH ?
      path.join(process.cwd(), process.env.MSEED_PATH) :
    path.join(process.cwd(), 'Trim_100%_select_merged(2) (1)', 'Trim_100%_select_merged(2)')
    ,
  defaultAdmin: {
    username: process.env.DEFAULT_ADMIN_USERNAME ?? 'user_geomecca',
    password: process.env.DEFAULT_ADMIN_PASSWORD ?? 'superadmin123',
    region: process.env.DEFAULT_ADMIN_REGION ?? 'central'
  },
  kafka: {
    brokers: (process.env.KAFKA_BROKERS ?? 'localhost:9092').split(','),
    clientId: process.env.KAFKA_CLIENT_ID ?? 'tews-backend',
    groupId: process.env.KAFKA_GROUP_ID ?? 'tews-backend-consumer'
  },
  seedlink: {
    host: process.env.SEEDLINK_HOST ?? 'localhost',
    port: numberFromEnv(process.env.SEEDLINK_PORT, 18000)
  }
}
