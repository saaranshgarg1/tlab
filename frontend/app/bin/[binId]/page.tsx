'use client'

import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { DashboardLayout } from '@/components/dashboard/layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  MapPin, Trash2, AlertCircle, TrendingUp, Calendar, 
  Star, MessageSquare, ArrowLeft, Clock, Activity,
  BarChart3, Users
} from 'lucide-react'
import Link from 'next/link'
import { use } from 'react'
import { motion } from 'framer-motion'
import { BinHistory } from '@/components/bin/bin-history'
import { BinReviews } from '@/components/bin/bin-reviews'
import { BinCollections } from '@/components/bin/bin-collections'
import { format } from 'date-fns'

function BinPageContent({ binId }: { binId: string }) {
  const { data: statsResponse, isLoading } = useQuery({
    queryKey: ['bin-stats', binId],
    queryFn: () => apiClient.getBinStats(binId),
    refetchInterval: 100,
  })

  const stats = statsResponse?.data

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Empty':
        return 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20'
      case 'Filling':
        return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20'
      case 'Maintenance':
        return 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20'
      case 'Full':
        return 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20'
      default:
        return 'bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20'
    }
  }

  const getFillLevelColor = (fillLevel: number) => {
    if (fillLevel < 5) return 'bg-green-500'
    if (fillLevel < 60) return 'bg-yellow-500'
    if (fillLevel <= 90) return 'bg-orange-500'
    return 'bg-red-500'
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-muted/50 rounded-lg animate-pulse w-1/3"></div>
        <div className="h-64 bg-muted/50 rounded-lg animate-pulse"></div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted">
          <Trash2 className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Bin not found</h3>
        <p className="text-muted-foreground mb-4">The bin with ID {binId} does not exist.</p>
        <Button asChild>
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
      </div>
    )
  }

  const bin = stats.binInfo
  const fillStats = stats.fillLevelStats
  const collectionStats = stats.collectionStats

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{bin.binId}</h1>
            <div className="flex items-center gap-2 text-muted-foreground mt-1">
              <MapPin className="h-4 w-4" />
              <span>{bin.location}</span>
              {bin.label && <Badge variant="outline" className="ml-2">{bin.label}</Badge>}
            </div>
          </div>
        </div>
        <Badge className={`${getStatusColor(bin.status)} border text-base px-4 py-2`}>
          {bin.status}
        </Badge>
      </div>

      {/* Main Stats - Enhanced with new data */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Fill Level</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{bin.currentFillLevel}%</div>
              <div className="mt-3 w-full bg-muted rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${getFillLevelColor(bin.currentFillLevel)}`}
                  style={{ width: `${Math.min(bin.currentFillLevel, 100)}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Threshold: {bin.threshold}%
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Collections</CardTitle>
              <Trash2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{collectionStats.totalCollections}</div>
              <p className="text-xs text-muted-foreground mt-2">
                {collectionStats.upcomingCollections > 0 
                  ? `${collectionStats.upcomingCollections} upcoming`
                  : 'No upcoming collections'}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rating</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {stats.reviewStats.averageRating > 0 ? stats.reviewStats.averageRating.toFixed(1) : 'N/A'}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {stats.reviewStats.totalReviews} review{stats.reviewStats.totalReviews !== 1 ? 's' : ''}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Fill Trend</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {fillStats.fillRateTrend > 0 ? '+' : ''}{fillStats.fillRateTrend.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                vs. previous week
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Additional Insights Row */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Average Fill Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fillStats.averageFillRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground mt-1">Overall average</p>
            <div className="mt-3 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Last week:</span>
                <span className="font-medium">{fillStats.lastWeekAverage}%</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Previous week:</span>
                <span className="font-medium">{fillStats.previousWeekAverage}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Next Collection</CardTitle>
          </CardHeader>
          <CardContent>
            {collectionStats.nextScheduledCollection ? (
              <>
                <div className="text-2xl font-bold">
                  {format(new Date(collectionStats.nextScheduledCollection), 'MMM dd')}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {format(new Date(collectionStats.nextScheduledCollection), 'yyyy, h:mm a')}
                </p>
              </>
            ) : collectionStats.predictedNextCollection ? (
              <>
                <div className="text-2xl font-bold">
                  {format(new Date(collectionStats.predictedNextCollection), 'MMM dd')}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Predicted (in ~{collectionStats.averageTimeToFill} days)
                </p>
              </>
            ) : (
              <div className="text-sm text-muted-foreground">Not scheduled</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Last Collection</CardTitle>
          </CardHeader>
          <CardContent>
            {collectionStats.lastCollectionDate ? (
              <>
                <div className="text-2xl font-bold">
                  {format(new Date(collectionStats.lastCollectionDate), 'MMM dd')}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {format(new Date(collectionStats.lastCollectionDate), 'yyyy, h:mm a')}
                </p>
                {collectionStats.averageTimeToFill && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Avg. interval: {collectionStats.averageTimeToFill} days
                  </p>
                )}
              </>
            ) : (
              <div className="text-sm text-muted-foreground">Never collected</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {(bin.currentFillLevel >= bin.threshold || bin.maintenanceFlag) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          {bin.currentFillLevel >= bin.threshold && (
            <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-700 dark:text-red-400">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <div>
                <p className="font-semibold">Collection Required</p>
                <p className="text-sm">This bin has exceeded the threshold and needs to be emptied.</p>
              </div>
            </div>
          )}
          
          {bin.maintenanceFlag && (
            <div className="flex items-center gap-3 p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg text-orange-700 dark:text-orange-400">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <div>
                <p className="font-semibold">Maintenance Required</p>
                <p className="text-sm">This bin has been flagged for maintenance.</p>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Details Tabs */}
      <Tabs defaultValue="history" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="history">
            <BarChart3 className="h-4 w-4 mr-2" />
            History
          </TabsTrigger>
          <TabsTrigger value="collections">
            <Calendar className="h-4 w-4 mr-2" />
            Collections
          </TabsTrigger>
          <TabsTrigger value="reviews">
            <MessageSquare className="h-4 w-4 mr-2" />
            Reviews
          </TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="space-y-4">
          <BinHistory binId={bin.binId} />
        </TabsContent>

        <TabsContent value="collections" className="space-y-4">
          <BinCollections binId={bin.binId} />
        </TabsContent>

        <TabsContent value="reviews" className="space-y-4">
          <BinReviews binId={bin.binId} />
        </TabsContent>
      </Tabs>

      {/* Additional Info */}
      <Card>
        <CardHeader>
          <CardTitle>System Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-border/50">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Activity className="h-4 w-4" />
              <span>Data Points</span>
            </div>
            <span className="font-medium">
              {fillStats.historyDataPoints} entries
            </span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-border/50">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Last Updated</span>
            </div>
            <span className="font-medium">
              {format(new Date(bin.lastUpdated), 'PPpp')}
            </span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-border/50">
            <div className="flex items-center gap-2 text-muted-foreground">
              <AlertCircle className="h-4 w-4" />
              <span>Threshold</span>
            </div>
            <span className="font-medium">
              {bin.threshold}%
            </span>
          </div>
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>Recent Collections</span>
            </div>
            <span className="font-medium">
              {collectionStats.recentCollections.length} logged
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function BinPage({ params }: { params: Promise<{ binId: string }> }) {
  const { binId } = use(params)

  return (
    <DashboardLayout>
      <BinPageContent binId={binId} />
    </DashboardLayout>
  )
}
