import { supabase } from '../lib/supabase'

export interface CreditCard {
  id: string
  user_id: string
  card_name: string
  issuing_bank: string
  credit_limit: number
  outstanding_balance: number
  statement_date?: number
  payment_due_date?: number
  notes?: string
}

export const creditCardService = {
  async getCreditCards(userId: string): Promise<CreditCard[]> {
    const { data, error } = await supabase
      .from('credit_cards')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  async createCreditCard(cardData: Omit<CreditCard, 'id' | 'outstanding_balance'>) {
    const { data, error } = await supabase
      .from('credit_cards')
      .insert([{ ...cardData, outstanding_balance: 0.00 }])
      .select()

    if (error) throw error
    return data?.[0]
  },

  async payCreditCardBill(cardId: string, accountId: string, amount: number) {
    // 1. Check bank/account balance
    const { data: acc, error: accError } = await supabase
      .from('accounts')
      .select('name, current_balance')
      .eq('id', accountId)
      .single()

    if (accError || !acc) throw new Error('Selected payment account not found.')

    if (Number(acc.current_balance) < amount) {
      throw new Error(`Insufficient funds in "${acc.name}" to pay this credit card bill.`)
    }

    // 2. Fetch credit card outstanding balance
    const { data: card } = await supabase
      .from('credit_cards')
      .select('outstanding_balance, card_name')
      .eq('id', cardId)
      .single()

    if (!card) throw new Error('Credit card not found.')

    const newOutstanding = Math.max(0, Number(card.outstanding_balance) - amount)

    // 3. Update credit card outstanding balance
    await supabase
      .from('credit_cards')
      .update({ outstanding_balance: newOutstanding })
      .eq('id', cardId)

    // 4. Deduct amount from bank account (No second expense created to avoid double-counting)
    await supabase
      .from('accounts')
      .update({ current_balance: Number(acc.current_balance) - amount })
      .eq('id', accountId)
  },

  async deleteCreditCard(id: string) {
    const { error } = await supabase.from('credit_cards').delete().eq('id', id)
    if (error) throw error
  }
}