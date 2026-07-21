import React, { useEffect, useState } from 'react';
import {
  FiMessageSquare,
  FiSearch,
  FiCheck,
  FiTrash2,
  FiChevronDown,
  FiChevronUp,
  FiMail,
  FiPhone,
  FiClock,
  FiFilter,
} from 'react-icons/fi';
import { inquiryApi } from '../../services/communicationApi';
import type { InquiryDto } from '../../services/communicationApi';

const STATUS_MAP: Record<number, { label: string; color: string; bg: string }> = {
  0: { label: 'Pending', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  1: { label: 'Replied', color: '#4ade80', bg: 'rgba(74,222,128,0.12)' },
  2: { label: 'Closed', color: '#94a3b8', bg: 'rgba(148,163,184,0.12)' },
};

const InquiryInboxPage: React.FC = () => {
  const [inquiries, setInquiries] = useState<InquiryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<number | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const params = filterStatus !== null ? { status: filterStatus } : undefined;
      const { data } = await inquiryApi.getAll(params);
      setInquiries(data);
    } catch {
      setError('Failed to load inquiries.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInquiries(); }, [filterStatus]);

  const filtered = inquiries.filter((inq) =>
    inq.message.toLowerCase().includes(search.toLowerCase()) ||
    (inq.propertyName || '').toLowerCase().includes(search.toLowerCase()) ||
    (inq.buyerName || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleReply = async (inq: InquiryDto) => {
    if (!replyText.trim()) return;
    setReplyLoading(true);
    try {
      await inquiryApi.reply(inq.id, replyText);
      setReplyText('');
      setExpanded(null);
      fetchInquiries();
    } catch {
      setError('Failed to send reply.');
    } finally {
      setReplyLoading(false);
    }
  };

  const handleClose = async (id: string) => {
    try {
      await inquiryApi.updateStatus(id, 2);
      fetchInquiries();
    } catch { /* noop */ }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this inquiry?')) return;
    try {
      await inquiryApi.softDelete(id);
      fetchInquiries();
    } catch { /* noop */ }
  };

  const formatDate = (dt: string) =>
    new Date(dt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="p-6 flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--heading)', color: 'var(--text-primary)' }}>
            Inquiry Inbox
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Manage buyer inquiries on your properties
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm px-4 py-2 rounded-xl"
          style={{ background: 'rgba(183,94,255,0.1)', border: '1px solid rgba(183,94,255,0.2)', color: 'var(--accent)' }}>
          <FiMessageSquare size={15} />
          <span>{inquiries.filter((i) => i.status === 0).length} pending</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <FiSearch size={15} className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--text-secondary)' }} />
          <input
            type="text"
            placeholder="Search inquiries..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none"
            style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
          />
        </div>

        <div className="flex items-center gap-2">
          <FiFilter size={14} style={{ color: 'var(--text-secondary)' }} />
          {[null, 0, 1, 2].map((s) => (
            <button
              key={String(s)}
              onClick={() => setFilterStatus(s)}
              className="px-3 py-2 rounded-xl text-sm font-medium transition-all"
              style={{
                background: filterStatus === s ? 'rgba(183,94,255,0.2)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${filterStatus === s ? 'rgba(183,94,255,0.4)' : 'var(--border)'}`,
                color: filterStatus === s ? 'var(--accent)' : 'var(--text-secondary)',
                cursor: 'pointer',
              }}
            >
              {s === null ? 'All' : STATUS_MAP[s].label}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="px-4 py-3 rounded-xl text-sm"
          style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', color: 'var(--error)' }}>
          {error}
        </div>
      )}

      {/* Inquiry List */}
      {loading ? (
        <div className="flex justify-center items-center py-16">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin"
            style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent)' }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(183,94,255,0.08)', border: '1px solid var(--border)' }}>
            <FiMessageSquare size={28} style={{ color: 'var(--text-secondary)' }} />
          </div>
          <p className="font-medium" style={{ color: 'var(--text-secondary)' }}>No inquiries found</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((inq) => {
            const statusInfo = STATUS_MAP[inq.status] ?? STATUS_MAP[0];
            const isOpen = expanded === inq.id;
            return (
              <div
                key={inq.id}
                className="rounded-2xl overflow-hidden transition-all"
                style={{
                  background: 'rgba(15,23,42,0.6)',
                  border: `1px solid ${isOpen ? 'rgba(183,94,255,0.3)' : 'var(--border)'}`,
                  boxShadow: isOpen ? '0 8px 24px rgba(0,0,0,0.3)' : 'none',
                }}
              >
                {/* Row Header */}
                <div
                  className="flex items-start gap-4 p-5 cursor-pointer"
                  onClick={() => setExpanded(isOpen ? null : inq.id)}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-sm"
                    style={{ background: 'rgba(183,94,255,0.15)', color: 'var(--accent)' }}>
                    {(inq.buyerName?.[0] || 'B').toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                        {inq.buyerName || 'Anonymous Buyer'}
                      </span>
                      <span className="px-2 py-0.5 rounded-lg text-xs font-medium"
                        style={{ background: statusInfo.bg, color: statusInfo.color }}>
                        {statusInfo.label}
                      </span>
                    </div>
                    {inq.propertyName && (
                      <p className="text-xs mt-0.5" style={{ color: 'var(--accent)', opacity: 0.8 }}>
                        {inq.propertyName}
                      </p>
                    )}
                    <p className="text-sm mt-1 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                      {inq.message}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-xs flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
                      <FiClock size={11} /> {formatDate(inq.createdAt)}
                    </span>
                    {isOpen ? <FiChevronUp size={16} style={{ color: 'var(--text-secondary)' }} />
                      : <FiChevronDown size={16} style={{ color: 'var(--text-secondary)' }} />}
                  </div>
                </div>

                {/* Expanded Panel */}
                {isOpen && (
                  <div className="px-5 pb-5 flex flex-col gap-4"
                    style={{ borderTop: '1px solid var(--border)' }}>
                    {/* Contact Info */}
                    <div className="flex flex-wrap gap-4 pt-4">
                      {inq.contactPhone && (
                        <span className="flex items-center gap-2 text-sm"
                          style={{ color: 'var(--text-secondary)' }}>
                          <FiPhone size={13} style={{ color: 'var(--accent)' }} />
                          {inq.contactPhone}
                        </span>
                      )}
                      {inq.contactEmail && (
                        <span className="flex items-center gap-2 text-sm"
                          style={{ color: 'var(--text-secondary)' }}>
                          <FiMail size={13} style={{ color: 'var(--accent)' }} />
                          {inq.contactEmail}
                        </span>
                      )}
                    </div>

                    {/* Full Message */}
                    <div className="p-4 rounded-xl text-sm"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
                      {inq.message}
                    </div>

                    {/* Existing Reply */}
                    {inq.replyMessage && (
                      <div className="p-4 rounded-xl text-sm"
                        style={{ background: 'rgba(183,94,255,0.08)', border: '1px solid rgba(183,94,255,0.2)', color: 'var(--text-primary)' }}>
                        <span className="text-xs font-semibold block mb-2" style={{ color: 'var(--accent)' }}>Your Reply</span>
                        {inq.replyMessage}
                      </div>
                    )}

                    {/* Reply Box */}
                    {inq.status !== 2 && !inq.replyMessage && (
                      <div className="flex flex-col gap-2">
                        <textarea
                          rows={3}
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Type your reply..."
                          className="w-full rounded-xl px-4 py-3 text-sm resize-none outline-none"
                          style={{
                            background: 'var(--input-bg)',
                            border: '1px solid var(--border)',
                            color: 'var(--text-primary)',
                          }}
                          onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
                          onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                        />
                        <button
                          onClick={() => handleReply(inq)}
                          disabled={replyLoading || !replyText.trim()}
                          className="self-end px-5 py-2 rounded-xl text-sm font-semibold flex items-center gap-2"
                          style={{
                            background: 'var(--accent)',
                            color: '#fff',
                            border: 'none',
                            opacity: replyLoading || !replyText.trim() ? 0.5 : 1,
                            cursor: replyLoading || !replyText.trim() ? 'not-allowed' : 'pointer',
                          }}
                        >
                          {replyLoading ? (
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : <FiCheck size={14} />}
                          Send Reply
                        </button>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-1">
                      {inq.status !== 2 && (
                        <button
                          onClick={() => handleClose(inq.id)}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                          style={{ background: 'rgba(148,163,184,0.1)', color: 'var(--text-secondary)', border: '1px solid var(--border)', cursor: 'pointer' }}
                        >
                          Mark Closed
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(inq.id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all"
                        style={{ background: 'rgba(248,113,113,0.08)', color: 'var(--error)', border: '1px solid rgba(248,113,113,0.2)', cursor: 'pointer' }}
                      >
                        <FiTrash2 size={11} /> Delete
                      </button>
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

export default InquiryInboxPage;
