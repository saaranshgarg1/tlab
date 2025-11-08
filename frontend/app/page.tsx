'use client'

import { DashboardLayout } from '@/components/dashboard/layout'
import { BinsOverview } from '@/components/dashboard/bins-overview'
import { Analytics } from '@/components/dashboard/analytics'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BarChart3, Trash2, Activity } from 'lucide-react'

export default function Home() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-lg text-muted-foreground">
            Monitor and manage garbage bins across your city
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="overview" className="gap-2">
              <Activity className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="bins" className="gap-2">
              <Trash2 className="h-4 w-4" />
              Bins
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <Analytics />
            <BinsOverview />
          </TabsContent>
          
          <TabsContent value="bins" className="space-y-6">
            <BinsOverview />
          </TabsContent>
          
          <TabsContent value="analytics" className="space-y-6">
            <Analytics />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
