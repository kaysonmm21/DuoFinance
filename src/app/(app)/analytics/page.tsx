import { getSpendingByCategory, getMonthlySpendingHistory, getMonthlyIncomeExpenseHistory } from '@/actions/transactions'
import { getCategories } from '@/actions/categories'
import { AnalyticsContent } from '@/components/analytics/analytics-content'

export default async function AnalyticsPage() {
  const [spendingByCategory, monthlyHistory, incomeExpenseHistory, categories] = await Promise.all([
    getSpendingByCategory(),
    getMonthlySpendingHistory(6),
    getMonthlyIncomeExpenseHistory(6),
    getCategories(),
  ])

  // Filter to expense categories only for the filter dropdown
  const expenseCategories = categories.filter(c => c.type === 'expense')

  return (
    <AnalyticsContent
      spendingByCategory={spendingByCategory}
      monthlyHistory={monthlyHistory}
      incomeExpenseHistory={incomeExpenseHistory}
      categories={expenseCategories}
    />
  )
}
