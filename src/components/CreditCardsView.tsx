import React, { useState, useEffect } from 'react';
import { creditCardService } from '../services/creditCardService';
import type { CreditCard } from '../services/creditCardService';
import { accountService } from '../services/accountService';
import type { Account } from '../services/accountService';
import { CreditCard as CardIcon, Plus, Trash2, DollarSign, AlertCircle, CheckCircle } from 'lucide-react';

interface CreditCardsViewProps {
  userId: string;
}

export const CreditCardsView: React.FC<CreditCardsViewProps> = ({ userId }) => {
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState<CreditCard | null>(null);

  // Form states for creating card
  const [cardName, setCardName] = useState('');
  const [issuingBank, setIssuingBank] = useState('');
  const [creditLimit, setCreditLimit] = useState('');
  const [statementDate, setStatementDate] = useState('15');
  const [paymentDueDate, setPaymentDueDate] = useState('5');
  const [notes, setNotes] = useState('');

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
      console.error('Error loading credit card data:', error);
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
        notes,
      });
      setShowModal(false);
      setCardName('');
      setIssuingBank('');
      setCreditLimit('');
      setNotes('');
      loadData();
    } catch (error) {
      console.error('Error creating credit card:', error);
    }
  };

  const openPayModal = (card: CreditCard) => {
    setSelectedCard(card);
    setPayAmount(card.outstanding_balance.toString());
    setShowPayModal(true);
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
      console.error('Error paying credit card bill:', error);
      alert(error.message || 'Failed to pay bill');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this credit card?')) {
      try {
        await creditCardService.deleteCreditCard(id);
        loadData();
      } catch (error) {
        console.error('Error deleting credit card:', error);
      }
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-dark-text">Credit Cards Management</h1>
          <p className="text-dark-muted text-sm">Track credit limits, outstanding balances, utilization ratio, and bill payments</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-fintech-blue hover:opacity-90 text-white font-semibold px-4 py-2 rounded-lg transition"
        >
          <Plus className="w-5 h-5" /> Add Credit Card
        </button>
      </div>

      {/* Cards Grid */}
      {loading ? (
        <p className="text-dark-muted">Loading credit cards...</p>
      ) : cards.length === 0 ? (
        <div className="bg-dark-card border border-dark-border rounded-xl p-8 text-center text-dark-muted">
          No credit cards recorded. Click "Add Credit Card" to track your cards.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card) => {
            const limit = Number(card.credit_limit);
            const outstanding = Number(card.outstanding_balance);
            const available = Math.max(0, limit - outstanding);
            const utilization = limit > 0 ? (outstanding / limit) * 100 : 0;

            return (
              <div key={card.id} className="bg-dark-card border border-dark-border rounded-xl p-5 shadow-lg flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-dark-bg rounded-lg border border-dark-border text-fintech-red">
                        <CardIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-dark-text">{card.card_name}</h3>
                        <span className="text-xs text-dark-muted">{card.issuing_bank}</span>
                      </div>
                    </div>
                    <button onClick={() => handleDelete(card.id)} className="text-dark-muted hover:text-fintech-red transition">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3 pt-2 border-t border-dark-border">
                  <div className="grid grid-cols-2 gap-2 text-xs bg-dark-bg p-3 rounded-lg border border-dark-border">
                    <div>
                      <span className="text-dark-muted block">Outstanding</span>
                      <span className="font-bold text-fintech-red text-sm">৳ {outstanding.toLocaleString()}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-dark-muted block">Available Credit</span>
                      <span className="font-bold text-fintech-green text-sm">৳ {available.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-dark-muted">
                      <span>Utilization: {utilization.toFixed(1)}%</span>
                      <span>Limit: ৳ {limit.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-dark-bg rounded-full h-2 border border-dark-border overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          utilization >= 80 ? 'bg-fintech-red' : utilization >= 50 ? 'bg-yellow-500' : 'bg-fintech-green'
                        }`}
                        style={{ width: `${Math.min(utilization, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xs text-dark-muted pt-1">
                    <span>Statement: {card.statement_date}th</span>
                    <span>Due: {card.payment_due_date}th</span>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => openPayModal(card)}
                      className="w-full py-2 bg-fintech-blue text-white text-xs font-semibold rounded-lg hover:opacity-90 transition text-center"
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

      {/* Add Card Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-dark-card border border-dark-border rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h2 className="text-xl font-bold mb-4 text-dark-text">Add Credit Card</h2>
            <form onSubmit={handleCreateCard} className="space-y-4">
              <div>
                <label className="block text-xs text-dark-muted mb-1">Card Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Visa Platinum, Mastercard"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-dark-text focus:outline-none focus:border-fintech-blue"
                />
              </div>
              <div>
                <label className="block text-xs text-dark-muted mb-1">Issuing Bank</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. EBL, City Bank"
                  value={issuingBank}
                  onChange={(e) => setIssuingBank(e.target.value)}
                  className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-dark-text focus:outline-none focus:border-fintech-blue"
                />
              </div>
              <div>
                <label className="block text-xs text-dark-muted mb-1">Credit Limit (BDT)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="100000"
                  value={creditLimit}
                  onChange={(e) => setCreditLimit(e.target.value)}
                  className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-dark-text focus:outline-none focus:border-fintech-blue"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-dark-muted mb-1">Statement Date (Day)</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    required
                    value={statementDate}
                    onChange={(e) => setStatementDate(e.target.value)}
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-dark-text focus:outline-none focus:border-fintech-blue"
                  />
                </div>
                <div>
                  <label className="block text-xs text-dark-muted mb-1">Payment Due Date (Day)</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    required
                    value={paymentDueDate}
                    onChange={(e) => setPaymentDueDate(e.target.value)}
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-dark-text focus:outline-none focus:border-fintech-blue"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg border border-dark-border text-dark-muted hover:text-dark-text transition">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-fintech-blue text-white font-semibold hover:opacity-90 transition">Save Card</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pay Bill Modal */}
      {showPayModal && selectedCard && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-dark-card border border-dark-border rounded-2xl w-full max-w-sm p-6 shadow-2xl">
            <h2 className="text-xl font-bold mb-2 text-dark-text">Pay Credit Card Bill</h2>
            <p className="text-xs text-dark-muted mb-4">Card: <strong>{selectedCard.card_name}</strong> (Outstanding: ৳ {Number(selectedCard.outstanding_balance).toLocaleString()})</p>
            <form onSubmit={handlePayBill} className="space-y-4">
              <div>
                <label className="block text-xs text-dark-muted mb-1">Payment Amount (BDT)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-dark-text focus:outline-none focus:border-fintech-blue"
                />
              </div>
              <div>
                <label className="block text-xs text-dark-muted mb-1">Pay From Bank/Cash Account</label>
                <select
                  value={payAccountId}
                  onChange={(e) => setPayAccountId(e.target.value)}
                  className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-dark-text focus:outline-none focus:border-fintech-blue"
                >
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.name} (৳ {acc.current_balance})</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowPayModal(false)} className="px-4 py-2 rounded-lg border border-dark-border text-dark-muted hover:text-dark-text transition">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-fintech-blue text-white font-semibold hover:opacity-90 transition">Confirm Payment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};