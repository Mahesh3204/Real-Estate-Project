import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../services/apiClient';

interface Inquiry {
  id: string;
  buyerId: string;
  propertyId: string;
  message: string;
  status: string;
  createdAt: string;
  lastUpdatedAt: string;
}

const InquiryHistoryPage: React.FC = () => {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchInquiries = async () => {
      try {
        const response = await apiClient.get('/api/user/inquiries');
        setInquiries(response.data);
      } catch (err: any) {
        setError(err.response?.data?.detail || "Failed to retrieve inquiry history.");
      } finally {
        setLoading(false);
      }
    };

    fetchInquiries();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Submitted': return '#3b82f6'; // Blue
      case 'Read': return '#fbbf24';      // Amber
      case 'Responded': return '#aa3bff'; // Purple
      case 'Closed': return '#10b981';    // Green
      case 'Archived': return '#64748b';  // Slate
      default: return '#64748b';
    }
  };

  return (
    <div className="glass-card animate-fade-in" style={{ maxWidth: '600px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '25px' }}>
        <Link to="/profile" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: '600', fontSize: '14px' }}>
          ← Back to Profile
        </Link>
        <h2 style={{ fontSize: '20px' }}>Inquiry Logs</h2>
      </div>

      {error && <div className="alert-error">{error}</div>}

      {loading ? (
        <p>Loading inquiries...</p>
      ) : inquiries.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <p style={{ color: 'var(--text-secondary)' }}>You haven't submitted any inquiries yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
          {inquiries.map((inquiry) => (
            <div key={inquiry.id} style={{
              background: 'white',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              padding: '16px 20px',
              position: 'relative',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 4px rgba(0,0,0,0.01)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                  Property ID: {inquiry.propertyId.substring(0, 8)}...
                </span>
                <span style={{
                  fontSize: '11px',
                  fontWeight: '700',
                  color: 'white',
                  backgroundColor: getStatusColor(inquiry.status),
                  padding: '2px 8px',
                  borderRadius: '12px'
                }}>
                  {inquiry.status}
                </span>
              </div>
              <p style={{ fontSize: '14px', color: 'var(--text-primary)', margin: '0 0 12px 0', lineHeight: '1.4' }}>
                "{inquiry.message}"
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)' }}>
                <span>Sent: {new Date(inquiry.createdAt).toLocaleDateString()}</span>
                <span>Updated: {new Date(inquiry.lastUpdatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InquiryHistoryPage;
