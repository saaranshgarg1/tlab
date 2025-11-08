'use client'

import { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Trash2, BarChart3, Settings, Recycle, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const queryClient = new QueryClient()

interface DashboardLayoutProps {
  children: ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center px-4">
            <div className="flex items-center space-x-3">
              <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Recycle className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-lg font-bold">Smart Garbage Monitor</h1>
                  <p className="text-xs text-muted-foreground">City Waste Management</p>
                </div>
              </Link>
            </div>

            <div className="flex items-center ml-auto space-x-4">
              {pathname !== '/' && (
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/">
                    <Home className="h-4 w-4 mr-2" />
                    Dashboard
                  </Link>
                </Button>
              )}
              <ThemeToggle />
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container px-4 py-6">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t py-6 mt-12">
          <div className="container px-4 text-center text-sm text-muted-foreground">
            <p>Smart Garbage Monitoring System © {new Date().getFullYear()}</p>
          </div>
        </footer>
      </div>
    </QueryClientProvider>
  )
}