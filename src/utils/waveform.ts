import { PhaseType } from '@src/types/waveform'

export const downsampleWaveform = (data: number[], originalFrequency: number, targetFrequency: number) => {
  if (targetFrequency >= originalFrequency) {
    return { downsampledData: data, downsampleFactor: 1 }
  }

  const downsampleFactor = originalFrequency / targetFrequency
  if (!Number.isInteger(downsampleFactor)) {
    return { downsampledData: data, downsampleFactor: 1 }
  }

  const downsampledData: number[] = []
  for (let i = 0; i < data.length; i += downsampleFactor) {
    downsampledData.push(data[i])
  }

  return { downsampledData, downsampleFactor }
}

export const getPhaseLabel = (phaseType: PhaseType | 'OT' | 'Pn' | 'Sn', isUpdated?: boolean) => {
  if (phaseType === 'Pn') return 'P'
  if (phaseType === 'Sn') return 'S'
  if (phaseType === 'OT') return 'OT'
  if (isUpdated) return `${phaseType}new`
  return `${phaseType}<A>`
}

export const getPhaseColor = (phaseType: PhaseType | 'OT' | 'Pn' | 'Sn', isUpdated?: boolean) => {
  if (phaseType === 'OT') return 'yellow'
  if (phaseType === 'Pn') return '#f73378'
  if (phaseType === 'Sn') return '#dd33fa'
  if (isUpdated) return phaseType === 'P' ? '#ff784e' : '#35baf6'
  return phaseType === 'P' ? '#ff5722' : '#03a9f4'
}
