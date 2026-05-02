import { describe, it, expect } from "vitest"
import {
  generateLiveOpsEvents,
  PERSONA_EVENT_PROFILES,
  LIVE_OPS_EVENT_TYPES,
  type LiveOpsEventSeedInput,
  type LiveOpsEventType,
} from "@/shared/api/live-ops-event-seed"

const baseInput: LiveOpsEventSeedInput = {
  personaId: "A",
  gameId: "game-001",
  startDate: new Date("2026-04-01T00:00:00Z"),
  durationDays: 30,
}

describe("generateLiveOpsEvents — output structure", () => {
  it("each event has id, type, date, dayN, title, expectedImpact", () => {
    const events = generateLiveOpsEvents(baseInput)
    expect(events.length).toBeGreaterThan(0)
    events.forEach((e) => {
      expect(typeof e.id).toBe("string")
      expect(LIVE_OPS_EVENT_TYPES).toContain(e.type)
      expect(e.date).toBeInstanceOf(Date)
      expect(typeof e.dayN).toBe("number")
      expect(typeof e.title).toBe("string")
      expect(e.expectedImpact.metric).toMatch(/^(retention|cohort_size|arpdau)$/)
      expect(e.expectedImpact.direction).toMatch(/^(up|down)$/)
      expect(e.expectedImpact.magnitudeBps).toBeGreaterThan(0)
      expect(Number.isInteger(e.expectedImpact.magnitudeBps)).toBe(true)
    })
  })

  it("event ids are unique within a single generation", () => {
    const events = generateLiveOpsEvents(baseInput)
    const ids = events.map((e) => e.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it("date matches startDate + dayN days", () => {
    const events = generateLiveOpsEvents(baseInput)
    const startMs = baseInput.startDate.getTime()
    const dayMs = 24 * 60 * 60 * 1000
    events.forEach((e) => {
      expect(e.date.getTime()).toBe(startMs + e.dayN * dayMs)
    })
  })
})

describe("generateLiveOpsEvents — count + range", () => {
  it("respects explicit eventCount", () => {
    const events = generateLiveOpsEvents({ ...baseInput, eventCount: 4 })
    expect(events).toHaveLength(4)
  })

  it("falls back to persona default when eventCount omitted", () => {
    const events = generateLiveOpsEvents(baseInput)
    expect(events).toHaveLength(PERSONA_EVENT_PROFILES.A.defaultCountPer30d)
  })

  it("dayN values fall within [0, durationDays)", () => {
    const events = generateLiveOpsEvents(baseInput)
    events.forEach((e) => {
      expect(e.dayN).toBeGreaterThanOrEqual(0)
      expect(e.dayN).toBeLessThan(baseInput.durationDays)
    })
  })

  it("events are sorted by dayN ascending", () => {
    const events = generateLiveOpsEvents({ ...baseInput, eventCount: 8 })
    for (let i = 1; i < events.length; i++) {
      expect(events[i].dayN).toBeGreaterThanOrEqual(events[i - 1].dayN)
    }
  })

  it("scales default count proportionally to durationDays", () => {
    const events = generateLiveOpsEvents({ ...baseInput, durationDays: 60 })
    const expected = PERSONA_EVENT_PROFILES.A.defaultCountPer30d * 2
    expect(events).toHaveLength(expected)
  })
})

describe("generateLiveOpsEvents — determinism", () => {
  it("same input produces identical output", () => {
    const a = generateLiveOpsEvents(baseInput)
    const b = generateLiveOpsEvents(baseInput)
    expect(a).toEqual(b)
  })

  it("different gameId produces different events", () => {
    const a = generateLiveOpsEvents(baseInput)
    const b = generateLiveOpsEvents({ ...baseInput, gameId: "game-002" })
    const aSig = a.map((e) => `${e.dayN}:${e.type}`).join("|")
    const bSig = b.map((e) => `${e.dayN}:${e.type}`).join("|")
    expect(aSig).not.toEqual(bSig)
  })
})

describe("generateLiveOpsEvents — persona event mix", () => {
  it("Persona A leans positive (>=80% impacts go up)", () => {
    const events = generateLiveOpsEvents({
      ...baseInput,
      personaId: "A",
      eventCount: 100,
    })
    const upCount = events.filter((e) => e.expectedImpact.direction === "up").length
    expect(upCount / events.length).toBeGreaterThanOrEqual(0.8)
  })

  it("Persona B is dominated by ua_campaign type", () => {
    const events = generateLiveOpsEvents({
      ...baseInput,
      personaId: "B",
      eventCount: 100,
    })
    const uaCount = events.filter((e) => e.type === "ua_campaign").length
    expect(uaCount / events.length).toBeGreaterThan(0.4)
  })

  it("Persona C surfaces feature_deprecation more often than A or B", () => {
    const counts = (id: "A" | "B" | "C") => {
      const events = generateLiveOpsEvents({
        ...baseInput,
        personaId: id,
        eventCount: 100,
      })
      return events.filter((e) => e.type === "feature_deprecation").length
    }
    expect(counts("C")).toBeGreaterThan(counts("A"))
    expect(counts("C")).toBeGreaterThan(counts("B"))
  })
})

describe("PERSONA_EVENT_PROFILES — completeness", () => {
  it("defines all 3 personas with required fields", () => {
    (["A", "B", "C"] as const).forEach((id) => {
      const profile = PERSONA_EVENT_PROFILES[id]
      expect(profile.defaultCountPer30d).toBeGreaterThan(0)
      expect(profile.typeDistribution).toBeDefined()
      const total = Object.values(profile.typeDistribution).reduce(
        (acc, w) => acc + w,
        0,
      )
      expect(total).toBeCloseTo(1, 5)
    })
  })

  it("LIVE_OPS_EVENT_TYPES contains all 4 expected types", () => {
    const expected: LiveOpsEventType[] = [
      "content_release",
      "ua_campaign",
      "monetization_promo",
      "feature_deprecation",
    ]
    expected.forEach((t) => expect(LIVE_OPS_EVENT_TYPES).toContain(t))
  })
})
