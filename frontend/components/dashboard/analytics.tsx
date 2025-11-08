'use client'

import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts'
import { 
  Trash2, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  BarChart3
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useState } from 'react'

export function Analytics() {
  const [trendDays, setTrendDays] = useState(7)

  const { data: analyticsResponse, isLoading } = useQuery({
    queryKey: ['analytics', 'summary'],
    queryFn: () => apiClient.getAnalyticsSummary(),
  })

  const analytics = analyticsResponse?.data

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-muted/50 rounded animate-pulse w-20"></div>
              <div className="h-4 w-4 bg-muted/50 rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted/50 rounded animate-pulse mb-2"></div>
              <div className="h-3 bg-muted/50 rounded animate-pulse w-16"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <BarChart3 className="h-12 w-12 mx-auto mb-4" />
            <p>No analytics data available</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Prepare chart data
  const statusDistribution = [
    { name: 'Empty', value: analytics.overview.emptyBins, color: 'hsl(142, 76%, 36%)' },
    { name: 'Filling', value: analytics.overview.fillingBins, color: 'hsl(30, 80%, 55%)' },
    { name: 'Full', value: analytics.overview.fullBins, color: 'hsl(0, 84%, 60%)' },
    { name: 'Maintenance', value: analytics.overview.maintenanceBins, color: 'hsl(280, 65%, 60%)' },
  ]

  const fillLevelDistribution = Object.entries(analytics.distribution).map(([range, count]) => ({
    range,
    count: count as number,
  }))

  const allTrendData = analytics.trends || []
  const trendData = allTrendData.slice(-trendDays)

  const trendDayOptions = [7, 14, 30, 60, 90]

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bins</CardTitle>
              <div className="p-2 bg-primary/10 rounded-lg">
                <Trash2 className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{analytics.overview.totalBins}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Across all locations
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Fill Level</CardTitle>
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <TrendingUp className="h-4 w-4 text-blue-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{analytics.overview.averageFillLevel}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                System-wide average
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Needs Attention</CardTitle>
              <div className="p-2 bg-red-500/10 rounded-lg">
                <AlertCircle className="h-4 w-4 text-red-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                {analytics.overview.binsRequiringAttention}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Full or maintenance
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Collections</CardTitle>
              <div className="p-2 bg-green-500/10 rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{analytics.collections.completed}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {analytics.collections.scheduled} scheduled
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Status Distribution Pie Chart */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Bin Status Distribution</CardTitle>
            <CardDescription>Current status of all bins</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '0.5rem',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              {statusDistribution.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-muted-foreground">{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Fill Level Distribution Bar Chart */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Fill Level Distribution</CardTitle>
            <CardDescription>Number of bins by fill level range</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={fillLevelDistribution}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="range" 
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '0.5rem',
                  }}
                />
                <Bar dataKey="count" fill="hsl(220, 90%, 56%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Trends Chart */}
      {trendData.length > 0 && (
        <Card className="border-border/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Fill Level Trend</CardTitle>
                <CardDescription>Average fill level over the last {trendDays} days</CardDescription>
              </div>
              <div className="flex gap-2">
                {trendDayOptions.map((days) => (
                  <Button
                    key={days}
                    variant={trendDays === days ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTrendDays(days)}
                    disabled={allTrendData.length < days}
                  >
                    {days}d
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(220, 90%, 56%)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(220, 90%, 56%)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  domain={[0, 100]}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '0.5rem',
                  }}
                />
                <Area
                  type="monotone" 
                  dataKey="averageFill" 
                  stroke="hsl(220, 90%, 56%)" 
                  strokeWidth={2}
                  fill="url(#colorFill)"
                  name="Average Fill Level (%)"
                  dot={{ fill: 'hsl(220, 90%, 56%)', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Urgent Attention Required */}
      {analytics.urgentBins && analytics.urgentBins.length > 0 && (
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Bins Requiring Urgent Attention
            </CardTitle>
            <CardDescription>These bins need immediate collection or maintenance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.urgentBins.map((bin: any) => (
                <div
                  key={bin.binId}
                  className="flex items-center justify-between p-4 bg-red-500/10 border border-red-500/20 rounded-lg"
                >
                  <div>
                    <div className="font-semibold text-red-700 dark:text-red-400">{bin.binId}</div>
                    <div className="text-sm text-muted-foreground">{bin.location}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">{bin.fillLevel}%</div>
                    <div className="text-xs text-muted-foreground">{bin.status}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Rated Bins */}
      {analytics.topRatedBins && analytics.topRatedBins.length > 0 && (
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Top Rated Bins
            </CardTitle>
            <CardDescription>Best performing bins based on community ratings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2">
              {analytics.topRatedBins.map((bin: any) => (
                <div
                  key={bin.binId}
                  className="flex items-center justify-between p-4 bg-green-500/10 border border-green-500/20 rounded-lg"
                >
                  <div>
                    <div className="font-semibold text-green-700 dark:text-green-400">{bin.binId}</div>
                    <div className="text-sm text-muted-foreground">{bin.location}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">⭐ {bin.rating}</div>
                    <div className="text-xs text-muted-foreground">{bin.reviews} reviews</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}