import React, { useState, useEffect } from 'react';
import { roleApi } from '../../services/roleApi';
import type { RoleRequestDto } from '../../services/roleApi';
import { useAppDispatch } from '../../store/hooks';
import { showToast } from '../../store/toastSlice';
import { FiCheck, FiX, FiSearch, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const AdminRoleRequestsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [requests, setRequests] = useState<RoleRequestDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Review Modal State
  const [selectedRequest, setSelectedRequest] = useState<RoleRequestDto | null>(null);
  const [reviewAction, setReviewAction] = useState<'Approve' | 'Reject' | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    loadRequests();
  }, [page, statusFilter, searchQuery]);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const filters: any = {
        pageNumber: page,
        pageSize,
        searchQuery: searchQuery.trim() || undefined,
      };

      if (statusFilter !== 'All') {
        const statusMap: Record<string, number> = {
          'Pending': 0,
          'Approved': 1,
          'Rejected': 2,
          'Cancelled': 3
        };
        filters.status = statusMap[statusFilter];
      }

      const res = await roleApi.getRoleRequests(filters);
      if (res.success && res.data) {
        setRequests(res.data.items || []);
        setTotalPages(res.data.totalPages || 1);
      }
    } catch (err: any) {
      dispatch(showToast({
        message: err.response?.data?.message || 'Failed to load role requests.',
        type: 'error'
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReview = (request: RoleRequestDto, action: 'Approve' | 'Reject') => {
    setSelectedRequest(request);
    setReviewAction(action);
    setReviewNotes('');
  };

  const handleCloseReview = () => {
    setSelectedRequest(null);
    setReviewAction(null);
    setReviewNotes('');
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest || !reviewAction) return;

    setSubmittingReview(true);
    try {
      if (reviewAction === 'Approve') {
        await roleApi.approveRequest(selectedRequest.id, reviewNotes);
        dispatch(showToast({ message: 'Request approved successfully.', type: 'success' }));
      } else {
        await roleApi.rejectRequest(selectedRequest.id, reviewNotes);
        dispatch(showToast({ message: 'Request rejected successfully.', type: 'success' }));
      }
      handleCloseReview();
      loadRequests();
    } catch (err: any) {
      dispatch(showToast({
        message: err.response?.data?.message || 'Failed to complete review.',
        type: 'error'
      }));
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Top Filter and Search Bar */}
      <div className="glass-card" style={{ padding: '20px', display: 'flex', flexWrap: 'wrap', gap: '15px', justifyContent: 'space-between', alignItems: 'center', maxWidth: 'none' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          {['All', 'Pending', 'Approved', 'Rejected', 'Cancelled'].map((status) => (
            <button
              key={status}
              type="button"
              className="btn-primary"
              style={{
                width: 'auto',
                padding: '8px 15px',
                fontSize: '13px',
                background: statusFilter === status ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                color: statusFilter === status ? '#fff' : 'var(--text-primary)',
                border: '1px solid var(--border)'
              }}
              onClick={() => { setStatusFilter(status); setPage(1); }}
            >
              {status}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', width: '300px' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search by User or Reason..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
            style={{ paddingLeft: '35px', width: '100%', marginBottom: 0 }}
          />
          <FiSearch style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-secondary)' }} />
        </div>
      </div>

      {/* Role Requests List */}
      <div className="glass-card" style={{ padding: '20px', minHeight: '300px', maxWidth: 'none' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '50px' }}>
            <span>Loading requests...</span>
          </div>
        ) : requests.length === 0 ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '50px', color: 'var(--text-secondary)' }}>
            No role requests found matching the filters.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="properties-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: '13px' }}>
                  <th style={{ padding: '12px 10px' }}>User Name</th>
                  <th style={{ padding: '12px 10px' }}>Requested Role</th>
                  <th style={{ padding: '12px 10px' }}>Reason</th>
                  <th style={{ padding: '12px 10px' }}>Submitted Date</th>
                  <th style={{ padding: '12px 10px' }}>Status</th>
                  <th style={{ padding: '12px 10px' }}>Feedback Notes</th>
                  <th style={{ padding: '12px 10px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr key={req.id} style={{ borderBottom: '1px solid var(--border-light)', fontSize: '14px' }}>
                    <td style={{ padding: '15px 10px', fontWeight: '500' }}>{req.userName}</td>
                    <td style={{ padding: '15px 10px' }}>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        backgroundColor: 'var(--accent-light)',
                        color: 'var(--accent)'
                      }}>
                        {req.requestedRole}
                      </span>
                    </td>
                    <td style={{ padding: '15px 10px', maxWidth: '250px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {req.reason}
                    </td>
                    <td style={{ padding: '15px 10px', color: 'var(--text-secondary)' }}>
                      {new Date(req.submittedAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '15px 10px' }}>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 'bold',
                        padding: '2px 8px',
                        borderRadius: '20px',
                        backgroundColor: req.status === 'Pending' ? 'rgba(234,179,8,0.1)' : req.status === 'Approved' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                        color: req.status === 'Pending' ? 'rgb(234,179,8)' : req.status === 'Approved' ? 'rgb(34,197,94)' : 'rgb(239,68,68)'
                      }}>
                        {req.status}
                      </span>
                    </td>
                    <td style={{ padding: '15px 10px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                      {req.reviewNotes || '-'}
                    </td>
                    <td style={{ padding: '15px 10px', textAlign: 'right' }}>
                      {req.status === 'Pending' && (
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button
                            type="button"
                            className="btn-primary"
                            onClick={() => handleOpenReview(req, 'Approve')}
                            style={{
                              width: 'auto',
                              padding: '5px 10px',
                              fontSize: '12px',
                              background: 'rgba(34,197,94,0.1)',
                              color: 'rgb(34,197,94)',
                              border: '1px solid rgba(34,197,94,0.2)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <FiCheck /> Approve
                          </button>
                          <button
                            type="button"
                            className="btn-primary"
                            onClick={() => handleOpenReview(req, 'Reject')}
                            style={{
                              width: 'auto',
                              padding: '5px 10px',
                              fontSize: '12px',
                              background: 'rgba(239,68,68,0.1)',
                              color: 'rgb(239,68,68)',
                              border: '1px solid rgba(239,68,68,0.2)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <FiX /> Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination bar */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', marginTop: '20px' }}>
            <button
              type="button"
              className="btn-primary"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              style={{ width: 'auto', padding: '6px 12px', display: 'flex', alignItems: 'center' }}
            >
              <FiChevronLeft /> Prev
            </button>
            <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Page {page} of {totalPages}</span>
            <button
              type="button"
              className="btn-primary"
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              style={{ width: 'auto', padding: '6px 12px', display: 'flex', alignItems: 'center' }}
            >
              Next <FiChevronRight />
            </button>
          </div>
        )}
      </div>

      {/* Review Modal popup */}
      {selectedRequest && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(4px)'
        }}>
          <form onSubmit={handleSubmitReview} className="glass-card animate-fade-in" style={{ padding: '25px', width: '450px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <h3 style={{ fontSize: '18px', color: 'var(--text-primary)', margin: 0 }}>
              {reviewAction} Role Upgrade Request
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
              Reviewing <strong>{selectedRequest.userName}</strong>'s request to become a <strong>{selectedRequest.requestedRole}</strong>.
            </p>
            <div style={{ padding: '10px', background: 'rgba(255,255,255,0.01)', borderLeft: '3px solid var(--accent)', fontSize: '13px', fontStyle: 'italic' }}>
              " {selectedRequest.reason} "
            </div>
            
            <div className="form-group">
              <label className="form-label">Review Decision Notes</label>
              <textarea
                className="form-input"
                placeholder="Provide notes/reasons for your decision..."
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                rows={4}
                required
                style={{ width: '100%', resize: 'none', marginBottom: 0 }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '10px', justifyContent: 'flex-end' }}>
              <button 
                type="button" 
                className="btn-primary" 
                style={{ width: 'auto', background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
                onClick={handleCloseReview}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn-primary" 
                style={{ 
                  width: 'auto', 
                  background: reviewAction === 'Approve' ? 'rgb(34,197,94)' : 'rgb(239,68,68)',
                  color: '#fff'
                }}
                disabled={submittingReview}
              >
                {submittingReview ? 'Submitting...' : `Confirm ${reviewAction}`}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminRoleRequestsPage;
