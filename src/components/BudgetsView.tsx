import React, { useState, useEffect } from 'react';
import { budgetService } from '../services/budgetService';
import { categoryService } from '../services/categoryService';
import { transactionService } from '../services/transactionService';
import { PieChart, Plus, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';

interface BudgetsViewProps {
  userId: string;
}

export const BudgetsView: React.FC<BudgetsViewProps> = ({ userId }) => {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form states
  const [categoryId, setCategoryId] = useState('');
  const [budgetLimit, setBudgetLimit] = useState('');

  useEffect(() => {
    loadData();
  }, [userId, selectedMonth]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [budgetData, catData, txData] = await Promise.all([
        budgetService.getBudgets(userId, selectedMonth),
        categoryService.getCategories(userId),
        transactionService.getTransactions(userId)
      ]);
      setBudgets(budgetData);
      setCategories(catData.filter(c => c.type === 'Expense'));
      if (catData.length > 0) setCategoryId(catData[0].id);
      setTransactions(txData);
    } catch (error) {
      console.error('Error loading budgets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await budgetService.setBudget({
        user_id: userId,
        category_id: categoryId,
        month: selectedMonth,
        budget_limit: parseFloat(budgetLimit) || 0
      });
      setShowModal(false);
      setBudgetLimit('');
      loadData();
    } catch (error) {
      console.error('Error saving budget:', error);
    }
  };

  // Calculate actual spending per category for selected month
  const monthTxs = transactions.filter(tx => tx.date.startsWith(selectedMonth) && tx.type === 'Expense');
  const spentMap: { [key: string]: number } = {};
  monthTxs.forEach(tx => {
    if (tx.category_id) {
      spentMap[tx.category_id] = (spentMap[tx.category_id] || 0) + Number(tx.amount);
    }
  });

  const totalBudgetLimit = budgets.reduce((sum, b) => sum + Number(b.budget_limit), 0);
  const totalSpent = Object.values(spentMap).reduce((sum, val) => sum + val, 0);
  const totalUtilization = totalBudgetLimit > 0 ? (totalSpent / totalBudgetLimit) * 100 : 0;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-dark-card via-[#161b22] to-dark-card border border-dark-border p-6 rounded-2xl shadow-xl">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-dark-text tracking-tight">Monthly Budgets</h1>
          <p className="text-dark-muted text-sm">Set category spending limits and monitor utilization in real-time</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-dark-card border border-dark-border rounded-xl px-4 py-2.5 text-dark-text text-sm focus:outline-none focus:border-fintech-blue"
          />
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-fintech-blue hover:opacity-90 text-white font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-fintech-blue/20 transition"
          >
            <Plus className="w-5 h-5" /> Set Budget
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <p className="text-dark-muted animate-pulse font-medium">Loading budgets...</p>
        </div>
      ) : (
        <>
          {/* Summary Metric Card */}
          <div className="bg-gradient-to-br from-dark-card to-[#12161c] border border-dark-border/80 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-xs text-dark-muted uppercase tracking-wider">Overall Budget Performance ({selectedMonth})</span>
                <h3 className="text-2xl font-black text-dark-text mt-1">
                  ৳ {totalSpent.toLocaleString()} <span className="text-sm font-normal text-dark-muted">spent of ৳ {totalBudgetLimit.toLocaleString()}</span>
                </h3>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${totalUtilization >= 100 ? 'bg-fintech-red/10 text-fintech-red border border-fintech-red/30' : 'bg-fintech-green/10 text-fintech-green border border-fintech-green/30'}`}>
                {totalUtilization.toFixed(1)}% Used
              </span>
            </div>
            <div className="w-full bg-dark-bg rounded-full h-3 border border-dark-border overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${totalUtilization >= 100 ? 'bg-fintech-red' : totalUtilization >= 80 ? 'bg-yellow-500' : 'bg-fintech-green'}`} 
                style={{ width: `${Math.min(totalUtilization, 100)}%` }}
              ></div>
            </div>
          </div>

          {/* Budget List Grid */}
          {budgets.length === 0 ? (
            <div className="bg-dark-card border border-dark-border border-dashed rounded-2xl p-12 text-center text-dark-muted">
              No budgets set for {selectedMonth}. Click "Set Budget" to start tracking.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {budgets.map((budget) => {
                const spent = spentMap[budget.category_id] || 0;
                const limit = Number(budget.budget_limit);
                const utilization = limit > 0 ? (spent / limit) * 100 : 0;

                return (
                  <div key={budget.id} className="bg-gradient-to-br from-dark-card to-[#12161c] border border-dark-border/80 rounded-2xl p-6 shadow-xl space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-lg text-dark-text">{budget.category?.name || 'Category'}</h3>
                        <span className="text-xs text-dark-muted">Limit: ৳ {limit.toLocaleString()}</span>
                      </div>
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${utilization >= 100 ? 'bg-fintech-red/10 text-fintech-red' : 'bg-fintech-green/10 text-fintech-green'}`}>
                        {utilization.toFixed(0)}%
                      </span>
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-dark-border">
                      <div className="flex justify-between text-xs">
                        <span className="text-dark-muted">Spent: ৳ {spent.toLocaleString()}</span>
                        <span className="text-dark-muted">Rem: ৳ {Math.max(0, limit - spent).toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-dark-bg rounded-full h-2.5 border border-dark-border overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-500 ${utilization >= 100 ? 'bg-fintech-red' : utilization >= 80 ? 'bg-yellow-500' : 'bg-fintech-blue'}`} 
                          style={{ width: `${Math.min(utilization, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Set Budget Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex justify-center items-center z-50 p-4">
          <div className="bg-dark-card border border-dark-border rounded-2xl w-full max-w-md p-8 shadow-2xl space-y-6">
            <h2 className="text-2xl font-bold text-dark-text">Set Category Budget</h2>
            <form onSubmit={handleSaveBudget} className="space-y-4">
              <div>
                <label className="block text-xs text-dark-muted mb-1">Expense Category</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-2.5 text-dark-text text-sm focus:outline-none focus:border-fintech-blue"
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-dark-muted mb-1">Monthly Limit (BDT)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="15000"
                  value={budgetLimit}
                  onChange={(e) => setBudgetLimit(e.target.value)}
                  className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-2.5 text-dark-text text-sm focus:outline-none focus:border-fintech-blue"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-xl border border-dark-border text-dark-muted text-sm font-semibold">Cancel</button>
                <button type="submit" className="px-5 py-2.5 rounded-xl bg-fintech-blue text-white font-semibold text-sm shadow-lg shadow-fintech-blue/20">Save Budget</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};