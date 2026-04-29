# D — Bayesian Stats Engine (yieldo) PR3 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development.

**Goal:** Generate a committed seed `PosteriorSnapshot` from a hardcoded "Match League" demo cohort fixture so the dashboard always renders real engine output (no mock branch). Add `verify-seed` CI gate that detects when `ENGINE_VERSION` or prior data drift would silently leave seed stale.

**Architecture:** Prebuild step writes `src/shared/data/seed-posterior.json`. Live customers continue to get their snapshot from Vercel Blob (PR2). UI in PR4 will pick demo vs live with one branch on `appId === "demo"`.

**Tech Stack:** TypeScript · `tsx` runner · vitest · Next.js 16 build pipeline

**Spec:** `yieldo/docs/superpowers/specs/2026-04-29-bayesian-stats-engine-yieldo-design.md` (commit 185e76a) — §6 (Seed Snapshot Prebuild), §13 (Engine version 운영 규약)

**PR1 + PR2 dependencies:** PR #9 (`7fc20ae`) + PR #10 (`23e584b`) merged. `computePosterior()` and `genre-priors.json` are available via existing imports.

## Brainstorming Decisions (2026-04-29)

| # | Decision | Choice | Rationale |
|---|---|---|---|
| 1 | Fixture transform shape | **Hardcoded demo CohortSummary inline in script** | mock-data.ts's `mockPriorPosterior` is row-shaped, not engine-compatible. Inline cohort = no parsing layer, single source of truth |
| 2 | CI gate timing | **`verify-seed` separate script, run in CI** | Auto-regenerate hides version mismatch. Explicit verify fails CI loudly when seed stale |
| 3 | seed-posterior.json shape | **Full PosteriorSnapshot** (cohortSummary + posterior + metadata) | Live snapshot shape → UI fetch is one branch (demo→file vs live→fetch) |

---

## File Structure

### Files this PR creates

```
yieldo/scripts/
├── build-seed-snapshot.ts       # Prebuild: hardcoded Match League fixture → engine → JSON
└── verify-seed-snapshot.ts      # CI: re-run prebuild, fail if git diff non-empty

yieldo/src/shared/data/
└── seed-posterior.json          # Generated, committed, used by PR4 demo path
```

### Files this PR modifies

- `yieldo/package.json` — add `prebuild` + `verify-seed` scripts; ensure `tsx` is a devDependency (skip if already)

### Files this PR does NOT touch

- `src/shared/lib/bayesian-stats/` (PR1 sealed)
- `src/shared/api/posterior/` (PR2 sealed)
- `src/app/(dashboard)/dashboard/market-gap/page.tsx` (PR4)

---

## Task 1: Worktree + branch + npm install

- [ ] **Step 1: Verify main is clean and synced**

```bash
cd /Users/mike/Downloads/Compass
git checkout main
git pull origin main
git status
```

Expected: `On branch main, Your branch is up to date with 'origin/main'`. `yieldo/src/styles/globals.css` may show as `M` — leave it alone (transcendent-translation, not in PR3 scope).

- [ ] **Step 2: Create worktree**

```bash
git worktree add .worktrees/feature-d-bayesian-pr3-seed-snapshot -b feature/d-bayesian-pr3-seed-snapshot main
```

- [ ] **Step 3: Verify worktree state**

```bash
cd /Users/mike/Downloads/Compass/.worktrees/feature-d-bayesian-pr3-seed-snapshot
git branch --show-current
git status
```

Expected: branch `feature/d-bayesian-pr3-seed-snapshot`, clean.

- [ ] **Step 4: npm install**

```bash
cd /Users/mike/Downloads/Compass/.worktrees/feature-d-bayesian-pr3-seed-snapshot/yieldo
npm install --legacy-peer-deps
```

- [ ] **Step 5: Verify baseline + check tsx availability**

```bash
npm test
npx tsx --version
```

Expected: tests green (≥ 120). `tsx --version` prints a version (already a dep). If `tsx` is missing (`npx: command not found tsx`), report DONE_WITH_CONCERNS — orchestrator will decide whether to add tsx as devDep in this same PR or pre-install.

> All subsequent commands run from `/Users/mike/Downloads/Compass/.worktrees/feature-d-bayesian-pr3-seed-snapshot/yieldo`.

---

## Task 2: build-seed-snapshot.ts

