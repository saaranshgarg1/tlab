import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'empty':
      return 'text-green-600 bg-green-50 dark:bg-green-950 dark:text-green-400'
    case 'filling':
      return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950 dark:text-yellow-400'
    case 'full':
      return 'text-red-600 bg-red-50 dark:bg-red-950 dark:text-red-400'
    default:
      return 'text-gray-600 bg-gray-50 dark:bg-gray-950 dark:text-gray-400'
  }
}

export function getFillLevelColor(fillLevel: number): string {
  if (fillLevel <= 60) return '#10b981' // green
  if (fillLevel <= 80) return '#f59e0b' // yellow
  return '#ef4444' // red
}
