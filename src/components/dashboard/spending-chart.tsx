'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'

interface SpendingData {
  name: string
  color: string
  total: number
}

interface SpendingChartProps {
  data: SpendingData[]
}

export function SpendingChart({ data }: SpendingChartProps) {
  const totalSpending = data.reduce((sum, item) => sum + item.total, 0)

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Spending by Category</CardTitle>
          <CardDescription>Your expense breakdown this month</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <p className="text-muted-foreground">No expenses this month</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spending by Category</CardTitle>
        <CardDescription>Your expense breakdown this month</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="total"
                nameKey="name"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload as SpendingData
                    const percentage = ((item.total / totalSpending) * 100).toFixed(1)
                    return (
                      <div className="bg-popover border rounded-lg shadow-lg p-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="font-medium">{item.name}</span>
                        </div>
                        <div className="mt-1 text-sm">
                          <span className="font-bold">{formatCurrency(item.total)}</span>
                          <span className="text-muted-foreground"> ({percentage}%)</span>
                        </div>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Legend
                formatter={(value: string) => (
                  <span className="text-sm text-foreground">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 text-center">
          <p className="text-sm text-muted-foreground">Total Spending</p>
          <p className="text-2xl font-bold">{formatCurrency(totalSpending)}</p>
        </div>
      </CardContent>
    </Card>
  )
}
