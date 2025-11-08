// API Types
export interface GarbageBin {
  _id: string
  binId: string
  location: string
  lat?: number
  lng?: number
  fillLevel: number
  status: 'Empty' | 'Filling' | 'Maintenance' | 'Full' | 'Error'
  threshold: number
  maintenanceFlag: boolean
  label?: string
  stats: {
    totalCollections: number
    averageFillRate: number
    lastCollectionDate?: string
    totalReviews: number
    averageRating: number
  }
  lastUpdated: string
  createdAt: string
}

export interface BinStats {
  binInfo: {
    binId: string
    location: string
    currentFillLevel: number
    status: string
    threshold: number
    maintenanceFlag: boolean
    label?: string
    lastUpdated: string
  }
  collectionStats: {
    totalCollections: number
    lastCollectionDate?: string
    upcomingCollections: number
    nextScheduledCollection?: string
    recentCollections: Array<{
      scheduledDate: string
      completedAt?: string
      fillLevelAtSchedule?: number
      fillLevelAtCollection?: number
      collectedBy?: string
    }>
    averageTimeToFill?: number
    predictedNextCollection?: string
  }
  fillLevelStats: {
    current: number
    averageFillRate: number
    lastWeekAverage: number
    previousWeekAverage: number
    fillRateTrend: number
    historyDataPoints: number
  }
  reviewStats: {
    totalReviews: number
    averageRating: number
    recentReviews: Array<{
      name_of_user: string
      stars: number
      text?: string
      createdAt: string
    }>
  }
  recentHistory: Array<{
    fillLevel: number
    status: string
    timestamp: string
  }>
}

export interface Collection {
  _id: string
  binId: string
  scheduledDate: string
  completedAt?: string
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled'
  notes?: string
  collectedBy?: string
  fillLevelAtSchedule?: number
  fillLevelAtCollection?: number
  autoScheduled?: boolean
  createdAt?: string
}

export interface Review {
  _id: string
  binId: string
  name_of_user: string
  stars: number
  text?: string
  createdAt: string
}

export interface HistoryDataPoint {
  timestamp: string
  fillLevel: number
}

export interface AnalyticsSummary {
  overview: {
    totalBins: number
    emptyBins: number
    fillingBins: number
    fullBins: number
    maintenanceBins: number
    binsRequiringAttention: number
    averageFillLevel: number
  }
  collections: {
    total: number
    scheduled: number
    inProgress: number
    completed: number
    avgInterval: number
  }
  reviews: {
    total: number
    averageRating: number
  }
  distribution: {
    [key: string]: number
  }
  topRatedBins?: Array<{
    binId: string
    location: string
    rating: number
    reviews: number
  }>
  urgentBins?: Array<{
    binId: string
    location: string
    fillLevel: number
    status: string
    maintenanceFlag: boolean
  }>
  trends?: Array<{
    date: string
    averageFill: number
    updates: number
  }>
}

export interface CollectionStats {
  totalCollections: number
  completedCollections: number
  pendingCollections: number
  avgResponseTime: number
  collectionsByStatus: {
    status: string
    count: number
  }[]
  collectionsByDay: {
    date: string
    count: number
  }[]
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  count?: number
}

// Form Types
export interface CreateBinForm {
  binId: string
  location: string
  latitude?: number
  longitude?: number
  threshold?: number
}

export interface UpdateBinForm {
  fillLevel: number
  binId: string
}

export interface ReviewForm {
  name_of_user: string
  stars: number
  text?: string
}
