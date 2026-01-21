'use client'

import Link from 'next/link'
import { ArrowRight, AlertTriangle } from 'lucide-react'

import { formatCurrency, calculatePercentage } from '@/lib/utils'
import type { BudgetWithCategory } from '@/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'

interface BudgetProgressProps {
  budgets: BudgetWithCategory[]
}

export function BudgetProgress({ budgets }: BudgetProgressProps) {
  if (budgets.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Budget Progress</CardTitle>
          <CardDescription>Track your spending against budget limits</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <p className="text-muted-foreground mb-4">No budgets set yet</p>
          <Button asChild variant="outline">
            <Link href="/budgets">
              Set Up Budgets
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Show top 5 budgets sorted by usage percentage
  const sortedBudgets = [...budgets]
    .map(budget => ({
      ...budget,
      percentage: calculatePercentage(budget.spent || 0, budget.amount)
    }))
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 5)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Budget Progress</CardTitle>
          <CardDescription>Track your spending against budget limits</CardDescription>
        </div>
        <Button asChild variant="ghost" size="sm">
          <Link href="/budgets">
            View All
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {sortedBudgets.map((budget) => {
          const spent = budget.spent || 0
          const percentage = budget.percentage
          const isOverBudget = spent > budget.amount

          return (
            <div key={budget.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: budget.category.color }}
                  />
                  <span className="font-medium text-sm">{budget.category.name}</span>
                  {isOverBudget && (
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  )}
                </div>
                <span className="text-sm text-muted-foreground">
                  {formatCurrency(spent)} / {formatCurrency(budget.amount)}
                </span>
              </div>
              <Progress
                value={Math.min(percentage, 100)}
                className={
                  isOverBudget
                    ? '[&>div]:bg-red-500'
                    : percentage >= 80
                    ? '[&>div]:bg-yellow-500'
                    : ''
                }
              />
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
