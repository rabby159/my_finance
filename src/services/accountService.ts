import { supabase } from '../lib/supabase'

export interface Account {
  id: string
  user_id: string
  name: string
  type: 'Cash' | 'Bank' | 'bKash' | 'Nagad' | 'Credit Card'
  institution?: string
  opening_balance: number
  current_balance: number
  credit_limit?: number
  opening_date: string
  account_number_ref?: string
  notes?: string
  is_active: boolean
}

export const accountService = {
  async getAccounts(userId: string): Promise<Account[]> {
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  async createAccount(accountData: Omit<Account, 'id' | 'current_balance' | 'created_at' | 'updated_at'>) {
    // Check if account with same name already exists for user to prevent duplicates
    const { data: existing } = await supabase
      .from('accounts')
      .select('id, name')
      .eq('user_id', accountData.user_id)
      .ilike('name', accountData.name)

    if (existing && existing.length > 0) {
      throw new Error(`An account with the name "${accountData.name}" already exists!`)
    }

    const { data, error } = await supabase
      .from('accounts')
      .insert([
        {
          ...accountData,
          current_balance: accountData.opening_balance,
        }
      ])
      .select()

    if (error) throw error
    return data?.[0]
  },

  async updateAccount(id: string, updates: Partial<Account>) {
    const { data, error } = await supabase
      .from('accounts')
      .update(updates)
      .eq('id', id)
      .select()

    if (error) throw error
    return data?.[0]
  },

  async deleteAccount(id: string) {
    const { error } = await supabase
      .from('accounts')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}