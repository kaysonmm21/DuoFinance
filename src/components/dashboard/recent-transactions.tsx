'use client'

import Link from 'next/link'
import { ArrowRight, ArrowUpCircle, ArrowDownCircle } from 'lucide-react'

import { formatCurrency, formatDate } from '@/lib/utils'
import type { TransactionWithCategory } from '@/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface RecentTransactionsProps {
  transactions: TransactionWithCategory[]
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  if (transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Your latest financial activity</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <p className="text-muted-foreground mb-4">No transactions yet</p>
          <Button asChild variant="outline">
            <Link href="/transactions">
              Add Transaction
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Your latest financial activity</CardDescription>
        </div>
        <Button asChild variant="ghost" size="sm">
          <Link href="/transactions">
            View All
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {transaction.type === 'income' ? (
                  <div className="p-2 rounded-full bg-green-500/10">
                    <ArrowUpCircle className="h-4 w-4 text-green-500" />
                  </div>
                ) : (
                  <div className="p-2 rounded-full bg-red-500/10">
                    <ArrowDownCircle className="h-4 w-4 text-red-500" />
                  </div>
                )}
                <div>
                  <p className="font-medium text-sm">{transaction.description}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{formatDate(transaction.date)}</span>
                    {transaction.category && (
                      <>
                        <span>·</span>
                        <Badge
                          variant="outline"
                          className="text-xs"
                          style={{
                            borderColor: transaction.category.color,
                            color: transaction.category.color,
                          }}
                        >
                          {transaction.category.name}
                        </Badge>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <span
                className={`font-medium ${
                  transaction.type === 'income' ? 'text-green-500' : 'text-red-500'
                }`}
              >
                {transaction.type === 'income' ? '+' : '-'}
                {formatCurrency(transaction.amount)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
