'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Star, MessageSquare, User, Calendar, Plus } from 'lucide-react'
import { format } from 'date-fns'
import { useState } from 'react'
import type { ReviewForm } from '@/lib/types'
import { AIReviewSummary } from './ai-review-summary'

interface BinReviewsProps {
  binId: string
}

export function BinReviews({ binId }: BinReviewsProps) {
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState<ReviewForm>({
    name_of_user: '',
    stars: 5,
    text: '',
  })
  const queryClient = useQueryClient()

  const { data: reviewsResponse, isLoading } = useQuery({
    queryKey: ['reviews', binId],
    queryFn: () => apiClient.getReviews(binId),
  })

  const addReviewMutation = useMutation({
    mutationFn: (data: ReviewForm) => apiClient.submitReview(binId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', binId] })
      queryClient.invalidateQueries({ queryKey: ['bins'] })
      setShowForm(false)
      setFormData({ name_of_user: '', stars: 5, text: '' })
    },
  })

  const reviews = reviewsResponse?.data || []

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.name_of_user.trim()) {
      addReviewMutation.mutate(formData)
    }
  }

  const renderStars = (stars: number, size: 'sm' | 'lg' = 'sm') => {
    const sizeClass = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClass} ${
              star <= stars
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-muted-foreground/30'
            }`}
          />
        ))}
      </div>
    )
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-muted/50 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.stars, 0) / reviews.length
    : 0

  return (
    <div className="space-y-4">
      {/* AI Review Summary */}
      {reviews.length > 0 && (
        <AIReviewSummary binId={binId} reviews={reviews} />
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Reviews</CardTitle>
              <CardDescription>Community feedback and ratings</CardDescription>
            </div>
            <Button onClick={() => setShowForm(!showForm)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Review
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {reviews.length > 0 && (
            <div className="mb-6 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-4xl font-bold">{avgRating.toFixed(1)}</span>
                    {renderStars(Math.round(avgRating), 'lg')}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Based on {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </div>
          )}

          {showForm && (
            <Card className="mb-6 border-primary/50">
              <CardContent className="p-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name_of_user">Your Name</Label>
                    <Input
                      id="name_of_user"
                      value={formData.name_of_user}
                      onChange={(e) => setFormData({ ...formData, name_of_user: e.target.value })}
                      placeholder="Enter your name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Rating</Label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setFormData({ ...formData, stars: star })}
                          className="hover:scale-110 transition-transform"
                        >
                          <Star
                            className={`h-8 w-8 ${
                              star <= formData.stars
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-muted-foreground/30'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="text">Comment (Optional)</Label>
                    <Textarea
                      id="text"
                      value={formData.text}
                      onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                      placeholder="Share your experience..."
                      rows={3}
                      maxLength={1000}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" disabled={addReviewMutation.isPending}>
                      {addReviewMutation.isPending ? 'Submitting...' : 'Submit Review'}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {reviews.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No reviews yet. Be the first to review!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reviews
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map((review) => (
                  <Card key={review._id} className="border-border/50">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{review.name_of_user}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(review.createdAt), 'PPP')}
                            </div>
                          </div>
                        </div>
                        {renderStars(review.stars)}
                      </div>
                      {review.text && (
                        <p className="text-sm text-muted-foreground mt-2 pl-10">
                          {review.text}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
