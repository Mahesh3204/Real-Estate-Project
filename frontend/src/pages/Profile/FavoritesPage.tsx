import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../store/hooks';
import { showToast } from '../../store/toastSlice';
import { favoritesApi } from '../../services/favoritesApi';
import type { PropertyDto } from '../../services/propertyApi';
import { PropertyCard } from '../../components/Property/PropertyCard';
import { FiArrowLeft, FiHeart } from 'react-icons/fi';

const FavoritesPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [properties, setProperties] = useState<PropertyDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [compareIds, setCompareIds] = useState<string[]>([]);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const response = await favoritesApi.getFavorites();
      setProperties(response.data || []);
    } catch (err: any) {
      dispatch(showToast({ message: err.response?.data?.message || "Failed to retrieve favorites.", type: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();

    const cachedCompare = localStorage.getItem('compareIds');
    if (cachedCompare) {
      setCompareIds(JSON.parse(cachedCompare));
    }
  }, []);

  const handleFavoriteToggle = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await favoritesApi.removeFavorite(id);
      setProperties(prev => prev.filter(p => p.id !== id));
      dispatch(showToast({ message: 'Removed from bookmarks.', type: 'success' }));
    } catch {
      dispatch(showToast({ message: 'Failed to remove bookmark.', type: 'error' }));
    }
  };

  const handleCompareToggle = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const isComparing = compareIds.includes(id);
    let nextCompareIds: string[];

    if (isComparing) {
      nextCompareIds = compareIds.filter(compareId => compareId !== id);
    } else {
      if (compareIds.length >= 4) {
        dispatch(showToast({ message: 'You can compare a maximum of 4 properties.', type: 'info' }));
        return;
      }
      nextCompareIds = [...compareIds, id];
    }

    setCompareIds(nextCompareIds);
    localStorage.setItem('compareIds', JSON.stringify(nextCompareIds));
  };

  const handleShareToggle = (property: PropertyDto, e: React.MouseEvent) => {
    e.stopPropagation();
    const canonicalUrl = `${window.location.origin}/properties/view/${property.slug || property.id}`;
    navigator.clipboard.writeText(canonicalUrl);
    dispatch(showToast({ message: 'Canonical link copied to clipboard!', type: 'success' }));
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center justify-between border-b border-border/40 pb-6 mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl bg-slate-800/40 hover:bg-slate-800 text-text-primary transition-all border border-border/45 cursor-pointer"
          >
            <FiArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-heading font-bold text-text-primary flex items-center gap-2">
              <FiHeart className="text-accent fill-accent/10" /> My Bookmarked Listings
            </h1>
            <p className="text-xs text-text-secondary mt-1">Manage and access your saved properties.</p>
          </div>
        </div>
        <Link 
          to="/properties" 
          className="text-xs font-semibold text-accent hover:underline"
        >
          Browse More Properties
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 animate-pulse">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-slate-800/40 rounded-3xl h-[320px]" />
          ))}
        </div>
      ) : properties.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-20 bg-slate-900/10 border border-dashed border-border/40 rounded-3xl gap-4">
          <div className="w-16 h-16 rounded-full bg-accent-light flex items-center justify-center text-accent">
            <FiHeart size={28} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-text-primary">No Bookmarks Saved</h3>
            <p className="text-sm text-text-secondary mt-1 max-w-md">
              Browse through our property search listings and click the heart icon on any listing to bookmark it here for later.
            </p>
          </div>
          <button
            onClick={() => navigate('/properties')}
            className="btn-primary mt-2"
          >
            Start Browsing Properties
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {properties.map((p) => (
            <PropertyCard
              key={p.id}
              property={p}
              isFavorited={true}
              isComparing={compareIds.includes(p.id)}
              onFavoriteToggle={handleFavoriteToggle}
              onCompareToggle={handleCompareToggle}
              onShareToggle={handleShareToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;
