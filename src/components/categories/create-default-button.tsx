'use client'

import { useState } from 'react'
import { Loader2, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

import { createDefaultCategories } from '@/actions/categories'
import { Button } from '@/components/ui/button'

export function CreateDefaultCategoriesButton() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  async function handleClick() {
    setIsLoading(true)
    const result = await createDefaultCategories()

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Default categories created')
      router.refresh()
    }

    setIsLoading(false)
  }

  return (
    <Button onClick={handleClick} className="w-full" disabled={isLoading}>
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Sparkles className="mr-2 h-4 w-4" />
      )}
      Create Default Categories
    </Button>
  )
}
