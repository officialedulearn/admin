import { create } from "zustand";
import { adminGrowthService } from "@/services/admin-growth.service";
import type {
  GrowthContentIntelligence,
  GrowthLead,
  GrowthOverview,
  GrowthRetention,
  GrowthSegment,
} from "@/types/admin-growth.types";

const CACHE_TTL_MS = 60_000;

interface AdminGrowthState {
  overview: GrowthOverview | null;
  segments: GrowthSegment[];
  leads: GrowthLead[];
  retention: GrowthRetention | null;
  content: GrowthContentIntelligence | null;
  loading: boolean;
  error: string | null;
  lastFetchedAt: Record<string, number>;
  loadOverview: (force?: boolean) => Promise<void>;
  loadSegments: (force?: boolean) => Promise<void>;
  loadLeads: (force?: boolean) => Promise<void>;
  loadRetention: (force?: boolean) => Promise<void>;
  loadContent: (force?: boolean) => Promise<void>;
  loadOperatorDashboard: (force?: boolean) => Promise<void>;
  clearError: () => void;
}

const isFresh = (lastFetchedAt: Record<string, number>, key: string) =>
  Date.now() - (lastFetchedAt[key] || 0) < CACHE_TTL_MS;

const messageFromError = (error: unknown) =>
  error instanceof Error ? error.message : "Unable to load growth data";

const settledErrorMessages = (results: PromiseSettledResult<unknown>[]) =>
  results
    .filter((result): result is PromiseRejectedResult => result.status === "rejected")
    .map((result) => messageFromError(result.reason));

export const useAdminGrowthStore = create<AdminGrowthState>((set, get) => ({
  overview: null,
  segments: [],
  leads: [],
  retention: null,
  content: null,
  loading: false,
  error: null,
  lastFetchedAt: {},

  async loadOverview(force = false) {
    if (!force && get().overview && isFresh(get().lastFetchedAt, "overview")) return;
    set({ loading: true, error: null });
    try {
      const overview = await adminGrowthService.getOverview();
      set((state) => ({
        overview,
        lastFetchedAt: { ...state.lastFetchedAt, overview: Date.now() },
      }));
    } catch (error) {
      set({ error: messageFromError(error) });
    } finally {
      set({ loading: false });
    }
  },

  async loadSegments(force = false) {
    if (!force && get().segments.length && isFresh(get().lastFetchedAt, "segments")) return;
    set({ loading: true, error: null });
    try {
      const segments = await adminGrowthService.getSegments();
      set((state) => ({
        segments,
        lastFetchedAt: { ...state.lastFetchedAt, segments: Date.now() },
      }));
    } catch (error) {
      set({ error: messageFromError(error) });
    } finally {
      set({ loading: false });
    }
  },

  async loadLeads(force = false) {
    if (!force && get().leads.length && isFresh(get().lastFetchedAt, "leads")) return;
    set({ loading: true, error: null });
    try {
      const leads = await adminGrowthService.getLeads();
      set((state) => ({
        leads,
        lastFetchedAt: { ...state.lastFetchedAt, leads: Date.now() },
      }));
    } catch (error) {
      set({ error: messageFromError(error) });
    } finally {
      set({ loading: false });
    }
  },

  async loadRetention(force = false) {
    if (!force && get().retention && isFresh(get().lastFetchedAt, "retention")) return;
    set({ loading: true, error: null });
    try {
      const retention = await adminGrowthService.getRetention();
      set((state) => ({
        retention,
        lastFetchedAt: { ...state.lastFetchedAt, retention: Date.now() },
      }));
    } catch (error) {
      set({ error: messageFromError(error) });
    } finally {
      set({ loading: false });
    }
  },

  async loadContent(force = false) {
    if (!force && get().content && isFresh(get().lastFetchedAt, "content")) return;
    set({ loading: true, error: null });
    try {
      const content = await adminGrowthService.getContentIntelligence();
      set((state) => ({
        content,
        lastFetchedAt: { ...state.lastFetchedAt, content: Date.now() },
      }));
    } catch (error) {
      set({ error: messageFromError(error) });
    } finally {
      set({ loading: false });
    }
  },

  async loadOperatorDashboard(force = false) {
    const state = get();
    const fresh =
      state.overview &&
      isFresh(state.lastFetchedAt, "dashboard");
    if (!force && fresh) return;
    set({ loading: true, error: null });
    try {
      const overview = await adminGrowthService.getOverview();
      set((current) => ({
        overview,
        segments: overview.segments,
        leads: overview.topLeads,
        retention: current.retention ?? {
          summary: overview.retention,
          riskBuckets: [],
          cohorts: [],
        },
        lastFetchedAt: {
          ...current.lastFetchedAt,
          dashboard: Date.now(),
          overview: Date.now(),
          retention: Date.now(),
          leads: Date.now(),
          segments: Date.now(),
        },
      }));

      const [retentionResult, contentResult, leadsResult] =
        await Promise.allSettled([
          adminGrowthService.getRetention(),
          adminGrowthService.getContentIntelligence(),
          adminGrowthService.getLeads(),
        ]);

      set((current) => ({
        retention:
          retentionResult.status === "fulfilled"
            ? retentionResult.value
            : current.retention,
        content:
          contentResult.status === "fulfilled" ? contentResult.value : current.content,
        leads: leadsResult.status === "fulfilled" ? leadsResult.value : current.leads,
        lastFetchedAt: {
          ...current.lastFetchedAt,
          ...(retentionResult.status === "fulfilled" && { retention: Date.now() }),
          ...(contentResult.status === "fulfilled" && { content: Date.now() }),
          ...(leadsResult.status === "fulfilled" && { leads: Date.now() }),
        },
      }));

      const errors = settledErrorMessages([retentionResult, contentResult, leadsResult]);
      if (errors.length) {
        set({ error: `Some analytics panels could not refresh: ${errors[0]}` });
      }
    } catch (error) {
      set({ error: messageFromError(error) });
    } finally {
      set({ loading: false });
    }
  },

  clearError() {
    set({ error: null });
  },
}));
