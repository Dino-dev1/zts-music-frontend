'use client'

import { useAtom } from 'jotai'
import { isSidebarCollapsedAtom } from '@/lib/atoms'
import { cn } from '@/lib/utils'
import { DesktopSidebar, MobileNav, Header } from '@/components/layout'
import { ErrorBoundary } from '@/components/error-boundary'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isSidebarCollapsed] = useAtom(isSidebarCollapsedAtom)

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <DesktopSidebar />

      {/* Header */}
      <Header />

      {/* Main content */}
      <main
        className={cn(
          'pt-16 pb-20 md:pb-6 transition-all duration-300',
          'md:pl-64',
          isSidebarCollapsed && 'md:pl-20'
        )}
      >
        <div className="p-4 md:p-6">
          <ErrorBoundary>{children}</ErrorBoundary>
        </div>
      </main>

      {/* Mobile Navigation */}
      <MobileNav />
    </div>
  )
}
