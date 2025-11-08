import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { GarbageBin, AnalyticsSummary } from './types'

interface UIState {
  theme: 'light' | 'dark'
  sidebarOpen: boolean
  filterStatus: string | null
  filterLocation: string | null
  toggleTheme: () => void
  toggleSidebar: () => void
  setFilterStatus: (status: string | null) => void
  setFilterLocation: (location: string | null) => void
  resetFilters: () => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: 'dark',
      sidebarOpen: true,
      filterStatus: null,
      filterLocation: null,
      
      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === 'light' ? 'dark' : 'light',
        })),
      
      toggleSidebar: () =>
        set((state) => ({
          sidebarOpen: !state.sidebarOpen,
        })),
      
      setFilterStatus: (status) =>
        set({ filterStatus: status }),
      
      setFilterLocation: (location) =>
        set({ filterLocation: location }),
      
      resetFilters: () =>
        set({ filterStatus: null, filterLocation: null }),
    }),
    {
      name: 'ui-storage',
    }
  )
)

interface AppState {
  bins: GarbageBin[]
  analytics: AnalyticsSummary | null
  isLoading: boolean
  error: string | null

  // Actions
  setBins: (bins: GarbageBin[]) => void
  setAnalytics: (analytics: AnalyticsSummary) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  addBin: (bin: GarbageBin) => void
  updateBin: (binId: string, updates: Partial<GarbageBin>) => void
  deleteBin: (binId: string) => void
}

export const useAppStore = create<AppState>((set) => ({
  bins: [],
  analytics: null,
  isLoading: false,
  error: null,

  setBins: (bins) => set({ bins }),
  setAnalytics: (analytics) => set({ analytics }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  
  addBin: (bin) => set((state) => ({ 
    bins: [...state.bins, bin] 
  })),
  
  updateBin: (binId, updates) => set((state) => ({
    bins: state.bins.map(bin => 
      bin.binId === binId ? { ...bin, ...updates } : bin
    )
  })),
  
  deleteBin: (binId) => set((state) => ({
    bins: state.bins.filter(bin => bin.binId !== binId)
  })),
}))
