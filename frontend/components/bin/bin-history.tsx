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

  const history = historyResponse?.data?.series || []

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

  const chartData = history.map((point: any) => ({
    timestamp: format(new Date(point.timestamp), 'MMM dd, HH:mm'),
    fillLevel: point.fillLevel,
    date: new Date(point.timestamp)
  })).sort((a: any, b: any) => a.date.getTime() - b.date.getTime())

  const trend = history.length >= 2 
    ? history[history.length - 1].fillLevel - history[0].fillLevel
    : 0

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
            <p className="text-2xl font-bold">{history.length}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Average</p>
            <p className="text-2xl font-bold">
              {(history.reduce((sum: number, p: any) => sum + p.fillLevel, 0) / history.length).toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Latest</p>
            <p className="text-2xl font-bold">{history[history.length - 1].fillLevel}%</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
