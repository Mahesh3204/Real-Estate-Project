import React, { useState } from 'react';
import { FiDollarSign, FiCheck, FiX, FiRefreshCw } from 'react-icons/fi';
import { offerApi } from '../../services/communicationApi';
import type { OfferDto } from '../../services/communicationApi';
import OfferModal from './OfferModal';

const STATUS_LABELS: Record<number, { label: string; color: string }> = {
  0: { label: 'Pending', color: '#f59e0b' },
  1: { label: 'Accepted', color: '#4ade80' },
  2: { label: 'Rejected', color: '#f87171' },
  3: { label: 'Countered', color: '#818cf8' },
  4: { label: 'Withdrawn', color: '#94a3b8' },
};

interface OfferChatCardProps {
  offer: OfferDto;
  isMine: boolean; // true if current user is the one who made the offer
  onRefresh?: () => void;
}

const OfferChatCard: React.FC<OfferChatCardProps> = ({ offer, isMine, onRefresh }) => {
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showCounterModal, setShowCounterModal] = useState(false);
  const s = STATUS_LABELS[offer.status] ?? STATUS_LABELS[0];

  const handleAction = async (status: number, label: string) => {
    setActionLoading(label);
    try {
      await offerApi.updateStatus(offer.id, status);
      onRefresh?.();
    } catch { /* noop */ }
    finally { setActionLoading(null); }
  };

  return (
    <>
      <div
        className="rounded-2xl p-4 flex flex-col gap-3"
        style={{
          background: 'rgba(15,23,42,0.8)',
          border: '1px solid rgba(183,94,255,0.25)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
          minWidth: '260px',
          maxWidth: '320px',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(183,94,255,0.15)' }}>
              <FiDollarSign size={16} style={{ color: 'var(--accent)' }} />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--accent)' }}>
              Offer
            </span>
          </div>
          <span className="text-xs px-2 py-0.5 rounded-lg font-medium"
            style={{ background: `${s.color}18`, color: s.color, border: `1px solid ${s.color}30` }}>
            {s.label}
          </span>
        </div>

        {/* Amount */}
        <div>
          <p className="text-2xl font-bold" style={{ fontFamily: 'var(--heading)', color: 'var(--text-primary)' }}>
            ${offer.amount.toLocaleString()}
          </p>
          {offer.message && (
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
              "{offer.message}"
            </p>
          )}
          {offer.validUntil && (
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
              Valid until {new Date(offer.validUntil).toLocaleDateString()}
            </p>
          )}
        </div>

        {/* Counter Offer Info */}
        {offer.status === 3 && offer.counterOfferAmount && (
          <div className="p-3 rounded-xl"
            style={{ background: 'rgba(129,140,248,0.08)', border: '1px solid rgba(129,140,248,0.2)' }}>
            <p className="text-xs font-semibold mb-1" style={{ color: '#818cf8' }}>Counter Offer</p>
            <p className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
              ${offer.counterOfferAmount.toLocaleString()}
            </p>
            {offer.counterOfferMessage && (
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{offer.counterOfferMessage}</p>
            )}
          </div>
        )}

        {/* Actions */}
        {offer.status === 0 && !isMine && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleAction(1, 'accept')}
              disabled={!!actionLoading}
              className="flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
              style={{ background: 'rgba(74,222,128,0.15)', color: 'var(--success)', border: '1px solid rgba(74,222,128,0.3)', cursor: 'pointer' }}
            >
              {actionLoading === 'accept' ? (
                <span className="w-3 h-3 border-2 border-success/30 border-t-current rounded-full animate-spin" />
              ) : <FiCheck size={12} />}
              Accept
            </button>
            <button
              onClick={() => setShowCounterModal(true)}
              disabled={!!actionLoading}
              className="flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
              style={{ background: 'rgba(129,140,248,0.12)', color: '#818cf8', border: '1px solid rgba(129,140,248,0.25)', cursor: 'pointer' }}
            >
              <FiRefreshCw size={12} /> Counter
            </button>
            <button
              onClick={() => handleAction(2, 'reject')}
              disabled={!!actionLoading}
              className="flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
              style={{ background: 'rgba(248,113,113,0.1)', color: 'var(--error)', border: '1px solid rgba(248,113,113,0.2)', cursor: 'pointer' }}
            >
              {actionLoading === 'reject' ? (
                <span className="w-3 h-3 border-2 border-error/30 border-t-current rounded-full animate-spin" />
              ) : <FiX size={12} />}
              Reject
            </button>
          </div>
        )}

        {/* Buyer withdraw */}
        {offer.status === 0 && isMine && (
          <button
            onClick={() => handleAction(4, 'withdraw')}
            disabled={!!actionLoading}
            className="w-full py-2 rounded-lg text-xs font-semibold"
            style={{ background: 'rgba(148,163,184,0.1)', color: 'var(--text-secondary)', border: '1px solid var(--border)', cursor: 'pointer' }}
          >
            {actionLoading === 'withdraw' ? 'Withdrawing...' : 'Withdraw Offer'}
          </button>
        )}
      </div>

      {showCounterModal && (
        <OfferModal
          mode="counter"
          propertyId={offer.propertyId}
          propertyName="Property"
          existingOffer={offer}
          onClose={() => setShowCounterModal(false)}
          onSuccess={() => { setShowCounterModal(false); onRefresh?.(); }}
        />
      )}
    </>
  );
};

export default OfferChatCard;
