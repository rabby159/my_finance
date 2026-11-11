import React, { useState, useEffect } from 'react';
import { transactionService } from '../services/transactionService';
import { accountService } from '../services/accountService';
import { creditCardService } from '../services/creditCardService';
import { loanService } from '../services/loanService';
import { 
  Wallet, TrendingUp, TrendingDown, PiggyBank, 
  CreditCard, Landmark, ArrowUpRight, ArrowDownRight, ShieldAlert, Sparkles 
} from 'lucide-react';

interface DashboardViewProps {
  userId: string;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ userId }) => {
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [creditCards, setCreditCards] = useState<any[]>([]);
  const [loans, setLoans] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, [userId]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [accData, txData, ccData, loanData] = await Promise.all([
        accountService.getAccounts(userId),
        transactionService.getTransactions(userId),
        creditCardService.getCreditCards(userId),
        loanService.getLoans(userId)
      ]);
      setAccounts(accData);
      setTransactions(txData);
      setCreditCards(ccData);
      setLoans(loanData);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculations
  const totalBalance = accounts
    .filter(acc => acc.type !== 'Credit Card')
    .reduce((sum, acc) => sum + Number(acc.current_balance), 0);

  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthTxs = transactions.filter(tx => tx.date.startsWith(currentMonth));

  const monthlyIncome = monthTxs
    .filter(tx => tx.type === 'Income')
    .reduce((sum, tx) => sum + Number(tx.amount), 0);

  const monthlyExpenses = monthTxs
    .filter(tx => tx.type === 'Expense')
    .reduce((sum, tx) => sum + Number(tx.amount), 0);

  const monthlySavings = monthlyIncome - monthlyExpenses;

  const totalCreditCardOutstanding = creditCards.reduce((sum, card) => sum + Number(card.outstanding_balance), 0);
  const totalLoansOutstanding = loans.reduce((sum, loan) => sum + Number(loan.outstanding_principal), 0);
  const netWorth = totalBalance - totalCreditCardOutstanding - totalLoansOutstanding;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-dark-card via-[#161b22] to-dark-card border border-dark-border p-6 rounded-2xl shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-fintech-blue/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2 text-fintech-blue text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" /> Live Financial Command Center
          </div>
          <h1 className="text-3xl font-extrabold text-dark-text tracking-tight">Financial Dashboard</h1>
          <p className="text-dark-muted text-sm">Welcome back! Here is your complete real-time wealth overview.</p>
        </div>
        <div className="bg-dark-bg/80 backdrop-blur border border-dark-border px-4 py-3 rounded-xl text-right">
          <span className="text-xs text-dark-muted block">Estimated Net Worth</span>
          <span className={`text-xl font-black ${netWorth >= 0 ? 'text-fintech-green' : 'text-fintech-red'}`}>
            ৳ {netWorth.toLocaleString()}
          </span>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <p className="text-dark-muted animate-pulse font-medium">Loading financial intelligence...</p>
        </div>
      ) : (
        <>
          {/* Main Financial Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            
            {/* Total Balance Card */}
            <div className="bg-gradient-to-br from-dark-card to-[#12161c] border border-dark-border/80 rounded-2xl p-6 shadow-xl hover:border-fintech-blue/50 transition duration-300 group">
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-medium text-dark-muted uppercase tracking-wider">Total Liquid Balance</span>
                <div className="p-2.5 bg-fintech-blue/10 text-fintech-blue rounded-xl group-hover:scale-110 transition">
                  <Wallet className="w-5 h-5" />
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl font-bold text-dark-text">৳ {totalBalance.toLocaleString()}</h3>
                <p className="text-xs text-dark-muted">Across all active bank & cash accounts</p>
              </div>
            </div>

            {/* Monthly Income Card */}
            <div className="bg-gradient-to-br from-dark-card to-[#12161c] border border-dark-border/80 rounded-2xl p-6 shadow-xl hover:border-fintech-green/50 transition duration-300 group">
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-medium text-dark-muted uppercase tracking-wider">Monthly Income</span>
                <div className="p-2.5 bg-fintech-green/10 text-fintech-green rounded-xl group-hover:scale-110 transition">
                  <ArrowUpRight className="w-5 h-5" />
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl font-bold text-fintech-green">৳ {monthlyIncome.toLocaleString()}</h3>
                <p className="text-xs text-dark-muted">Earned during this calendar month</p>
              </div>
            </div>

            {/* Monthly Expenses Card */}
            <div className="bg-gradient-to-br from-dark-card to-[#12161c] border border-dark-border/80 rounded-2xl p-6 shadow-xl hover:border-fintech-red/50 transition duration-300 group">
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-medium text-dark-muted uppercase tracking-wider">Monthly Expenses</span>
                <div className="p-2.5 bg-fintech-red/10 text-fintech-red rounded-xl group-hover:scale-110 transition">
                  <ArrowDownRight className="w-5 h-5" />
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl font-bold text-fintech-red">৳ {monthlyExpenses.toLocaleString()}</h3>
                <p className="text-xs text-dark-muted">Total spent this month</p>
              </div>
            </div>

            {/* Net Savings Card */}
            <div className="bg-gradient-to-br from-dark-card to-[#12161c] border border-dark-border/80 rounded-2xl p-6 shadow-xl hover:border-purple-500/50 transition duration-300 group">
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-medium text-dark-muted uppercase tracking-wider">Monthly Net Surplus</span>
                <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-xl group-hover:scale-110 transition">
                  <PiggyBank className="w-5 h-5" />
                </div>
              </div>
              <div className="space-y-1">
                <h3 className={`text-2xl font-bold ${monthlySavings >= 0 ? 'text-purple-400' : 'text-fintech-red'}`}>
                  ৳ {monthlySavings.toLocaleString()}
                </h3>
                <p className="text-xs text-dark-muted">Income minus monthly expenses</p>
              </div>
            </div>

          </div>

          {/* Secondary Overview Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Accounts Overview Section */}
            <div className="bg-dark-card border border-dark-border rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-lg text-dark-text flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-fintech-blue" /> Accounts & Wallets Summary
                </h3>
                <span className="text-xs text-dark-muted bg-dark-bg px-2.5 py-1 rounded-full border border-dark-border">
                  {accounts.length} Active
                </span>
              </div>

              {accounts.length === 0 ? (
                <div className="py-8 text-center text-dark-muted text-sm bg-dark-bg/50 rounded-xl border border-dark-border border-dashed">
                  No accounts added yet. Go to Accounts & Wallets to add one.
                </div>
              ) : (
                <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
                  {accounts.map(acc => (
                    <div key={acc.id} className="flex justify-between items-center bg-dark-bg/60 border border-dark-border/80 p-3.5 rounded-xl hover:border-fintech-blue/40 transition">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-dark-card rounded-lg border border-dark-border text-fintech-blue">
                          {acc.type === 'Bank' ? <Landmark className="w-4 h-4" /> : acc.type === 'Credit Card' ? <CreditCard className="w-4 h-4" /> : <Wallet className="w-4 h-4" />}
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm text-dark-text">{acc.name}</h4>
                          <span className="text-xs text-dark-muted">{acc.type} {acc.institution ? `• ${acc.institution}` : ''}</span>
                        </div>
                      </div>
                      <span className={`font-bold text-sm ${Number(acc.current_balance) < 0 ? 'text-fintech-red' : 'text-dark-text'}`}>
                        ৳ {Number(acc.current_balance).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Activity Section */}
            <div className="bg-dark-card border border-dark-border rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-lg text-dark-text flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-fintech-green" /> Recent Activity
                </h3>
                <span className="text-xs text-dark-muted bg-dark-bg px-2.5 py-1 rounded-full border border-dark-border">
                  Latest Transactions
                </span>
              </div>

              {transactions.length === 0 ? (
                <div className="py-8 text-center text-dark-muted text-sm bg-dark-bg/50 rounded-xl border border-dark-border border-dashed">
                  No recent transactions found.
                </div>
              ) : (
                <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
                  {transactions.slice(0, 5).map(tx => (
                    <div key={tx.id} className="flex justify-between items-center bg-dark-bg/60 border border-dark-border/80 p-3.5 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg border border-dark-border ${tx.type === 'Income' ? 'bg-fintech-green/10 text-fintech-green' : tx.type === 'Expense' ? 'bg-fintech-red/10 text-fintech-red' : 'bg-fintech-blue/10 text-fintech-blue'}`}>
                          {tx.type === 'Income' ? <ArrowUpRight className="w-4 h-4" /> : tx.type === 'Expense' ? <ArrowDownRight className="w-4 h-4" /> : <Wallet className="w-4 h-4" />}
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm text-dark-text">{tx.category?.name || tx.type}</h4>
                          <span className="text-xs text-dark-muted">{tx.description || tx.date}</span>
                        </div>
                      </div>
                      <span className={`font-bold text-sm ${tx.type === 'Income' ? 'text-fintech-green' : tx.type === 'Expense' ? 'text-fintech-red' : 'text-fintech-blue'}`}>
                        {tx.type === 'Income' ? '+' : tx.type === 'Expense' ? '-' : ''} ৳ {Number(tx.amount).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </>
      )}

    </div>
  );
};