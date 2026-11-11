import React, { useState, useEffect } from 'react';
import { savingsService } from '../services/savingsService';
import type { SavingsGoal } from '../services/savingsService';
import { accountService } from '../services/accountService';
import type { Account } from '../services/accountService';
import { Target, Plus, Trash2, CheckCircle } from 'lucide-react';

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
  const [contributeAmount, setContributeAmount] = useState('');

  // Form states
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [linkedAccountId, setLinkedAccountId] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [goalData, accData] = await Promise.all([
        savingsService.getSavingsGoals(userId),
        accountService.getAccounts(userId)
      ]);
      setGoals(goalData);
      setAccounts(accData);
      if (accData.length > 0) setLinkedAccountId(accData[0].id);
    } catch (error) {
      console.error('Error loading savings data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await savingsService.createSavingsGoal({
        user_id: userId,
        name,
        target_amount: parseFloat(targetAmount) || 0,
        target_date: targetDate,
        linked_account_id: linkedAccountId || undefined,
        description,
      });
      setShowModal(false);
      setName('');
      setTargetAmount('');
      setTargetDate('');
      setDescription('');
      loadData();
    } catch (error) {
      console.error('Error creating goal:', error);
    }
  };

  const handleContribute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoal) return;
    try {
      await savingsService.contributeToGoal(selectedGoal.id, parseFloat(contributeAmount) || 0);
      setShowContributeModal(false);
      setSelectedGoal(null);
      setContributeAmount('');
      loadData();
    } catch (error) {
      console.error('Error contributing to goal:', error);
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
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-dark-text">Savings & Financial Goals</h1>
          <p className="text-dark-muted text-sm">Track progress towards your target milestones and emergency funds</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-fintech-green hover:opacity-90 text-dark-bg font-semibold px-4 py-2 rounded-lg transition"
        >
          <Plus className="w-5 h-5" /> Add Goal
        </button>
      </div>

      {/* Goals Grid */}
      {loading ? (
        <p className="text-dark-muted">Loading savings goals...</p>
      ) : goals.length === 0 ? (
        <div className="bg-dark-card border border-dark-border rounded-xl p-8 text-center text-dark-muted">
          No savings goals found. Click "Add Goal" to start tracking your targets.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal) => {
            const progress = Math.min((Number(goal.current_saved_amount) / Number(goal.target_amount)) * 100, 100);
            return (
              <div key={goal.id} className="bg-dark-card border border-dark-border rounded-xl p-5 shadow-lg flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-dark-bg rounded-lg border border-dark-border text-fintech-green">
                        <Target className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-dark-text">{goal.name}</h3>
                        <span className="text-xs text-dark-muted">Target Date: {goal.target_date}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(goal.id)}
                      className="text-dark-muted hover:text-fintech-red transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  {goal.description && <p className="text-xs text-dark-muted mt-2">{goal.description}</p>}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-dark-muted">Saved: <strong className="text-dark-text">৳ {Number(goal.current_saved_amount).toLocaleString()}</strong></span>
                    <span className="text-dark-muted">Target: <strong className="text-dark-text">৳ {Number(goal.target_amount).toLocaleString()}</strong></span>
                  </div>
                  <div className="w-full bg-dark-bg rounded-full h-2.5 border border-dark-border overflow-hidden">
                    <div
                      className="bg-fintech-green h-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-xs font-semibold text-dark-muted">{progress.toFixed(1)}% Achieved</span>
                    {goal.status === 'Completed' ? (
                      <span className="flex items-center gap-1 text-xs text-fintech-green font-semibold">
                        <CheckCircle className="w-4 h-4" /> Completed
                      </span>
                    ) : (
                      <button
                        onClick={() => { setSelectedGoal(goal); setShowContributeModal(true); }}
                        className="px-3 py-1 bg-fintech-blue text-white text-xs font-semibold rounded-lg hover:opacity-90 transition"
                      >
                        + Contribute
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Goal Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-dark-card border border-dark-border rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h2 className="text-xl font-bold mb-4 text-dark-text">Add Savings Goal</h2>
            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div>
                <label className="block text-xs text-dark-muted mb-1">Goal Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Emergency Fund, Bike Purchase"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-dark-text focus:outline-none focus:border-fintech-blue"
                />
              </div>
              <div>
                <label className="block text-xs text-dark-muted mb-1">Target Amount (BDT)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="50000"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-dark-text focus:outline-none focus:border-fintech-blue"
                />
              </div>
              <div>
                <label className="block text-xs text-dark-muted mb-1">Target Completion Date</label>
                <input
                  type="date"
                  required
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-dark-text focus:outline-none focus:border-fintech-blue"
                />
              </div>
              <div>
                <label className="block text-xs text-dark-muted mb-1">Description (Optional)</label>
                <textarea
                  placeholder="Notes about this savings goal"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-dark-text focus:outline-none focus:border-fintech-blue"
                  rows={2}
                ></textarea>
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
                  className="px-4 py-2 rounded-lg bg-fintech-green text-dark-bg font-semibold hover:opacity-90 transition"
                >
                  Save Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Contribute Modal */}
      {showContributeModal && selectedGoal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-dark-card border border-dark-border rounded-2xl w-full max-w-sm p-6 shadow-2xl">
            <h2 className="text-xl font-bold mb-2 text-dark-text">Contribute to Goal</h2>
            <p className="text-xs text-dark-muted mb-4">Adding funds to: <strong>{selectedGoal.name}</strong></p>
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
                  className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-dark-text focus:outline-none focus:border-fintech-blue"
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowContributeModal(false)}
                  className="px-4 py-2 rounded-lg border border-dark-border text-dark-muted hover:text-dark-text transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-fintech-blue text-white font-semibold hover:opacity-90 transition"
                >
                  Add Funds
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};