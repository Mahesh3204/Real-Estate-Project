import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface CompareProperty {
  id: string;
  title: string;
  price: string;
  type: string;
  beds: number;
  baths: number;
  area: string;
}

const MOCK_PROPERTIES: CompareProperty[] = [
  { id: '1', title: 'Luxury Villa', price: '$1,200,000', type: 'House', beds: 4, baths: 4, area: '4,200 sqft' },
  { id: '2', title: 'Modern Penthouse', price: '$850,000', type: 'Apartment', beds: 3, baths: 2.5, area: '2,100 sqft' },
  { id: '3', title: 'Cozy Cottage', price: '$450,000', type: 'House', beds: 2, baths: 1.5, area: '1,400 sqft' },
  { id: '4', title: 'Downtown Loft', price: '$650,000', type: 'Apartment', beds: 2, baths: 2, area: '1,800 sqft' },
  { id: '5', title: 'Suburban Mansion', price: '$2,100,000', type: 'House', beds: 6, baths: 5.5, area: '6,800 sqft' }
];

const ComparePage: React.FC = () => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [error, setError] = useState('');

  const handleToggleSelect = (id: string) => {
    setError('');
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(item => item !== id));
    } else {
      if (selectedIds.length >= 4) {
        setError("Maximum comparison limit is restricted to 4 concurrent properties.");
        return;
      }
      setSelectedIds([...selectedIds, id]);
    }
  };

  const getCompareList = () => {
    return MOCK_PROPERTIES.filter(p => selectedIds.includes(p.id));
  };

  return (
    <div className="glass-card animate-fade-in" style={{ maxWidth: '800px', width: '95vw' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '25px' }}>
        <Link to="/profile" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: '600', fontSize: '14px' }}>
          ← Profile
        </Link>
        <h2 style={{ fontSize: '20px' }}>Comparison Matrix</h2>
      </div>

      {error && <div className="alert-error" style={{ marginBottom: '20px' }}>{error}</div>}

      <div style={{ marginBottom: '30px', textAlign: 'left' }}>
        <label className="form-label">Select properties to compare (Max 4):</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {MOCK_PROPERTIES.map((p) => {
            const isSelected = selectedIds.includes(p.id);
            return (
              <div 
                key={p.id}
                onClick={() => handleToggleSelect(p.id)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '12px',
                  border: `1px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
                  backgroundColor: isSelected ? 'var(--accent-light)' : 'white',
                  color: isSelected ? 'var(--accent)' : 'var(--text-primary)',
                  fontWeight: '600',
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {p.title}
              </div>
            );
          })}
        </div>
      </div>

      {selectedIds.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', border: '1px dashed var(--border)', borderRadius: '16px' }}>
          <p style={{ color: 'var(--text-secondary)' }}>Select properties from the list above to compare specifications side-by-side.</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: '16px', background: 'white' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-primary)' }}>
                <th style={{ padding: '12px 16px', fontWeight: '600' }}>Features</th>
                {getCompareList().map(p => (
                  <th key={p.id} style={{ padding: '12px 16px', fontWeight: '700', color: 'var(--accent)' }}>{p.title}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '12px 16px', fontWeight: '600', color: 'var(--text-secondary)' }}>Price</td>
                {getCompareList().map(p => <td key={p.id} style={{ padding: '12px 16px' }}>{p.price}</td>)}
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '12px 16px', fontWeight: '600', color: 'var(--text-secondary)' }}>Property Type</td>
                {getCompareList().map(p => <td key={p.id} style={{ padding: '12px 16px' }}>{p.type}</td>)}
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '12px 16px', fontWeight: '600', color: 'var(--text-secondary)' }}>Bedrooms</td>
                {getCompareList().map(p => <td key={p.id} style={{ padding: '12px 16px' }}>{p.beds}</td>)}
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '12px 16px', fontWeight: '600', color: 'var(--text-secondary)' }}>Bathrooms</td>
                {getCompareList().map(p => <td key={p.id} style={{ padding: '12px 16px' }}>{p.baths}</td>)}
              </tr>
              <tr>
                <td style={{ padding: '12px 16px', fontWeight: '600', color: 'var(--text-secondary)' }}>Area Size</td>
                {getCompareList().map(p => <td key={p.id} style={{ padding: '12px 16px' }}>{p.area}</td>)}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ComparePage;
