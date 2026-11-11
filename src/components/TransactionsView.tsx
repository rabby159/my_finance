import React, { useState, useEffect } from 'react';
import { transactionService } from '../services/transactionService';
import { accountService } from '../services/accountService';
import { categoryService } from '../services/categoryService';
import { ArrowLeftRight, Plus, Trash2, ArrowUpRight, ArrowDownRight, Wallet } from 'lucide-react';

interface TransactionsViewProps {
  userId: string;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({ userId }) => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form states
  const [type, setType] = useState<'Income' | 'Expense' | 'Transfer'>('Expense');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [accountId, setAccountId] = useState('');
  const [destinationAccountId, setDestinationAccountId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');

  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [txData, accData, catData] = await Promise.all([
        transactionService.getTransactions(userId),
        accountService.getAccounts(userId),
        categoryService.getCategories(userId)
      ]);
      setTransactions(txData);
      setAccounts(accData);
      setCategories(catData);
      if (accData.length > 0) setAccountId(accData[0].id);
      if (catData.length > 0) setCategoryId(catData[0].id);
    } catch (error) {
      console.error('Error loading transactions data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = {
        user_id: userId,
        type,
        amount: parseFloat(amount) || 0,
        account_id: accountId,
        date,
        description,
      };

      if (type !== 'Transfer') {
        payload.category_id = categoryId;
      } else {
        payload.destination_account_id = destinationAccountId;
      }

      await transactionService.createTransaction(payload);
      setShowModal(false);
      setAmount('');
      setDescription('');
      loadData();
    } catch (error: any) {
      console.error('Error recording transaction:', error);
      alert(error.message || 'Failed to record transaction');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this transaction? Account balance will be reversed.')) {
      try {
        await transactionService.deleteTransaction(id);
        loadData();
      } catch (error) {
        console.error('Error deleting transaction:', error);
      }
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-dark-card via-[#161b22] to-dark-card border border-dark-border p-6 rounded-2xl shadow-xl">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-dark-text tracking-tight">Transactions</h1>
          <p className="text-dark-muted text-sm">Record income, expenses, and account transfers with automatic balance sync</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-fintech-blue hover:opacity-90 text-white font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-fintech-blue/20 transition"
        >
          <Plus className="w-5 h-5" /> New Transaction
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <p className="text-dark-muted animate-pulse font-medium">Loading transactions...</p>
        </div>
      ) : transactions.length === 0 ? (
        <div className="bg-dark-card border border-dark-border border-dashed rounded-2xl p-12 text-center text-dark-muted">
          No transactions recorded yet. Click "New Transaction" to begin.
        </div>
      ) : (
        <div className="bg-gradient-to-br from-dark-card to-[#12161c] border border-dark-border/80 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="font-bold text-lg text-dark-text">Complete History</h3>
          <div className="space-y-3">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex justify-between items-center bg-dark-bg/60 border border-dark-border/80 p-4 rounded-xl hover:border-fintech-blue/40 transition">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl border border-dark-border ${tx.type === 'Income' ? 'bg-fintech-green/10 text-fintech-green' : tx.type === 'Expense' ? 'bg-fintech-red/10 text-fintech-red' : 'bg-fintech-blue/10 text-fintech-blue'}`}>
                    {tx.type === 'Income' ? <ArrowUpRight className="w-5 h-5" /> : tx.type === 'Expense' ? <ArrowDownRight className="w-5 h-5" /> : <Wallet className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-dark-text">{tx.category?.name || tx.type}</h4>
                    <p className="text-xs text-dark-muted">{tx.description || 'No description'} • <span className="text-dark-text/80">{tx.date}</span></p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`font-black text-base ${tx.type === 'Income' ? 'text-fintech-green' : tx.type === 'Expense' ? 'text-fintech-red' : 'text-fintech-blue'}`}>
                    {tx.type === 'Income' ? '+' : tx.type === 'Expense' ? '-' : ''} ৳ {Number(tx.amount).toLocaleString()}
                  </span>
                  <button onClick={() => handleDelete(tx.id)} className="text-dark-muted hover:text-fintech-red transition p-2 rounded-lg hover:bg-dark-card" title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex justify-center items-center z-50 p-4">
          <div className="bg-dark-card border border-dark-border rounded-2xl w-full max-w-md p-8 shadow-2xl space-y-6">
            <h2 className="text-2xl font-bold text-dark-text">Record Transaction</h2>
            <form onSubmit={handleCreateTransaction} className="space-y-4">
              <div>
                <label className="block text-xs text-dark-muted mb-1">Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-2.5 text-dark-text text-sm focus:outline-none focus:border-fintech-blue"
                >
                  <option value="Expense">Expense</option>
                  <option value="Income">Income</option>
                  <option value="Transfer">Account Transfer</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-dark-muted mb-1">Amount (BDT)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="5000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-2.5 text-dark-text text-sm focus:outline-none focus:border-fintech-blue"
                />
              </div>

              {type !== 'Transfer' && (
                <div>
                  <label className="block text-xs text-dark-muted mb-1">Category</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-2.5 text-dark-text text-sm focus:outline-none focus:border-fintech-blue"
                  >
                    {categories.filter(c => c.type === type).map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs text-dark-muted mb-1">{type === 'Transfer' ? 'From Account' : 'Account'}</label>
                <select
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-2.5 text-dark-text text-sm focus:outline-none focus:border-fintech-blue"
                >
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.name} (৳ {acc.current_balance})</option>
                  ))}
                </select>
              </div>

              {type === 'Transfer' && (
                <div>
                  <label className="block text-xs text-dark-muted mb-1">To Account</label>
                  <select
                    value={destinationAccountId}
                    onChange={(e) => setDestinationAccountId(e.target.value)}
                    className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-2.5 text-dark-text text-sm focus:outline-none focus:border-fintech-blue"
                  >
                    {accounts.map(acc => (
                      <option key={acc.id} value={acc.id}>{acc.name} (৳ {acc.current_balance})</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs text-dark-muted mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-2.5 text-dark-text text-sm focus:outline-none focus:border-fintech-blue"
                />
              </div>

              <div>
                <label className="block text-xs text-dark-muted mb-1">Description (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Grocery shopping at supershop"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-2.5 text-dark-text text-sm focus:outline-none focus:border-fintech-blue"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-xl border border-dark-border text-dark-muted text-sm font-semibold">Cancel</button>
                <button type="submit" className="px-5 py-2.5 rounded-xl bg-fintech-blue text-white font-semibold text-sm shadow-lg shadow-fintech-blue/20">Save Transaction</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};