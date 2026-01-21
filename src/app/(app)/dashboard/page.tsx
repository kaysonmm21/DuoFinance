import { getMonthlySummary, getMonthlyTransactions, getSpendingByCategory } from '@/actions/transactions'
import { getBudgetsWithSpending } from '@/actions/budgets'
import { getCategories } from '@/actions/categories'
import { DashboardContent } from '@/components/dashboard/dashboard-content'
import { FloatingAddButton } from '@/components/dashboard/floating-add-button'

export default async function DashboardPage() {
  const [summary, transactions, spendingByCategory, budgets, categories] = await Promise.all([
    getMonthlySummary(),
    getMonthlyTransactions(),
    getSpendingByCategory(),
    getBudgetsWithSpending(),
    getCategories(),
  ])

  // Calculate total budget
  const totalBudget = budgets.reduce((sum, b) => sum + Number(b.amount), 0)
  const totalSpent = budgets.reduce((sum, b) => sum + (b.spent || 0), 0)

  return (
    <>
      <DashboardContent
        income={summary.income}
        totalBudget={totalBudget}
        totalSpent={totalSpent}
        budgets={budgets}
        transactions={transactions}
        categories={categories}
      />
      <FloatingAddButton categories={categories} />
    </>
  )
}
