'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  ArrowLeftRight,
  Tags,
  BarChart3,
  Settings,
  LogOut,
  Wallet,
} from 'lucide-react'

import { signOut } from '@/actions/auth'
import { cn } from '@/lib/utils'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'

const navItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Transactions',
    href: '/transactions',
    icon: ArrowLeftRight,
  },
  {
    title: 'Categories',
    href: '/categories',
    icon: Tags,
  },
  {
    title: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
  },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar className="border-r-0">
      <SidebarHeader className="px-6 py-6">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl ig-gradient flex items-center justify-center shadow-lg shadow-primary/20 group-hover:shadow-primary/30 transition-shadow duration-300">
              <Wallet className="h-5 w-5 text-white" strokeWidth={2} />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight">DuoFinance</span>
            <span className="text-xs text-muted-foreground">Budget Tracker</span>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent className="px-3">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={cn(
                        'h-11 px-4 rounded-xl transition-all duration-200',
                        isActive
                          ? 'bg-primary/10 text-primary font-semibold hover:bg-primary/15'
                          : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                      )}
                    >
                      <Link href={item.href} className="flex items-center gap-3">
                        <item.icon
                          className={cn(
                            'h-5 w-5 transition-all duration-200',
                            isActive && 'text-primary'
                          )}
                          strokeWidth={isActive ? 2.5 : 1.5}
                        />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <form action={signOut}>
          <Button
            variant="ghost"
            className="w-full justify-start h-11 px-4 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
            type="submit"
          >
            <LogOut className="mr-3 h-5 w-5" strokeWidth={1.5} />
            Sign Out
          </Button>
        </form>
      </SidebarFooter>
    </Sidebar>
  )
}
