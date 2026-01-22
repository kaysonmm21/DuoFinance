'use client'

import { useState } from 'react'
import { MoreHorizontal, Pencil, Trash2, Plus, DollarSign, TrendingUp, TrendingDown, Tags } from 'lucide-react'
import { toast } from 'sonner'

import { deleteCategory } from '@/actions/categories'
import { createBudget, updateBudget, deleteBudget } from '@/actions/budgets'
import type { Category, Budget } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { CategoryForm } from './category-form'

interface CategoryWithBudget extends Category {
  budget?: Budget | null
}

interface CategoriesListProps {
  categories: CategoryWithBudget[]
}

export function CategoriesList({ categories }: CategoriesListProps) {
  const [formOpen, setFormOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [budgetDialogOpen, setBudgetDialogOpen] = useState(false)
  const [budgetCategory, setBudgetCategory] = useState<CategoryWithBudget | null>(null)
  const [budgetAmount, setBudgetAmount] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const incomeCategories = categories.filter((c) => c.type === 'income')
  const expenseCategories = categories.filter((c) => c.type === 'expense')

  async function handleDelete() {
    if (!deleteId) return

    const result = await deleteCategory(deleteId)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Category deleted')
    }

    setDeleteId(null)
  }

  function handleEdit(category: Category) {
    setEditingCategory(category)
    setFormOpen(true)
  }

  function handleFormClose(open: boolean) {
    setFormOpen(open)
    if (!open) {
      setEditingCategory(null)
    }
  }

  function openBudgetDialog(category: CategoryWithBudget) {
    setBudgetCategory(category)
    setBudgetAmount(category.budget?.amount?.toString() || '')
    setBudgetDialogOpen(true)
  }

  async function handleBudgetSave() {
    if (!budgetCategory) return

    setIsSubmitting(true)
    const amount = parseFloat(budgetAmount)

    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount')
      setIsSubmitting(false)
      return
    }

    let result
    if (budgetCategory.budget) {
      result = await updateBudget(budgetCategory.budget.id, {
        amount,
        period: 'monthly',
        is_active: true,
      })
    } else {
      result = await createBudget({
        category_id: budgetCategory.id,
        amount,
        period: 'monthly',
        is_active: true,
      })
    }

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Budget saved')
      setBudgetDialogOpen(false)
    }

    setIsSubmitting(false)
  }

  async function handleBudgetRemove() {
    if (!budgetCategory?.budget) return

    setIsSubmitting(true)
    const result = await deleteBudget(budgetCategory.budget.id)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Budget removed')
      setBudgetDialogOpen(false)
    }

    setIsSubmitting(false)
  }

  const CategoryItem = ({ category }: { category: CategoryWithBudget }) => (
    <div className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors group">
      <div className="flex items-center gap-3">
        <div
          className="w-11 h-11 rounded-full flex items-center justify-center transition-transform group-hover:scale-105"
          style={{ backgroundColor: category.color + '15' }}
        >
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: category.color }}
          />
        </div>
        <div>
          <span className="font-medium text-sm">{category.name}</span>
          {category.type === 'expense' && (
            <div className="text-xs text-muted-foreground mt-0.5">
              {category.budget ? (
                <span className="text-primary font-medium">
                  Budget: {formatCurrency(category.budget.amount)}/mo
                </span>
              ) : (
                <span>No budget set</span>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1">
        {category.type === 'expense' && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => openBudgetDialog(category)}
            title="Set Budget"
            className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <DollarSign className="h-4 w-4" />
          </Button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-xl w-36">
            <DropdownMenuItem onClick={() => handleEdit(category)} className="rounded-lg">
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive rounded-lg focus:text-destructive"
              onClick={() => setDeleteId(category.id)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Categories</h2>
          <p className="text-muted-foreground text-sm mt-1">Manage your income and expense categories</p>
        </div>
        <Button
          onClick={() => setFormOpen(true)}
          className="rounded-full h-10 px-5 font-semibold ig-gradient border-0 shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all duration-300"
        >
          <Plus className="mr-2 h-4 w-4" strokeWidth={2.5} />
          Add
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Income Categories */}
        <Card className="border shadow-sm rounded-2xl overflow-hidden ig-card-hover">
          <CardHeader className="pb-3 bg-gradient-to-br from-emerald-50/50 to-teal-50/50 dark:from-emerald-950/20 dark:to-teal-950/20">
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
              </div>
              <span>Income</span>
              <span className="text-muted-foreground font-normal text-sm ml-auto">
                {incomeCategories.length}
              </span>
            </CardTitle>
            <CardDescription className="text-xs">Categories for tracking your income</CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            {incomeCategories.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 rounded-full bg-muted mx-auto mb-3 flex items-center justify-center">
                  <Tags className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-sm">No income categories yet</p>
              </div>
            ) : (
              <div className="space-y-1">
                {incomeCategories.map((category) => (
                  <CategoryItem key={category.id} category={category} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Expense Categories */}
        <Card className="border shadow-sm rounded-2xl overflow-hidden ig-card-hover">
          <CardHeader className="pb-3 bg-gradient-to-br from-rose-50/50 to-orange-50/50 dark:from-rose-950/20 dark:to-orange-950/20">
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center">
                <TrendingDown className="h-4 w-4 text-rose-600 dark:text-rose-400" strokeWidth={2} />
              </div>
              <span>Expenses</span>
              <span className="text-muted-foreground font-normal text-sm ml-auto">
                {expenseCategories.length}
              </span>
            </CardTitle>
            <CardDescription className="text-xs">Categories for tracking your expenses (with budgets)</CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            {expenseCategories.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 rounded-full bg-muted mx-auto mb-3 flex items-center justify-center">
                  <Tags className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-sm">No expense categories yet</p>
              </div>
            ) : (
              <div className="space-y-1">
                {expenseCategories.map((category) => (
                  <CategoryItem key={category.id} category={category} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <CategoryForm
        category={editingCategory}
        open={formOpen}
        onOpenChange={handleFormClose}
      />

      {/* Budget Dialog */}
      <Dialog open={budgetDialogOpen} onOpenChange={setBudgetDialogOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>
              {budgetCategory?.budget ? 'Edit Budget' : 'Set Budget'}
            </DialogTitle>
            <DialogDescription>
              Set a monthly budget for {budgetCategory?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Monthly Budget Amount</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={budgetAmount}
                  onChange={(e) => setBudgetAmount(e.target.value)}
                  className="pl-8 h-11 rounded-xl bg-muted/50 border-0 focus-visible:ring-2 focus-visible:ring-primary/20"
                />
              </div>
            </div>
          </div>
          <DialogFooter className="flex justify-between gap-2">
            <div>
              {budgetCategory?.budget && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleBudgetRemove}
                  disabled={isSubmitting}
                  className="rounded-full"
                >
                  Remove Budget
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setBudgetDialogOpen(false)}
                className="rounded-full"
              >
                Cancel
              </Button>
              <Button
                onClick={handleBudgetSave}
                disabled={isSubmitting}
                className="rounded-full ig-gradient border-0"
              >
                Save
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this category? Transactions using this
              category will not be deleted, but they will no longer be associated with
              any category.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive rounded-full hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
