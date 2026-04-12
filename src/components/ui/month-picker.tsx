'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { format, addMonths, subMonths, startOfMonth, isSameMonth } from 'date-fns'
import { Button } from './button'

interface MonthPickerProps {
  value: Date
  onChange: (date: Date) => void
}

export function MonthPicker({ value, onChange }: MonthPickerProps) {
  const isCurrentMonth = isSameMonth(value, new Date())

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 rounded-full"
        onClick={() => onChange(startOfMonth(subMonths(value, 1)))}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="text-sm font-medium min-w-[112px] text-center tabular-nums">
        {format(value, 'MMMM yyyy')}
      </span>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 rounded-full"
        onClick={() => onChange(startOfMonth(addMonths(value, 1)))}
        disabled={isCurrentMonth}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
