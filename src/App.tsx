import React, { useState, useEffect } from 'react';
import { DashboardView } from './components/DashboardView';
import { AccountsView } from './components/AccountsView';
import { TransactionsView } from './components/TransactionsView';
import { BudgetsView } from './components/BudgetsView';
import { SavingsView } from './components/SavingsView';
import { LoansView } from './components/LoansView';
import { CreditCardsView } from './components/CreditCardsView';
import { seedDefaultCategories } from './utils/defaultCategories';
import { LayoutDashboard, Wallet, ArrowLeftRight, PieChart, Target, Landmark, CreditCard, ShieldCheck } from 'lucide-react';

export function App() {
  const userId = '00000000-0000-0000-0000-000000000001';
  const [activeTab, setActiveTab] = useState<'dashboard' | 'accounts' | 'transactions' | 'budgets' | 'savings' | 'loans' | 'creditCards'>('dashboard');
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    seedDefaultCategories(userId).then(() => {
      setInitialized(true);
    });
  }, [userId]);

  if (!initialized) {
    return (
      <div className="min-h-screen bg-dark-bg text-dark-text flex justify-center items-center">
        <p className="text-dark-muted animate-pulse">Initializing MyFinance Control System...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg text-dark-text flex flex-col md:flex-row">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-dark-card border-r border-dark-border flex flex-col justify-between p-6">
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-fintech-blue/10 text-fintech-blue rounded-xl border border-dark-border">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-dark-text tracking-wide">MyFinance</h1>
              <span className="text-xs text-dark-muted">v1.0 Control System</span>
            </div>
          </div>

          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition ${
                activeTab === 'dashboard' ? 'bg-fintech-blue text-white shadow-lg shadow-fintech-blue/20' : 'text-dark-muted hover:text-dark-text hover:bg-dark-bg'
              }`}
            >
              <LayoutDashboard className="w-5 h-5" /> Dashboard
            </button>

            <button
              onClick={() => setActiveTab('accounts')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition ${
                activeTab === 'accounts' ? 'bg-fintech-blue text-white shadow-lg shadow-fintech-blue/20' : 'text-dark-muted hover:text-dark-text hover:bg-dark-bg'
              }`}
            >
              <Wallet className="w-5 h-5" /> Accounts & Wallets
            </button>

            <button
              onClick={() => setActiveTab('transactions')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition ${
                activeTab === 'transactions' ? 'bg-fintech-blue text-white shadow-lg shadow-fintech-blue/20' : 'text-dark-muted hover:text-dark-text hover:bg-dark-bg'
              }`}
            >
              <ArrowLeftRight className="w-5 h-5" /> Transactions
            </button>

            <button
              onClick={() => setActiveTab('budgets')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition ${
                activeTab === 'budgets' ? 'bg-fintech-blue text-white shadow-lg shadow-fintech-blue/20' : 'text-dark-muted hover:text-dark-text hover:bg-dark-bg'
              }`}
            >
              <PieChart className="w-5 h-5" /> Monthly Budgets
            </button>

            <button
              onClick={() => setActiveTab('savings')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition ${
                activeTab === 'savings' ? 'bg-fintech-blue text-white shadow-lg shadow-fintech-blue/20' : 'text-dark-muted hover:text-dark-text hover:bg-dark-bg'
              }`}
            >
              <Target className="w-5 h-5" /> Savings Goals
            </button>

            <button
              onClick={() => setActiveTab('loans')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition ${
                activeTab === 'loans' ? 'bg-fintech-blue text-white shadow-lg shadow-fintech-blue/20' : 'text-dark-muted hover:text-dark-text hover:bg-dark-bg'
              }`}
            >
              <Landmark className="w-5 h-5" /> Loans & EMIs
            </button>

            <button
              onClick={() => setActiveTab('creditCards')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition ${
                activeTab === 'creditCards' ? 'bg-fintech-blue text-white shadow-lg shadow-fintech-blue/20' : 'text-dark-muted hover:text-dark-text hover:bg-dark-bg'
              }`}
            >
              <CreditCard className="w-5 h-5" /> Credit Cards
            </button>
          </nav>
        </div>

        <div className="pt-6 border-t border-dark-border text-xs text-dark-muted flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-fintech-green" />
          <span>Single-User Secure RLS</span>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        {activeTab === 'dashboard' && <DashboardView userId={userId} />}
        {activeTab === 'accounts' && <AccountsView userId={userId} />}
        {activeTab === 'transactions' && <TransactionsView userId={userId} />}
        {activeTab === 'budgets' && <BudgetsView userId={userId} />}
        {activeTab === 'savings' && <SavingsView userId={userId} />}
        {activeTab === 'loans' && <LoansView userId={userId} />}
        {activeTab === 'creditCards' && <CreditCardsView userId={userId} />}
      </main>

    </div>
  );
}

export default App;