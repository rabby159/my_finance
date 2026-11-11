import React, { useState, useEffect } from 'react';
import { accountService } from '../services/accountService';
import type { Account } from '../services/accountService';
import { transactionService } from '../services/transactionService';
import type { Transaction } from '../services/transactionService';
import { Wallet, TrendingUp, TrendingDown, DollarSign, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

interface DashboardViewProps {
  userId: string;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ userId }) => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [userId]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [accData, txData] = await Promise.all([
        accountService.getAccounts(userId),
        transactionService.getTransactions(userId)
      ]);
      setAccounts(accData);
      setTransactions(txData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculations
  // Total Balance = Sum of all positive asset accounts (excluding credit card liabilities from total liquid cash)
  const totalBalance = accounts
    .filter(acc => acc.type !== 'Credit Card')
    .reduce((sum, acc) => sum + Number(acc.current_balance), 0);

  // Current month income & expenses
  const currentMonth = new Date().toISOString().slice(0, 7); // 'YYYY-MM'
  
  const monthlyIncome = transactions
    .filter(tx => tx.type === 'Income' && tx.date.startsWith(currentMonth))
    .reduce((sum, tx) => sum + Number(tx.amount), 0);

  const monthlyExpenses = transactions
    .filter(tx => tx.type === 'Expense' && tx.date.startsWith(currentMonth))
    .reduce((sum, tx) => sum + Number(tx.amount), 0);

  const monthlyNetSavings = monthlyIncome - monthlyExpenses;

  if (loading) {
    return <div className="p-6 text-dark-muted">Loading dashboard overview...</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-dark-text">Financial Dashboard</h1>
        <p className="text-dark-muted text-sm">Welcome back! Here is your complete financial overview for this month.</p>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Balance */}
        <div className="bg-dark-card border border-dark-border rounded-xl p-5 shadow-lg">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs text-dark-muted font-medium">Total Balance</span>
            <div className="p-2 bg-fintech-blue/10 text-fintech-blue rounded-lg">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-dark-text">৳ {totalBalance.toLocaleString()}</h3>
          <span className="text-xs text-dark-muted mt-1 block">Across all active accounts</span>
        </div>

        {/* Monthly Income */}
        <div className="bg-dark-card border border-dark-border rounded-xl p-5 shadow-lg">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs text-dark-muted font-medium">Monthly Income</span>
            <div className="p-2 bg-fintech-green/10 text-fintech-green rounded-lg">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-fintech-green">৳ {monthlyIncome.toLocaleString()}</h3>
          <span className="text-xs text-dark-muted mt-1 block">This month's earnings</span>
        </div>

        {/* Monthly Expenses */}
        <div className="bg-dark-card border border-dark-border rounded-xl p-5 shadow-lg">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs text-dark-muted font-medium">Monthly Expenses</span>
            <div className="p-2 bg-fintech-red/10 text-fintech-red rounded-lg">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-fintech-red">৳ {monthlyExpenses.toLocaleString()}</h3>
          <span className="text-xs text-dark-muted mt-1 block">This month's spending</span>
        </div>

        {/* Net Savings */}
        <div className="bg-dark-card border border-dark-border rounded-xl p-5 shadow-lg">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs text-dark-muted font-medium">Monthly Net Savings</span>
            <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <h3 className={`text-2xl font-bold ${monthlyNetSavings >= 0 ? 'text-fintech-green' : 'text-fintech-red'}`}>
            ৳ {monthlyNetSavings.toLocaleString()}
          </h3>
          <span className="text-xs text-dark-muted mt-1 block">Income minus expenses</span>
        </div>

      </div>

      {/* Two Column Layout: Accounts Overview & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Accounts Summary Box */}
        <div className="bg-dark-card border border-dark-border rounded-xl p-5 shadow-lg lg:col-span-1 space-y-4">
          <h3 className="font-semibold text-lg text-dark-text border-b border-dark-border pb-3">Accounts Overview</h3>
          {accounts.length === 0 ? (
            <p className="text-sm text-dark-muted">No accounts added yet.</p>
          ) : (
            <div className="space-y-3">
              {accounts.map(acc => (
                <div key={acc.id} className="flex justify-between items-center p-3 bg-dark-bg rounded-lg border border-dark-border">
                  <div>
                    <h4 className="font-medium text-sm text-dark-text">{acc.name}</h4>
                    <span className="text-xs text-dark-muted">{acc.type}</span>
                  </div>
                  <span className="font-semibold text-sm text-dark-text">৳ {Number(acc.current_balance).toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Transactions Box */}
        <div className="bg-dark-card border border-dark-border rounded-xl p-5 shadow-lg lg:col-span-2 space-y-4">
          <h3 className="font-semibold text-lg text-dark-text border-b border-dark-border pb-3">Recent Activity</h3>
          {transactions.length === 0 ? (
            <p className="text-sm text-dark-muted">No recent transactions found.</p>
          ) : (
            <div className="divide-y divide-dark-border">
              {transactions.slice(0, 5).map((tx: any) => (
                <div key={tx.id} className="py-3 flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-sm text-dark-text">{tx.title}</h4>
                    <span className="text-xs text-dark-muted">{tx.date} • {tx.accounts?.name}</span>
                  </div>
                  <span className={`font-bold text-sm ${
                    tx.type === 'Income' ? 'text-fintech-green' :
                    tx.type === 'Expense' ? 'text-fintech-red' :
                    'text-fintech-blue'
                  }`}>
                    {tx.type === 'Income' ? '+' : tx.type === 'Expense' ? '-' : ''} ৳ {Number(tx.amount).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};