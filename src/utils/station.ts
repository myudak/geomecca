import { Station } from '../types/station'

export const getChannelByOrder = (station: Station, channels: string[]) => {
  for (const channel of channels) {
    if (station.channel.includes(channel)) {
      return channel
    }
  }
  return null
}

export const getStationByChannel = (stations: Station[], channels: string[]) => {
  if (!channels.length) return stations
  return stations.filter((station) => {
    return channels.some((channel) => station.channel.includes(channel))
  })
}

export const getChannelFullName = (station: Station, channelName: string) => {
  return `${station.network}.${station.code}.${station.location}.${channelName}`
}

export const sortStationChannelByPriority = (arr: string[]) => {
  const priority = ['Z', 'E', 'N']

  return arr.toSorted((a, b) => {
    // Check if last character is in priority list
    const aPriority = priority.includes(a[a.length - 1]) ? priority.indexOf(a[a.length - 1]) : Infinity
    const bPriority = priority.includes(b[b.length - 1]) ? priority.indexOf(b[b.length - 1]) : Infinity

    // Sort by priority, if equal keep original order
    return aPriority - bPriority
  })
}
