import React, { useState, useEffect } from 'react';
import { budgetService } from '../services/budgetService';
import { transactionService } from '../services/transactionService';
import { Target, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';

interface BudgetsViewProps {
  userId: string;
}

export const BudgetsView: React.FC<BudgetsViewProps> = ({ userId }) => {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const [month, setMonth] = useState(currentMonth);
  const [totalBudget, setTotalBudget] = useState('');
  const [currentBudgetRecord, setCurrentBudgetRecord] = useState<any>(null);
  const [monthlyExpenses, setMonthlyExpenses] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBudgetData();
  }, [userId, month]);

  const loadBudgetData = async () => {
    try {
      setLoading(true);
      const [budget, transactions] = await Promise.all([
        budgetService.getMonthlyBudget(userId, month),
        transactionService.getTransactions(userId)
      ]);
      setCurrentBudgetRecord(budget);
      if (budget) {
        setTotalBudget(budget.total_budget.toString());
      } else {
        setTotalBudget('');
      }

      const expenses = transactions
        .filter((tx: any) => tx.type === 'Expense' && tx.date.startsWith(month))
        .reduce((sum: number, tx: any) => sum + Number(tx.amount), 0);
      setMonthlyExpenses(expenses);
    } catch (error) {
      console.error('Error loading budget data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await budgetService.setMonthlyBudget(userId, month, parseFloat(totalBudget) || 0);
      loadBudgetData();
      alert('Monthly budget saved successfully!');
    } catch (error) {
      console.error('Error saving budget:', error);
    }
  };

  const budgetLimit = currentBudgetRecord ? Number(currentBudgetRecord.total_budget) : 0;
  const utilization = budgetLimit > 0 ? (monthlyExpenses / budgetLimit) * 100 : 0;
  const remaining = budgetLimit - monthlyExpenses;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-dark-text">Monthly Budget Management</h1>
          <p className="text-dark-muted text-sm">Set your spending limits and monitor budget performance</p>
        </div>
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="bg-dark-card border border-dark-border rounded-lg px-3 py-2 text-dark-text focus:outline-none focus:border-fintech-blue text-sm"
        />
      </div>

      {/* Budget Set Form */}
      <div className="bg-dark-card border border-dark-border rounded-xl p-6 shadow-lg">
        <h3 className="font-semibold text-lg text-dark-text mb-4">Set Total Budget for {month}</h3>
        <form onSubmit={handleSaveBudget} className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-xs text-dark-muted mb-1">Monthly Budget Limit (BDT)</label>
            <input
              type="number"
              step="0.01"
              required
              placeholder="e.g. 30000"
              value={totalBudget}
              onChange={(e) => setTotalBudget(e.target.value)}
              className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-dark-text focus:outline-none focus:border-fintech-blue"
            />
          </div>
          <button
            type="submit"
            className="bg-fintech-blue hover:opacity-90 text-white font-semibold px-6 py-2 rounded-lg transition"
          >
            Save Budget
          </button>
        </form>
      </div>

      {/* Budget Overview Card */}
      {budgetLimit > 0 && (
        <div className="bg-dark-card border border-dark-border rounded-xl p-6 shadow-lg space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-lg text-dark-text">Performance Overview</h3>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              utilization >= 100 ? 'bg-fintech-red/10 text-fintech-red border border-fintech-red' :
              utilization >= 80 ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500' :
              'bg-fintech-green/10 text-fintech-green border border-fintech-green'
            }`}>
              {utilization >= 100 ? 'Budget Exceeded!' : utilization >= 80 ? 'Warning: 80% Reached' : 'On Track'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-dark-bg p-4 rounded-xl border border-dark-border">
              <span className="text-xs text-dark-muted block">Total Budget</span>
              <span className="text-xl font-bold text-dark-text">৳ {budgetLimit.toLocaleString()}</span>
            </div>
            <div className="bg-dark-bg p-4 rounded-xl border border-dark-border">
              <span className="text-xs text-dark-muted block">Actual Spent</span>
              <span className="text-xl font-bold text-fintech-red">৳ {monthlyExpenses.toLocaleString()}</span>
            </div>
            <div className="bg-dark-bg p-4 rounded-xl border border-dark-border">
              <span className="text-xs text-dark-muted block">Remaining Budget</span>
              <span className={`text-xl font-bold ${remaining >= 0 ? 'text-fintech-green' : 'text-fintech-red'}`}>
                ৳ {remaining.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-dark-muted">
              <span>Utilization: {utilization.toFixed(1)}%</span>
              <span>{monthlyExpenses.toLocaleString()} / {budgetLimit.toLocaleString()} BDT</span>
            </div>
            <div className="w-full bg-dark-bg rounded-full h-3 border border-dark-border overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  utilization >= 100 ? 'bg-fintech-red' :
                  utilization >= 80 ? 'bg-yellow-500' :
                  'bg-fintech-green'
                }`}
                style={{ width: `${Math.min(utilization, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};