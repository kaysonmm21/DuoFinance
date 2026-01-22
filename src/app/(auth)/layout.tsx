import { Wallet } from 'lucide-react'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl ig-gradient mb-4 shadow-lg shadow-primary/20">
            <Wallet className="h-8 w-8 text-white" strokeWidth={2} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">DuoFinance</h1>
          <p className="text-muted-foreground mt-2 text-sm">Take control of your finances</p>
        </div>
        {children}
      </div>
    </div>
  )
}
