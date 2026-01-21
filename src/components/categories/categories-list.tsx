'use client'

import { useState } from 'react'
import { MoreHorizontal, Pencil, Trash2, Plus, DollarSign } from 'lucide-react'
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
import { Badge } from '@/components/ui/badge'
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
      // Update existing budget
      result = await updateBudget(budgetCategory.budget.id, {
        amount,
        period: 'monthly',
        is_active: true,
      })
    } else {
      // Create new budget
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
    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ backgroundColor: category.color + '20' }}
        >
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: category.color }}
          />
        </div>
        <div>
          <span className="font-medium">{category.name}</span>
          {category.type === 'expense' && (
            <div className="text-sm text-muted-foreground">
              {category.budget ? (
                <span className="text-primary">
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
          >
            <DollarSign className="h-4 w-4" />
          </Button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleEdit(category)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive"
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
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Categories</h2>
          <p className="text-muted-foreground">Manage your income and expense categories</p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="default" className="bg-green-500">Income</Badge>
              <span>{incomeCategories.length} categories</span>
            </CardTitle>
            <CardDescription>Categories for tracking your income</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {incomeCategories.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No income categories yet</p>
            ) : (
              incomeCategories.map((category) => (
                <CategoryItem key={category.id} category={category} />
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="destructive">Expenses</Badge>
              <span>{expenseCategories.length} categories</span>
            </CardTitle>
            <CardDescription>Categories for tracking your expenses (with monthly budgets)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {expenseCategories.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No expense categories yet</p>
            ) : (
              expenseCategories.map((category) => (
                <CategoryItem key={category.id} category={category} />
              ))
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
        <DialogContent>
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
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={budgetAmount}
                  onChange={(e) => setBudgetAmount(e.target.value)}
                  className="pl-7"
                />
              </div>
            </div>
          </div>
          <DialogFooter className="flex justify-between">
            <div>
              {budgetCategory?.budget && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleBudgetRemove}
                  disabled={isSubmitting}
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
              >
                Cancel
              </Button>
              <Button onClick={handleBudgetSave} disabled={isSubmitting}>
                Save
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this category? Transactions using this
              category will not be deleted, but they will no longer be associated with
              any category.
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
