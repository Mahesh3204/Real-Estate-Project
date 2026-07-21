import React, { useEffect, useState } from 'react';
import { FiStar, FiMessageSquare, FiFlag, FiCheck } from 'react-icons/fi';
import { reviewApi } from '../../services/communicationApi';
import type { ReviewSummaryDto } from '../../services/communicationApi';

interface ReviewSectionProps {
  sellerId?: string;
  propertyId?: string;
  onWriteReview?: () => void;
}

const StarDisplay: React.FC<{ rating: number; size?: number }> = ({ rating, size = 14 }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <FiStar
        key={s}
        size={size}
        style={{
          color: s <= Math.round(rating) ? '#fbbf24' : 'rgba(255,255,255,0.15)',
          fill: s <= Math.round(rating) ? '#fbbf24' : 'transparent',
        }}
      />
    ))}
  </div>
);

const ReviewSection: React.FC<ReviewSectionProps> = ({ sellerId, propertyId, onWriteReview }) => {
  const [summary, setSummary] = useState<ReviewSummaryDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyState, setReplyState] = useState<{ [id: string]: { text: string; loading: boolean; sent: boolean } }>({});
  const [reportState, setReportState] = useState<{ [id: string]: boolean }>({});

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const { data } = await reviewApi.getReviews({ sellerId, propertyId });
        setSummary(data);
      } catch { /* noop */ }
      finally { setLoading(false); }
    };
    load();
  }, [sellerId, propertyId]);

  const handleReply = async (reviewId: string) => {
    const state = replyState[reviewId];
    if (!state?.text?.trim()) return;
    setReplyState((prev) => ({ ...prev, [reviewId]: { ...prev[reviewId], loading: true } }));
    try {
      await reviewApi.reply(reviewId, state.text);
      setReplyState((prev) => ({ ...prev, [reviewId]: { ...prev[reviewId], loading: false, sent: true } }));
      // Refresh
      const { data } = await reviewApi.getReviews({ sellerId, propertyId });
      setSummary(data);
    } catch {
      setReplyState((prev) => ({ ...prev, [reviewId]: { ...prev[reviewId], loading: false } }));
    }
  };

  const handleReport = async (reviewId: string) => {
    try {
      await reviewApi.report(reviewId, 'Inappropriate content');
      setReportState((prev) => ({ ...prev, [reviewId]: true }));
    } catch { /* noop */ }
  };

  const formatDate = (dt: string) =>
    new Date(dt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <div className="w-7 h-7 border-2 rounded-full animate-spin"
          style={{ borderColor: 'var(--border)', borderTopColor: '#fbbf24' }} />
      </div>
    );
  }

  if (!summary) return null;

  return (
    <div className="flex flex-col gap-6">
      {/* Rating Summary Widget */}
      <div className="rounded-2xl p-6"
        style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid var(--border)' }}>
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Big average */}
          <div className="flex flex-col items-center gap-2 flex-shrink-0">
            <p className="text-6xl font-black" style={{ fontFamily: 'var(--heading)', color: '#fbbf24' }}>
              {summary.averageRating.toFixed(1)}
            </p>
            <StarDisplay rating={summary.averageRating} size={20} />
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {summary.totalReviews} review{summary.totalReviews !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Distribution bars */}
          <div className="flex-1 flex flex-col gap-2 w-full">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = summary.distribution[star] || 0;
              const pct = summary.totalReviews > 0 ? (count / summary.totalReviews) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-3">
                  <span className="text-xs w-4 text-right" style={{ color: 'var(--text-secondary)' }}>{star}</span>
                  <FiStar size={12} style={{ color: '#fbbf24', fill: '#fbbf24', flexShrink: 0 }} />
                  <div className="flex-1 h-2 rounded-full overflow-hidden"
                    style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, background: '#fbbf24', transition: 'width 0.8s ease' }}
                    />
                  </div>
                  <span className="text-xs w-8" style={{ color: 'var(--text-secondary)' }}>
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {onWriteReview && (
          <button
            onClick={onWriteReview}
            className="mt-4 px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all"
            style={{
              background: 'rgba(251,191,36,0.15)',
              color: '#fbbf24',
              border: '1px solid rgba(251,191,36,0.3)',
              cursor: 'pointer',
            }}
          >
            <FiStar size={15} /> Write a Review
          </button>
        )}
      </div>

      {/* Review Cards */}
      {summary.reviews.length === 0 ? (
        <div className="text-center py-8 rounded-2xl"
          style={{ border: '1px dashed var(--border)' }}>
          <FiStar size={28} style={{ color: 'var(--text-secondary)', margin: '0 auto 8px' }} />
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>No reviews yet</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {summary.reviews.map((review) => {
            const rs = replyState[review.id] || { text: '', loading: false, sent: false };
            return (
              <div
                key={review.id}
                className="rounded-2xl p-5 flex flex-col gap-4"
                style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid var(--border)' }}
              >
                {/* Reviewer Info */}
                <div className="flex items-start justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    {review.buyerAvatarUrl ? (
                      <img src={review.buyerAvatarUrl} alt={review.buyerName}
                        className="w-10 h-10 rounded-xl object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm"
                        style={{ background: 'rgba(183,94,255,0.15)', color: 'var(--accent)' }}>
                        {(review.buyerName?.[0] || 'B').toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                        {review.buyerName || 'Anonymous'}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        {formatDate(review.createdAt)}
                      </p>
                    </div>
                  </div>
                  <StarDisplay rating={review.rating} />
                </div>

                {/* Comment */}
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {review.comment}
                </p>

                {/* Seller Reply */}
                {review.replyMessage && (
                  <div className="p-4 rounded-xl"
                    style={{ background: 'rgba(183,94,255,0.06)', border: '1px solid rgba(183,94,255,0.15)' }}>
                    <p className="text-xs font-semibold mb-1" style={{ color: 'var(--accent)' }}>
                      Seller's Reply
                    </p>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{review.replyMessage}</p>
                  </div>
                )}

                {/* Reply Box (only if no reply yet) */}
                {!review.replyMessage && (
                  <div className="flex flex-col gap-2">
                    <textarea
                      rows={2}
                      value={rs.text}
                      onChange={(e) => setReplyState((prev) => ({
                        ...prev,
                        [review.id]: { ...rs, text: e.target.value }
                      }))}
                      placeholder="Reply to this review..."
                      className="w-full rounded-xl px-4 py-2.5 text-sm resize-none outline-none"
                      style={{
                        background: 'var(--input-bg)',
                        border: '1px solid var(--border)',
                        color: 'var(--text-primary)',
                      }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                    />
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => handleReport(review.id)}
                        disabled={reportState[review.id]}
                        className="text-xs flex items-center gap-1.5"
                        style={{
                          color: reportState[review.id] ? 'var(--success)' : 'var(--text-secondary)',
                          background: 'none', border: 'none', cursor: 'pointer', opacity: 0.7,
                        }}
                      >
                        {reportState[review.id] ? <FiCheck size={11} /> : <FiFlag size={11} />}
                        {reportState[review.id] ? 'Reported' : 'Report'}
                      </button>
                      {rs.text?.trim() && (
                        <button
                          onClick={() => handleReply(review.id)}
                          disabled={rs.loading}
                          className="px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5"
                          style={{ background: 'rgba(183,94,255,0.15)', color: 'var(--accent)', border: '1px solid rgba(183,94,255,0.25)', cursor: 'pointer' }}
                        >
                          {rs.loading ? (
                            <span className="w-3 h-3 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                          ) : <FiMessageSquare size={11} />}
                          Reply
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ReviewSection;
