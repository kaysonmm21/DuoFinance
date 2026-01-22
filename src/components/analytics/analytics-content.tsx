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
import { PieChartIcon, BarChart3 } from 'lucide-react'

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
        <div className="bg-popover text-popover-foreground rounded-xl border p-3 shadow-lg">
          <p className="font-medium text-sm">{data.name}</p>
          <p className="text-sm">{formatCurrency(data.total)}</p>
          <p className="text-xs text-muted-foreground">{percentage}%</p>
        </div>
      )
    }
    return null
  }

  // Custom tooltip for bar chart
  const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover text-popover-foreground rounded-xl border p-3 shadow-lg">
          <p className="font-medium text-sm">{label}</p>
          <p className="text-sm">{formatCurrency(payload[0].value)}</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Analytics</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Visualize your spending patterns and trends
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Spending by Category Donut Chart */}
        <Card className="border shadow-sm rounded-2xl ig-card-hover">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <PieChartIcon className="h-4 w-4 text-primary" strokeWidth={2} />
              </div>
              <div>
                <CardTitle className="text-base">Spending by Category</CardTitle>
                <CardDescription className="text-xs">This month&apos;s breakdown</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {spendingByCategory.length === 0 ? (
              <div className="flex items-center justify-center h-[280px]">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-3 flex items-center justify-center">
                    <PieChartIcon className="h-7 w-7 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground text-sm">No spending data this month</p>
                </div>
              </div>
            ) : (
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={spendingByCategory}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={90}
                      paddingAngle={3}
                      dataKey="total"
                      nameKey="name"
                      strokeWidth={0}
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
                      iconType="circle"
                      iconSize={8}
                      formatter={(value) => (
                        <span className="text-xs text-foreground">{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
            {spendingByCategory.length > 0 && (
              <div className="text-center mt-2 pt-4 border-t">
                <p className="text-xs text-muted-foreground">Total Spending</p>
                <p className="text-xl font-bold">{formatCurrency(totalSpending)}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Monthly Spending Trend */}
        <Card className="border shadow-sm rounded-2xl ig-card-hover">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <BarChart3 className="h-4 w-4 text-primary" strokeWidth={2} />
                </div>
                <div>
                  <CardTitle className="text-base">Spending Over Time</CardTitle>
                  <CardDescription className="text-xs">Last 6 months trend</CardDescription>
                </div>
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[140px] h-9 rounded-xl text-xs">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all" className="rounded-lg text-xs">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id} className="rounded-lg text-xs">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        {category.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                </div>
              ) : monthlyHistory.every(m => m.total === 0) ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-3 flex items-center justify-center">
                      <BarChart3 className="h-7 w-7 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground text-sm">No spending data for this period</p>
                  </div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyHistory}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted/50" vertical={false} />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      className="text-muted-foreground"
                    />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `$${value}`}
                      className="text-muted-foreground"
                      width={50}
                    />
                    <Tooltip content={<CustomBarTooltip />} />
                    <Bar
                      dataKey="total"
                      fill="url(#barGradient)"
                      radius={[6, 6, 0, 0]}
                    />
                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="oklch(0.65 0.25 350)" />
                        <stop offset="100%" stopColor="oklch(0.55 0.28 290)" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown Table */}
      <Card className="border shadow-sm rounded-2xl ig-card-hover">
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Category Breakdown</CardTitle>
          <CardDescription className="text-sm">Detailed spending by category this month</CardDescription>
        </CardHeader>
        <CardContent>
          {spendingByCategory.length === 0 ? (
            <p className="text-muted-foreground text-center py-8 text-sm">
              No spending data this month
            </p>
          ) : (
            <div className="space-y-2">
              {spendingByCategory.map((category, index) => {
                const percentage = ((category.total / totalSpending) * 100).toFixed(1)
                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center transition-transform group-hover:scale-105"
                        style={{ backgroundColor: category.color + '15' }}
                      >
                        <div
                          className="w-3.5 h-3.5 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                      </div>
                      <span className="font-medium text-sm">{category.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm tabular-nums">{formatCurrency(category.total)}</p>
                      <p className="text-xs text-muted-foreground">{percentage}%</p>
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
