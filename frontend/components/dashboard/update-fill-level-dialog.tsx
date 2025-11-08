'use client'

import { useState, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'
import type { GarbageBin } from '@/lib/types'

interface UpdateFillLevelDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  bin: GarbageBin | null
  onSuccess: () => void
}

export function UpdateFillLevelDialog({
  open,
  onOpenChange,
  bin,
  onSuccess,
}: UpdateFillLevelDialogProps) {
  const [fillLevel, setFillLevel] = useState('')

  useEffect(() => {
    if (bin && open) {
      setFillLevel(bin.fillLevel.toString())
    }
  }, [bin, open])

  const updateFillLevelMutation = useMutation({
    mutationFn: (data: any) => apiClient.updateBinFillLevel(data),
    onSuccess: () => {
      onSuccess()
      setFillLevel('')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!bin) return

    const submitData = {
      binId: bin.binId,
      fillLevel: parseInt(fillLevel),
      location: bin.location, // Include location as it may be required by API
    }

    updateFillLevelMutation.mutate(submitData)
  }

  if (!bin) return null

  const getFillLevelColor = (level: number) => {
    if (level <= 30) return 'text-green-600'
    if (level <= 60) return 'text-yellow-600'
    if (level <= 80) return 'text-orange-600'
    return 'text-red-600'
  }

  const currentLevel = parseInt(fillLevel) || 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Fill Level</DialogTitle>
          <DialogDescription>
            Update the fill level for bin {bin.binId} at {bin.location}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fillLevel">Fill Level (%)</Label>
            <Input
              id="fillLevel"
              type="number"
              min="0"
              max="100"
              value={fillLevel}
              onChange={(e) => setFillLevel(e.target.value)}
              placeholder="Enter fill level percentage"
              required
            />
          </div>

          {/* Visual Fill Level Indicator */}
          {fillLevel && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Current Level Preview</span>
                <span className={`font-medium ${getFillLevelColor(currentLevel)}`}>
                  {currentLevel}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className={`h-4 rounded-full transition-all duration-300 ${
                    currentLevel <= 30
                      ? 'bg-green-500'
                      : currentLevel <= 60
                      ? 'bg-yellow-500'
                      : currentLevel <= 80
                      ? 'bg-orange-500'
                      : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(currentLevel, 100)}%` }}
                />
              </div>
            </div>
          )}

          {/* Status Preview */}
          {fillLevel && (
            <div className="p-3 bg-gray-50 rounded-md">
              <div className="text-sm">
                <div className="flex justify-between">
                  <span>New Status:</span>
                  <span
                    className={`font-medium ${
                      currentLevel <= 60
                        ? 'text-green-600'
                        : currentLevel <= 80
                        ? 'text-yellow-600'
                        : 'text-red-600'
                    }`}
                  >
                    {currentLevel <= 60 ? 'Empty' : currentLevel <= 80 ? 'Filling' : 'Full'}
                  </span>
                </div>
                {currentLevel >= bin.threshold && (
                  <div className="text-red-600 text-xs mt-1">
                    ⚠️ Collection will be auto-scheduled (threshold: {bin.threshold}%)
                  </div>
                )}
              </div>
            </div>
          )}

          {updateFillLevelMutation.error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
              Error: {updateFillLevelMutation.error.message}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateFillLevelMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateFillLevelMutation.isPending}>
              {updateFillLevelMutation.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Update Fill Level
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}