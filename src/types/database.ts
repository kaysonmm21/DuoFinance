export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type TransactionType = 'income' | 'expense'
export type BudgetPeriod = 'monthly' | 'weekly' | 'yearly'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          currency: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          currency?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          currency?: string
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          user_id: string
          name: string
          icon: string
          color: string
          type: TransactionType
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          icon?: string
          color?: string
          type: TransactionType
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          icon?: string
          color?: string
          type?: TransactionType
          created_at?: string
          updated_at?: string
        }
      }
      budgets: {
        Row: {
          id: string
          user_id: string
          category_id: string
          amount: number
          period: BudgetPeriod
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category_id: string
          amount: number
          period?: BudgetPeriod
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          category_id?: string
          amount?: number
          period?: BudgetPeriod
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          category_id: string | null
          amount: number
          type: TransactionType
          description: string
          date: string
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category_id?: string | null
          amount: number
          type: TransactionType
          description: string
          date: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          category_id?: string | null
          amount?: number
          type?: TransactionType
          description?: string
          date?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Enums: {
      transaction_type: TransactionType
      budget_period: BudgetPeriod
    }
  }
}

// Helper types for convenience
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Category = Database['public']['Tables']['categories']['Row']
export type Budget = Database['public']['Tables']['budgets']['Row']
export type Transaction = Database['public']['Tables']['transactions']['Row']

export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type CategoryInsert = Database['public']['Tables']['categories']['Insert']
export type BudgetInsert = Database['public']['Tables']['budgets']['Insert']
export type TransactionInsert = Database['public']['Tables']['transactions']['Insert']

export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']
export type CategoryUpdate = Database['public']['Tables']['categories']['Update']
export type BudgetUpdate = Database['public']['Tables']['budgets']['Update']
export type TransactionUpdate = Database['public']['Tables']['transactions']['Update']

// Extended types with relations
export type CategoryWithBudget = Category & {
  budget?: Budget | null
}

export type TransactionWithCategory = Transaction & {
  category?: Category | null
}

export type BudgetWithCategory = Budget & {
  category: Category
  spent?: number
}
