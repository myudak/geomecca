import { Kafka } from 'kafkajs'
import { env } from '../config/env'
import { logger } from '../config/logger'
import { PickModel } from '../models/Pick'
import { ArrivalModel } from '../models/Arrival'

const kafka = new Kafka({ clientId: env.kafka.clientId, brokers: env.kafka.brokers })
export const kafkaProducer = kafka.producer()
const kafkaConsumer = kafka.consumer({ groupId: env.kafka.groupId })

const handleMessage = async (topic: string, payload: Buffer | null) => {
  if (!payload) return
  try {
    const parsed = JSON.parse(payload.toString())
    if (topic === 'picks') {
      const { station_id, timestamp } = parsed
      if (station_id && timestamp) await PickModel.create({ station_id, timestamp })
    }
    if (topic === 'arrivals') {
      const { pick_source_id, station_id, timestamp, phase_type } = parsed
      if (pick_source_id && station_id && timestamp && phase_type) {
        await ArrivalModel.create({ pick_source_id, station_id, timestamp, phase_type })
      }
    }
  } catch (err) {
    logger.warn({ err }, 'failed to parse kafka message')
  }
}

export const startKafka = async () => {
  try {
    await kafkaProducer.connect()
    await kafkaConsumer.connect()
    await kafkaConsumer.subscribe({ topic: 'picks', fromBeginning: false })
    await kafkaConsumer.subscribe({ topic: 'arrivals', fromBeginning: false })

    await kafkaConsumer.run({
      eachMessage: async ({ topic, message }) => {
        await handleMessage(topic, message.value)
      }
    })

    logger.info('kafka connected')
  } catch (err) {
    logger.warn({ err }, 'kafka unavailable, continuing without stream ingestion')
  }
}
