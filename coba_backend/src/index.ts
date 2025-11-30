import cors from 'cors'
import http from 'http'
import express from 'express'
import { env } from './config/env'
import { httpLogger, logger } from './config/logger'
import { connectMongo } from './config/mongo'
import { healthRouter } from './routes/health'
import { authRouter } from './routes/auth'
import { usersRouter } from './routes/users'
import { stationsRouter } from './routes/stations'
import { eventsRouter } from './routes/events'
import { originsRouter } from './routes/origins'
import { arrivalsRouter } from './routes/arrivals'
import { picksRouter } from './routes/picks'
import { recordStreamRouter } from './routes/recordstream'
import { arrivalCatalogRouter } from './routes/arrivalCatalog'
import { wadatiRouter } from './routes/wadati'
import { magnitudeRouter } from './routes/magnitude'
import { dashboardRouter } from './routes/dashboard'
import { ensureDefaultAdmin, ensureDefaultAdminStations } from './utils/seedAdmin'
import { startKafka } from './kafka/client'
import { ensureDefaultStations } from './utils/seedStations'
import { startSocketServer } from './ws/socketServer'

const app = express()
app.use(cors())
app.use(express.json({ limit: '2mb' }))
app.use(httpLogger)

app.use('/health', healthRouter)
app.use('/auth', authRouter)
app.use('/user', usersRouter)
app.use('/station', stationsRouter)
app.use('/event', eventsRouter)
app.use('/origin', originsRouter)
app.use('/arrival', arrivalsRouter)
app.use('/pick', picksRouter)
app.use('/recordstream', recordStreamRouter)
app.use('/arrivalkatalog', arrivalCatalogRouter)
app.use('/wadati', wadatiRouter)
app.use('/magnitude', magnitudeRouter)
app.use('/dashboard', dashboardRouter)

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error({ err }, 'unhandled error')
  res.status(500).json({ status: false, message: 'internal server error' })
})

const start = async () => {
  await connectMongo()
  await ensureDefaultAdmin()
  await ensureDefaultStations()
  await ensureDefaultAdminStations()
  startKafka().catch((err) => logger.warn({ err }, 'kafka background error'))

  const server = http.createServer(app)
  startSocketServer(server)
  server.listen(env.port, () => logger.info(`api running on :${env.port}`))
}

start().catch((err) => {
  logger.error({ err }, 'failed to start')
  process.exit(1)
})
