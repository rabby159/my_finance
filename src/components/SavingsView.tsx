import React, { useState, useEffect } from 'react';
import { savingsService } from '../services/savingsService';
import type { SavingsGoal } from '../services/savingsService';
import { accountService } from '../services/accountService';
import type { Account } from '../services/accountService';
import { Target, Plus, Trash2, CheckCircle, TrendingUp } from 'lucide-react';

interface SavingsViewProps {
  userId: string;
}

export const SavingsView: React.FC<SavingsViewProps> = ({ userId }) => {
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showContributeModal, setShowContributeModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<SavingsGoal | null>(null);

  // Form states
  const [goalName, setGoalName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [initialSaved, setInitialSaved] = useState('');
  const [targetDate, setTargetDate] = useState('');

  // Contribution state
  const [contributeAmount, setContributeAmount] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState('');

  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [goalData, accData] = await Promise.all([
        savingsService.getGoals(userId),
        accountService.getAccounts(userId)
      ]);
      setGoals(goalData);
      setAccounts(accData);
      if (accData.length > 0) setSelectedAccountId(accData[0].id);
    } catch (error) {
      console.error('Error loading savings data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await savingsService.createGoal({
        user_id: userId,
        goal_name: goalName,
        target_amount: parseFloat(targetAmount) || 0,
        current_saved: parseFloat(initialSaved) || 0,
        target_date: targetDate,
      });
      setShowModal(false);
      setGoalName('');
      setTargetAmount('');
      setInitialSaved('');
      setTargetDate('');
      loadData();
    } catch (error) {
      console.error('Error creating goal:', error);
    }
  };

  const handleContribute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoal) return;
    try {
      await savingsService.contributeToGoal(selectedGoal.id, selectedAccountId, parseFloat(contributeAmount) || 0);
      setShowContributeModal(false);
      setSelectedGoal(null);
      setContributeAmount('');
      loadData();
    } catch (error: any) {
      console.error('Error contributing to goal:', error);
      alert(error.message || 'Failed to contribute');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this savings goal?')) {
      try {
        await savingsService.deleteGoal(id);
        loadData();
      } catch (error) {
        console.error('Error deleting goal:', error);
      }
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-dark-card via-[#161b22] to-dark-card border border-dark-border p-6 rounded-2xl shadow-xl">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-dark-text tracking-tight">Savings & Financial Goals</h1>
          <p className="text-dark-muted text-sm">Track milestones, emergency funds, and future financial targets</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-fintech-blue hover:opacity-90 text-white font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-fintech-blue/20 transition"
        >
          <Plus className="w-5 h-5" /> New Goal
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <p className="text-dark-muted animate-pulse font-medium">Loading savings goals...</p>
        </div>
      ) : goals.length === 0 ? (
        <div className="bg-dark-card border border-dark-border border-dashed rounded-2xl p-12 text-center text-dark-muted">
          No savings goals recorded. Click "New Goal" to start saving.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal) => {
            const target = Number(goal.target_amount);
            const saved = Number(goal.current_saved);
            const progress = target > 0 ? (saved / target) * 100 : 0;

            return (
              <div key={goal.id} className="bg-gradient-to-br from-dark-card to-[#12161c] border border-dark-border/80 rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-dark-bg rounded-xl border border-dark-border text-fintech-blue">
                      <Target className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-dark-text">{goal.goal_name}</h3>
                      <span className="text-xs text-dark-muted">Target Date: {goal.target_date || 'N/A'}</span>
                    </div>
                  </div>
                  <button onClick={() => handleDelete(goal.id)} className="text-dark-muted hover:text-fintech-red transition p-1.5 rounded-lg hover:bg-dark-bg">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2 pt-2 border-t border-dark-border">
                  <div className="flex justify-between text-sm">
                    <span className="text-dark-muted">Saved: <strong className="text-fintech-green">৳ {saved.toLocaleString()}</strong></span>
                    <span className="text-dark-muted">Target: ৳ {target.toLocaleString()}</span>
                  </div>

                  <div className="w-full bg-dark-bg rounded-full h-3 border border-dark-border overflow-hidden">
                    <div className="bg-fintech-green h-full transition-all duration-500" style={{ width: `${Math.min(progress, 100)}%` }}></div>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-xs text-dark-muted font-medium">{progress.toFixed(1)}% Completed</span>
                    <button
                      onClick={() => { setSelectedGoal(goal); setShowContributeModal(true); }}
                      className="px-3.5 py-1.5 bg-fintech-blue text-white text-xs font-semibold rounded-xl hover:opacity-90 transition shadow-md shadow-fintech-blue/20"
                    >
                      Contribute
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Goal Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex justify-center items-center z-50 p-4">
          <div className="bg-dark-card border border-dark-border rounded-2xl w-full max-w-md p-8 shadow-2xl space-y-6">
            <h2 className="text-2xl font-bold text-dark-text">Create Savings Goal</h2>
            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div>
                <label className="block text-xs text-dark-muted mb-1">Goal Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Emergency Fund, Bike Purchase"
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                  className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-2.5 text-dark-text text-sm focus:outline-none focus:border-fintech-blue"
                />
              </div>
              <div>
                <label className="block text-xs text-dark-muted mb-1">Target Amount (BDT)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="100000"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-2.5 text-dark-text text-sm focus:outline-none focus:border-fintech-blue"
                />
              </div>
              <div>
                <label className="block text-xs text-dark-muted mb-1">Initial Saved Amount (BDT)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0"
                  value={initialSaved}
                  onChange={(e) => setInitialSaved(e.target.value)}
                  className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-2.5 text-dark-text text-sm focus:outline-none focus:border-fintech-blue"
                />
              </div>
              <div>
                <label className="block text-xs text-dark-muted mb-1">Target Completion Date</label>
                <input
                  type="date"
                  required
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-2.5 text-dark-text text-sm focus:outline-none focus:border-fintech-blue"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-xl border border-dark-border text-dark-muted text-sm font-semibold">Cancel</button>
                <button type="submit" className="px-5 py-2.5 rounded-xl bg-fintech-blue text-white font-semibold text-sm shadow-lg shadow-fintech-blue/20">Save Goal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Contribute Modal */}
      {showContributeModal && selectedGoal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex justify-center items-center z-50 p-4">
          <div className="bg-dark-card border border-dark-border rounded-2xl w-full max-w-sm p-8 shadow-2xl space-y-6">
            <h2 className="text-xl font-bold text-dark-text">Contribute to Goal</h2>
            <p className="text-xs text-dark-muted">Goal: <strong>{selectedGoal.goal_name}</strong></p>
            <form onSubmit={handleContribute} className="space-y-4">
              <div>
                <label className="block text-xs text-dark-muted mb-1">Contribution Amount (BDT)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="5000"
                  value={contributeAmount}
                  onChange={(e) => setContributeAmount(e.target.value)}
                  className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-2.5 text-dark-text text-sm focus:outline-none focus:border-fintech-blue"
                />
              </div>
              <div>
                <label className="block text-xs text-dark-muted mb-1">Fund From Account</label>
                <select
                  value={selectedAccountId}
                  onChange={(e) => setSelectedAccountId(e.target.value)}
                  className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-2.5 text-dark-text text-sm focus:outline-none focus:border-fintech-blue"
                >
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.name} (৳ {acc.current_balance})</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowContributeModal(false)} className="px-5 py-2.5 rounded-xl border border-dark-border text-dark-muted text-sm font-semibold">Cancel</button>
                <button type="submit" className="px-5 py-2.5 rounded-xl bg-fintech-blue text-white font-semibold text-sm shadow-lg shadow-fintech-blue/20">Confirm</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};