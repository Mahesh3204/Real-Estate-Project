import React, { useState } from 'react';
import { FiX, FiStar, FiCheck, FiMessageSquare } from 'react-icons/fi';
import { reviewApi } from '../../services/communicationApi';

interface ReviewModalProps {
  propertyId: string;
  sellerId: string;
  propertyName: string;
  onClose: () => void;
  onSuccess?: () => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({
  propertyId,
  sellerId,
  propertyName,
  onClose,
  onSuccess,
}) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const RATING_LABELS: Record<number, string> = {
    1: 'Poor',
    2: 'Fair',
    3: 'Good',
    4: 'Very Good',
    5: 'Excellent',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError('Please select a rating.');
      return;
    }
    if (comment.trim().length < 10) {
      setError('Please write at least 10 characters in your review.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await reviewApi.submit({ propertyId, sellerId, rating, comment });
      setSuccess(true);
      onSuccess?.();
      setTimeout(onClose, 2000);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr?.response?.data?.message || 'Failed to submit review. You may not be eligible yet.');
    } finally {
      setLoading(false);
    }
  };

  const displayRating = hoverRating || rating;

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
              style={{ background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.3)' }}>
              <FiStar style={{ color: '#fbbf24', fontSize: '20px' }} />
            </div>
            <div>
              <h2 className="font-semibold text-lg" style={{ color: 'var(--text-primary)', fontFamily: 'var(--heading)' }}>
                Leave a Review
              </h2>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{propertyName}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{ color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.05)', border: 'none', cursor: 'pointer' }}>
            <FiX size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
          {success ? (
            <div className="text-center py-8 flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(74,222,128,0.15)', border: '2px solid rgba(74,222,128,0.4)' }}>
                <FiCheck size={28} style={{ color: 'var(--success)' }} />
              </div>
              <p className="font-semibold text-lg" style={{ color: 'var(--success)' }}>Review Submitted!</p>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Thank you for your feedback!
              </p>
            </div>
          ) : (
            <>
              {/* Star Rating */}
              <div className="flex flex-col items-center gap-3">
                <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Your Rating <span style={{ color: 'var(--error)' }}>*</span>
                </p>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="transition-all transform hover:scale-110"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}
                    >
                      <FiStar
                        size={36}
                        style={{
                          color: star <= displayRating ? '#fbbf24' : 'var(--border)',
                          fill: star <= displayRating ? '#fbbf24' : 'transparent',
                          transition: 'all 0.15s ease',
                        }}
                      />
                    </button>
                  ))}
                </div>
                {displayRating > 0 && (
                  <span className="text-sm font-semibold" style={{ color: '#fbbf24' }}>
                    {RATING_LABELS[displayRating]}
                  </span>
                )}
              </div>

              {/* Comment */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                  <FiMessageSquare size={13} /> Your Review <span style={{ color: 'var(--error)' }}>*</span>
                </label>
                <textarea
                  rows={5}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your experience with this property and seller..."
                  className="w-full rounded-xl px-4 py-3 text-sm resize-none outline-none"
                  style={{
                    background: 'var(--input-bg)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-primary)',
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#fbbf24'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                />
                <p className="text-xs text-right" style={{ color: 'var(--text-secondary)', opacity: 0.6 }}>
                  {comment.length} characters (min 10)
                </p>
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
                  background: loading ? 'rgba(251,191,36,0.4)' : '#fbbf24',
                  color: '#1a1a1a',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-gray-800/30 border-t-gray-800 rounded-full animate-spin" />
                ) : (
                  <FiStar size={16} />
                )}
                {loading ? 'Submitting...' : 'Submit Review'}
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;
