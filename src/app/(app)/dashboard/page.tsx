import { getMonthlySummary, getRecentTransactions, getSpendingByCategory } from '@/actions/transactions'
import { getBudgetsWithSpending } from '@/actions/budgets'
import { SummaryCards } from '@/components/dashboard/summary-cards'
import { SpendingChart } from '@/components/dashboard/spending-chart'
import { BudgetProgress } from '@/components/dashboard/budget-progress'
import { RecentTransactions } from '@/components/dashboard/recent-transactions'

export default async function DashboardPage() {
  const [summary, recentTransactions, spendingByCategory, budgets] = await Promise.all([
    getMonthlySummary(),
    getRecentTransactions(5),
    getSpendingByCategory(),
    getBudgetsWithSpending(),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Welcome back!</h2>
        <p className="text-muted-foreground">Here&apos;s an overview of your finances this month.</p>
      </div>

      <SummaryCards
        income={summary.income}
        expense={summary.expense}
        balance={summary.balance}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <SpendingChart data={spendingByCategory} />
        <BudgetProgress budgets={budgets} />
      </div>

      <RecentTransactions transactions={recentTransactions} />
    </div>
  )
}
