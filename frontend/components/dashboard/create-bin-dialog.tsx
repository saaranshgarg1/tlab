'use client'

import { useState } from 'react'
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

interface CreateBinDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function CreateBinDialog({ open, onOpenChange, onSuccess }: CreateBinDialogProps) {
  const [formData, setFormData] = useState({
    binId: '',
    location: '',
    lat: '',
    lng: '',
    threshold: '60',
    label: '',
  })

  const createBinMutation = useMutation({
    mutationFn: (data: any) => apiClient.createBin(data),
    onSuccess: () => {
      onSuccess()
      setFormData({
        binId: '',
        location: '',
        lat: '',
        lng: '',
        threshold: '60',
        label: '',
      })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const submitData = {
      binId: formData.binId,
      location: formData.location,
      ...(formData.lat && { lat: parseFloat(formData.lat) }),
      ...(formData.lng && { lng: parseFloat(formData.lng) }),
      threshold: parseInt(formData.threshold),
      ...(formData.label && { label: formData.label }),
    }

    createBinMutation.mutate(submitData)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Bin</DialogTitle>
          <DialogDescription>
            Add a new garbage bin to the monitoring system.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="binId" className="text-right">
              Bin ID *
            </Label>
            <Input
              id="binId"
              placeholder="BIN-001"
              value={formData.binId}
              onChange={(e) => handleInputChange('binId', e.target.value)}
              className="col-span-3"
              required
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="location" className="text-right">
              Location *
            </Label>
            <Input
              id="location"
              placeholder="Main Street, Block A"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              className="col-span-3"
              required
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="label" className="text-right">
              Label
            </Label>
            <Input
              id="label"
              placeholder="Optional description"
              value={formData.label}
              onChange={(e) => handleInputChange('label', e.target.value)}
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lat">Latitude</Label>
              <Input
                id="lat"
                type="number"
                step="any"
                placeholder="40.7128"
                value={formData.lat}
                onChange={(e) => handleInputChange('lat', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lng">Longitude</Label>
              <Input
                id="lng"
                type="number"
                step="any"
                placeholder="-74.0060"
                value={formData.lng}
                onChange={(e) => handleInputChange('lng', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="threshold" className="text-right">
              Threshold %
            </Label>
            <Input
              id="threshold"
              type="number"
              min="1"
              max="100"
              value={formData.threshold}
              onChange={(e) => handleInputChange('threshold', e.target.value)}
              className="col-span-3"
              required
            />
          </div>

          {createBinMutation.error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
              Error: {createBinMutation.error.message}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createBinMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createBinMutation.isPending}>
              {createBinMutation.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Create Bin
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}