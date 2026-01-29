'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MoreHorizontal, Pencil, Trash2, Plus, TrendingUp, TrendingDown, Tags, ChevronLeft, ChevronRight } from 'lucide-react'
import { format, addMonths, subMonths, parse } from 'date-fns'
import { toast } from 'sonner'

import { deleteCategory } from '@/actions/categories'
import type { Category, Budget } from '@/types'
import { formatCurrency } from '@/lib/utils'
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
import { CategoryForm } from './category-form'

interface CategoryWithBudget extends Category {
  budget?: (Budget & { _inherited?: boolean }) | null
}

interface CategoriesListProps {
  categories: CategoryWithBudget[]
  selectedMonth: string
}

export function CategoriesList({ categories, selectedMonth }: CategoriesListProps) {
  const router = useRouter()
  const [formOpen, setFormOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<CategoryWithBudget | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const incomeCategories = categories.filter((c) => c.type === 'income')
  const expenseCategories = categories.filter((c) => c.type === 'expense')

  const monthDate = parse(selectedMonth, 'yyyy-MM', new Date())
  const monthLabel = format(monthDate, 'MMMM yyyy')

  function navigateMonth(direction: 'prev' | 'next') {
    const newDate = direction === 'prev' ? subMonths(monthDate, 1) : addMonths(monthDate, 1)
    const newMonth = format(newDate, 'yyyy-MM')
    router.push(`/categories?month=${newMonth}`)
  }

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

  function handleEdit(category: CategoryWithBudget) {
    setEditingCategory(category)
    setFormOpen(true)
  }

  function handleFormClose(open: boolean) {
    setFormOpen(open)
    if (!open) {
      setEditingCategory(null)
    }
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
                  {category.budget._inherited && (
                    <span className="text-muted-foreground font-normal"> (prev month)</span>
                  )}
                </span>
              ) : (
                <span>No budget set</span>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1">
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
          onClick={() => {
            setEditingCategory(null)
            setFormOpen(true)
          }}
          className="rounded-full h-10 px-5 font-semibold ig-gradient border-0 shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all duration-300"
        >
          <Plus className="mr-2 h-4 w-4" strokeWidth={2.5} />
          Add
        </Button>
      </div>

      {/* Month Selector */}
      <div className="flex items-center justify-center gap-3 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigateMonth('prev')}
          className="h-9 w-9 rounded-full"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <span className="text-sm font-semibold min-w-[160px] text-center">
          {monthLabel}
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigateMonth('next')}
          className="h-9 w-9 rounded-full"
        >
          <ChevronRight className="h-5 w-5" />
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
        selectedMonth={selectedMonth}
      />

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
