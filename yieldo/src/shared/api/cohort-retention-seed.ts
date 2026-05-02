export type PersonaId = "A" | "B" | "C"
export type Genre = "puzzle" | "rpg" | "casual" | "strategy"

export type CohortRetentionSeedInput = {
  personaId: PersonaId
  gameId: string
  cohortStartDate: Date
  cohortSize: number
  observationDays: number
  genre: Genre
}

export type RetentionPoint = {
  cohortDate: Date
  dayN: number
  activeUsers: number
  retentionRate: number
}

export type RetentionProfile = {
  scale: number
  exponent: number
  floor: number
}

export const PERSONA_RETENTION_PROFILES: Record<PersonaId, RetentionProfile> = {
  A: { scale: 0.35, exponent: -0.6, floor: 0.03 },
  B: { scale: 0.39, exponent: -0.5, floor: 0.04 },
  C: { scale: 0.235, exponent: -0.65, floor: 0.015 },
}

const JITTER_AMPLITUDE = 0.005
const DAY_MS = 24 * 60 * 60 * 1000

function hash(input: string): number {
  let h = 5381
  for (let i = 0; i < input.length; i++) {
    h = ((h << 5) + h) ^ input.charCodeAt(i)
  }
  return h >>> 0
}

function jitter(personaId: PersonaId, gameId: string, dayN: number): number {
  const h = hash(`${personaId}:${gameId}:${dayN}`)
  const normalized = (h % 10_000) / 10_000
  return (normalized - 0.5) * 2 * JITTER_AMPLITUDE
}

export function generateCohortRetention(
  input: CohortRetentionSeedInput,
): RetentionPoint[] {
  const profile = PERSONA_RETENTION_PROFILES[input.personaId]
  const startMs = input.cohortStartDate.getTime()

  const rawRates: number[] = []
  for (let d = 0; d <= input.observationDays; d++) {
    if (d === 0) {
      rawRates.push(1)
      continue
    }
    const base = profile.scale * Math.pow(d, profile.exponent) + profile.floor
    const noisy = base + jitter(input.personaId, input.gameId, d)
    rawRates.push(Math.max(0, Math.min(1, noisy)))
  }

  for (let i = 1; i < rawRates.length; i++) {
    if (rawRates[i] > rawRates[i - 1]) {
      rawRates[i] = rawRates[i - 1]
    }
  }

  return rawRates.map((retentionRate, dayN) => ({
    cohortDate: new Date(startMs + dayN * DAY_MS),
    dayN,
    activeUsers: Math.round(input.cohortSize * retentionRate),
    retentionRate,
  }))
}
