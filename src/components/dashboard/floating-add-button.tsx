'use client'

import { useState, useEffect } from 'react'
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
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow z-50"
        size="icon"
      >
        <Plus className="h-6 w-6" />
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