**Files:**
- Create: `scripts/build-seed-snapshot.ts`

> Note: `scripts/` here means `yieldo/scripts/`, not the repo-root `scripts/harness/`. Create the directory if needed.

- [ ] **Step 1: Write the prebuild script**

```typescript
// yieldo/scripts/build-seed-snapshot.ts
//
// Generates src/shared/data/seed-posterior.json from a hardcoded "Match League"
// demo cohort. Run automatically by `npm run prebuild` (and verified by CI via
// `npm run verify-seed`). Re-runs are idempotent: same inputs + ENGINE_VERSION
// produce byte-identical output.
//
// Why hardcoded: mockPriorPosterior in shared/api/mock-data.ts is row-shaped
// (per-metric values), not CohortSummary-shaped. Bridging would require fragile
// parsing. A small inline fixture is clearer and gives stable demo output.

import { writeFileSync } from "node:fs"
import { resolve } from "node:path"
import { computePosterior } from "../src/shared/api/posterior"
import type { CohortSummary } from "../src/shared/api/appsflyer/types"

const DEMO_COHORT_DATE = "2026-02-28" // 60 days before 2026-04-29
const DEMO_GENRE = "match-3"           // Match League is match-3-style

const demoCohortSummary: CohortSummary = {
  updatedAt: "2026-04-29T00:00:00.000Z",
  cohorts: [
    {
      cohortDate: DEMO_COHORT_DATE,
      installs: 8000,
      retainedByDay: { d1: 1840, d7: 392, d30: 80 },
      uaSpendUsd: 24_000,
    },
  ],
  revenue: {
    daily: [
      { date: "2026-02-15", sumUsd: 50_000, purchasers: 280 },
      { date: "2026-03-15", sumUsd: 60_000, purchasers: 320 },
      { date: "2026-04-15", sumUsd: 70_000, purchasers: 360 },
    ],
    total: { sumUsd: 180_000, purchasers: 960 },
  },
  spend: { totalUsd: 24_000, homeCurrency: "USD" },
}

const snapshot = computePosterior(demoCohortSummary, DEMO_GENRE)

const outPath = resolve(__dirname, "..", "src", "shared", "data", "seed-posterior.json")
writeFileSync(outPath, JSON.stringify(snapshot, null, 2) + "\n")

console.log(`✅ seed-posterior.json generated: ${outPath}`)
console.log(`   engineVersion=${snapshot.metadata.engineVersion}`)
console.log(`   priorVersion=${snapshot.metadata.priorVersion}`)
console.log(`   genreUsed=${snapshot.metadata.genreUsed}`)
console.log(`   metrics=${Object.keys(snapshot.posterior).join(", ")}`)
```

- [ ] **Step 2: TypeScript compile check**

```bash
npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 3: Run the script — produces seed-posterior.json**

```bash
mkdir -p src/shared/data
npx tsx scripts/build-seed-snapshot.ts
```

Expected:
- File created at `src/shared/data/seed-posterior.json`
- Console prints engineVersion=1.0.0, priorVersion=genre-priors-2026-04-29, genreUsed=match-3, metrics=retention_d1, retention_d7, retention_d30, monthly_revenue_usd

- [ ] **Step 4: Verify generated JSON is valid + has expected shape**

```bash
node -e "
  const s = JSON.parse(require('fs').readFileSync('src/shared/data/seed-posterior.json', 'utf8'));
  if (!s.cohortSummary) { console.error('FAIL: missing cohortSummary'); process.exit(1); }
  if (Object.keys(s.posterior).length !== 4) { console.error('FAIL: posterior should have 4 metrics'); process.exit(1); }
  if (s.metadata.engineVersion !== '1.0.0') { console.error('FAIL: engineVersion'); process.exit(1); }
  if (s.metadata.genreUsed !== 'match-3') { console.error('FAIL: genreUsed'); process.exit(1); }
  console.log('✅ seed-posterior.json shape OK');
"
```

Expected: `✅ seed-posterior.json shape OK`

- [ ] **Step 5: Commit script + generated JSON together**

```bash
git add scripts/build-seed-snapshot.ts src/shared/data/seed-posterior.json
git commit -m "feat(seed): add build-seed-snapshot script + initial seed-posterior.json

