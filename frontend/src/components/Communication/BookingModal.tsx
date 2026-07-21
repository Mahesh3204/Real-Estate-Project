import React, { useState } from 'react';
import { FiX, FiCalendar, FiUsers, FiFileText, FiCheck } from 'react-icons/fi';
import { appointmentApi } from '../../services/communicationApi';

interface BookingModalProps {
  propertyId: string;
  propertyName: string;
  onClose: () => void;
  onSuccess?: () => void;
}

const BookingModal: React.FC<BookingModalProps> = ({
  propertyId,
  propertyName,
  onClose,
  onSuccess,
}) => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().slice(0, 16);

  const [scheduledAt, setScheduledAt] = useState(tomorrowStr);
  const [notes, setNotes] = useState('');
  const [numberOfVisitors, setNumberOfVisitors] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduledAt) {
      setError('Please select a date and time.');
      return;
    }
    if (new Date(scheduledAt) <= new Date()) {
      setError('Please select a future date and time.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await appointmentApi.book({ propertyId, scheduledAt, notes, numberOfVisitors });
      setSuccess(true);
      onSuccess?.();
      setTimeout(onClose, 2000);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr?.response?.data?.message || 'Failed to book appointment.');
    } finally {
      setLoading(false);
    }
  };

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
              <FiCalendar style={{ color: 'var(--accent)', fontSize: '20px' }} />
            </div>
            <div>
              <h2 className="font-semibold text-lg" style={{ color: 'var(--text-primary)', fontFamily: 'var(--heading)' }}>
                Schedule a Visit
              </h2>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{propertyName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-lg flex items-center justify-center transition-all"
            style={{ color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.05)' }}
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          {success ? (
            <div className="text-center py-10 flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(74,222,128,0.15)', border: '2px solid rgba(74,222,128,0.4)' }}>
                <FiCheck size={28} style={{ color: 'var(--success)' }} />
              </div>
              <p className="font-semibold text-lg" style={{ color: 'var(--success)' }}>Booking Requested!</p>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Your visit request has been submitted. The seller will confirm shortly.
              </p>
            </div>
          ) : (
            <>
              {/* Date & Time */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                  <FiCalendar size={14} /> Date & Time <span style={{ color: 'var(--error)' }}>*</span>
                </label>
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  min={tomorrowStr}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                  style={{
                    background: 'var(--input-bg)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-primary)',
                    colorScheme: 'dark',
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                />
              </div>

              {/* Number of Visitors */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                  <FiUsers size={14} /> Number of Visitors
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setNumberOfVisitors(Math.max(1, numberOfVisitors - 1))}
                    className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-lg transition-all"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', color: 'var(--text-primary)', cursor: 'pointer' }}
                  >
                    −
                  </button>
                  <span className="text-lg font-bold w-8 text-center" style={{ color: 'var(--text-primary)' }}>
                    {numberOfVisitors}
                  </span>
                  <button
                    type="button"
                    onClick={() => setNumberOfVisitors(Math.min(10, numberOfVisitors + 1))}
                    className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-lg transition-all"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', color: 'var(--text-primary)', cursor: 'pointer' }}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Notes */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                  <FiFileText size={14} /> Notes (optional)
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any special requests or questions for the visit..."
                  className="w-full rounded-xl px-4 py-3 text-sm resize-none outline-none"
                  style={{
                    background: 'var(--input-bg)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-primary)',
                  }}
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
                  color: '#fff',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  border: 'none',
                }}
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <FiCalendar size={16} />
                )}
                {loading ? 'Booking...' : 'Request Visit'}
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default BookingModal;
