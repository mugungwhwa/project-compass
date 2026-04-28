/**
 * Selected Game Store — UI state for the global game selector.
 *
 * Scope: Holds ONLY the selected gameId. No data is stored here.
 * Data is fetched via the `useGameData` adapter hook (see shared/api/use-game-data.ts),
 * which is the single boundary that will be swapped from mock lookup to a real API
 * (TanStack Query + Supabase) in a future milestone.
 *
 * Why separate store from data:
 *  - UI selection is client-side, synchronous, instant.
 *  - Data is potentially async, cacheable, revalidatable.
 *  - Keeping them separate lets us change the data source without touching consumers.
 */
import { create } from "zustand"

/**
 * Default view is portfolio-level (aggregate of all titles).
 * Individual game IDs drill into per-title views.
 * Special sentinel: "portfolio" = all-titles overview.
 */
export const DEFAULT_GAME_ID = "portfolio"

export const PORTFOLIO_ID = "portfolio"

type SelectedGameStore = {
  gameId: string
  setGameId: (id: string) => void
}

export const useSelectedGame = create<SelectedGameStore>((set) => ({
  gameId: DEFAULT_GAME_ID,
  setGameId: (id) => set({ gameId: id }),
}))
