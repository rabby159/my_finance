import React, { useState, useEffect } from 'react';
import { loanService } from '../services/loanService';
import type { Loan } from '../services/loanService';
import { accountService } from '../services/accountService';
import type { Account } from '../services/accountService';
import { Landmark, Plus, Trash2, CheckCircle } from 'lucide-react';

interface LoansViewProps {
  userId: string;
}

export const LoansView: React.FC<LoansViewProps> = ({ userId }) => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);

  // Form states
  const [loanName, setLoanName] = useState('');
  const [lender, setLender] = useState('');
  const [originalAmount, setOriginalAmount] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [emiAmount, setEmiAmount] = useState('');
  const [totalDuration, setTotalDuration] = useState('');
  const [loanStartDate, setLoanStartDate] = useState(new Date().toISOString().split('T')[0]);

  // Payment states
  const [paymentAmount, setPaymentAmount] = useState('');
  const [principalPaid, setPrincipalPaid] = useState('');
  const [interestPaid, setInterestPaid] = useState('');
  const [paymentAccountId, setPaymentAccountId] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [loanData, accData] = await Promise.all([
        loanService.getLoans(userId),
        accountService.getAccounts(userId)
      ]);
      setLoans(loanData);
      setAccounts(accData);
      if (accData.length > 0) setPaymentAccountId(accData[0].id);
    } catch (error) {
      console.error('Error loading loan data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLoan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await loanService.createLoan({
        user_id: userId,
        loan_name: loanName,
        lender,
        original_amount: parseFloat(originalAmount) || 0,
        interest_rate: parseFloat(interestRate) || 0,
        emi_amount: parseFloat(emiAmount) || 0,
        total_duration: parseInt(totalDuration) || 12,
        loan_start_date: loanStartDate,
        payment_due_day: 5,
      });
      setShowModal(false);
      setLoanName('');
      setLender('');
      setOriginalAmount('');
      setInterestRate('');
      setEmiAmount('');
      setTotalDuration('');
      loadData();
    } catch (error) {
      console.error('Error creating loan:', error);
    }
  };

  const openPayModal = (loan: Loan) => {
    setSelectedLoan(loan);
    setPaymentAmount(loan.emi_amount.toString());
    setPrincipalPaid((loan.emi_amount * 0.8).toFixed(2));
    setInterestPaid((loan.emi_amount * 0.2).toFixed(2));
    setShowPayModal(true);
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoan) return;
    try {
      await loanService.recordEMIPayment({
        loan_id: selectedLoan.id,
        payment_amount: parseFloat(paymentAmount) || 0,
        principal_paid: parseFloat(principalPaid) || 0,
        interest_paid: parseFloat(interestPaid) || 0,
        account_id: paymentAccountId,
        payment_date: paymentDate,
      });
      setShowPayModal(false);
      setSelectedLoan(null);
      loadData();
    } catch (error: any) {
      console.error('Error recording EMI payment:', error);
      alert(error.message || 'Failed to record EMI payment');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this loan record?')) {
      try {
        await loanService.deleteLoan(id);
        loadData();
      } catch (error) {
        console.error('Error deleting loan:', error);
      }
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-dark-card via-[#161b22] to-dark-card border border-dark-border p-6 rounded-2xl shadow-xl">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-dark-text tracking-tight">Loans & EMI Management</h1>
          <p className="text-dark-muted text-sm">Track loan liabilities, outstanding principal, and monthly EMI payments</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-fintech-blue hover:opacity-90 text-white font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-fintech-blue/20 transition"
        >
          <Plus className="w-5 h-5" /> Add Loan
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <p className="text-dark-muted animate-pulse font-medium">Loading loans...</p>
        </div>
      ) : loans.length === 0 ? (
        <div className="bg-dark-card border border-dark-border border-dashed rounded-2xl p-12 text-center text-dark-muted">
          No loans recorded. Click "Add Loan" to track your liabilities.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loans.map((loan) => {
            const paidProgress = Math.max(0, 100 - ((Number(loan.outstanding_principal) / Number(loan.original_amount)) * 100));
            return (
              <div key={loan.id} className="bg-gradient-to-br from-dark-card to-[#12161c] border border-dark-border/80 rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-dark-bg rounded-xl border border-dark-border text-fintech-blue">
                      <Landmark className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-dark-text">{loan.loan_name}</h3>
                      <span className="text-xs text-dark-muted">{loan.lender || 'Personal/Other Lender'}</span>
                    </div>
                  </div>
                  <button onClick={() => handleDelete(loan.id)} className="text-dark-muted hover:text-fintech-red transition p-1.5 rounded-lg hover:bg-dark-bg">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3 pt-2 border-t border-dark-border">
                  <div className="flex justify-between text-sm">
                    <span className="text-dark-muted">Outstanding:</span>
                    <span className="font-black text-fintech-red">৳ {Number(loan.outstanding_principal).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs text-dark-muted">
                    <span>Original: ৳ {Number(loan.original_amount).toLocaleString()}</span>
                    <span>EMI: ৳ {Number(loan.emi_amount).toLocaleString()}</span>
                  </div>

                  <div className="w-full bg-dark-bg rounded-full h-3 border border-dark-border overflow-hidden">
                    <div className="bg-fintech-green h-full transition-all duration-500" style={{ width: `${paidProgress}%` }}></div>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-xs text-dark-muted font-medium">{paidProgress.toFixed(1)}% Paid Off</span>
                    {loan.status === 'Completed' ? (
                      <span className="flex items-center gap-1 text-xs text-fintech-green font-semibold">
                        <CheckCircle className="w-4 h-4" /> Fully Paid
                      </span>
                    ) : (
                      <button
                        onClick={() => openPayModal(loan)}
                        className="px-3.5 py-1.5 bg-fintech-blue text-white text-xs font-semibold rounded-xl hover:opacity-90 transition shadow-md shadow-fintech-blue/20"
                      >
                        Pay EMI
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Loan Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex justify-center items-center z-50 p-4">
          <div className="bg-dark-card border border-dark-border rounded-2xl w-full max-w-md p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-dark-text">Add Loan Liability</h2>
            <form onSubmit={handleCreateLoan} className="space-y-4">
              <div>
                <label className="block text-xs text-dark-muted mb-1">Loan Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bank Car Loan, Personal Debt"
                  value={loanName}
                  onChange={(e) => setLoanName(e.target.value)}
                  className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-2.5 text-dark-text text-sm focus:outline-none focus:border-fintech-blue"
                />
              </div>
              <div>
                <label className="block text-xs text-dark-muted mb-1">Lender / Bank (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. City Bank, BRAC"
                  value={lender}
                  onChange={(e) => setLender(e.target.value)}
                  className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-2.5 text-dark-text text-sm focus:outline-none focus:border-fintech-blue"
                />
              </div>
              <div>
                <label className="block text-xs text-dark-muted mb-1">Original Loan Amount (BDT)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="100000"
                  value={originalAmount}
                  onChange={(e) => setOriginalAmount(e.target.value)}
                  className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-2.5 text-dark-text text-sm focus:outline-none focus:border-fintech-blue"
                />
              </div>
              <div>
                <label className="block text-xs text-dark-muted mb-1">Monthly EMI Amount (BDT)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="10000"
                  value={emiAmount}
                  onChange={(e) => setEmiAmount(e.target.value)}
                  className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-2.5 text-dark-text text-sm focus:outline-none focus:border-fintech-blue"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-dark-muted mb-1">Duration (Months)</label>
                  <input
                    type="number"
                    required
                    placeholder="12"
                    value={totalDuration}
                    onChange={(e) => setTotalDuration(e.target.value)}
                    className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-2.5 text-dark-text text-sm focus:outline-none focus:border-fintech-blue"
                  />
                </div>
                <div>
                  <label className="block text-xs text-dark-muted mb-1">Interest Rate (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="9.0"
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                    className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-2.5 text-dark-text text-sm focus:outline-none focus:border-fintech-blue"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-dark-muted mb-1">Start Date</label>
                <input
                  type="date"
                  required
                  value={loanStartDate}
                  onChange={(e) => setLoanStartDate(e.target.value)}
                  className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-2.5 text-dark-text text-sm focus:outline-none focus:border-fintech-blue"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-xl border border-dark-border text-dark-muted text-sm font-semibold">Cancel</button>
                <button type="submit" className="px-5 py-2.5 rounded-xl bg-fintech-blue text-white font-semibold text-sm shadow-lg shadow-fintech-blue/20">Save Loan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pay EMI Modal */}
      {showPayModal && selectedLoan && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex justify-center items-center z-50 p-4">
          <div className="bg-dark-card border border-dark-border rounded-2xl w-full max-w-md p-8 shadow-2xl space-y-6">
            <h2 className="text-2xl font-bold text-dark-text">Record EMI Payment</h2>
            <p className="text-xs text-dark-muted">Loan: <strong>{selectedLoan.loan_name}</strong></p>
            <form onSubmit={handleRecordPayment} className="space-y-4">
              <div>
                <label className="block text-xs text-dark-muted mb-1">Total Payment Amount (BDT)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-2.5 text-dark-text text-sm focus:outline-none focus:border-fintech-blue"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-dark-muted mb-1">Principal Reduction</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={principalPaid}
                    onChange={(e) => setPrincipalPaid(e.target.value)}
                    className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-2.5 text-dark-text text-sm focus:outline-none focus:border-fintech-blue"
                  />
                </div>
                <div>
                  <label className="block text-xs text-dark-muted mb-1">Interest / Fee</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={interestPaid}
                    onChange={(e) => setInterestPaid(e.target.value)}
                    className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-2.5 text-dark-text text-sm focus:outline-none focus:border-fintech-blue"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-dark-muted mb-1">Pay From Account</label>
                <select
                  value={paymentAccountId}
                  onChange={(e) => setPaymentAccountId(e.target.value)}
                  className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-2.5 text-dark-text text-sm focus:outline-none focus:border-fintech-blue"
                >
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.name} (৳ {acc.current_balance})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-dark-muted mb-1">Payment Date</label>
                <input
                  type="date"
                  required
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-2.5 text-dark-text text-sm focus:outline-none focus:border-fintech-blue"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowPayModal(false)} className="px-5 py-2.5 rounded-xl border border-dark-border text-dark-muted text-sm font-semibold">Cancel</button>
                <button type="submit" className="px-5 py-2.5 rounded-xl bg-fintech-blue text-white font-semibold text-sm shadow-lg shadow-fintech-blue/20">Confirm Payment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};