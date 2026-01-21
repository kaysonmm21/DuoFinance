'use client'

import { useState, useEffect } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

import { getMonthlySpendingHistory } from '@/actions/transactions'
import { formatCurrency } from '@/lib/utils'
import type { Category } from '@/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface SpendingData {
  name: string
  color: string
  total: number
}

interface MonthlyData {
  month: string
  total: number
}

interface AnalyticsContentProps {
  spendingByCategory: SpendingData[]
  monthlyHistory: MonthlyData[]
  categories: Category[]
}

export function AnalyticsContent({
  spendingByCategory,
  monthlyHistory: initialHistory,
  categories,
}: AnalyticsContentProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [monthlyHistory, setMonthlyHistory] = useState(initialHistory)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      const categoryId = selectedCategory === 'all' ? undefined : selectedCategory
      const data = await getMonthlySpendingHistory(6, categoryId)
      setMonthlyHistory(data)
      setIsLoading(false)
    }

    fetchData()
  }, [selectedCategory])

  const totalSpending = spendingByCategory.reduce((sum, cat) => sum + cat.total, 0)

  // Custom tooltip for pie chart
  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      const percentage = ((data.total / totalSpending) * 100).toFixed(1)
      return (
        <div className="bg-popover text-popover-foreground rounded-lg border p-3 shadow-md">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm">{formatCurrency(data.total)}</p>
          <p className="text-sm text-muted-foreground">{percentage}%</p>
        </div>
      )
    }
    return null
  }

  // Custom tooltip for bar chart
  const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover text-popover-foreground rounded-lg border p-3 shadow-md">
          <p className="font-medium">{label}</p>
          <p className="text-sm">{formatCurrency(payload[0].value)}</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold mb-2">Analytics</h2>
        <p className="text-muted-foreground">
          Visualize your spending patterns and trends
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Spending by Category Donut Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
            <CardDescription>This month&apos;s expenses breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            {spendingByCategory.length === 0 ? (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No spending data this month
              </div>
            ) : (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={spendingByCategory}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="total"
                      nameKey="name"
                    >
                      {spendingByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                    <Legend
                      layout="vertical"
                      align="right"
                      verticalAlign="middle"
                      formatter={(value) => (
                        <span className="text-sm">{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
            {spendingByCategory.length > 0 && (
              <div className="text-center mt-4">
                <p className="text-sm text-muted-foreground">Total Spending</p>
                <p className="text-2xl font-bold">{formatCurrency(totalSpending)}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Monthly Spending Trend */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Spending Over Time</CardTitle>
              <CardDescription>Last 6 months spending trend</CardDescription>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
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
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {isLoading ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Loading...
                </div>
              ) : monthlyHistory.every(m => m.total === 0) ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No spending data for this period
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyHistory}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 12 }}
                      className="text-muted-foreground"
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => `$${value}`}
                      className="text-muted-foreground"
                    />
                    <Tooltip content={<CustomBarTooltip />} />
                    <Bar
                      dataKey="total"
                      fill="hsl(var(--primary))"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown Table */}
      <Card>
        <CardHeader>
          <CardTitle>Category Breakdown</CardTitle>
          <CardDescription>Detailed spending by category this month</CardDescription>
        </CardHeader>
        <CardContent>
          {spendingByCategory.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No spending data this month
            </p>
          ) : (
            <div className="space-y-3">
              {spendingByCategory.map((category, index) => {
                const percentage = ((category.total / totalSpending) * 100).toFixed(1)
                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="font-medium">{category.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(category.total)}</p>
                      <p className="text-sm text-muted-foreground">{percentage}%</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
