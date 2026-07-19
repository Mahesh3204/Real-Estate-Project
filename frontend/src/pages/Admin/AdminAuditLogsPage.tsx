import React, { useState, useEffect } from 'react';
import { getAuditLogs } from '../../services/adminApi';
import { FiEye, FiEyeOff } from 'react-icons/fi';

interface AuditLog {
  id: string;
  userId: string | null;
  userEmail: string | null;
  action: string;
  resource: string;
  resourceId: string;
  oldValues: string | null;
  newValues: string | null;
  timestamp: string;
  ipAddress: string | null;
  userAgent: string | null;
}

const AdminAuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState('');

  // Expandable row state (holds the expanded log's ID)
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  useEffect(() => {
    loadLogs();
  }, [page, searchTerm]);

  const loadLogs = async () => {
    try {
      const res = await getAuditLogs({ pageNumber: page, pageSize: 10, searchTerm });
      setLogs(res.data || []);
      setTotalPages(res.meta?.totalPages || 1);
    } catch {
      setError('Failed to load audit logs.');
    }
  };


  const formatJson = (jsonStr: string | null) => {
    if (!jsonStr) return 'None';
    try {
      const parsed = JSON.parse(jsonStr);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return jsonStr;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'left' }}>
      <div>
        <h2 style={{ fontSize: '28px', color: 'var(--text-primary)', marginBottom: '5px' }}>Audit Trail</h2>
        <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Inspect administrative configuration adjustments and data modifications.</p>
      </div>

        {error && <div style={{ padding: '12px', background: 'rgba(248,113,113,0.15)', border: '1px solid var(--error)', color: 'var(--error)', borderRadius: '12px' }}>{error}</div>}

        {/* Filters and List */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.45)',
          border: '1px solid var(--border)',
          borderRadius: '20px',
          padding: '24px',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '18px', color: 'var(--text-primary)', margin: 0 }}>System Activity Log</h3>
            <input
              type="text"
              placeholder="Search by User, Action, Resource..."
              className="form-input"
              style={{ width: '280px', padding: '8px 12px', fontSize: '13px' }}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)', textAlign: 'left' }}>
                  <th style={{ padding: '12px' }}>Timestamp</th>
                  <th style={{ padding: '12px' }}>User</th>
                  <th style={{ padding: '12px' }}>Action</th>
                  <th style={{ padding: '12px' }}>Resource</th>
                  <th style={{ padding: '12px' }}>IP Address</th>
                  <th style={{ padding: '12px', width: '100px', textAlign: 'center' }}>Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => {
                  const isExpanded = expandedLogId === log.id;
                  return (
                    <React.Fragment key={log.id}>
                      <tr style={{ borderBottom: isExpanded ? 'none' : '1px solid var(--border)', transition: 'background 0.2s' }}>
                        <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td style={{ padding: '12px' }}><strong>{log.userEmail || 'System'}</strong></td>
                        <td style={{ padding: '12px' }}>
                          <span style={{
                            padding: '3px 8px', borderRadius: '20px', fontSize: '12px', fontWeight: '600',
                            backgroundColor: log.action === 'Create' ? 'rgba(74,222,128,0.1)' : log.action === 'Update' ? 'rgba(183,94,255,0.1)' : 'rgba(248,113,113,0.1)',
                            color: log.action === 'Create' ? 'var(--success)' : log.action === 'Update' ? 'var(--accent)' : 'var(--error)'
                          }}>
                            {log.action}
                          </span>
                        </td>
                        <td style={{ padding: '12px', color: 'var(--text-primary)' }}>{log.resource}</td>
                        <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{log.ipAddress || 'N/A'}</td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <button
                            onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                            style={{
                              background: 'transparent', border: 'none', color: 'var(--accent)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '6px'
                            }}
                            title={isExpanded ? 'Hide' : 'View Values'}
                          >
                            {isExpanded ? <FiEyeOff style={{ fontSize: '18px' }} /> : <FiEye style={{ fontSize: '18px' }} />}
                          </button>
                        </td>
                      </tr>

                      {/* Expanded Panel Details */}
                      {isExpanded && (
                        <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.01)' }}>
                          <td colSpan={6} style={{ padding: '15px 24px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', fontSize: '13px' }}>
                              
                              <div>
                                <strong style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '8px' }}>Old Values (Before)</strong>
                                <pre style={{
                                  background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px',
                                  color: 'var(--error)', overflowX: 'auto', margin: 0, fontFamily: 'monospace'
                                }}>
                                  {formatJson(log.oldValues)}
                                </pre>
                              </div>

                              <div>
                                <strong style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '8px' }}>New Values (After)</strong>
                                <pre style={{
                                  background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px',
                                  color: 'var(--success)', overflowX: 'auto', margin: 0, fontFamily: 'monospace'
                                }}>
                                  {formatJson(log.newValues)}
                                </pre>
                              </div>

                            </div>
                            
                            <div style={{ marginTop: '10px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                              <strong>User Agent:</strong> {log.userAgent || 'Unknown'}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
                {logs.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      No audit log events found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  background: 'rgba(255,255,255,0.03)',
                  color: 'var(--text-primary)',
                  cursor: page === 1 ? 'not-allowed' : 'pointer'
                }}
              >
                Prev
              </button>
              <span style={{ alignSelf: 'center', color: 'var(--text-secondary)', fontSize: '13px' }}>
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  background: 'rgba(255,255,255,0.03)',
                  color: 'var(--text-primary)',
                  cursor: page === totalPages ? 'not-allowed' : 'pointer'
                }}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

export default AdminAuditLogsPage;
