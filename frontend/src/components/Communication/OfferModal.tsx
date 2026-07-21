import React, { useState } from 'react';
import { FiX, FiDollarSign, FiCalendar, FiMessageSquare, FiCheck } from 'react-icons/fi';
import { offerApi } from '../../services/communicationApi';
import type { OfferDto } from '../../services/communicationApi';

type Mode = 'submit' | 'counter';

interface OfferModalProps {
  mode: Mode;
  propertyId: string;
  propertyName: string;
  existingOffer?: OfferDto;
  onClose: () => void;
  onSuccess?: () => void;
}

const OfferModal: React.FC<OfferModalProps> = ({
  mode,
  propertyId,
  propertyName,
  existingOffer,
  onClose,
  onSuccess,
}) => {
  const [amount, setAmount] = useState(existingOffer?.counterOfferAmount?.toString() || '');
  const [message, setMessage] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(amount.replace(/,/g, ''));
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Please enter a valid offer amount.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      if (mode === 'submit') {
        await offerApi.submit({ propertyId, amount: amountNum, message, validUntil: validUntil || undefined });
      } else if (mode === 'counter' && existingOffer) {
        await offerApi.counter(existingOffer.id, { amount: amountNum, message, validUntil: validUntil || undefined });
      }
      setSuccess(true);
      onSuccess?.();
      setTimeout(onClose, 1800);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr?.response?.data?.message || 'Failed to submit offer.');
    } finally {
      setLoading(false);
    }
  };

  const title = mode === 'submit' ? 'Submit an Offer' : 'Make a Counter Offer';
  const submitLabel = mode === 'submit' ? 'Submit Offer' : 'Send Counter Offer';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="rounded-2xl w-full max-w-lg"
        style={{
          background: 'rgba(15,23,42,0.95)',
          border: '1px solid rgba(183,94,255,0.2)',
          boxShadow: '0 30px 60px rgba(0,0,0,0.5)',
          animation: 'fadeInUp 0.25s ease',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(183,94,255,0.15)', border: '1px solid rgba(183,94,255,0.3)' }}>
              <FiDollarSign style={{ color: 'var(--accent)', fontSize: '20px' }} />
            </div>
            <div>
              <h2 className="font-semibold text-lg" style={{ color: 'var(--text-primary)', fontFamily: 'var(--heading)' }}>
                {title}
              </h2>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{propertyName}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{ color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.05)', border: 'none', cursor: 'pointer' }}>
            <FiX size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          {success ? (
            <div className="text-center py-8 flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(74,222,128,0.15)', border: '2px solid rgba(74,222,128,0.4)' }}>
                <FiCheck size={28} style={{ color: 'var(--success)' }} />
              </div>
              <p className="font-semibold text-lg" style={{ color: 'var(--success)' }}>
                Offer {mode === 'submit' ? 'Submitted' : 'Countered'}!
              </p>
            </div>
          ) : (
            <>
              {/* Existing Offer Reference (Counter mode) */}
              {mode === 'counter' && existingOffer && (
                <div className="p-4 rounded-xl"
                  style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
                  <p className="text-xs font-semibold mb-1" style={{ color: '#f59e0b' }}>
                    Buyer's Offer
                  </p>
                  <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    ${existingOffer.amount.toLocaleString()}
                  </p>
                  {existingOffer.message && (
                    <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{existingOffer.message}</p>
                  )}
                </div>
              )}

              {/* Amount */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  {mode === 'counter' ? 'Counter Amount' : 'Offer Amount'} <span style={{ color: 'var(--error)' }}>*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-semibold"
                    style={{ color: 'var(--text-secondary)' }}>$</span>
                  <input
                    type="text"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value.replace(/[^0-9.,]/g, ''))}
                    placeholder="0"
                    className="w-full pl-8 pr-4 py-3 rounded-xl text-xl font-bold outline-none"
                    style={{
                      background: 'var(--input-bg)',
                      border: '1px solid var(--border)',
                      color: 'var(--accent)',
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                  />
                </div>
              </div>

              {/* Message */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                  <FiMessageSquare size={13} /> Message (optional)
                </label>
                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Add a note with your offer..."
                  className="w-full rounded-xl px-4 py-3 text-sm resize-none outline-none"
                  style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                />
              </div>

              {/* Valid Until */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                  <FiCalendar size={13} /> Valid Until (optional)
                </label>
                <input
                  type="datetime-local"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                  style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-primary)', colorScheme: 'dark' }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                />
              </div>

              {error && (
                <p className="text-sm px-3 py-2 rounded-lg"
                  style={{ color: 'var(--error)', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)' }}>
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all"
                style={{
                  background: loading ? 'rgba(183,94,255,0.4)' : 'var(--accent)',
                  color: '#fff', border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : <FiDollarSign size={16} />}
                {loading ? 'Submitting...' : submitLabel}
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default OfferModal;
