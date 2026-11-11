import { supabase } from '../lib/supabase'

export interface Budget {
  id: string
  user_id: string
  month: string // format: 'YYYY-MM'
  total_budget: number
}

export interface BudgetCategoryAllocation {
  id: string
  budget_id: string
  category_id: string
  allocated_amount: number
}

export const budgetService = {
  // Get budget for a specific month (e.g., '2026-11')
  async getMonthlyBudget(userId: string, month: string) {
    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', userId)
      .eq('month', month)
      .maybeSingle()

    if (error) throw error
    return data
  },

  // Create or update monthly budget
  async setMonthlyBudget(userId: string, month: string, total_budget: number) {
    // Check if budget already exists for this month
    const existing = await this.getMonthlyBudget(userId, month)

    if (existing) {
      const { data, error } = await supabase
        .from('budgets')
        .update({ total_budget })
        .eq('id', existing.id)
        .select()
      if (error) throw error
      return data?.[0]
    } else {
      const { data, error } = await supabase
        .from('budgets')
        .insert([{ user_id: userId, month, total_budget }])
        .select()
      if (error) throw error
      return data?.[0]
    }
  }
}