Hardcoded Match League demo cohort (8000 installs, 60 days old, match-3 genre)
runs through computePosterior() to produce a v2 PosteriorSnapshot.
ENGINE_VERSION=1.0.0, priorVersion=genre-priors-2026-04-29.

The committed JSON is the source of truth for the dashboard demo path (PR4).
verify-seed CI gate (Task 4) detects drift between committed seed and
re-generated output."
```

---

## Task 3: verify-seed-snapshot.ts

**Files:**
- Create: `scripts/verify-seed-snapshot.ts`

- [ ] **Step 1: Write the CI verifier**

```typescript
// yieldo/scripts/verify-seed-snapshot.ts
//
// Re-runs build-seed-snapshot in-process and compares output against the
// committed src/shared/data/seed-posterior.json. Exits non-zero (and writes
// the diff summary to stderr) if they differ — used as a CI gate so engine
// changes that would silently invalidate the seed are caught at PR time.

import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { computePosterior } from "../src/shared/api/posterior"
import type { CohortSummary } from "../src/shared/api/appsflyer/types"

const DEMO_COHORT_DATE = "2026-02-28"
const DEMO_GENRE = "match-3"

const demoCohortSummary: CohortSummary = {
  updatedAt: "2026-04-29T00:00:00.000Z",
  cohorts: [
    {
      cohortDate: DEMO_COHORT_DATE,
      installs: 8000,
      retainedByDay: { d1: 1840, d7: 392, d30: 80 },
      uaSpendUsd: 24_000,
    },
  ],
  revenue: {
    daily: [
      { date: "2026-02-15", sumUsd: 50_000, purchasers: 280 },
      { date: "2026-03-15", sumUsd: 60_000, purchasers: 320 },
      { date: "2026-04-15", sumUsd: 70_000, purchasers: 360 },
    ],
    total: { sumUsd: 180_000, purchasers: 960 },
  },
  spend: { totalUsd: 24_000, homeCurrency: "USD" },
}

const expected = computePosterior(demoCohortSummary, DEMO_GENRE)
const expectedJson = JSON.stringify(expected, null, 2) + "\n"

const seedPath = resolve(__dirname, "..", "src", "shared", "data", "seed-posterior.json")
const actualJson = readFileSync(seedPath, "utf8")

if (expectedJson !== actualJson) {
  console.error("❌ seed-posterior.json is OUT OF DATE")
  console.error("   Committed seed differs from current engine output.")
  console.error("   Likely cause: ENGINE_VERSION bump, prior change, or fixture drift.")
  console.error("   Fix: run `npm run prebuild:seed` to regenerate, then commit.")
  process.exit(1)
}

console.log("✅ seed-posterior.json is up to date")
```

- [ ] **Step 2: TypeScript compile check**

```bash
npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 3: Run verifier (should pass)**

```bash
npx tsx scripts/verify-seed-snapshot.ts
```

Expected: `✅ seed-posterior.json is up to date` and exit 0.

- [ ] **Step 4: Sanity test — verifier catches drift**

Temporarily corrupt the seed and verify failure:

```bash
cp src/shared/data/seed-posterior.json /tmp/seed-backup.json
echo '{"corrupted": true}' > src/shared/data/seed-posterior.json
npx tsx scripts/verify-seed-snapshot.ts
echo "EXIT=$?"
cp /tmp/seed-backup.json src/shared/data/seed-posterior.json
rm /tmp/seed-backup.json
```

Expected: stderr prints `❌ seed-posterior.json is OUT OF DATE`, `EXIT=1`. Then seed restored.

- [ ] **Step 5: Verifier passes again after restore**

```bash
npx tsx scripts/verify-seed-snapshot.ts
```

Expected: `✅ seed-posterior.json is up to date`.

- [ ] **Step 6: Commit**

```bash
git add scripts/verify-seed-snapshot.ts
git commit -m "feat(seed): add verify-seed-snapshot script for CI drift detection"
```

---

## Task 4: package.json scripts

**Files:**
- Modify: `yieldo/package.json`

- [ ] **Step 1: Read current scripts**

```bash
grep -A 6 '"scripts"' package.json
```

Expected: shows existing `dev`, `build`, `start`, `lint`, `test` scripts.

- [ ] **Step 2: Add prebuild:seed and verify-seed**

