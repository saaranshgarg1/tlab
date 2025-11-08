'use client'

import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, MapPin, Trash2, AlertCircle, Eye, TrendingUp } from 'lucide-react'
import { useState } from 'react'
import { CreateBinDialog } from './create-bin-dialog'
import { UpdateFillLevelDialog } from './update-fill-level-dialog'
import type { GarbageBin } from '@/lib/types'
import Link from 'next/link'
import { motion } from 'framer-motion'

export function BinsOverview() {
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showUpdateDialog, setShowUpdateDialog] = useState(false)
  const [selectedBin, setSelectedBin] = useState<GarbageBin | null>(null)

  const { data: binsResponse, isLoading, refetch } = useQuery({
    queryKey: ['bins'],
    queryFn: () => apiClient.getBins(),
  })

  const bins = binsResponse?.data || []

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
      <Card>
        <CardHeader>
          <CardTitle>Loading bins...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-muted/50 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2 text-2xl">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Trash2 className="h-5 w-5 text-primary" />
            </div>
            Garbage Bins
            <Badge variant="secondary" className="ml-2">{bins.length}</Badge>
          </CardTitle>
          <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Bin
          </Button>
        </CardHeader>
        <CardContent>
          {bins.length === 0 ? (
            <div className="text-center py-12">
              <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted">
                <Trash2 className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No bins found</h3>
              <p className="text-muted-foreground mb-4">Add your first bin to get started with waste management.</p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Bin
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {bins.map((bin, index) => (
                <motion.div
                  key={bin.binId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card className="group hover:shadow-lg hover:border-primary/50 transition-all duration-300 overflow-hidden">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg mb-1">{bin.binId}</h3>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5 mr-1" />
                            {bin.location}
                          </div>
                        </div>
                        <Badge className={`${getStatusColor(bin.status)} border`}>
                          {bin.status}
                        </Badge>
                      </div>

                      {/* Fill Level Progress */}
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Fill Level</span>
                          <span className="font-semibold">{bin.fillLevel}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(bin.fillLevel, 100)}%` }}
                            transition={{ duration: 0.8, delay: index * 0.05 }}
                            className={`h-2.5 rounded-full transition-all duration-300 ${getFillLevelColor(
                              bin.fillLevel
                            )}`}
                          />
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-3 mb-4 py-3 border-y border-border/50">
                        <div className="text-center">
                          <div className="text-lg font-bold">{bin.stats.totalCollections}</div>
                          <div className="text-xs text-muted-foreground">Collections</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold">
                            {bin.stats.averageRating > 0 ? bin.stats.averageRating.toFixed(1) : 'N/A'}
                          </div>
                          <div className="text-xs text-muted-foreground">Rating</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold">{bin.stats.totalReviews}</div>
                          <div className="text-xs text-muted-foreground">Reviews</div>
                        </div>
                      </div>

                      {/* Alerts */}
                      {bin.fillLevel >= bin.threshold && (
                        <div className="flex items-center gap-2 mb-3 p-2.5 bg-red-500/10 border border-red-500/20 rounded-lg text-red-700 dark:text-red-400 text-sm">
                          <AlertCircle className="h-4 w-4 flex-shrink-0" />
                          <span>Requires collection</span>
                        </div>
                      )}
                      
                      {bin.maintenanceFlag && (
                        <div className="flex items-center gap-2 mb-3 p-2.5 bg-orange-500/10 border border-orange-500/20 rounded-lg text-orange-700 dark:text-orange-400 text-sm">
                          <AlertCircle className="h-4 w-4 flex-shrink-0" />
                          <span>Needs maintenance</span>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            setSelectedBin(bin)
                            setShowUpdateDialog(true)
                          }}
                        >
                          <TrendingUp className="h-4 w-4 mr-2" />
                          Update
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          asChild
                          className="flex-1"
                        >
                          <Link href={`/bin/${bin.binId}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <CreateBinDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={() => {
          setShowCreateDialog(false)
          refetch()
        }}
      />

      <UpdateFillLevelDialog
        open={showUpdateDialog}
        onOpenChange={setShowUpdateDialog}
        bin={selectedBin}
        onSuccess={() => {
          setShowUpdateDialog(false)
          setSelectedBin(null)
          refetch()
        }}
      />
    </>
  )
}