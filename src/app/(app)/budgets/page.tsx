import { getBudgetsWithSpending, getUnbudgetedCategories } from '@/actions/budgets'
import { BudgetsList } from '@/components/budgets/budgets-list'

export default async function BudgetsPage() {
  const [budgets, unbudgetedCategories] = await Promise.all([
    getBudgetsWithSpending(),
    getUnbudgetedCategories(),
  ])

  return <BudgetsList budgets={budgets} unbudgetedCategories={unbudgetedCategories} />
}