Use a JSON-aware edit (do NOT regex through the file). Add two scripts under the `"scripts"` block. Final shape:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "test": "vitest run --passWithNoTests",
    "prebuild:seed": "tsx scripts/build-seed-snapshot.ts",
    "verify-seed": "tsx scripts/verify-seed-snapshot.ts"
  }
}
```

> **Naming note**: `prebuild:seed` (with namespacing colon), NOT `prebuild`. Next.js does NOT auto-run npm `prebuild` lifecycle hooks during `next build`, and we don't want a hidden auto-regenerate step that masks `verify-seed` drift detection. CI will run `npm run verify-seed` explicitly.

- [ ] **Step 3: Verify both scripts work**

```bash
npm run prebuild:seed
npm run verify-seed
```

Expected:
- `prebuild:seed` regenerates the JSON (idempotent — git diff should be empty)
- `verify-seed` exits 0 with success message

- [ ] **Step 4: Confirm git diff is clean (idempotency)**

```bash
git diff --exit-code src/shared/data/seed-posterior.json
echo "EXIT=$?"
```

Expected: `EXIT=0` (no diff). The committed seed matches what prebuild:seed regenerates byte-for-byte.

- [ ] **Step 5: Commit package.json**

```bash
git add package.json
git commit -m "chore(seed): add prebuild:seed + verify-seed npm scripts"
```

---

## Task 5: Add verify-seed to CI gate (harness)

> **Scope note:** This task is OPTIONAL for PR3. If PR3 lands without it, drift detection still works locally via `npm run verify-seed`. Include this task only if the harness extension is straightforward; if `precommit-gate.sh` requires non-trivial restructuring, defer to a follow-up harness PR.

- [ ] **Step 1: Inspect current gate**

```bash
grep -nE "build-check|eslint|tsc" /Users/mike/Downloads/Compass/scripts/harness/precommit-gate.sh
```

Look for the existing 4-stage check (tsc, eslint, arch-guard, build).

- [ ] **Step 2: Decision — defer or include?**

If the current gate only fires on yieldo/ commits and uses `bash "$LIB_DIR/build-check.sh"` (which runs `next build`), then `verify-seed` should run BEFORE `next build` so a stale seed is caught quickly. Otherwise, a stale seed propagates to the Vercel preview build.

**If including:** Add a new step in `precommit-gate.sh` between `eslint` and `arch-guard`:

```bash
# 2.5 verify-seed — only if seed-posterior.json or related sources are staged
SEED_RELATED=$(echo "$STAGED" | grep -E '^yieldo/(src/shared/data/seed-posterior\.json|src/shared/lib/bayesian-stats/|src/shared/data/genre-priors\.json|src/shared/api/posterior/|scripts/(build|verify)-seed-snapshot\.ts)$' || true)
if [ -n "$SEED_RELATED" ]; then
  echo "▸ verify-seed..." >&2
  if ! (cd "$APP_DIR" && npx tsx scripts/verify-seed-snapshot.ts) > /tmp/yieldo-seed.log 2>&1; then
    cat /tmp/yieldo-seed.log >&2
    add_failure "verify-seed" "seed-posterior.json out of date — run \`npm run prebuild:seed\` and re-commit"
  else
    echo "  ✅ verify-seed 통과" >&2
  fi
fi
```

This gate change is committed in the **main worktree** (not PR3 branch), since `scripts/harness/` is harness infrastructure shared across all worktrees.

**If deferring:** skip Task 5 entirely. Document deferred status in PR description.

- [ ] **Step 3 (if deferring): Note deferral**

Add to PR description body:
> **Deferred:** harness `precommit-gate.sh` integration of `verify-seed` is not in this PR. Run `npm run verify-seed` manually or rely on Vercel build-time failure if seed drifts.

---

## Task 6: Full suite + tsc + lint + push + PR

- [ ] **Step 1: Full test suite**

```bash
npm test
```

Expected: all green, count unchanged from PR2 (≥ 120). PR3 adds no test files (scripts are exercised by Task 2/3 manual runs + Task 4 idempotency check).

- [ ] **Step 2: Type check**

```bash
npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 3: Lint**

```bash
npm run lint
```

Expected: 0 errors in NEW files (`scripts/build-seed-snapshot.ts`, `scripts/verify-seed-snapshot.ts`, `src/shared/data/seed-posterior.json`). Pre-existing 7 errors elsewhere remain — PR3 does not touch them.

