'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { ArrowUpCircle, Target, AlertTriangle, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold mb-2">Dashboard</h2>
        <p className="text-muted-foreground">
          {format(new Date(), 'MMMM yyyy')} Overview
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Income Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
            <ArrowUpCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              +{formatCurrency(income)}
            </div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        {/* Budget Progress Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Budget</CardTitle>
            <Target className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-baseline justify-between">
              <div className="text-2xl font-bold">
                {formatCurrency(totalSpent)}
              </div>
              <div className="text-sm text-muted-foreground">
                of {formatCurrency(totalBudget)}
              </div>
            </div>
            <Progress
              value={Math.min(budgetPercentage, 100)}
              className={
                budgetPercentage > 100
                  ? '[&>div]:bg-red-500'
                  : budgetPercentage >= 80
                  ? '[&>div]:bg-yellow-500'
                  : '[&>div]:bg-green-500'
              }
            />
            <p className="text-xs text-muted-foreground">
              {remaining >= 0
                ? `${formatCurrency(remaining)} remaining`
                : `${formatCurrency(Math.abs(remaining))} over budget`}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Category Budget Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Spending by Category</CardTitle>
          <CardDescription>Track your spending against each budget</CardDescription>
        </CardHeader>
        <CardContent>
          {budgets.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No budgets set. Add budgets in the Categories page.
            </p>
          ) : (
            <div className="space-y-4">
              {budgets.map((budget) => {
                const spent = budget.spent || 0
                const percentage = calculatePercentage(spent, budget.amount)
                const isOverBudget = spent > budget.amount

                return (
                  <div key={budget.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: budget.category.color }}
                        />
                        <span className="font-medium text-sm">{budget.category.name}</span>
                        {isOverBudget && (
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {formatCurrency(spent)} / {formatCurrency(budget.amount)}
                      </span>
                    </div>
                    <Progress
                      value={Math.min(percentage, 100)}
                      className={
                        isOverBudget
                          ? '[&>div]:bg-red-500'
                          : percentage >= 80
                          ? '[&>div]:bg-yellow-500'
                          : ''
                      }
                    />
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transactions List */}
      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
          <CardDescription>All transactions this month</CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No transactions this month. Click the + button to add one.
            </p>
          ) : (
            <div className="space-y-2">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {transaction.category && (
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: transaction.category.color + '20' }}
                      >
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: transaction.category.color }}
                        />
                      </div>
                    )}
                    {!transaction.category && (
                      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-muted">
                        <div className="w-4 h-4 rounded-full bg-gray-400" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {transaction.category?.name || 'Uncategorized'} • {format(new Date(transaction.date), 'MMM d')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-semibold ${
                        transaction.type === 'income' ? 'text-green-500' : 'text-red-500'
                      }`}
                    >
                      {transaction.type === 'income' ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(transaction)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
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
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this transaction? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
