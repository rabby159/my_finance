import { supabase } from '../lib/supabase'

export interface SavingsGoal {
  id: string
  user_id: string
  name: string
  target_amount: number
  current_saved_amount: number
  target_date: string
  linked_account_id?: string
  description?: string
  status: 'Active' | 'Completed'
}

export const savingsService = {
  async getSavingsGoals(userId: string): Promise<SavingsGoal[]> {
    const { data, error } = await supabase
      .from('savings_goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  async createSavingsGoal(goalData: Omit<SavingsGoal, 'id' | 'current_saved_amount' | 'status'>) {
    const { data, error } = await supabase
      .from('savings_goals')
      .insert([{ ...goalData, current_saved_amount: 0, status: 'Active' }])
      .select()

    if (error) throw error
    return data?.[0]
  },

  async contributeToGoal(goalId: string, amount: number) {
    // Fetch current saved amount
    const { data: goal } = await supabase.from('savings_goals').select('current_saved_amount, target_amount').eq('id', goalId).single()
    if (!goal) return

    const newSaved = Number(goal.current_saved_amount) + Number(amount)
    const status = newSaved >= goal.target_amount ? 'Completed' : 'Active'

    const { data, error } = await supabase
      .from('savings_goals')
      .update({ current_saved_amount: newSaved, status })
      .eq('id', goalId)
      .select()

    if (error) throw error
    return data?.[0]
  },

  async deleteGoal(id: string) {
    const { error } = await supabase.from('savings_goals').delete().eq('id', id)
    if (error) throw error
  }
}