'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { TransactionInput } from '@/lib/validations'
import type { Transaction, TransactionWithCategory } from '@/types'
import { format, startOfMonth, endOfMonth } from 'date-fns'

export async function getTransactions(options?: {
  startDate?: Date
  endDate?: Date
  type?: 'income' | 'expense'
  categoryId?: string
  limit?: number
}): Promise<TransactionWithCategory[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  let query = supabase
    .from('transactions')
    .select(`
      *,
      category:categories(*)
    `)
    .eq('user_id', user.id)
    .order('date', { ascending: false })

  if (options?.startDate) {
    query = query.gte('date', format(options.startDate, 'yyyy-MM-dd'))
  }

  if (options?.endDate) {
    query = query.lte('date', format(options.endDate, 'yyyy-MM-dd'))
  }

  if (options?.type) {
    query = query.eq('type', options.type)
  }

  if (options?.categoryId) {
    query = query.eq('category_id', options.categoryId)
  }

  if (options?.limit) {
    query = query.limit(options.limit)
  }

  const { data, error } = await query

  if (error) throw error
  return data || []
}

export async function getMonthlyTransactions(date?: Date): Promise<TransactionWithCategory[]> {
  const targetDate = date || new Date()
  return getTransactions({
    startDate: startOfMonth(targetDate),
    endDate: endOfMonth(targetDate),
  })
}

export async function getRecentTransactions(limit: number = 5): Promise<TransactionWithCategory[]> {
  return getTransactions({ limit })
}

export async function createTransaction(input: TransactionInput) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('transactions')
    .insert({
      user_id: user.id,
      category_id: input.category_id || null,
      amount: input.amount,
      type: input.type,
      description: input.description,
      date: input.date,
      notes: input.notes || null,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/transactions')
  revalidatePath('/dashboard')
  revalidatePath('/budgets')
  return { data }
}

export async function updateTransaction(id: string, input: Partial<TransactionInput>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('transactions')
    .update({
      category_id: input.category_id,
      amount: input.amount,
      type: input.type,
      description: input.description,
      date: input.date,
      notes: input.notes,
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/transactions')
  revalidatePath('/dashboard')
  revalidatePath('/budgets')
  return { data }
}

export async function deleteTransaction(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/transactions')
  revalidatePath('/dashboard')
  revalidatePath('/budgets')
  return { success: true }
}

export async function getMonthlySummary(date?: Date) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { income: 0, expense: 0, balance: 0 }

  const targetDate = date || new Date()
  const startDate = format(startOfMonth(targetDate), 'yyyy-MM-dd')
  const endDate = format(endOfMonth(targetDate), 'yyyy-MM-dd')

  const { data, error } = await supabase
    .from('transactions')
    .select('amount, type')
    .eq('user_id', user.id)
    .gte('date', startDate)
    .lte('date', endDate)

  if (error) throw error

  const summary = (data || []).reduce(
    (acc, transaction) => {
      if (transaction.type === 'income') {
        acc.income += Number(transaction.amount)
      } else {
        acc.expense += Number(transaction.amount)
      }
      return acc
    },
    { income: 0, expense: 0 }
  )

  return {
    ...summary,
    balance: summary.income - summary.expense,
  }
}

export async function getSpendingByCategory(date?: Date) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  const targetDate = date || new Date()
  const startDate = format(startOfMonth(targetDate), 'yyyy-MM-dd')
  const endDate = format(endOfMonth(targetDate), 'yyyy-MM-dd')

  const { data, error } = await supabase
    .from('transactions')
    .select(`
      amount,
      category:categories(id, name, color, icon)
    `)
    .eq('user_id', user.id)
    .eq('type', 'expense')
    .gte('date', startDate)
    .lte('date', endDate)

  if (error) throw error

  // Group by category
  const categoryMap = new Map<string, { name: string; color: string; total: number }>()

  for (const transaction of data || []) {
    const categoryData = transaction.category as unknown
    const category = Array.isArray(categoryData) ? categoryData[0] : categoryData
    const cat = category as { id: string; name: string; color: string } | null | undefined
    const key = cat?.id || 'uncategorized'
    const name = cat?.name || 'Uncategorized'
    const color = cat?.color || '#64748b'

    const existing = categoryMap.get(key)
    if (existing) {
      existing.total += Number(transaction.amount)
    } else {
      categoryMap.set(key, { name, color, total: Number(transaction.amount) })
    }
  }

  return Array.from(categoryMap.values()).sort((a, b) => b.total - a.total)
}

export async function getMonthlySpendingHistory(months: number = 6, categoryId?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  const now = new Date()
  const result: { month: string; total: number }[] = []

  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const startDate = format(startOfMonth(date), 'yyyy-MM-dd')
    const endDate = format(endOfMonth(date), 'yyyy-MM-dd')

    let query = supabase
      .from('transactions')
      .select('amount')
      .eq('user_id', user.id)
      .eq('type', 'expense')
      .gte('date', startDate)
      .lte('date', endDate)

    if (categoryId) {
      query = query.eq('category_id', categoryId)
    }

    const { data, error } = await query

    if (error) throw error

    const total = (data || []).reduce((sum, tx) => sum + Number(tx.amount), 0)

    result.push({
      month: format(date, 'MMM yyyy'),
      total,
    })
  }

  return result
}
