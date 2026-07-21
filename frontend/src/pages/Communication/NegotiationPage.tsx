import React, { useEffect, useState } from 'react';
import {
  FiDollarSign,
  FiCheck,
  FiX,
  FiRefreshCw,
  FiArrowDown,
  FiArrowUp,
  FiPlus,
} from 'react-icons/fi';
import { offerApi } from '../../services/communicationApi';
import type { OfferDto } from '../../services/communicationApi';
import { useAppSelector } from '../../store/hooks';
import OfferModal from '../../components/Communication/OfferModal';

const STATUS_MAP: Record<number, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  0: { label: 'Pending', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', icon: <FiRefreshCw size={12} /> },
  1: { label: 'Accepted', color: '#4ade80', bg: 'rgba(74,222,128,0.12)', icon: <FiCheck size={12} /> },
  2: { label: 'Rejected', color: '#f87171', bg: 'rgba(248,113,113,0.12)', icon: <FiX size={12} /> },
  3: { label: 'Countered', color: '#818cf8', bg: 'rgba(129,140,248,0.12)', icon: <FiArrowUp size={12} /> },
  4: { label: 'Withdrawn', color: '#94a3b8', bg: 'rgba(148,163,184,0.12)', icon: <FiArrowDown size={12} /> },
};

const NegotiationPage: React.FC = () => {
  const { user } = useAppSelector((s) => s.auth);
  const [offers, setOffers] = useState<OfferDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<OfferDto | null>(null);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const { data } = await offerApi.getOffers();
      setOffers(data);
    } catch { /* noop */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchOffers(); }, []);

  const handleStatusAction = async (offerId: string, status: number, label: string) => {
    setActionLoading(offerId + label);
    try {
      await offerApi.updateStatus(offerId, status);
      fetchOffers();
    } catch { /* noop */ }
    finally { setActionLoading(null); }
  };

  const formatDate = (dt: string) =>
    new Date(dt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const sentOffers = offers.filter((o) => o.buyerId === user?.id);
  const receivedOffers = offers.filter((o) => o.sellerId === user?.id);

  const renderOfferCard = (offer: OfferDto, isSent: boolean) => {
    const s = STATUS_MAP[offer.status] ?? STATUS_MAP[0];
    return (
      <div
        key={offer.id}
        className="rounded-2xl p-5 flex flex-col gap-4"
        style={{
          background: 'rgba(15,23,42,0.6)',
          border: `1px solid ${offer.status === 0 ? 'rgba(183,94,255,0.25)' : 'var(--border)'}`,
          boxShadow: offer.status === 0 ? '0 4px 20px rgba(0,0,0,0.25)' : 'none',
        }}
      >
        {/* Offer Header */}
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(183,94,255,0.15)' }}>
              <FiDollarSign size={20} style={{ color: 'var(--accent)' }} />
            </div>
            <div>
              <p className="font-bold text-xl" style={{ color: 'var(--text-primary)', fontFamily: 'var(--heading)' }}>
                ${offer.amount.toLocaleString()}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                {offer.propertyName || 'Property'} · {formatDate(offer.createdAt)}
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5"
            style={{ background: s.bg, color: s.color, border: `1px solid ${s.color}30` }}>
            {s.icon} {s.label}
          </span>
        </div>

        {offer.message && (
          <p className="text-sm px-4 py-3 rounded-xl"
            style={{ color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
            "{offer.message}"
          </p>
        )}

        {offer.validUntil && new Date(offer.validUntil) > new Date() && (
          <p className="text-xs" style={{ color: '#f59e0b' }}>
            ⏳ Valid until {new Date(offer.validUntil).toLocaleString()}
          </p>
        )}

        {/* Counter Offer */}
        {offer.status === 3 && offer.counterOfferAmount && (
          <div className="p-4 rounded-xl"
            style={{ background: 'rgba(129,140,248,0.08)', border: '1px solid rgba(129,140,248,0.2)' }}>
            <p className="text-xs font-semibold mb-1" style={{ color: '#818cf8' }}>Counter Offer</p>
            <p className="font-bold text-xl" style={{ color: 'var(--text-primary)' }}>
              ${offer.counterOfferAmount.toLocaleString()}
            </p>
            {offer.counterOfferMessage && (
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{offer.counterOfferMessage}</p>
            )}

            {/* If buyer received a counter, they can accept/reject */}
            {isSent && (
              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={() => handleStatusAction(offer.id, 1, 'accept-counter')}
                  disabled={!!actionLoading}
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5"
                  style={{ background: 'rgba(74,222,128,0.15)', color: 'var(--success)', border: '1px solid rgba(74,222,128,0.3)', cursor: 'pointer' }}
                >
                  <FiCheck size={11} /> Accept Counter
                </button>
                <button
                  onClick={() => handleStatusAction(offer.id, 2, 'reject-counter')}
                  disabled={!!actionLoading}
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5"
                  style={{ background: 'rgba(248,113,113,0.1)', color: 'var(--error)', border: '1px solid rgba(248,113,113,0.2)', cursor: 'pointer' }}
                >
                  <FiX size={11} /> Reject
                </button>
              </div>
            )}
          </div>
        )}

        {/* Seller Actions for Pending */}
        {offer.status === 0 && !isSent && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleStatusAction(offer.id, 1, 'accept')}
              disabled={!!actionLoading}
              className="px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5"
              style={{ background: 'rgba(74,222,128,0.15)', color: 'var(--success)', border: '1px solid rgba(74,222,128,0.3)', cursor: 'pointer' }}
            >
              <FiCheck size={13} /> Accept
            </button>
            <button
              onClick={() => { setSelectedOffer(offer); setShowOfferModal(true); }}
              className="px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5"
              style={{ background: 'rgba(129,140,248,0.12)', color: '#818cf8', border: '1px solid rgba(129,140,248,0.25)', cursor: 'pointer' }}
            >
              <FiRefreshCw size={13} /> Counter
            </button>
            <button
              onClick={() => handleStatusAction(offer.id, 2, 'reject')}
              disabled={!!actionLoading}
              className="px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5"
              style={{ background: 'rgba(248,113,113,0.1)', color: 'var(--error)', border: '1px solid rgba(248,113,113,0.2)', cursor: 'pointer' }}
            >
              <FiX size={13} /> Reject
            </button>
          </div>
        )}

        {/* Buyer withdraw pending offer */}
        {offer.status === 0 && isSent && (
          <button
            onClick={() => handleStatusAction(offer.id, 4, 'withdraw')}
            disabled={!!actionLoading}
            className="self-start px-4 py-2 rounded-xl text-xs"
            style={{ background: 'rgba(148,163,184,0.1)', color: 'var(--text-secondary)', border: '1px solid var(--border)', cursor: 'pointer' }}
          >
            Withdraw Offer
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="p-6 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--heading)', color: 'var(--text-primary)' }}>
            Offer Negotiations
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Track, accept, reject, and counter property offers
          </p>
        </div>
        <button
          onClick={() => { setSelectedOffer(null); setShowOfferModal(true); }}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all"
          style={{ background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer' }}
        >
          <FiPlus size={16} /> New Offer
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 rounded-full animate-spin"
            style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent)' }} />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Received Offers */}
          <div className="flex flex-col gap-4">
            <h2 className="font-semibold text-lg flex items-center gap-2"
              style={{ color: 'var(--text-primary)', fontFamily: 'var(--heading)' }}>
              <FiArrowDown size={18} style={{ color: '#f59e0b' }} />
              Received Offers
              <span className="text-sm px-2 py-0.5 rounded-lg"
                style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b' }}>
                {receivedOffers.length}
              </span>
            </h2>
            {receivedOffers.length === 0 ? (
              <div className="text-center py-8 rounded-2xl"
                style={{ border: '1px dashed var(--border)' }}>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>No offers received yet</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {receivedOffers.map((o) => renderOfferCard(o, false))}
              </div>
            )}
          </div>

          {/* Sent Offers */}
          <div className="flex flex-col gap-4">
            <h2 className="font-semibold text-lg flex items-center gap-2"
              style={{ color: 'var(--text-primary)', fontFamily: 'var(--heading)' }}>
              <FiArrowUp size={18} style={{ color: 'var(--accent)' }} />
              Sent Offers
              <span className="text-sm px-2 py-0.5 rounded-lg"
                style={{ background: 'rgba(183,94,255,0.12)', color: 'var(--accent)' }}>
                {sentOffers.length}
              </span>
            </h2>
            {sentOffers.length === 0 ? (
              <div className="text-center py-8 rounded-2xl"
                style={{ border: '1px dashed var(--border)' }}>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>You haven't made any offers yet</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {sentOffers.map((o) => renderOfferCard(o, true))}
              </div>
            )}
          </div>
        </div>
      )}

      {showOfferModal && (
        <OfferModal
          mode={selectedOffer ? 'counter' : 'submit'}
          propertyId={selectedOffer?.propertyId || ''}
          propertyName={selectedOffer?.propertyName || 'Property'}
          existingOffer={selectedOffer || undefined}
          onClose={() => { setShowOfferModal(false); setSelectedOffer(null); }}
          onSuccess={() => { setShowOfferModal(false); setSelectedOffer(null); fetchOffers(); }}
        />
      )}
    </div>
  );
};

export default NegotiationPage;
