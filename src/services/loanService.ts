import { supabase } from '../lib/supabase'

export interface Loan {
  id: string
  user_id: string
  loan_name: string
  lender?: string
  original_amount: number
  outstanding_principal: number
  interest_rate?: number
  emi_amount: number
  total_duration: number
  loan_start_date: string
  payment_due_day?: number
  status: 'Active' | 'Completed'
}

export const loanService = {
  async getLoans(userId: string): Promise<Loan[]> {
    const { data, error } = await supabase
      .from('loans')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  async createLoan(loanData: Omit<Loan, 'id' | 'outstanding_principal' | 'status'>) {
    const { data, error } = await supabase
      .from('loans')
      .insert([
        {
          ...loanData,
          outstanding_principal: loanData.original_amount,
          status: 'Active',
        }
      ])
      .select()

    if (error) throw error
    return data?.[0]
  },

async recordEMIPayment(paymentData: {
    loan_id: string
    payment_amount: number
    principal_paid: number
    interest_paid: number
    fees?: number
    account_id: string
    payment_date: string
    notes?: string
  }) {
    // 1. Check if paying account has sufficient balance
    const { data: acc, error: accError } = await supabase
      .from('accounts')
      .select('name, current_balance')
      .eq('id', paymentData.account_id)
      .single()

    if (accError || !acc) throw new Error('Selected account not found.')

    if (Number(acc.current_balance) < Number(paymentData.payment_amount)) {
      throw new Error(`Insufficient funds in "${acc.name}". Current balance is ৳ ${Number(acc.current_balance).toLocaleString()}, but payment is ৳ ${Number(paymentData.payment_amount).toLocaleString()}.`)
    }

    // 2. Insert payment record
    const { error: payError } = await supabase
      .from('loan_payments')
      .insert([paymentData])

    if (payError) throw payError

    // 3. Fetch current loan details to update outstanding principal
    const { data: loan } = await supabase
      .from('loans')
      .select('outstanding_principal')
      .eq('id', paymentData.loan_id)
      .single()

    if (loan) {
      const newPrincipal = Math.max(0, Number(loan.outstanding_principal) - Number(paymentData.principal_paid))
      const status = newPrincipal === 0 ? 'Completed' : 'Active'

      await supabase
        .from('loans')
        .update({ outstanding_principal: newPrincipal, status })
        .eq('id', paymentData.loan_id)
    }

    // 4. Deduct total payment amount from the paying account safely
    await supabase
      .from('accounts')
      .update({ current_balance: Number(acc.current_balance) - Number(paymentData.payment_amount) })
      .eq('id', paymentData.account_id)
  },
}