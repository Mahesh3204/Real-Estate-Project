import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../services/apiClient';

const FavoritesPage: React.FC = () => {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const response = await apiClient.get('/api/user/favorites');
        setFavorites(response.data);
      } catch (err: any) {
        setError(err.response?.data?.detail || "Failed to retrieve favorites.");
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  const handleRemoveFavorite = async (propertyId: string) => {
    try {
      await apiClient.delete(`/api/user/favorites/${propertyId}`);
      setFavorites(favorites.filter(id => id !== propertyId));
    } catch {
      setError("Failed to remove bookmark.");
    }
  };

  return (
    <div className="glass-card animate-fade-in" style={{ maxWidth: '550px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '25px' }}>
        <Link to="/profile" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: '600', fontSize: '14px' }}>
          ← Back
        </Link>
        <h2 style={{ fontSize: '20px' }}>My Bookmarks</h2>
      </div>

      {error && <div className="alert-error">{error}</div>}

      {loading ? (
        <p>Loading bookmarks...</p>
      ) : favorites.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <p style={{ color: 'var(--text-secondary)' }}>You don't have any bookmarked listings yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left' }}>
          {favorites.map((id) => (
            <div key={id} style={{
              background: 'white',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              padding: '16px 20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <strong style={{ display: 'block', fontSize: '15px' }}>Property #{id.substring(0, 8)}</strong>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Added to favorites</span>
              </div>
              <button 
                type="button" 
                style={{ 
                  backgroundColor: '#fee2e2', 
                  color: 'var(--error)', 
                  border: 'none', 
                  padding: '8px 12px', 
                  borderRadius: '10px', 
                  fontSize: '13px', 
                  fontWeight: '600',
                  cursor: 'pointer' 
                }} 
                onClick={() => handleRemoveFavorite(id)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;
