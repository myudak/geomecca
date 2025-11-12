import { RealtimeArrival, RealtimePick } from './types/waveform'

// View Transitions API types
interface ViewTransition {
  finished: Promise<void>
  ready: Promise<void>
  updateCallbackDone: Promise<void>
  skipTransition: () => void
}

declare global {
  interface Window {
    socketData: Record<
      string,
      {
        picks: Record<string, RealtimePick>
        arrivals: Record<string, RealtimeArrival[]>
      }
    >
  }

  interface Document {
    startViewTransition?: (callback: () => void | Promise<void>) => ViewTransition
  }
}
