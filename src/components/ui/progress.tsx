"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

function Progress({
  className,
  value,
  style,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root>) {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        "bg-primary/10 relative h-2 w-full overflow-hidden rounded-full",
        className
      )}
      style={style}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className="h-full w-full flex-1 rounded-full transition-all duration-300 ease-out"
        style={{
          transform: `translateX(-${100 - (value || 0)}%)`,
          backgroundColor: (style as any)?.['--progress-color'] || 'var(--primary)',
        }}
      />
    </ProgressPrimitive.Root>
  )
}

export { Progress }
