import React, { useState, useEffect } from 'react';
import { accountService } from '../services/accountService';
import type { Account } from '../services/accountService';
import { Wallet, Landmark, CreditCard, Plus, Trash2, Edit2 } from 'lucide-react';

interface AccountsViewProps {
  userId: string;
}

export const AccountsView: React.FC<AccountsViewProps> = ({ userId }) => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Form states
  const [name, setName] = useState('');
  const [type, setType] = useState<'Cash' | 'Bank' | 'bKash' | 'Nagad' | 'Credit Card'>('bKash');
  const [institution, setInstitution] = useState('');
  const [openingBalance, setOpeningBalance] = useState('');
  const [creditLimit, setCreditLimit] = useState('');
  const [accountRef, setAccountRef] = useState('');

  useEffect(() => {
    fetchAccounts();
  }, [userId]);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const data = await accountService.getAccounts(userId);
      setAccounts(data);
    } catch (error) {
      console.error('Error fetching accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingAccount(null);
    setName('');
    setType('bKash');
    setInstitution('');
    setOpeningBalance('');
    setCreditLimit('');
    setAccountRef('');
    setErrorMessage('');
    setShowModal(true);
  };

  const openEditModal = (acc: Account) => {
    setEditingAccount(acc);
    setName(acc.name);
    setType(acc.type);
    setInstitution(acc.institution || '');
    setOpeningBalance(acc.current_balance.toString());
    setCreditLimit(acc.credit_limit?.toString() || '');
    setAccountRef(acc.account_number_ref || '');
    setErrorMessage('');
    setShowModal(true);
  };

  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    try {
      if (editingAccount) {
        // Update account including current balance
        await accountService.updateAccount(editingAccount.id, {
          name,
          type,
          institution,
          current_balance: parseFloat(openingBalance) || editingAccount.current_balance,
          credit_limit: type === 'Credit Card' ? parseFloat(creditLimit) || 0 : 0,
          account_number_ref: accountRef,
        });
      } else {
        // Create new account
        await accountService.createAccount({
          user_id: userId,
          name,
          type,
          institution,
          opening_balance: parseFloat(openingBalance) || 0,
          credit_limit: type === 'Credit Card' ? parseFloat(creditLimit) || 0 : 0,
          opening_date: new Date().toISOString().split('T')[0],
          account_number_ref: accountRef,
          is_active: true,
        });
      }
      setShowModal(false);
      fetchAccounts();
    } catch (error: any) {
      console.error('Error saving account:', error);
      setErrorMessage(error.message || 'Failed to save account');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this account?')) {
      try {
        await accountService.deleteAccount(id);
        fetchAccounts();
      } catch (error) {
        console.error('Error deleting account:', error);
      }
    }
  };

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'Bank': return <Landmark className="w-6 h-6 text-fintech-blue" />;
      case 'Credit Card': return <CreditCard className="w-6 h-6 text-fintech-red" />;
      default: return <Wallet className="w-6 h-6 text-fintech-green" />;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-dark-text">Accounts & Wallets</h1>
          <p className="text-dark-muted text-sm">Manage your Cash, Bank, bKash, Nagad, and Credit Cards</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-fintech-green hover:opacity-90 text-dark-bg font-semibold px-4 py-2 rounded-lg transition"
        >
          <Plus className="w-5 h-5" /> Add Account
        </button>
      </div>

      {/* Account Cards Grid */}
      {loading ? (
        <p className="text-dark-muted">Loading accounts...</p>
      ) : accounts.length === 0 ? (
        <div className="bg-dark-card border border-dark-border rounded-xl p-8 text-center text-dark-muted">
          No accounts found. Click "Add Account" to get started.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.map((acc) => (
            <div key={acc.id} className="bg-dark-card border border-dark-border rounded-xl p-5 shadow-lg flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-dark-bg rounded-lg border border-dark-border">
                      {getAccountIcon(acc.type)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-dark-text">{acc.name}</h3>
                      <span className="text-xs px-2 py-0.5 bg-dark-bg border border-dark-border text-dark-muted rounded-full">
                        {acc.type} {acc.institution ? `• ${acc.institution}` : ''}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => openEditModal(acc)}
                      className="text-dark-muted hover:text-fintech-blue transition p-1"
                      title="Edit Account"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(acc.id)}
                      className="text-dark-muted hover:text-fintech-red transition p-1"
                      title="Delete Account"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-dark-border flex justify-between items-end">
                <div>
                  <span className="text-xs text-dark-muted block">Current Balance</span>
                  <span className={`text-xl font-bold ${acc.current_balance < 0 ? 'text-fintech-red' : 'text-dark-text'}`}>
                    ৳ {acc.current_balance.toLocaleString()}
                  </span>
                </div>
                {acc.type === 'Credit Card' && acc.credit_limit && (
                  <div className="text-right">
                    <span className="text-xs text-dark-muted block">Limit</span>
                    <span className="text-sm font-medium text-dark-muted">৳ {acc.credit_limit.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Account Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-dark-card border border-dark-border rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h2 className="text-xl font-bold mb-4 text-dark-text">
              {editingAccount ? 'Edit Account' : 'Add New Account'}
            </h2>

            {errorMessage && (
              <div className="mb-4 p-3 bg-fintech-red/10 border border-fintech-red text-fintech-red text-xs rounded-lg">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSaveAccount} className="space-y-4">
              <div>
                <label className="block text-xs text-dark-muted mb-1">Account Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dutch-Bangla Bank, My bKash"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-dark-text focus:outline-none focus:border-fintech-blue"
                />
              </div>

              <div>
                <label className="block text-xs text-dark-muted mb-1">Account Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-dark-text focus:outline-none focus:border-fintech-blue"
                >
                  <option value="Cash">Cash</option>
                  <option value="Bank">Bank</option>
                  <option value="bKash">bKash</option>
                  <option value="Nagad">Nagad</option>
                  <option value="Credit Card">Credit Card</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-dark-muted mb-1">Institution / Provider (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. DBBL, BRAC, bKash Ltd"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-dark-text focus:outline-none focus:border-fintech-blue"
                />
              </div>

              <div>
                <label className="block text-xs text-dark-muted mb-1">
                  {editingAccount ? 'Current Balance (BDT)' : 'Opening Balance (BDT)'}
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={openingBalance}
                  onChange={(e) => setOpeningBalance(e.target.value)}
                  className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-dark-text focus:outline-none focus:border-fintech-blue"
                />
              </div>

              {type === 'Credit Card' && (
                <div>
                  <label className="block text-xs text-dark-muted mb-1">Credit Limit (BDT)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={creditLimit}
                    onChange={(e) => setCreditLimit(e.target.value)}
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-dark-text focus:outline-none focus:border-fintech-blue"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs text-dark-muted mb-1">Account Number / Reference (Optional)</label>
                <input
                  type="text"
                  placeholder="Last 4 digits or phone number"
                  value={accountRef}
                  onChange={(e) => setAccountRef(e.target.value)}
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
                  {editingAccount ? 'Update Account' : 'Save Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};