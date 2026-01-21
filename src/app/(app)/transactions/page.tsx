import { getTransactions } from '@/actions/transactions'
import { getCategories } from '@/actions/categories'
import { TransactionsList } from '@/components/transactions/transactions-list'

export default async function TransactionsPage() {
  const [transactions, categories] = await Promise.all([
    getTransactions(),
    getCategories(),
  ])

  return <TransactionsList transactions={transactions} categories={categories} />
}
