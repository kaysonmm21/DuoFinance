'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { BudgetInput } from '@/lib/validations'
import type { Budget, BudgetWithCategory, Category } from '@/types'
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfYear, endOfYear } from 'date-fns'

export async function getBudgets(): Promise<Budget[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  const { data, error } = await supabase
    .from('budgets')
    .select('*')
    .eq('user_id', user.id)

  if (error) throw error
  return data || []
}

export async function getBudgetsWithCategories(): Promise<BudgetWithCategory[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  const { data, error } = await supabase
    .from('budgets')
    .select(`
      *,
      category:categories(*)
    `)
    .eq('user_id', user.id)
    .eq('is_active', true)

  if (error) throw error
  return data || []
}

function getDateRangeForPeriod(period: 'monthly' | 'weekly' | 'yearly', date: Date = new Date()) {
  switch (period) {
    case 'weekly':
      return {
        start: format(startOfWeek(date, { weekStartsOn: 0 }), 'yyyy-MM-dd'),
        end: format(endOfWeek(date, { weekStartsOn: 0 }), 'yyyy-MM-dd'),
      }
    case 'yearly':
      return {
        start: format(startOfYear(date), 'yyyy-MM-dd'),
        end: format(endOfYear(date), 'yyyy-MM-dd'),
      }
    case 'monthly':
    default:
      return {
        start: format(startOfMonth(date), 'yyyy-MM-dd'),
        end: format(endOfMonth(date), 'yyyy-MM-dd'),
      }
  }
}

export async function getBudgetsWithSpending(): Promise<BudgetWithCategory[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  // Get budgets with categories
  const { data: budgets, error: budgetsError } = await supabase
    .from('budgets')
    .select(`
      *,
      category:categories(*)
    `)
    .eq('user_id', user.id)
    .eq('is_active', true)

  if (budgetsError) throw budgetsError
  if (!budgets || budgets.length === 0) return []

  // Get spending for each budget based on its period
  const budgetsWithSpending = await Promise.all(
    budgets.map(async (budget: BudgetWithCategory) => {
      const { start, end } = getDateRangeForPeriod(budget.period)

      const { data: transactions, error: txError } = await supabase
        .from('transactions')
        .select('amount')
        .eq('user_id', user.id)
        .eq('category_id', budget.category_id)
        .eq('type', 'expense')
        .gte('date', start)
        .lte('date', end)

      if (txError) throw txError

      const spent = (transactions || []).reduce(
        (sum, tx) => sum + Number(tx.amount),
        0
      )

      return {
        ...budget,
        spent,
      }
    })
  )

  return budgetsWithSpending
}

export async function createBudget(input: BudgetInput) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Check if budget already exists for this category
  const { data: existing } = await supabase
    .from('budgets')
    .select('id')
    .eq('user_id', user.id)
    .eq('category_id', input.category_id)
    .single()

  if (existing) {
    return { error: 'A budget already exists for this category' }
  }

  const { data, error } = await supabase
    .from('budgets')
    .insert({
      user_id: user.id,
      category_id: input.category_id,
      amount: input.amount,
      period: input.period,
      is_active: input.is_active,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/budgets')
  revalidatePath('/dashboard')
  return { data }
}

export async function updateBudget(id: string, input: Partial<BudgetInput>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('budgets')
    .update({
      amount: input.amount,
      period: input.period,
      is_active: input.is_active,
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/budgets')
  revalidatePath('/dashboard')
  return { data }
}

export async function deleteBudget(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('budgets')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/budgets')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function getUnbudgetedCategories(): Promise<Category[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  // Get all expense categories
  const { data: categories, error: catError } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', user.id)
    .eq('type', 'expense')

  if (catError) throw catError
  if (!categories) return []

  // Get categories that already have budgets
  const { data: budgets, error: budgetError } = await supabase
    .from('budgets')
    .select('category_id')
    .eq('user_id', user.id)

  if (budgetError) throw budgetError

  const budgetedCategoryIds = new Set((budgets || []).map(b => b.category_id))

  // Return categories without budgets
  return categories.filter(c => !budgetedCategoryIds.has(c.id))
}
