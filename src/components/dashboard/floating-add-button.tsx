'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { TransactionForm } from '@/components/transactions/transaction-form'
import type { Category } from '@/types'

interface FloatingAddButtonProps {
  categories: Category[]
}

export function FloatingAddButton({ categories }: FloatingAddButtonProps) {
  const [formOpen, setFormOpen] = useState(false)

  return (
    <>
      <Button
        onClick={() => setFormOpen(true)}
        className="fixed bottom-24 md:bottom-8 right-6 h-14 w-14 rounded-full shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:scale-105 transition-all duration-300 z-50 ig-gradient border-0"
        size="icon"
      >
        <Plus className="h-6 w-6 text-white" strokeWidth={2.5} />
        <span className="sr-only">Add Transaction</span>
      </Button>

      <TransactionForm
        categories={categories}
        open={formOpen}
        onOpenChange={setFormOpen}
      />
    </>
  )
}
