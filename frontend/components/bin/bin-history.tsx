'use client'

import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
import { Activity, TrendingUp, TrendingDown } from 'lucide-react'
import { format } from 'date-fns'

interface BinHistoryProps {
  binId: string
}

export function BinHistory({ binId }: BinHistoryProps) {
  const { data: historyResponse, isLoading } = useQuery({
    queryKey: ['history', binId],
    queryFn: () => apiClient.getBinHistory(binId),
  })

  console.log('Bin history response:', historyResponse)
  const history = historyResponse?.series || []

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Fill Level History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-muted/50 rounded-lg animate-pulse"></div>
        </CardContent>
      </Card>
    )
  }

  if (history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Fill Level History</CardTitle>
          <CardDescription>Track fill level changes over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No history data available yet.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Normalize keys and filter invalid entries
  const normalized = history
    .map((p: any) => ({
      ts: p.ts ?? p.timestamp,
      fill: typeof p.fill === 'number' ? p.fill : (typeof p.fillLevel === 'number' ? p.fillLevel : NaN),
    }))
    .filter((p: any) => p.ts && !Number.isNaN(p.fill))
    .sort((a: any, b: any) => new Date(a.ts).getTime() - new Date(b.ts).getTime())

  // Smoothing helper: small moving-average blend, and suppress very large spikes slightly.
  function smoothValues(values: number[], radius = 1, outlierThreshold = 20) {
    if (values.length === 0) return values
    return values.map((v, i) => {
      const start = Math.max(0, i - radius)
      const end = Math.min(values.length - 1, i + radius)
      const window = values.slice(start, end + 1)
      const avg = window.reduce((s, x) => s + x, 0) / window.length
      // Blend slightly with local average to smooth; if the point is a huge spike (> threshold) use the avg
      if (Math.abs(v - avg) > outlierThreshold) return avg
      // slight smoothing: keep most of original, mix small part of average
      return avg 
    })
  }

  const rawFills = normalized.map((p: any) => p.fill)
  const smoothedFills = smoothValues(rawFills, 20, 5) // radius 2, outlier threshold 5 percentage points

  const chartData = normalized.map((p: any, idx: number) => ({
    timestamp: format(new Date(p.ts), 'MMM dd, HH:mm'),
    fillLevel: Number(smoothedFills[idx].toFixed(2)),
    date: new Date(p.ts),
  }))

  // Metrics come from chartData (normalized + smoothed)
  const dataPoints = chartData.length
  const average = dataPoints > 0 ? chartData.reduce((sum, d) => sum + d.fillLevel, 0) / dataPoints : 0
  const latest = dataPoints > 0 ? chartData[dataPoints - 1].fillLevel : 0
  const first = dataPoints > 0 ? chartData[0].fillLevel : 0
  const trend = dataPoints >= 2 ? latest - first : 0

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Fill Level History</CardTitle>
            <CardDescription>Track fill level changes over time</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {trend > 0 ? (
              <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm font-medium">+{trend.toFixed(1)}%</span>
              </div>
            ) : trend < 0 ? (
              <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                <TrendingDown className="h-4 w-4" />
                <span className="text-sm font-medium">{trend.toFixed(1)}%</span>
              </div>
            ) : null}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="fillGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="timestamp"
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                domain={[0, 100]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '0.5rem',
                }}
                labelStyle={{ color: 'hsl(var(--popover-foreground))' }}
              />
              <Area
                type="monotone"
                dataKey="fillLevel"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#fillGradient)"
                name="Fill Level (%)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-sm text-muted-foreground">Data Points</p>
            <p className="text-2xl font-bold">{dataPoints}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Average</p>
            <p className="text-2xl font-bold">
              {average.toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Latest</p>
            <p className="text-2xl font-bold">{latest}%</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