If the new scripts have any `@typescript-eslint/no-explicit-any` or unused-import errors, fix them, commit as `fix(seed): lint cleanup`, re-run lint to verify.

- [ ] **Step 4: Verify file inventory**

```bash
ls scripts/ | grep -E '(build|verify)-seed'
ls src/shared/data/seed-posterior.json
grep -E '"(prebuild:seed|verify-seed)"' package.json
```

Expected: all three commands print non-empty output.

- [ ] **Step 5: Push + create PR**

```bash
git push -u origin feature/d-bayesian-pr3-seed-snapshot
gh pr create --title "feat(d-bayesian): PR3 Seed Snapshot Prebuild" \
  --body "$(cat <<'EOF'
## Summary
- New prebuild script `scripts/build-seed-snapshot.ts` — hardcoded Match League demo cohort → engine → JSON
- New CI verifier `scripts/verify-seed-snapshot.ts` — fails if committed seed drifts from current engine output
- Committed seed `src/shared/data/seed-posterior.json` — full PosteriorSnapshot shape (cohortSummary + posterior + metadata)
- npm scripts `prebuild:seed` + `verify-seed`

## Spec
\`yieldo/docs/superpowers/specs/2026-04-29-bayesian-stats-engine-yieldo-design.md\` (commit 185e76a) — §6, §13

## Plan
\`yieldo/docs/superpowers/plans/2026-04-29-bayesian-stats-engine-yieldo-pr3.md\`

## Brainstorming decisions
- Q1 Fixture transform: hardcoded inline cohort
- Q2 CI gate timing: `verify-seed` separate (no auto-regenerate)
- Q3 seed shape: full PosteriorSnapshot

## Test plan
- [x] \`npm test\` — all green (≥ 120 tests, 0 new but baseline preserved)
- [x] \`npx tsc --noEmit\` — 0 type errors
- [x] \`npm run lint\` — 0 errors in new files
- [x] \`npm run prebuild:seed\` produces stable output (git diff empty after re-run)
- [x] \`npm run verify-seed\` passes on committed seed
- [x] \`verify-seed\` correctly fails when seed is corrupted (sanity test)

## Out of scope (next PR)
- PR4: market-gap page wiring + Methodology Modal + i18n (consumes seed-posterior.json for demo path)

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

Expected: PR URL printed.

If `gh pr create` errors, push branch only and report manual URL.

---

## Self-Review

**Spec coverage check:**

| Spec section | PR3 task |
|---|---|
| §6.1 Seed prebuild purpose (demo dogfooding) | Task 2 (build-seed-snapshot.ts) |
| §6.2 Prebuild script structure | Task 2 (computePosterior call + writeFileSync) |
| §6.3 Engine version safety net | Task 3 (verify-seed) + Task 4 (npm script) |
| §13 Engine version 운영 규약 | Task 3 stderr message ("Likely cause: ENGINE_VERSION bump") |

**Placeholder scan:** No "TBD" / "TODO" / "fill in details". Demo cohort numbers are concrete (8000, 1840, 392, 80). Demo dates are concrete. ✅

**Type consistency:**
- `CohortSummary` shape used in build-seed-snapshot.ts and verify-seed-snapshot.ts is identical (literal duplication). Acceptable — DRY violation is intentional to keep verify-seed standalone.
- `computePosterior(summary, "match-3")` signature consistent with PR2's `computePosterior(cohortSummary, genre?)`.
- `seed-posterior.json` shape conforms to `PosteriorSnapshotSchema` (Task 2 step 4 sanity check verifies metric count + metadata fields).

**DRY note:** The `demoCohortSummary` const is duplicated between build-seed-snapshot.ts and verify-seed-snapshot.ts. This is intentional: both scripts must be standalone-runnable without importing a shared helper that could itself drift. The duplication is small (~25 lines) and the value of independent verification outweighs the hygiene cost.

---

## What ships at end of PR3

- `seed-posterior.json` committed to repo, mirrors live snapshot shape
- `npm run prebuild:seed` regenerates seed deterministically
- `npm run verify-seed` detects drift (CI ready)
- Optional: harness `precommit-gate.sh` includes verify-seed step (Task 5 — defer if non-trivial)

PR4 will consume this file via `import seedPosterior from "@/shared/data/seed-posterior.json"` to render the demo path.

---

**End of PR3 plan.**
