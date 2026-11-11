import { supabase } from '../lib/supabase'

export interface Transaction {
  id: string
  user_id: string
  type: 'Income' | 'Expense' | 'Transfer'
  amount: number
  category_id?: string
  account_id: string
  destination_account_id?: string
  date: string
  title: string
  description?: string
  is_essential?: boolean
  reference_id?: string
  created_at: string
}

export const transactionService = {
  async getTransactions(userId: string): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        categories (name, color, icon),
        accounts:account_id (name, type),
        destination_account:destination_account_id (name, type)
      `)
      .eq('user_id', userId)
      .order('date', { ascending: false })

    if (error) throw error
    return data || []
  },

  async createTransaction(txData: {
    user_id: string
    type: 'Income' | 'Expense' | 'Transfer'
    amount: number
    category_id?: string
    account_id: string
    destination_account_id?: string
    date: string
    title: string
    description?: string
    is_essential?: boolean
  }) {
    // 1. Insert transaction
    const { data, error } = await supabase
      .from('transactions')
      .insert([txData])
      .select()

    if (error) throw error

    // 2. Update Account Balance(s) accordingly
    const { amount, type, account_id, destination_account_id } = txData

    if (type === 'Income') {
      // Fetch current balance and add
      const { data: acc } = await supabase.from('accounts').select('current_balance').eq('id', account_id).single()
      if (acc) {
        await supabase
          .from('accounts')
          .update({ current_balance: Number(acc.current_balance) + Number(amount) })
          .eq('id', account_id)
      }
    } else if (type === 'Expense') {
      // Fetch current balance and subtract
      const { data: acc } = await supabase.from('accounts').select('current_balance').eq('id', account_id).single()
      if (acc) {
        await supabase
          .from('accounts')
          .update({ current_balance: Number(acc.current_balance) - Number(amount) })
          .eq('id', account_id)
      }
    } else if (type === 'Transfer' && destination_account_id) {
      // Subtract from source account
      const { data: srcAcc } = await supabase.from('accounts').select('current_balance').eq('id', account_id).single()
      if (srcAcc) {
        await supabase
          .from('accounts')
          .update({ current_balance: Number(srcAcc.current_balance) - Number(amount) })
          .eq('id', account_id)
      }
      // Add to destination account
      const { data: destAcc } = await supabase.from('accounts').select('current_balance').eq('id', destination_account_id).single()
      if (destAcc) {
        await supabase
          .from('accounts')
          .update({ current_balance: Number(destAcc.current_balance) + Number(amount) })
          .eq('id', destination_account_id)
      }
    }

    return data?.[0]
  },

  async deleteTransaction(id: string, userId: string) {
    // Optional: Fetch transaction before deleting to reverse its balance impact if needed
    const { data: tx } = await supabase.from('transactions').select('*').eq('id', id).single()
    if (!tx) return

    // Reverse balance impact
    if (tx.type === 'Income') {
      const { data: acc } = await supabase.from('accounts').select('current_balance').eq('id', tx.account_id).single()
      if (acc) {
        await supabase.from('accounts').update({ current_balance: Number(acc.current_balance) - Number(tx.amount) }).eq('id', tx.account_id)
      }
    } else if (tx.type === 'Expense') {
      const { data: acc } = await supabase.from('accounts').select('current_balance').eq('id', tx.account_id).single()
      if (acc) {
        await supabase.from('accounts').update({ current_balance: Number(acc.current_balance) + Number(tx.amount) }).eq('id', tx.account_id)
      }
    }

    // Delete record
    const { error } = await supabase.from('transactions').delete().eq('id', id)
    if (error) throw error
  }
}