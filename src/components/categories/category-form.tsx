'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, TrendingUp, TrendingDown, Check } from 'lucide-react'
import { toast } from 'sonner'

import { createCategory, updateCategory } from '@/actions/categories'
import { createBudget, updateBudget, deleteBudget } from '@/actions/budgets'
import { categorySchema, type CategoryInput } from '@/lib/validations'
import type { Category, Budget } from '@/types'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const iconOptions = [
  'briefcase', 'laptop', 'trending-up', 'plus-circle',
  'utensils', 'car', 'shopping-bag', 'gamepad-2',
  'receipt', 'heart-pulse', 'home', 'graduation-cap',
  'more-horizontal', 'circle', 'wallet', 'credit-card',
  'gift', 'plane', 'music', 'book',
]

const colorOptions = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308',
  '#84cc16', '#22c55e', '#10b981', '#14b8a6',
  '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
  '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
  '#f43f5e', '#64748b',
]

interface CategoryWithBudget extends Category {
  budget?: (Budget & { _inherited?: boolean }) | null
}

interface CategoryFormProps {
  category?: CategoryWithBudget | null
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedMonth?: string
}

export function CategoryForm({ category, open, onOpenChange, selectedMonth }: CategoryFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [budgetAmount, setBudgetAmount] = useState('')
  const isEditing = !!category

  const form = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category?.name || '',
      icon: category?.icon || 'circle',
      color: category?.color || '#6366f1',
      type: category?.type || 'expense',
    },
  })

  // Reset form and budget when category changes
  useEffect(() => {
    if (category) {
      form.reset({
        name: category.name,
        icon: category.icon,
        color: category.color,
        type: category.type,
      })
      setBudgetAmount(category.budget?.amount?.toString() || '')
    } else {
      form.reset({
        name: '',
        icon: 'circle',
        color: '#6366f1',
        type: 'expense',
      })
      setBudgetAmount('')
    }
  }, [category, form])

  const watchType = form.watch('type')

  async function onSubmit(data: CategoryInput) {
    setIsLoading(true)

    const result = isEditing
      ? await updateCategory(category.id, data)
      : await createCategory(data)

    if (result.error) {
      toast.error(result.error)
      setIsLoading(false)
      return
    }

    // Handle budget for expense categories
    if (data.type === 'expense' && selectedMonth) {
      const amount = parseFloat(budgetAmount)
      const categoryId = isEditing ? category.id : (result as any).data?.id

      if (categoryId) {
        if (!isNaN(amount) && amount > 0) {
          // Has a real (non-inherited) budget for this month — update it
          if (category?.budget && !category.budget._inherited) {
            await updateBudget(category.budget.id, {
              amount,
              period: 'monthly',
              is_active: true,
            })
          } else {
            // Create new budget for this month (or inherited → create fresh)
            await createBudget({
              category_id: categoryId,
              amount,
              period: 'monthly',
              budget_month: selectedMonth,
              is_active: true,
            })
          }
        } else if (category?.budget && !category.budget._inherited) {
          // Amount cleared — remove the budget for this month
          await deleteBudget(category.budget.id)
        }
      }
    }

    toast.success(isEditing ? 'Category updated' : 'Category created')
    onOpenChange(false)
    form.reset()
    setBudgetAmount('')
    setIsLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">{isEditing ? 'Edit Category' : 'Create Category'}</DialogTitle>
          <DialogDescription className="text-sm">
            {isEditing
              ? 'Update the category details below.'
              : 'Add a new category to organize your transactions.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Category name"
                      className="h-11 rounded-xl bg-muted/50 border-0 focus-visible:ring-2 focus-visible:ring-primary/20"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            {/* Budget Amount - only for expense categories when editing */}
            {watchType === 'expense' && selectedMonth && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Monthly Budget</label>
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
                <p className="text-xs text-muted-foreground">
                  Leave empty for no budget
                </p>
              </div>
            )}

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Type</FormLabel>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => field.onChange('income')}
                      className={cn(
                        'flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all duration-200',
                        field.value === 'income'
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30'
                          : 'border-border hover:border-emerald-300 hover:bg-emerald-50/50'
                      )}
                    >
                      <TrendingUp className="h-4 w-4" strokeWidth={2} />
                      <span className="font-medium text-sm">Income</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => field.onChange('expense')}
                      className={cn(
                        'flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all duration-200',
                        field.value === 'expense'
                          ? 'border-rose-500 bg-rose-50 text-rose-600 dark:bg-rose-950/30'
                          : 'border-border hover:border-rose-300 hover:bg-rose-50/50'
                      )}
                    >
                      <TrendingDown className="h-4 w-4" strokeWidth={2} />
                      <span className="font-medium text-sm">Expense</span>
                    </button>
                  </div>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Icon</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-11 rounded-xl bg-muted/50 border-0">
                        <SelectValue placeholder="Select icon" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="rounded-xl">
                      {iconOptions.map((icon) => (
                        <SelectItem key={icon} value={icon} className="rounded-lg">
                          {icon}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Color</FormLabel>
                  <div className="flex flex-wrap gap-2 p-3 rounded-xl bg-muted/30">
                    {colorOptions.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={cn(
                          'w-8 h-8 rounded-full transition-all duration-200 flex items-center justify-center',
                          field.value === color
                            ? 'ring-2 ring-offset-2 ring-offset-background scale-110'
                            : 'hover:scale-105'
                        )}
                        style={{
                          backgroundColor: color,
                          ['--tw-ring-color' as string]: color,
                        }}
                        onClick={() => field.onChange(color)}
                      >
                        {field.value === color && (
                          <Check className="h-4 w-4 text-white" strokeWidth={3} />
                        )}
                      </button>
                    ))}
                  </div>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="rounded-full flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="rounded-full flex-1 ig-gradient border-0"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
