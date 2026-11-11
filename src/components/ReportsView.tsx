import React, { useState, useEffect } from 'react';
import { transactionService } from '../services/transactionService';
import { Download } from 'lucide-react';

interface ReportsViewProps {
  userId: string;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ userId }) => {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [userId, selectedMonth]);

  const loadData = async () => {
    try {
      setLoading(true);
      const txData = await transactionService.getTransactions(userId);
      setTransactions(txData);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const monthTransactions = transactions.filter(tx => tx.date.startsWith(selectedMonth));
  const totalIncome = monthTransactions.filter(tx => tx.type === 'Income').reduce((s, t) => s + Number(t.amount), 0);
  const totalExpense = monthTransactions.filter(tx => tx.type === 'Expense').reduce((s, t) => s + Number(t.amount), 0);
  const netSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

  const categoryExpenses: { [key: string]: number } = {};
  monthTransactions.filter(tx => tx.type === 'Expense').forEach(tx => {
    const cat = tx.category?.name || 'Uncategorized';
    categoryExpenses[cat] = (categoryExpenses[cat] || 0) + Number(tx.amount);
  });

  const exportToCSV = () => {
    if (monthTransactions.length === 0) {
      alert('No transactions found for this month.');
      return;
    }
    const headers = ['ID', 'Type', 'Amount', 'Category', 'Date', 'Description'];
    const rows = monthTransactions.map(tx => [tx.id, tx.type, tx.amount, `"${tx.category?.name || ''}"`, tx.date, `"${tx.description || ''}"`]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `MyFinance_Report_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-dark-card via-[#161b22] to-dark-card border border-dark-border p-6 rounded-2xl shadow-xl">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-dark-text tracking-tight">Reports & Analytics</h1>
          <p className="text-dark-muted text-sm">Analyze cash flows, category spending, and export statements</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-dark-card border border-dark-border rounded-xl px-4 py-2.5 text-dark-text text-sm focus:outline-none focus:border-fintech-blue"
          />
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 bg-fintech-blue hover:opacity-90 text-white font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-fintech-blue/20 transition text-sm"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <p className="text-dark-muted animate-pulse font-medium">Loading reports...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            <div className="bg-gradient-to-br from-dark-card to-[#12161c] border border-dark-border/80 rounded-2xl p-6 shadow-xl">
              <span className="text-xs text-dark-muted uppercase tracking-wider block">Total Income</span>
              <span className="text-2xl font-black text-fintech-green mt-1 block">৳ {totalIncome.toLocaleString()}</span>
            </div>
            <div className="bg-gradient-to-br from-dark-card to-[#12161c] border border-dark-border/80 rounded-2xl p-6 shadow-xl">
              <span className="text-xs text-dark-muted uppercase tracking-wider block">Total Expenses</span>
              <span className="text-2xl font-black text-fintech-red mt-1 block">৳ {totalExpense.toLocaleString()}</span>
            </div>
            <div className="bg-gradient-to-br from-dark-card to-[#12161c] border border-dark-border/80 rounded-2xl p-6 shadow-xl">
              <span className="text-xs text-dark-muted uppercase tracking-wider block">Net Surplus</span>
              <span className={`text-2xl font-black mt-1 block ${netSavings >= 0 ? 'text-fintech-green' : 'text-fintech-red'}`}>
                ৳ {netSavings.toLocaleString()}
              </span>
            </div>
            <div className="bg-gradient-to-br from-dark-card to-[#12161c] border border-dark-border/80 rounded-2xl p-6 shadow-xl">
              <span className="text-xs text-dark-muted uppercase tracking-wider block">Savings Rate</span>
              <span className="text-2xl font-black text-fintech-blue mt-1 block">{savingsRate.toFixed(1)}%</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-dark-card to-[#12161c] border border-dark-border/80 rounded-2xl p-6 shadow-xl space-y-6">
            <h3 className="font-bold text-lg text-dark-text">Category Breakdown ({selectedMonth})</h3>
            {Object.keys(categoryExpenses).length === 0 ? (
              <p className="text-dark-muted text-sm">No expenses recorded for this month.</p>
            ) : (
              <div className="space-y-4">
                {Object.entries(categoryExpenses).map(([category, amount]) => {
                  const percentage = totalExpense > 0 ? (amount / totalExpense) * 100 : 0;
                  return (
                    <div key={category} className="space-y-1.5">
                      <div className="flex justify-between text-sm">
                        <span className="text-dark-text font-semibold">{category}</span>
                        <span className="text-dark-muted">৳ {amount.toLocaleString()} ({percentage.toFixed(1)}%)</span>
                      </div>
                      <div className="w-full bg-dark-bg rounded-full h-3 border border-dark-border overflow-hidden">
                        <div className="bg-fintech-blue h-full transition-all duration-500" style={{ width: `${percentage}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};