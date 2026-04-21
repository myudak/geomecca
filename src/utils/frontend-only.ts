import { isFrontendOnly } from '@src/constants/env'
import {
  registerFrontendOnlySocketHandler,
  requestFrontendOnlyWaveform,
  startFrontendOnlyRealtimeDemo,
  unregisterFrontendOnlySocketHandler
} from '@src/mocks/frontend-only/realtime'
import { RealtimeArrival, RealtimePick, StationWaveForm } from '@src/types/waveform'
import { toast } from 'vue3-toastify'

type SocketEventHandler = (...args: any[]) => void

type SocketStub = {
  emit: (..._args: any[]) => SocketStub
  on: (_event: string, handler: SocketEventHandler) => SocketStub
  off: (_event?: string, _handler?: SocketEventHandler) => SocketStub
  disconnect: () => void
}

const FRONTEND_ONLY_TOAST_ID = 'frontend-only-toast'

export const showFrontendOnlyToast = (message = 'Frontend-only mode: action not persisted') => {
  toast.info(message, {
    autoClose: 2500,
    position: 'top-center',
    toastId: FRONTEND_ONLY_TOAST_ID
  })
}

export const createSocketStub = (): SocketStub => {
  const api: SocketStub = {
    emit(eventName, ...args) {
      if (eventName === 'waveform' && typeof args[0] === 'string') {
        requestFrontendOnlyWaveform(args[0])
      }
      return api
    },
    on(eventName, handler) {
      startFrontendOnlyRealtimeDemo()
      registerFrontendOnlySocketHandler(eventName, handler)
      if (eventName === 'connect') {
        queueMicrotask(() => handler())
      }
      return api
    },
    off(eventName, handler) {
      if (!eventName) {
        unregisterFrontendOnlySocketHandler()
        return api
      }
      if (!handler) {
        unregisterFrontendOnlySocketHandler(eventName)
        return api
      }
      unregisterFrontendOnlySocketHandler(eventName, handler)
      return api
    },
    disconnect() {
      unregisterFrontendOnlySocketHandler()
    }
  }

  return api
}

export const seedFrontendOnlySocketData = () => {
  if (!isFrontendOnly) return
  if (!window.socketData) {
    window.socketData = {}
  }
}

export const seedFrontendOnlyStationChannel = (
  channelName: string,
  picks: Record<string, RealtimePick> = {},
  arrivals: Record<string, RealtimeArrival[]> = {}
) => {
  if (!isFrontendOnly) return
  seedFrontendOnlySocketData()
  window.socketData[channelName] = {
    picks,
    arrivals
  }
}

export const toRealtimeWaveforms = (waveform: StationWaveForm): StationWaveForm[] => {
  if (!isFrontendOnly) {
    return [waveform]
  }

  const chunkSize = 300
  const segments: StationWaveForm[] = []

  for (let index = 0; index < waveform.waveform.length; index += chunkSize) {
    const segment = waveform.waveform.slice(index, index + chunkSize)
    const startOffsetSeconds = index * waveform.delta
    const endOffsetSeconds = (index + segment.length) * waveform.delta

    segments.push({
      ...waveform,
      starttime: new Date(new Date(waveform.starttime).getTime() + startOffsetSeconds * 1000).toISOString(),
      endtime: new Date(new Date(waveform.starttime).getTime() + endOffsetSeconds * 1000).toISOString(),
      waveform: segment,
      npts: segment.length
    })
  }

  return segments
}
