import { env } from '../config/env'
import { StationModel } from '../models/Station'
import { logger } from '../config/logger'

const defaultSeedlink = env.seedlink.host ? `${env.seedlink.host}:${env.seedlink.port}` : ''
const defaultFdsn = ''

const defaultStations = [
  {
    name: 'PTH01',
    code: 'PPL01',
    network: 'PPL',
    channel: ['DPZ', 'DPN', 'DPE', 'BHZ'],
    latitude: -7.186050842,
    longitude: 107.4445627,
    elevation: 1959,
    server_seedlink: defaultSeedlink,
    server_fdsn: defaultFdsn
  },
  {
    name: 'PTH02',
    code: 'PPL02',
    network: 'PPL',
    channel: ['DPZ', 'DPN', 'DPE', 'BHZ'],
    latitude: -7.181019827,
    longitude: 107.4184103,
    elevation: 2022,
    server_seedlink: defaultSeedlink,
    server_fdsn: defaultFdsn
  },
  {
    name: 'PTH03',
    code: 'PPL03',
    network: 'PPL',
    channel: ['DPZ', 'DPN', 'DPE', 'BHZ'],
    latitude: -7.177826467,
    longitude: 107.4343474,
    elevation: 1964,
    server_seedlink: defaultSeedlink,
    server_fdsn: defaultFdsn
  },
  {
    name: 'PTH04',
    code: 'PPL04',
    network: 'PPL',
    channel: ['DPZ', 'DPN', 'DPE', 'BHZ'],
    latitude: -7.171208157,
    longitude: 107.4194353,
    elevation: 1989,
    server_seedlink: defaultSeedlink,
    server_fdsn: defaultFdsn
  },
  {
    name: 'PTH05',
    code: 'PPL05',
    network: 'PPL',
    channel: ['DPZ', 'DPN', 'DPE', 'BHZ'],
    latitude: -7.1799,
    longitude: 107.4396613,
    elevation: 1968,
    server_seedlink: defaultSeedlink,
    server_fdsn: defaultFdsn
  },
  {
    name: 'PTH07',
    code: 'PPL07',
    network: 'PPL',
    channel: ['DPZ', 'DPN', 'DPE', 'BHZ'],
    latitude: -7.179869852,
    longitude: 107.4273722,
    elevation: 1985,
    server_seedlink: defaultSeedlink,
    server_fdsn: defaultFdsn
  },
  {
    name: 'PTH08',
    code: 'PPL08',
    network: 'PPL',
    channel: ['DPZ', 'DPN', 'DPE', 'BHZ'],
    latitude: -7.172022105,
    longitude: 107.4021192,
    elevation: 2234,
    server_seedlink: defaultSeedlink,
    server_fdsn: defaultFdsn
  },
  {
    name: 'PTHC02',
    code: 'TCH02',
    network: 'PPL',
    channel: ['DPZ', 'DPN', 'DPE', 'BHZ'],
    latitude: -7.166270213,
    longitude: 107.432,
    elevation: 1779,
    server_seedlink: defaultSeedlink,
    server_fdsn: defaultFdsn
  },
  {
    name: 'PTHC04',
    code: 'TCH04',
    network: 'PPL',
    channel: ['DPZ', 'DPN', 'DPE', 'BHZ'],
    latitude: -7.193306305,
    longitude: 107.4279413,
    elevation: 1952,
    server_seedlink: defaultSeedlink,
    server_fdsn: defaultFdsn
  },
  {
    name: 'PTHC14',
    code: 'TCH14',
    network: 'PPL',
    channel: ['DPZ', 'DPN', 'DPE', 'BHZ'],
    latitude: -7.184191504,
    longitude: 107.4099567,
    elevation: 2124,
    server_seedlink: defaultSeedlink,
    server_fdsn: defaultFdsn
  },
  {
    name: 'PTHC17',
    code: 'TCH17',
    network: 'PPL',
    channel: ['DPZ', 'DPN', 'DPE', 'BHZ'],
    latitude: -7.1594,
    longitude: 107.4074102,
    elevation: 2144,
    server_seedlink: defaultSeedlink,
    server_fdsn: defaultFdsn
  }
]

export const ensureDefaultStations = async () => {
  for (const station of defaultStations) {
    const existing = await StationModel.findOne({ code: station.code })
    if (existing) {
      // ensure channels merged to include BHZ if missing
      const mergedChannels = Array.from(new Set([...(existing.channel ?? []), ...station.channel]))
      if (mergedChannels.length !== existing.channel.length) {
        existing.channel = mergedChannels
        await existing.save()
        logger.info({ code: station.code }, 'updated station channels')
      }
      continue
    }
    await StationModel.create(station)
    logger.info({ code: station.code }, 'seeded station')
  }
}
