'use client'

import { useState } from 'react'
import { MoreHorizontal, Pencil, Trash2, Plus, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'

import { deleteBudget } from '@/actions/budgets'
import { formatCurrency, calculatePercentage } from '@/lib/utils'
import type { BudgetWithCategory, Category } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { BudgetForm } from './budget-form'

interface BudgetsListProps {
  budgets: BudgetWithCategory[]
  unbudgetedCategories: Category[]
}

export function BudgetsList({ budgets, unbudgetedCategories }: BudgetsListProps) {
  const [formOpen, setFormOpen] = useState(false)
  const [editingBudget, setEditingBudget] = useState<BudgetWithCategory | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  async function handleDelete() {
    if (!deleteId) return

    const result = await deleteBudget(deleteId)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Budget deleted')
    }

    setDeleteId(null)
  }

  function handleEdit(budget: BudgetWithCategory) {
    setEditingBudget(budget)
    setFormOpen(true)
  }

  function handleFormClose(open: boolean) {
    setFormOpen(open)
    if (!open) {
      setEditingBudget(null)
    }
  }

  const periodLabels = {
    weekly: 'This Week',
    monthly: 'This Month',
    yearly: 'This Year',
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Budgets</h2>
          <p className="text-muted-foreground">Set spending limits for your categories</p>
        </div>
        {unbudgetedCategories.length > 0 && (
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Budget
          </Button>
        )}
      </div>

      {budgets.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <p className="text-muted-foreground mb-4">No budgets set yet</p>
            {unbudgetedCategories.length > 0 ? (
              <Button onClick={() => setFormOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create your first budget
              </Button>
            ) : (
              <p className="text-sm text-muted-foreground">
                Create expense categories first to set budgets
              </p>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {budgets.map((budget) => {
            const spent = budget.spent || 0
            const percentage = calculatePercentage(spent, budget.amount)
            const isOverBudget = spent > budget.amount
            const isNearLimit = percentage >= 80 && !isOverBudget

            return (
              <Card key={budget.id}>
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                  <div className="space-y-1">
                    <CardTitle className="text-base font-medium flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: budget.category.color }}
                      />
                      {budget.category.name}
                    </CardTitle>
                    <CardDescription>
                      {periodLabels[budget.period]}
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(budget)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => setDeleteId(budget.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">
                      {formatCurrency(spent)}
                    </span>
                    <span className="text-muted-foreground">
                      of {formatCurrency(budget.amount)}
                    </span>
                  </div>
                  <Progress
                    value={Math.min(percentage, 100)}
                    className={
                      isOverBudget
                        ? '[&>div]:bg-red-500'
                        : isNearLimit
                        ? '[&>div]:bg-yellow-500'
                        : ''
                    }
                  />
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{percentage}% used</span>
                    {isOverBudget && (
                      <Badge variant="destructive" className="gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Over by {formatCurrency(spent - budget.amount)}
                      </Badge>
                    )}
                    {isNearLimit && (
                      <Badge variant="outline" className="text-yellow-500 border-yellow-500">
                        Near limit
                      </Badge>
                    )}
                    {!isOverBudget && !isNearLimit && (
                      <span className="text-green-500">
                        {formatCurrency(budget.amount - spent)} left
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <BudgetForm
        budget={editingBudget}
        categories={unbudgetedCategories}
        open={formOpen}
        onOpenChange={handleFormClose}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Budget</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this budget? Your transactions will not be affected.
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
    </>
  )
}
