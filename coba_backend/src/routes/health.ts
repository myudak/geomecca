import { Router } from 'express'
import mongoose from 'mongoose'
import { env } from '../config/env'

export const healthRouter = Router()

healthRouter.get('/', (_req, res) => {
  const mongo = mongoose.connection.readyState === 1 ? 'up' : 'down'
  res.json({ status: 'ok', mongo, kafka: 'pending', seedlink: env.seedlink.host })
})
