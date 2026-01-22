import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { MobileNav } from '@/components/layout/mobile-nav'
import { Header } from '@/components/layout/header'
import { Toaster } from '@/components/ui/sonner'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-background">
        <Header />
        <main className="flex-1 overflow-auto p-4 md:p-6 pb-24 md:pb-6">
          {children}
        </main>
      </SidebarInset>
      <MobileNav />
      <Toaster position="top-center" />
    </SidebarProvider>
  )
}
