'use client'

import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, User, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'
import type { Collection } from '@/lib/types'

interface BinCollectionsProps {
  binId: string
}

export function BinCollections({ binId }: BinCollectionsProps) {
  const { data: collectionsResponse, isLoading } = useQuery({
    queryKey: ['collections', binId],
    queryFn: () => apiClient.getCollections(binId),
  })

  const collections = collectionsResponse?.data || []

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'Scheduled':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'In Progress':
        return <AlertCircle className="h-4 w-4 text-blue-500" />
      case 'Cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20'
      case 'Scheduled':
        return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20'
      case 'In Progress':
        return 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20'
      case 'Cancelled':
        return 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20'
      default:
        return 'bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20'
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Collections</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-muted/50 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (collections.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Collections</CardTitle>
          <CardDescription>View all collection schedules and history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No collections scheduled yet.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const sortedCollections = [...collections].sort((a, b) => 
    new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime()
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Collections</CardTitle>
            <CardDescription>View all collection schedules and history</CardDescription>
          </div>
          <Badge variant="secondary">{collections.length} total</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sortedCollections.map((collection) => (
            <Card key={collection._id} className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(collection.status)}
                      <Badge className={`${getStatusColor(collection.status)} border`}>
                        {collection.status}
                      </Badge>
                    </div>
                    
                    <div className="space-y-1.5 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>
                          Scheduled: {format(new Date(collection.scheduledDate), 'PPp')}
                        </span>
                      </div>
                      
                      {collection.completedAt && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <CheckCircle className="h-3.5 w-3.5" />
                          <span>
                            Completed: {format(new Date(collection.completedAt), 'PPp')}
                          </span>
                        </div>
                      )}
                      
                      {collection.collectedBy && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <User className="h-3.5 w-3.5" />
                          <span>Collected by: {collection.collectedBy}</span>
                        </div>
                      )}
                      
                      {collection.notes && (
                        <p className="text-muted-foreground mt-2 pl-5">
                          Note: {collection.notes}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
