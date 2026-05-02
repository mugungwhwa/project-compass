import type { PersonaId } from "./cohort-retention-seed"

export const LIVE_OPS_EVENT_TYPES = [
  "content_release",
  "ua_campaign",
  "monetization_promo",
  "feature_deprecation",
] as const
export type LiveOpsEventType = (typeof LIVE_OPS_EVENT_TYPES)[number]

export type ImpactMetric = "retention" | "cohort_size" | "arpdau"
export type ImpactDirection = "up" | "down"

export type LiveOpsEvent = {
  id: string
  type: LiveOpsEventType
  date: Date
  dayN: number
  title: string
  expectedImpact: {
    metric: ImpactMetric
    direction: ImpactDirection
    magnitudeBps: number
  }
}

export type LiveOpsEventSeedInput = {
  personaId: PersonaId
  gameId: string
  startDate: Date
  durationDays: number
  eventCount?: number
}

type EventTypeDistribution = Record<LiveOpsEventType, number>

export type PersonaEventProfile = {
  defaultCountPer30d: number
  typeDistribution: EventTypeDistribution
}

export const PERSONA_EVENT_PROFILES: Record<PersonaId, PersonaEventProfile> = {
  A: {
    defaultCountPer30d: 6,
    typeDistribution: {
      content_release: 0.5,
      monetization_promo: 0.32,
      ua_campaign: 0.15,
      feature_deprecation: 0.03,
    },
  },
  B: {
    defaultCountPer30d: 8,
    typeDistribution: {
      ua_campaign: 0.6,
      content_release: 0.25,
      monetization_promo: 0.12,
      feature_deprecation: 0.03,
    },
  },
  C: {
    defaultCountPer30d: 5,
    typeDistribution: {
      feature_deprecation: 0.4,
      monetization_promo: 0.28,
      content_release: 0.18,
      ua_campaign: 0.14,
    },
  },
}

const IMPACT_TEMPLATES: Record<
  LiveOpsEventType,
  { metric: ImpactMetric; direction: ImpactDirection; baseBps: number; titleKo: string }
> = {
  content_release: { metric: "retention", direction: "up", baseBps: 50, titleKo: "신규 콘텐츠 출시" },
  monetization_promo: { metric: "arpdau", direction: "up", baseBps: 200, titleKo: "결제 프로모션" },
  ua_campaign: { metric: "cohort_size", direction: "up", baseBps: 1000, titleKo: "UA 캠페인 시작" },
  feature_deprecation: { metric: "retention", direction: "down", baseBps: 30, titleKo: "기능 deprecation" },
}

const DAY_MS = 24 * 60 * 60 * 1000

function hash(input: string): number {
  let h = 5381
  for (let i = 0; i < input.length; i++) {
    h = ((h << 5) + h) ^ input.charCodeAt(i)
  }
  return h >>> 0
}

function pickType(distribution: EventTypeDistribution, hashValue: number): LiveOpsEventType {
  const r = (hashValue % 10_000) / 10_000
  let cumulative = 0
  for (const t of LIVE_OPS_EVENT_TYPES) {
    cumulative += distribution[t]
    if (r < cumulative) return t
  }
  return LIVE_OPS_EVENT_TYPES[LIVE_OPS_EVENT_TYPES.length - 1]
}

function dayJitter(hashValue: number): number {
  return ((hashValue % 1_000) / 1_000 - 0.5) * 2
}

function magnitudeJitter(hashValue: number, baseBps: number): number {
  const factor = 0.8 + ((hashValue % 1_000) / 1_000) * 0.4
  return Math.round(baseBps * factor)
}

export function generateLiveOpsEvents(input: LiveOpsEventSeedInput): LiveOpsEvent[] {
  const profile = PERSONA_EVENT_PROFILES[input.personaId]
  const count =
    input.eventCount ??
    Math.round((profile.defaultCountPer30d * input.durationDays) / 30)

  const slot = input.durationDays / count
  const startMs = input.startDate.getTime()

  const events: LiveOpsEvent[] = []
  for (let i = 0; i < count; i++) {
    const seedKey = `${input.personaId}:${input.gameId}:${i}`
    const typeHash = hash(`type:${seedKey}`)
    const dayHash = hash(`day:${seedKey}`)
    const magHash = hash(`mag:${seedKey}`)

    const type = pickType(profile.typeDistribution, typeHash)
    const template = IMPACT_TEMPLATES[type]

    const center = (i + 0.5) * slot
    const offset = dayJitter(dayHash) * (slot * 0.4)
    const dayN = Math.max(0, Math.min(input.durationDays - 1, Math.floor(center + offset)))

    events.push({
      id: `evt-${input.gameId}-${i}`,
      type,
      date: new Date(startMs + dayN * DAY_MS),
      dayN,
      title: `${template.titleKo} #${i + 1}`,
      expectedImpact: {
        metric: template.metric,
        direction: template.direction,
        magnitudeBps: magnitudeJitter(magHash, template.baseBps),
      },
    })
  }

  events.sort((a, b) => a.dayN - b.dayN)
  return events
}
