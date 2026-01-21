'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { CategoryInput } from '@/lib/validations'
import type { Category, CategoryWithBudget } from '@/types'

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', user.id)
    .order('name')

  if (error) throw error
  return data || []
}

export async function getCategoriesWithBudgets(): Promise<CategoryWithBudget[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  const { data, error } = await supabase
    .from('categories')
    .select(`
      *,
      budget:budgets(*)
    `)
    .eq('user_id', user.id)
    .order('name')

  if (error) throw error

  return (data || []).map((category: Category & { budget: any[] }) => ({
    ...category,
    budget: category.budget?.[0] || null,
  }))
}

export async function getCategoriesByType(type: 'income' | 'expense'): Promise<Category[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', user.id)
    .eq('type', type)
    .order('name')

  if (error) throw error
  return data || []
}

export async function createCategory(input: CategoryInput) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('categories')
    .insert({
      user_id: user.id,
      name: input.name,
      icon: input.icon,
      color: input.color,
      type: input.type,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/categories')
  revalidatePath('/transactions')
  revalidatePath('/budgets')
  return { data }
}

export async function updateCategory(id: string, input: Partial<CategoryInput>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('categories')
    .update({
      name: input.name,
      icon: input.icon,
      color: input.color,
      type: input.type,
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/categories')
  revalidatePath('/transactions')
  revalidatePath('/budgets')
  return { data }
}

export async function deleteCategory(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/categories')
  revalidatePath('/transactions')
  revalidatePath('/budgets')
  return { success: true }
}

export async function createDefaultCategories() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Check if user already has categories
  const { data: existing } = await supabase
    .from('categories')
    .select('id')
    .eq('user_id', user.id)
    .limit(1)

  if (existing && existing.length > 0) {
    return { error: 'Categories already exist' }
  }

  const defaultCategories = [
    // Income categories
    { name: 'Salary', icon: 'briefcase', color: '#22c55e', type: 'income' as const },
    { name: 'Freelance', icon: 'laptop', color: '#10b981', type: 'income' as const },
    { name: 'Investments', icon: 'trending-up', color: '#14b8a6', type: 'income' as const },
    { name: 'Other Income', icon: 'plus-circle', color: '#06b6d4', type: 'income' as const },
    // Expense categories
    { name: 'Food & Dining', icon: 'utensils', color: '#ef4444', type: 'expense' as const },
    { name: 'Transportation', icon: 'car', color: '#f97316', type: 'expense' as const },
    { name: 'Shopping', icon: 'shopping-bag', color: '#f59e0b', type: 'expense' as const },
    { name: 'Entertainment', icon: 'gamepad-2', color: '#eab308', type: 'expense' as const },
    { name: 'Bills & Utilities', icon: 'receipt', color: '#84cc16', type: 'expense' as const },
    { name: 'Healthcare', icon: 'heart-pulse', color: '#ec4899', type: 'expense' as const },
    { name: 'Housing', icon: 'home', color: '#8b5cf6', type: 'expense' as const },
    { name: 'Education', icon: 'graduation-cap', color: '#6366f1', type: 'expense' as const },
    { name: 'Other Expenses', icon: 'more-horizontal', color: '#64748b', type: 'expense' as const },
  ]

  const { error } = await supabase
    .from('categories')
    .insert(defaultCategories.map(cat => ({
      ...cat,
      user_id: user.id,
    })))

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/categories')
  return { success: true }
}
