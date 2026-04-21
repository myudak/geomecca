import { EarthQuakeEventDetail } from '@src/types/event'
import { Magnitude } from '@src/types/magnitude'
// import { format } from 'date-fns'

export const formatDate = (date?: string | Date | null) => {
  // const strFormat = 'd/M/yyyy pp'
  if (!date) {
    return '-'
  }

  const normalizedDate = typeof date === 'string' ? newISODate(date) : date

  if (!(normalizedDate instanceof Date) || Number.isNaN(normalizedDate.getTime())) {
    return '-'
  }

  // return format(normalizedDate, strFormat)
  return normalizedDate.toISOString()
}

export const newISODate = (date: string) => {
  if (!date) {
    return new Date(NaN)
  }
  return new Date(date.includes('T') && !date.includes('Z') ? `${date}Z` : date)
}

export const getPreferredOrigin = (event: EarthQuakeEventDetail, originId?: string) => {
  return event.origins.find((origin) => origin._id === (originId ?? event.preferred_origin_id))
}

export const getDefaultMagnitude = (magnitudes: Magnitude[]) =>
  magnitudes.find((magnitude) => magnitude.type.toLowerCase() === 'mw')

export const getOriginTimeFromEvent = (event: EarthQuakeEventDetail) => {
  const preferredOrigin = event.origins.find((origin) => origin._id === event.preferred_origin_id)
  return preferredOrigin?.origin_time
}

export const formatMagnitude = (magnitude: number) => magnitude?.toFixed(1)
export const formatDepth = (depth: number) => depth?.toFixed(1)
export const formatLatLon = (coordinate: number) => coordinate?.toFixed(3)

export const timeAgo = (date: Date) => {
  const now = new Date()
  const secondsAgo = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (secondsAgo < 60) {
    return secondsAgo === 1 ? 'baru saja' : `${secondsAgo} detik lalu`
  }

  const minutesAgo = Math.floor(secondsAgo / 60)
  if (minutesAgo < 60) {
    return `${minutesAgo} menit lalu`
  }

  const hoursAgo = Math.floor(minutesAgo / 60)
  return `${hoursAgo} jam lalu`
}
