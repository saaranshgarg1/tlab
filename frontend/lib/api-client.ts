import type {
  GarbageBin,
  BinStats,
  Collection,
  Review,
  HistoryDataPoint,
  AnalyticsSummary,
  CollectionStats,
  ApiResponse,
  CreateBinForm,
  UpdateBinForm,
  ReviewForm,
} from './types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Request failed' }))
        throw new Error(error.message || `HTTP ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error)
      throw error
    }
  }

  // Bin endpoints
  async getBins(): Promise<ApiResponse<GarbageBin[]>> {
    return this.request('/api/bins/status')
  }

  async getBin(binId: string): Promise<ApiResponse<GarbageBin>> {
    return this.request(`/api/bins/status/${binId}`)
  }

  async getBinStats(binId: string): Promise<ApiResponse<BinStats>> {
    return this.request(`/api/bins/${binId}/stats`)
  }

  async getFullBins(): Promise<ApiResponse<GarbageBin[]>> {
    return this.request('/api/bins/full')
  }

  async createBin(data: CreateBinForm): Promise<ApiResponse<GarbageBin>> {
    return this.request('/api/bins', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateBinFillLevel(data: UpdateBinForm): Promise<ApiResponse<GarbageBin>> {
    return this.request('/api/bins/update', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateBin(
    binId: string,
    data: Partial<GarbageBin>
  ): Promise<ApiResponse<GarbageBin>> {
    return this.request(`/api/bins/${binId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteBin(binId: string): Promise<ApiResponse<void>> {
    return this.request(`/api/bins/${binId}`, {
      method: 'DELETE',
    })
  }

  // History endpoints
  async getBinHistory(
    binId: string,
    params?: { from?: string; to?: string; interval?: string }
  ): Promise<ApiResponse<{ binId: string; series: HistoryDataPoint[] }>> {
    const query = new URLSearchParams(params as Record<string, string>)
    return this.request(`/api/bins/${binId}/history?${query}`)
  }

  // Review endpoints
  async getReviews(binId: string): Promise<ApiResponse<Review[]>> {
    return this.request(`/api/bins/${binId}/reviews`)
  }

  async submitReview(binId: string, data: ReviewForm): Promise<ApiResponse<Review>> {
    return this.request(`/api/bins/${binId}/review`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // Collection endpoints
  async getCollections(binId: string): Promise<ApiResponse<Collection[]>> {
    return this.request(`/api/bins/${binId}/collection`)
  }

  // Analytics endpoints
  async getAnalyticsSummary(params?: {
    from?: string
    to?: string
  }): Promise<ApiResponse<AnalyticsSummary>> {
    const query = new URLSearchParams(params as Record<string, string>)
    return this.request(`/api/analytics/summary?${query}`)
  }

  async getCollectionStats(params?: {
    from?: string
    to?: string
  }): Promise<ApiResponse<CollectionStats>> {
    const query = new URLSearchParams(params as Record<string, string>)
    return this.request(`/api/analytics/collection-stats?${query}`)
  }
}

export const apiClient = new ApiClient(API_BASE_URL)
