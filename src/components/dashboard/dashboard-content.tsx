'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { ArrowUpRight, Target, AlertTriangle, MoreHorizontal, Pencil, Trash2, TrendingUp, TrendingDown } from 'lucide-react'
import { toast } from 'sonner'

import { formatCurrency, calculatePercentage } from '@/lib/utils'
import { deleteTransaction } from '@/actions/transactions'
import type { BudgetWithCategory, TransactionWithCategory, Category } from '@/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { TransactionForm } from '@/components/transactions/transaction-form'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface DashboardContentProps {
  income: number
  totalBudget: number
  totalSpent: number
  budgets: BudgetWithCategory[]
  transactions: TransactionWithCategory[]
  categories: Category[]
}

export function DashboardContent({
  income,
  totalBudget,
  totalSpent,
  budgets,
  transactions,
  categories,
}: DashboardContentProps) {
  const [formOpen, setFormOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<TransactionWithCategory | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const budgetPercentage = totalBudget > 0 ? calculatePercentage(totalSpent, totalBudget) : 0
  const remaining = totalBudget - totalSpent

  async function handleDelete() {
    if (!deleteId) return

    const result = await deleteTransaction(deleteId)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Transaction deleted')
    }

    setDeleteId(null)
  }

  function handleEdit(transaction: TransactionWithCategory) {
    setEditingTransaction(transaction)
    setFormOpen(true)
  }

  function handleFormClose(open: boolean) {
    setFormOpen(open)
    if (!open) {
      setEditingTransaction(null)
    }
  }

  return (
    <div className="space-y-6 stagger-children max-w-4xl mx-auto">
      {/* Greeting Header */}
      <div className="pt-2">
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground text-sm mt-1">
          {format(new Date(), 'MMMM yyyy')} Overview
        </p>
      </div>

      {/* Summary Cards - Instagram Story Style */}
      <div className="grid gap-4 grid-cols-2">
        {/* Income Card */}
        <Card className="border-0 shadow-none bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 ig-card-hover">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Income</p>
                <div>
                  <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    +{formatCurrency(income)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">This month</p>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Budget Progress Card */}
        <Card className="border-0 shadow-none bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 ig-card-hover">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-3 flex-1">
                <p className="text-sm font-medium text-violet-600 dark:text-violet-400">Budget</p>
                <div>
                  <p className="text-2xl font-bold text-violet-600 dark:text-violet-400">
                    {formatCurrency(totalSpent)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    of {formatCurrency(totalBudget)}
                  </p>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
                <Target className="h-5 w-5 text-violet-600 dark:text-violet-400" strokeWidth={2} />
              </div>
            </div>
            <div className="mt-4">
              <Progress
                value={Math.min(budgetPercentage, 100)}
                className="h-2 bg-violet-200/50 dark:bg-violet-800/30 [&>div]:bg-gradient-to-r [&>div]:from-violet-500 [&>div]:to-purple-500"
              />
              <p className="text-xs text-muted-foreground mt-2">
                {remaining >= 0
                  ? `${formatCurrency(remaining)} remaining`
                  : `${formatCurrency(Math.abs(remaining))} over budget`}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Budget Progress */}
      <Card className="border shadow-sm ig-card-hover">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold">Spending by Category</CardTitle>
          <CardDescription className="text-sm">Track your spending against each budget</CardDescription>
        </CardHeader>
        <CardContent>
          {budgets.length === 0 ? (
            <p className="text-muted-foreground text-center py-8 text-sm">
              No budgets set. Add budgets in the Categories page.
            </p>
          ) : (
            <div className="space-y-5">
              {budgets.map((budget) => {
                const spent = budget.spent || 0
                const percentage = calculatePercentage(spent, budget.amount)
                const isOverBudget = spent > budget.amount
                const isNearLimit = percentage >= 80 && !isOverBudget

                return (
                  <div key={budget.id} className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: budget.category.color + '15' }}
                        >
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: budget.category.color }}
                          />
                        </div>
                        <div>
                          <span className="font-medium text-sm">{budget.category.name}</span>
                          {isOverBudget && (
                            <AlertTriangle className="inline-block ml-1.5 h-3.5 w-3.5 text-red-500" />
                          )}
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground tabular-nums">
                        {formatCurrency(spent)} / {formatCurrency(budget.amount)}
                      </span>
                    </div>
                    <Progress
                      value={Math.min(percentage, 100)}
                      className="h-2"
                      style={{
                        ['--progress-color' as string]: isOverBudget
                          ? 'oklch(0.62 0.24 25)'
                          : isNearLimit
                          ? 'oklch(0.78 0.16 85)'
                          : budget.category.color,
                      }}
                    />
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transactions List */}
      <Card className="border shadow-sm ig-card-hover">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
          <CardDescription className="text-sm">All transactions this month</CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <p className="text-muted-foreground text-center py-8 text-sm">
              No transactions this month. Click the + button to add one.
            </p>
          ) : (
            <div className="space-y-1">
              {transactions.map((transaction, index) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 -mx-3 rounded-xl hover:bg-muted/50 transition-colors group"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex items-center gap-3">
                    {transaction.category && (
                      <div
                        className="w-11 h-11 rounded-full flex items-center justify-center transition-transform group-hover:scale-105"
                        style={{ backgroundColor: transaction.category.color + '15' }}
                      >
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: transaction.category.color }}
                        />
                      </div>
                    )}
                    {!transaction.category && (
                      <div className="w-11 h-11 rounded-full flex items-center justify-center bg-muted">
                        <div className="w-4 h-4 rounded-full bg-muted-foreground/30" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-sm">{transaction.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {transaction.category?.name || 'Uncategorized'} • {format(new Date(transaction.date), 'MMM d')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-semibold text-sm tabular-nums ${
                        transaction.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'
                      }`}
                    >
                      {transaction.type === 'income' ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl">
                        <DropdownMenuItem onClick={() => handleEdit(transaction)} className="rounded-lg">
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive rounded-lg focus:text-destructive"
                          onClick={() => setDeleteId(transaction.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Transaction Form */}
      <TransactionForm
        transaction={editingTransaction}
        categories={categories}
        open={formOpen}
        onOpenChange={handleFormClose}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this transaction? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive rounded-full hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
