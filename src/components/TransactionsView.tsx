import React, { useState, useEffect } from 'react';
import { transactionService } from '../services/transactionService';
import type { Transaction } from '../services/transactionService';
import { accountService } from '../services/accountService';
import type { Account } from '../services/accountService';
import { categoryService } from '../services/categoryService';
import type { Category } from '../services/categoryService';
import { ArrowUpRight, ArrowDownLeft, RefreshCw, Plus, Trash2 } from 'lucide-react';

interface TransactionsViewProps {
  userId: string;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({ userId }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form states
  const [type, setType] = useState<'Income' | 'Expense' | 'Transfer'>('Expense');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [accountId, setAccountId] = useState('');
  const [destinationAccountId, setDestinationAccountId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [isEssential, setIsEssential] = useState(true);

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
      console.error('Error loading transaction data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await transactionService.createTransaction({
        user_id: userId,
        type,
        amount: parseFloat(amount) || 0,
        account_id: accountId,
        destination_account_id: type === 'Transfer' ? destinationAccountId : undefined,
        category_id: type !== 'Transfer' ? categoryId : undefined,
        date,
        title,
        description,
        is_essential: isEssential,
      });

      setShowModal(false);
      // Reset form
      setTitle('');
      setAmount('');
      setDescription('');
      loadData();
    } catch (error) {
      console.error('Error creating transaction:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this transaction? Account balance will be adjusted.')) {
      try {
        await transactionService.deleteTransaction(id, userId);
        loadData();
      } catch (error) {
        console.error('Error deleting transaction:', error);
      }
    }
  };

  // Filter categories based on transaction type
  const filteredCategories = categories.filter(c => type === 'Income' ? c.type === 'Income' : c.type === 'Expense');

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-dark-text">Transactions</h1>
          <p className="text-dark-muted text-sm">Track your income, expenses, and account transfers</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-fintech-blue hover:opacity-95 text-white font-semibold px-4 py-2 rounded-lg transition"
        >
          <Plus className="w-5 h-5" /> Add Transaction
        </button>
      </div>

      {/* Transactions List */}
      {loading ? (
        <p className="text-dark-muted">Loading transactions...</p>
      ) : transactions.length === 0 ? (
        <div className="bg-dark-card border border-dark-border rounded-xl p-8 text-center text-dark-muted">
          No transactions found. Click "Add Transaction" to record your cash flow.
        </div>
      ) : (
        <div className="bg-dark-card border border-dark-border rounded-xl overflow-hidden shadow-lg">
          <div className="divide-y divide-dark-border">
            {transactions.map((tx: any) => (
              <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-dark-bg/40 transition">
                <div className="flex items-center gap-4">
                  <div className={`p-2.5 rounded-lg border border-dark-border ${
                    tx.type === 'Income' ? 'bg-fintech-green/10 text-fintech-green' :
                    tx.type === 'Expense' ? 'bg-fintech-red/10 text-fintech-red' :
                    'bg-fintech-blue/10 text-fintech-blue'
                  }`}>
                    {tx.type === 'Income' ? <ArrowDownLeft className="w-5 h-5" /> :
                     tx.type === 'Expense' ? <ArrowUpRight className="w-5 h-5" /> :
                     <RefreshCw className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className="font-semibold text-dark-text">{tx.title}</h4>
                    <div className="flex items-center gap-2 text-xs text-dark-muted mt-0.5">
                      <span>{tx.date}</span>
                      <span>•</span>
                      <span>{tx.accounts?.name}</span>
                      {tx.type === 'Transfer' && tx.destination_account && (
                        <span>→ {tx.destination_account.name}</span>
                      )}
                      {tx.categories?.name && (
                        <>
                          <span>•</span>
                          <span className="px-2 py-0.5 bg-dark-bg rounded border border-dark-border">{tx.categories.name}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className={`font-bold text-lg ${
                    tx.type === 'Income' ? 'text-fintech-green' :
                    tx.type === 'Expense' ? 'text-fintech-red' :
                    'text-fintech-blue'
                  }`}>
                    {tx.type === 'Income' ? '+' : tx.type === 'Expense' ? '-' : ''} ৳ {Number(tx.amount).toLocaleString()}
                  </span>
                  <button 
                    onClick={() => handleDelete(tx.id)}
                    className="text-dark-muted hover:text-fintech-red transition p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Transaction Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-dark-card border border-dark-border rounded-2xl w-full max-w-md p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-dark-text">Add New Transaction</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Type Selector Tabs */}
              <div className="grid grid-cols-3 gap-2 bg-dark-bg p-1 rounded-lg border border-dark-border">
                {(['Expense', 'Income', 'Transfer'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={`py-1.5 text-xs font-semibold rounded-md transition ${
                      type === t ? 'bg-fintech-blue text-white' : 'text-dark-muted hover:text-dark-text'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-xs text-dark-muted mb-1">Title / Description</label>
                <input
                  type="text"
                  required
                  placeholder={type === 'Income' ? 'e.g. Monthly Salary' : type === 'Expense' ? 'e.g. Grocery shopping' : 'e.g. Bank to bKash transfer'}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-dark-text focus:outline-none focus:border-fintech-blue"
                />
              </div>

              <div>
                <label className="block text-xs text-dark-muted mb-1">Amount (BDT)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-dark-text focus:outline-none focus:border-fintech-blue"
                />
              </div>

              <div>
                <label className="block text-xs text-dark-muted mb-1">
                  {type === 'Transfer' ? 'From Account' : 'Account'}
                </label>
                <select
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-dark-text focus:outline-none focus:border-fintech-blue"
                >
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.name} ({acc.type}) - ৳ {acc.current_balance}</option>
                  ))}
                </select>
              </div>

              {type === 'Transfer' && (
                <div>
                  <label className="block text-xs text-dark-muted mb-1">To Account</label>
                  <select
                    value={destinationAccountId}
                    onChange={(e) => setDestinationAccountId(e.target.value)}
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-dark-text focus:outline-none focus:border-fintech-blue"
                  >
                    <option value="">Select Destination Account</option>
                    {accounts.filter(acc => acc.id !== accountId).map(acc => (
                      <option key={acc.id} value={acc.id}>{acc.name} ({acc.type})</option>
                    ))}
                  </select>
                </div>
              )}

              {type !== 'Transfer' && (
                <div>
                  <label className="block text-xs text-dark-muted mb-1">Category</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-dark-text focus:outline-none focus:border-fintech-blue"
                  >
                    {filteredCategories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
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
                  className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-dark-text focus:outline-none focus:border-fintech-blue"
                />
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg border border-dark-border text-dark-muted hover:text-dark-text transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-fintech-blue text-white font-semibold hover:opacity-90 transition"
                >
                  Save Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};