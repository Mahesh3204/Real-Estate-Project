import React, { useState } from 'react';
import { FiX, FiMessageSquare, FiPhone, FiMail, FiSend } from 'react-icons/fi';
import { inquiryApi } from '../../services/communicationApi';

interface InquiryModalProps {
  propertyId: string;
  propertyName: string;
  onClose: () => void;
  onSuccess?: () => void;
}

const InquiryModal: React.FC<InquiryModalProps> = ({
  propertyId,
  propertyName,
  onClose,
  onSuccess,
}) => {
  const [message, setMessage] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      setError('Please enter a message.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await inquiryApi.create({ propertyId, message, contactPhone, contactEmail });
      setSuccess(true);
      onSuccess?.();
      setTimeout(onClose, 1800);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr?.response?.data?.message || 'Failed to send inquiry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="glass-card rounded-2xl w-full max-w-lg"
        style={{
          background: 'rgba(15,23,42,0.92)',
          border: '1px solid rgba(183,94,255,0.2)',
          boxShadow: '0 30px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(183,94,255,0.1)',
          animation: 'fadeInUp 0.25s ease',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b"
          style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(183,94,255,0.15)', border: '1px solid rgba(183,94,255,0.3)' }}>
              <FiMessageSquare style={{ color: 'var(--accent)', fontSize: '20px' }} />
            </div>
            <div>
              <h2 className="font-semibold text-lg" style={{ color: 'var(--text-primary)', fontFamily: 'var(--heading)' }}>
                Send Inquiry
              </h2>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {propertyName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-lg flex items-center justify-center transition-all"
            style={{ color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.05)' }}
            onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          {success ? (
            <div className="text-center py-8 flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(74,222,128,0.15)', border: '2px solid rgba(74,222,128,0.4)' }}>
                <FiSend size={28} style={{ color: 'var(--success)' }} />
              </div>
              <p className="font-semibold text-lg" style={{ color: 'var(--success)' }}>Inquiry Sent!</p>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Your message has been sent to the seller. They'll get back to you shortly.
              </p>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Message <span style={{ color: 'var(--error)' }}>*</span>
                </label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Hi, I'm interested in this property and would like to know more..."
                  className="w-full rounded-xl px-4 py-3 text-sm resize-none outline-none transition-all"
                  style={{
                    background: 'var(--input-bg)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--sans)',
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                    Phone (optional)
                  </label>
                  <div className="relative">
                    <FiPhone size={15} className="absolute left-3 top-1/2 -translate-y-1/2"
                      style={{ color: 'var(--text-secondary)' }} />
                    <input
                      type="tel"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="+1 555 000 0000"
                      className="w-full rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none"
                      style={{
                        background: 'var(--input-bg)',
                        border: '1px solid var(--border)',
                        color: 'var(--text-primary)',
                      }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                    Email (optional)
                  </label>
                  <div className="relative">
                    <FiMail size={15} className="absolute left-3 top-1/2 -translate-y-1/2"
                      style={{ color: 'var(--text-secondary)' }} />
                    <input
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="you@email.com"
                      className="w-full rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none"
                      style={{
                        background: 'var(--input-bg)',
                        border: '1px solid var(--border)',
                        color: 'var(--text-primary)',
                      }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                    />
                  </div>
                </div>
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
                onMouseOver={(e) => { if (!loading) e.currentTarget.style.background = 'var(--accent-hover)'; }}
                onMouseOut={(e) => { if (!loading) e.currentTarget.style.background = 'var(--accent)'; }}
              >
                {loading ? (
                  <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                ) : (
                  <FiSend size={16} />
                )}
                {loading ? 'Sending...' : 'Send Inquiry'}
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default InquiryModal;
