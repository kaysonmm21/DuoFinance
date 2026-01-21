'use client'

import { useState } from 'react'
import { MoreHorizontal, Pencil, Trash2, Plus } from 'lucide-react'
import { toast } from 'sonner'

import { deleteCategory } from '@/actions/categories'
import type { Category } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { CategoryForm } from './category-form'

interface CategoriesListProps {
  categories: Category[]
}

export function CategoriesList({ categories }: CategoriesListProps) {
  const [formOpen, setFormOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const incomeCategories = categories.filter((c) => c.type === 'income')
  const expenseCategories = categories.filter((c) => c.type === 'expense')

  async function handleDelete() {
    if (!deleteId) return

    const result = await deleteCategory(deleteId)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Category deleted')
    }

    setDeleteId(null)
  }

  function handleEdit(category: Category) {
    setEditingCategory(category)
    setFormOpen(true)
  }

  function handleFormClose(open: boolean) {
    setFormOpen(open)
    if (!open) {
      setEditingCategory(null)
    }
  }

  const CategoryItem = ({ category }: { category: Category }) => (
    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ backgroundColor: category.color + '20' }}
        >
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: category.color }}
          />
        </div>
        <span className="font-medium">{category.name}</span>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleEdit(category)}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive"
            onClick={() => setDeleteId(category.id)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Categories</h2>
          <p className="text-muted-foreground">Manage your income and expense categories</p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="default" className="bg-green-500">Income</Badge>
              <span>{incomeCategories.length} categories</span>
            </CardTitle>
            <CardDescription>Categories for tracking your income</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {incomeCategories.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No income categories yet</p>
            ) : (
              incomeCategories.map((category) => (
                <CategoryItem key={category.id} category={category} />
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="destructive">Expenses</Badge>
              <span>{expenseCategories.length} categories</span>
            </CardTitle>
            <CardDescription>Categories for tracking your expenses</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {expenseCategories.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No expense categories yet</p>
            ) : (
              expenseCategories.map((category) => (
                <CategoryItem key={category.id} category={category} />
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <CategoryForm
        category={editingCategory}
        open={formOpen}
        onOpenChange={handleFormClose}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this category? Transactions using this
              category will not be deleted, but they will no longer be associated with
              any category.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
