import { create } from "zustand";
import type { DashboardSnapshot } from "../lib/types";

interface DashboardState {
  snapshot: DashboardSnapshot | null;
  authState: "loading" | "authenticated" | "guest";
  error: string | null;
  setSnapshot: (snapshot: DashboardSnapshot) => void;
  setAuthState: (state: DashboardState["authState"]) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  snapshot: null,
  authState: "loading",
  error: null,
  setSnapshot: (snapshot) => set({ snapshot, authState: "authenticated", error: null }),
  setAuthState: (authState) => set({ authState }),
  setError: (error) => set({ error }),
  reset: () => set({ snapshot: null, authState: "guest", error: null })
}));
