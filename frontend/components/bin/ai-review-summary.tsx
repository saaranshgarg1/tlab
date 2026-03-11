'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Sparkles, Loader2, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Review } from '@/lib/types'

interface AIReviewSummaryProps {
  binId: string
  reviews: Review[]
}

export function AIReviewSummary({ binId, reviews }: AIReviewSummaryProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [summary, setSummary] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const hasGeneratedRef = useRef(false)

  const generateSummary = async () => {
    if (reviews.length === 0) {
      setError('No reviews available to summarize')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/ai/summarize-reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ binId, reviews }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate AI summary')
      }

      const data = await response.json()
      setSummary(data.summary)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  // Auto-generate summary on mount (only once)
  useEffect(() => {
    if (!hasGeneratedRef.current && reviews.length > 0) {
      hasGeneratedRef.current = true
      generateSummary()
    }
  }, [reviews.length])

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
      },
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: { duration: 0.3 },
    },
  }

  const shimmerVariants = {
    initial: { backgroundPosition: '-200% 0' },
    animate: {
      backgroundPosition: '200% 0',
      transition: {
        duration: 2,
        ease: 'linear',
        repeat: Infinity,
      },
    },
  }

  const sparkleVariants = {
    initial: { scale: 0, rotate: 0 },
    animate: {
      scale: [0, 1, 1, 0],
      rotate: [0, 180, 360],
      transition: {
        duration: 2,
        ease: 'easeInOut',
        repeat: Infinity,
      },
    },
  }

  const textRevealVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.01,
      },
    },
  }

  const charVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.05 },
    },
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <Card className="border-2 border-purple-500/20 bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5 relative overflow-hidden">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-purple-500/10 opacity-50" />
        
        {/* Sparkle effects */}
        <motion.div
          className="absolute top-4 right-4 text-purple-500"
          variants={sparkleVariants}
          initial="initial"
          animate="animate"
        >
          <Sparkles className="h-6 w-6" />
        </motion.div>
        
        <CardHeader className="relative">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <motion.div
              animate={{
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </motion.div>
            AI Review Summary
            <motion.div
              className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white"
              animate={{
                scale: [1, 1.05, 1],
                opacity: [1, 0.8, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              Powered by Gemini
            </motion.div>
          </CardTitle>
        </CardHeader>

        <CardContent className="relative">
          <AnimatePresence mode="wait">
            {isLoading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                {[1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    className="h-4 rounded-lg overflow-hidden bg-gradient-to-r from-purple-200/50 via-blue-200/50 to-purple-200/50 dark:from-purple-900/20 dark:via-blue-900/20 dark:to-purple-900/20"
                    style={{ width: `${100 - i * 10}%` }}
                    variants={shimmerVariants}
                    initial="initial"
                    animate="animate"
                    transition={{ delay: i * 0.1 }}
                  />
                ))}
              </motion.div>
            )}

            {error && (
              <motion.div
                key="error"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-700 dark:text-red-400"
              >
                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Error</p>
                  <p className="text-sm">{error}</p>
                </div>
              </motion.div>
            )}

            {summary && !isLoading && (
              <motion.div
                key="summary"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="space-y-4"
              >
                <motion.div
                  className="relative p-6 rounded-xl bg-gradient-to-br from-white/80 to-purple-50/50 dark:from-gray-900/80 dark:to-purple-950/20 border border-purple-200/50 dark:border-purple-800/30 backdrop-blur-sm"
                  initial={{ boxShadow: '0 0 0 0 rgba(168, 85, 247, 0)' }}
                  animate={{
                    boxShadow: [
                      '0 0 0 0 rgba(168, 85, 247, 0)',
                      '0 0 20px 5px rgba(168, 85, 247, 0.2)',
                      '0 0 0 0 rgba(168, 85, 247, 0)',
                    ],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  {/* Decorative corner elements */}
                  <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-purple-400/40 rounded-tl-xl" />
                  <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-blue-400/40 rounded-br-xl" />
                  
                  <motion.div
                    variants={textRevealVariants}
                    initial="hidden"
                    animate="visible"
                    className="text-base leading-relaxed text-gray-800 dark:text-gray-200 whitespace-pre-wrap"
                  >
                    {summary.split('').map((char, index) => (
                      <motion.span key={index} variants={charVariants}>
                        {char}
                      </motion.span>
                    ))}
                  </motion.div>

                  {/* Floating particles effect */}
                  <motion.div
                    className="absolute top-4 right-4 w-2 h-2 rounded-full bg-purple-400/60"
                    animate={{
                      y: [0, -10, 0],
                      opacity: [0.6, 1, 0.6],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />
                  <motion.div
                    className="absolute bottom-8 left-8 w-1.5 h-1.5 rounded-full bg-blue-400/60"
                    animate={{
                      y: [0, -8, 0],
                      opacity: [0.6, 1, 0.6],
                    }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: 0.5,
                    }}
                  />
                </motion.div>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-xs text-muted-foreground italic text-center"
                >
                  ✨ Generated by Gemini AI based on {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                </motion.p>
              </motion.div>
            )}


          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  )
}
