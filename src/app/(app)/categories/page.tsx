import { getCategoriesWithBudgets } from '@/actions/categories'
import { CategoriesList } from '@/components/categories/categories-list'
import { CreateDefaultCategoriesButton } from '@/components/categories/create-default-button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Sparkles } from 'lucide-react'

export default async function CategoriesPage() {
  const categories = await getCategoriesWithBudgets()

  if (categories.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md">
          <CardHeader className="text-center">
            <Sparkles className="h-12 w-12 mx-auto text-primary mb-4" />
            <CardTitle>No Categories Yet</CardTitle>
            <CardDescription>
              Get started by creating your own categories or use our recommended defaults.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <CreateDefaultCategoriesButton />
          </CardContent>
        </Card>
      </div>
    )
  }

  return <CategoriesList categories={categories} />
}
