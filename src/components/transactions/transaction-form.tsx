'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, CalendarIcon, TrendingUp, TrendingDown } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'

import { createTransaction, updateTransaction } from '@/actions/transactions'
import { transactionSchema, type TransactionInput } from '@/lib/validations'
import type { Transaction, Category } from '@/types'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'

interface TransactionFormProps {
  transaction?: Transaction | null
  categories: Category[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TransactionForm({ transaction, categories, open, onOpenChange }: TransactionFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const isEditing = !!transaction

  const form = useForm<TransactionInput>({
    resolver: zodResolver(transactionSchema) as any,
    defaultValues: {
      category_id: transaction?.category_id || undefined,
      amount: transaction?.amount || 0,
      type: transaction?.type || 'expense',
      description: transaction?.description || '',
      date: transaction?.date || format(new Date(), 'yyyy-MM-dd'),
      notes: transaction?.notes || '',
    },
  })

  const selectedType = form.watch('type')
  const filteredCategories = categories.filter((c) => c.type === selectedType)

  // Reset category when type changes
  useEffect(() => {
    const currentCategoryId = form.getValues('category_id')
    if (currentCategoryId) {
      const currentCategory = categories.find(c => c.id === currentCategoryId)
      if (currentCategory && currentCategory.type !== selectedType) {
        form.setValue('category_id', undefined)
      }
    }
  }, [selectedType, categories, form])

  async function onSubmit(data: TransactionInput) {
    setIsLoading(true)

    const result = isEditing
      ? await updateTransaction(transaction.id, data)
      : await createTransaction(data)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(isEditing ? 'Transaction updated' : 'Transaction created')
      onOpenChange(false)
      form.reset({
        category_id: undefined,
        amount: 0,
        type: 'expense',
        description: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        notes: '',
      })
    }

    setIsLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">{isEditing ? 'Edit Transaction' : 'Add Transaction'}</DialogTitle>
          <DialogDescription className="text-sm">
            {isEditing
              ? 'Update the transaction details below.'
              : 'Record a new income or expense.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Type Toggle */}
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
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Amount</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        className="pl-8 h-11 rounded-xl bg-muted/50 border-0 focus-visible:ring-2 focus-visible:ring-primary/20"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Description</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="What was this for?"
                      className="h-11 rounded-xl bg-muted/50 border-0 focus-visible:ring-2 focus-visible:ring-primary/20"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Category</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ''}>
                    <FormControl>
                      <SelectTrigger className="h-11 rounded-xl bg-muted/50 border-0">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="rounded-xl">
                      {filteredCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id} className="rounded-lg">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: category.color }}
                            />
                            {category.name}
                          </div>
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
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-sm font-medium">Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full h-11 rounded-xl bg-muted/50 border-0 pl-4 text-left font-normal justify-start hover:bg-muted/70',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                          {field.value ? (
                            format(new Date(field.value), 'PPP')
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 rounded-xl" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value ? new Date(field.value) : undefined}
                        onSelect={(date) => date && field.onChange(format(date, 'yyyy-MM-dd'))}
                        disabled={(date) => date > new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Notes (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any additional notes..."
                      className="resize-none rounded-xl bg-muted/50 border-0 focus-visible:ring-2 focus-visible:ring-primary/20 min-h-[80px]"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
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
                {isEditing ? 'Update' : 'Add'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
