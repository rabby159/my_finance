import React, { useState, useEffect } from 'react';
import { creditCardService } from '../services/creditCardService';
import type { CreditCard as CC } from '../services/creditCardService';
import { accountService } from '../services/accountService';
import type { Account } from '../services/accountService';
import { CreditCard as CardIcon, Plus, Trash2 } from 'lucide-react';

interface CreditCardsViewProps {
  userId: string;
}

export const CreditCardsView: React.FC<CreditCardsViewProps> = ({ userId }) => {
  const [cards, setCards] = useState<CC[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState<CC | null>(null);

  // Form states
  const [cardName, setCardName] = useState('');
  const [issuingBank, setIssuingBank] = useState('');
  const [creditLimit, setCreditLimit] = useState('');
  const [statementDate, setStatementDate] = useState('15');
  const [paymentDueDate, setPaymentDueDate] = useState('5');

  // Payment states
  const [payAmount, setPayAmount] = useState('');
  const [payAccountId, setPayAccountId] = useState('');

  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [cardData, accData] = await Promise.all([
        creditCardService.getCreditCards(userId),
        accountService.getAccounts(userId)
      ]);
      setCards(cardData);
      setAccounts(accData);
      if (accData.length > 0) setPayAccountId(accData[0].id);
    } catch (error) {
      console.error('Error loading credit cards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCard = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await creditCardService.createCreditCard({
        user_id: userId,
        card_name: cardName,
        issuing_bank: issuingBank,
        credit_limit: parseFloat(creditLimit) || 0,
        statement_date: parseInt(statementDate) || 15,
        payment_due_date: parseInt(paymentDueDate) || 5,
      });
      setShowModal(false);
      setCardName('');
      setIssuingBank('');
      setCreditLimit('');
      loadData();
    } catch (error) {
      console.error('Error creating card:', error);
    }
  };

  const handlePayBill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCard) return;
    try {
      await creditCardService.payCreditCardBill(selectedCard.id, payAccountId, parseFloat(payAmount) || 0);
      setShowPayModal(false);
      setSelectedCard(null);
      loadData();
    } catch (error: any) {
      alert(error.message || 'Failed to pay bill');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this credit card?')) {
      try {
        await creditCardService.deleteCreditCard(id);
        loadData();
      } catch (error) {
        console.error('Error deleting card:', error);
      }
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-dark-card via-[#161b22] to-dark-card border border-dark-border p-6 rounded-2xl shadow-xl">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-dark-text tracking-tight">Credit Cards Management</h1>
          <p className="text-dark-muted text-sm">Track limits, outstanding balances, utilization ratio, and bill payments</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-fintech-blue hover:opacity-90 text-white font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-fintech-blue/20 transition"
        >
          <Plus className="w-5 h-5" /> Add Credit Card
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <p className="text-dark-muted animate-pulse font-medium">Loading credit cards...</p>
        </div>
      ) : cards.length === 0 ? (
        <div className="bg-dark-card border border-dark-border border-dashed rounded-2xl p-12 text-center text-dark-muted">
          No credit cards recorded. Click "Add Credit Card" to track.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card) => {
            const limit = Number(card.credit_limit);
            const outstanding = Number(card.outstanding_balance);
            const available = Math.max(0, limit - outstanding);
            const utilization = limit > 0 ? (outstanding / limit) * 100 : 0;

            return (
              <div key={card.id} className="bg-gradient-to-br from-dark-card to-[#12161c] border border-dark-border/80 rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-dark-bg rounded-xl border border-dark-border text-fintech-red">
                      <CardIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-dark-text">{card.card_name}</h3>
                      <span className="text-xs text-dark-muted">{card.issuing_bank}</span>
                    </div>
                  </div>
                  <button onClick={() => handleDelete(card.id)} className="text-dark-muted hover:text-fintech-red transition p-1.5 rounded-lg hover:bg-dark-bg">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3 pt-2 border-t border-dark-border">
                  <div className="grid grid-cols-2 gap-2 text-xs bg-dark-bg p-3.5 rounded-xl border border-dark-border">
                    <div>
                      <span className="text-dark-muted block">Outstanding</span>
                      <span className="font-black text-fintech-red text-sm">৳ {outstanding.toLocaleString()}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-dark-muted block">Available</span>
                      <span className="font-black text-fintech-green text-sm">৳ {available.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-dark-muted">
                      <span>Utilization: {utilization.toFixed(1)}%</span>
                      <span>Limit: ৳ {limit.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-dark-bg rounded-full h-2.5 border border-dark-border overflow-hidden">
                      <div className={`h-full transition-all duration-500 ${utilization >= 80 ? 'bg-fintech-red' : utilization >= 50 ? 'bg-yellow-500' : 'bg-fintech-green'}`} style={{ width: `${Math.min(utilization, 100)}%` }}></div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => { setSelectedCard(card); setPayAmount(card.outstanding_balance.toString()); setShowPayModal(true); }}
                      className="w-full py-2.5 bg-fintech-blue text-white text-xs font-semibold rounded-xl hover:opacity-90 transition text-center shadow-md shadow-fintech-blue/20"
                    >
                      Pay Bill from Account
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex justify-center items-center z-50 p-4">
          <div className="bg-dark-card border border-dark-border rounded-2xl w-full max-w-md p-8 shadow-2xl space-y-6">
            <h2 className="text-2xl font-bold text-dark-text">Add Credit Card</h2>
            <form onSubmit={handleCreateCard} className="space-y-4">
              <div>
                <label className="block text-xs text-dark-muted mb-1">Card Name</label>
                <input type="text" required placeholder="Visa Platinum" value={cardName} onChange={(e) => setCardName(e.target.value)} className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-2.5 text-dark-text text-sm focus:outline-none focus:border-fintech-blue" />
              </div>
              <div>
                <label className="block text-xs text-dark-muted mb-1">Issuing Bank</label>
                <input type="text" required placeholder="EBL, City Bank" value={issuingBank} onChange={(e) => setIssuingBank(e.target.value)} className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-2.5 text-dark-text text-sm focus:outline-none focus:border-fintech-blue" />
              </div>
              <div>
                <label className="block text-xs text-dark-muted mb-1">Credit Limit (BDT)</label>
                <input type="number" step="0.01" required placeholder="100000" value={creditLimit} onChange={(e) => setCreditLimit(e.target.value)} className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-2.5 text-dark-text text-sm focus:outline-none focus:border-fintech-blue" />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-xl border border-dark-border text-dark-muted text-sm font-semibold">Cancel</button>
                <button type="submit" className="px-5 py-2.5 rounded-xl bg-fintech-blue text-white font-semibold text-sm shadow-lg shadow-fintech-blue/20">Save Card</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pay Modal */}
      {showPayModal && selectedCard && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex justify-center items-center z-50 p-4">
          <div className="bg-dark-card border border-dark-border rounded-2xl w-full max-w-sm p-8 shadow-2xl space-y-6">
            <h2 className="text-xl font-bold text-dark-text">Pay Bill</h2>
            <form onSubmit={handlePayBill} className="space-y-4">
              <div>
                <label className="block text-xs text-dark-muted mb-1">Amount (BDT)</label>
                <input type="number" step="0.01" required value={payAmount} onChange={(e) => setPayAmount(e.target.value)} className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-2.5 text-dark-text text-sm focus:outline-none focus:border-fintech-blue" />
              </div>
              <div>
                <label className="block text-xs text-dark-muted mb-1">Pay From Account</label>
                <select value={payAccountId} onChange={(e) => setPayAccountId(e.target.value)} className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-2.5 text-dark-text text-sm focus:outline-none focus:border-fintech-blue">
                  {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name} (৳ {acc.current_balance})</option>)}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowPayModal(false)} className="px-5 py-2.5 rounded-xl border border-dark-border text-dark-muted text-sm font-semibold">Cancel</button>
                <button type="submit" className="px-5 py-2.5 rounded-xl bg-fintech-blue text-white font-semibold text-sm shadow-lg shadow-fintech-blue/20">Confirm</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};