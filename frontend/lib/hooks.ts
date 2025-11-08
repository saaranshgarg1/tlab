import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from './api-client'
import type { CreateBinForm, UpdateBinForm, ReviewForm } from './types'

// Query keys
export const queryKeys = {
  bins: ['bins'] as const,
  bin: (id: string) => ['bins', id] as const,
  binHistory: (id: string, params?: Record<string, string>) =>
    ['bins', id, 'history', params] as const,
  binReviews: (id: string) => ['bins', id, 'reviews'] as const,
  binCollections: (id: string) => ['bins', id, 'collections'] as const,
  fullBins: ['bins', 'full'] as const,
  analytics: (params?: Record<string, string>) => ['analytics', params] as const,
  collectionStats: (params?: Record<string, string>) =>
    ['collection-stats', params] as const,
}

// Bins hooks
export function useBins() {
  return useQuery({
    queryKey: queryKeys.bins,
    queryFn: () => apiClient.getBins(),
    refetchInterval: 30000, // Poll every 30 seconds
  })
}

export function useBin(binId: string) {
  return useQuery({
    queryKey: queryKeys.bin(binId),
    queryFn: () => apiClient.getBin(binId),
    enabled: !!binId,
    refetchInterval: 30000,
  })
}

export function useFullBins() {
  return useQuery({
    queryKey: queryKeys.fullBins,
    queryFn: () => apiClient.getFullBins(),
    refetchInterval: 20000, // Poll more frequently for alerts
  })
}

export function useBinHistory(
  binId: string,
  params?: { from?: string; to?: string; interval?: string }
) {
  return useQuery({
    queryKey: queryKeys.binHistory(binId, params as Record<string, string>),
    queryFn: () => apiClient.getBinHistory(binId, params),
    enabled: !!binId,
  })
}

export function useBinReviews(binId: string) {
  return useQuery({
    queryKey: queryKeys.binReviews(binId),
    queryFn: () => apiClient.getReviews(binId),
    enabled: !!binId,
  })
}

export function useBinCollections(binId: string) {
  return useQuery({
    queryKey: queryKeys.binCollections(binId),
    queryFn: () => apiClient.getCollections(binId),
    enabled: !!binId,
  })
}

// Analytics hooks
export function useAnalyticsSummary(params?: { from?: string; to?: string }) {
  return useQuery({
    queryKey: queryKeys.analytics(params as Record<string, string>),
    queryFn: () => apiClient.getAnalyticsSummary(params),
    refetchInterval: 60000, // Poll every minute
  })
}

export function useCollectionStats(params?: { from?: string; to?: string }) {
  return useQuery({
    queryKey: queryKeys.collectionStats(params as Record<string, string>),
    queryFn: () => apiClient.getCollectionStats(params),
  })
}

// Mutations
export function useCreateBin() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: CreateBinForm) => apiClient.createBin(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bins })
    },
  })
}

export function useUpdateBinFillLevel() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: UpdateBinForm) => apiClient.updateBinFillLevel(data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bins })
      queryClient.invalidateQueries({ queryKey: queryKeys.bin(variables.binId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.fullBins })
    },
  })
}

export function useUpdateBin() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ binId, data }: { binId: string; data: Partial<any> }) =>
      apiClient.updateBin(binId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bins })
      queryClient.invalidateQueries({ queryKey: queryKeys.bin(variables.binId) })
    },
  })
}

export function useDeleteBin() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (binId: string) => apiClient.deleteBin(binId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bins })
    },
  })
}

export function useSubmitReview() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ binId, data }: { binId: string; data: ReviewForm }) =>
      apiClient.submitReview(binId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.binReviews(variables.binId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.bin(variables.binId) })
    },
  })
}
