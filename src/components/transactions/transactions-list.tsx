'use client'

import { useState } from 'react'
import { MoreHorizontal, Pencil, Trash2, Plus, TrendingUp, TrendingDown, Download, ChevronLeft, ChevronRight } from 'lucide-react'
import { format, addMonths, subMonths } from 'date-fns'
import { toast } from 'sonner'

import { deleteTransaction } from '@/actions/transactions'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { TransactionWithCategory, Category } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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
import { TransactionForm } from './transaction-form'

interface TransactionsListProps {
  transactions: TransactionWithCategory[]
  categories: Category[]
}

export function TransactionsList({ transactions, categories }: TransactionsListProps) {
  const [formOpen, setFormOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<TransactionWithCategory | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [exportOpen, setExportOpen] = useState(false)
  const [exportMonth, setExportMonth] = useState(new Date())
  const [isExporting, setIsExporting] = useState(false)

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

  async function handleExport() {
    setIsExporting(true)
    const month = format(exportMonth, 'yyyy-MM')
    try {
      const res = await fetch(`/api/export?month=${month}`)
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || 'Export failed')
        setIsExporting(false)
        return
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Spending_${format(exportMonth, 'MMMM_yyyy')}.xlsx`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Export downloaded')
      setExportOpen(false)
    } catch {
      toast.error('Export failed')
    }
    setIsExporting(false)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Transactions</h2>
          <p className="text-muted-foreground text-sm mt-1">Track your income and expenses</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setExportOpen(true)}
            className="rounded-full h-10 px-5 font-semibold"
          >
            <Download className="mr-2 h-4 w-4" strokeWidth={2.5} />
            Export
          </Button>
          <Button
            onClick={() => setFormOpen(true)}
            className="rounded-full h-10 px-5 font-semibold ig-gradient border-0 shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all duration-300"
          >
            <Plus className="mr-2 h-4 w-4" strokeWidth={2.5} />
            Add
          </Button>
        </div>
      </div>

      <Card className="border shadow-sm rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          {transactions.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                <TrendingUp className="h-7 w-7 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-sm">No transactions yet</p>
              <Button
                variant="link"
                onClick={() => setFormOpen(true)}
                className="text-primary mt-2"
              >
                Add your first transaction
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {transactions.map((transaction, index) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors group"
                  style={{ animationDelay: `${index * 0.03}s` }}
                >
                  <div className="flex items-center gap-4">
                    {/* Category Icon */}
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center transition-transform group-hover:scale-105 shrink-0"
                      style={{
                        backgroundColor: transaction.category
                          ? transaction.category.color + '15'
                          : 'var(--muted)'
                      }}
                    >
                      {transaction.type === 'income' ? (
                        <TrendingUp
                          className="h-5 w-5"
                          style={{ color: transaction.category?.color || '#22c55e' }}
                          strokeWidth={2}
                        />
                      ) : (
                        <TrendingDown
                          className="h-5 w-5"
                          style={{ color: transaction.category?.color || '#ef4444' }}
                          strokeWidth={2}
                        />
                      )}
                    </div>

                    {/* Transaction Info */}
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{transaction.description}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {transaction.category ? (
                          <Badge
                            variant="secondary"
                            className="rounded-full px-2 py-0 text-xs font-normal"
                            style={{
                              backgroundColor: transaction.category.color + '15',
                              color: transaction.category.color,
                            }}
                          >
                            {transaction.category.name}
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">Uncategorized</span>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {formatDate(transaction.date)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Amount & Actions */}
                  <div className="flex items-center gap-3">
                    <span
                      className={`font-semibold text-sm tabular-nums ${
                        transaction.type === 'income'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-red-500'
                      }`}
                    >
                      {transaction.type === 'income' ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full opacity-50 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl w-36">
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

      <TransactionForm
        transaction={editingTransaction}
        categories={categories}
        open={formOpen}
        onOpenChange={handleFormClose}
      />

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
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive rounded-full hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Export Month Picker Dialog */}
      <Dialog open={exportOpen} onOpenChange={setExportOpen}>
        <DialogContent className="rounded-2xl max-w-xs">
          <DialogHeader>
            <DialogTitle>Export Transactions</DialogTitle>
            <DialogDescription>
              Select a month to export as XLSX
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center gap-3 py-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setExportMonth(prev => subMonths(prev, 1))}
              className="h-9 w-9 rounded-full"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <span className="text-sm font-semibold min-w-[140px] text-center">
              {format(exportMonth, 'MMMM yyyy')}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setExportMonth(prev => addMonths(prev, 1))}
              className="h-9 w-9 rounded-full"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setExportOpen(false)}
              className="rounded-full flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleExport}
              disabled={isExporting}
              className="rounded-full flex-1 ig-gradient border-0"
            >
              {isExporting ? 'Exporting...' : 'Download'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
