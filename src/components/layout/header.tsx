'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Wallet } from 'lucide-react'

import { SidebarTrigger } from '@/components/ui/sidebar'

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/transactions': 'Transactions',
  '/categories': 'Categories',
  '/analytics': 'Analytics',
  '/settings': 'Settings',
}

export function Header() {
  const pathname = usePathname()
  const title = pageTitles[pathname] || 'DuoFinance'

  return (
    <header className="sticky top-0 z-40 glass border-b border-border/50">
      <div className="flex h-14 items-center justify-between px-4">
        {/* Mobile: Logo centered, menu trigger left */}
        <div className="flex items-center gap-3 md:hidden">
          <SidebarTrigger className="h-9 w-9 rounded-xl hover:bg-muted transition-colors" />
        </div>

        {/* Mobile logo */}
        <Link href="/dashboard" className="flex items-center gap-2 md:hidden">
          <div className="w-8 h-8 rounded-lg ig-gradient flex items-center justify-center">
            <Wallet className="h-4 w-4 text-white" strokeWidth={2} />
          </div>
          <span className="font-bold text-lg tracking-tight">DuoFinance</span>
        </Link>

        {/* Desktop: Page title */}
        <div className="hidden md:flex items-center gap-3">
          <SidebarTrigger className="h-9 w-9 rounded-xl hover:bg-muted transition-colors" />
          <div className="h-6 w-px bg-border/50" />
          <h1 className="text-lg font-semibold">{title}</h1>
        </div>

        {/* Spacer for mobile (right side) */}
        <div className="w-9 md:hidden" />
      </div>
    </header>
  )
}
