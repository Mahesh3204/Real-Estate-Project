import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { showToast } from '../../store/toastSlice';
import { propertyApi } from '../../services/propertyApi';
import type { PropertyDto } from '../../services/propertyApi';
import { recentlyViewedApi } from '../../services/recentlyViewedApi';
import { favoritesApi } from '../../services/favoritesApi';
import { PropertyCard } from '../../components/Property/PropertyCard';
import { FiClock as FiClockIcon, FiTrash2 as FiTrashIcon, FiSlash as FiSlashIcon } from 'react-icons/fi';

export const RecentlyViewed: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [properties, setProperties] = useState<PropertyDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [compareIds, setCompareIds] = useState<string[]>([]);

  const loadRecentlyViewed = async () => {
    setLoading(true);
    try {
      if (user) {
        // Authenticated: fetch history from backend API
        const res = await recentlyViewedApi.getRecentlyViewed();
        setProperties(res.data || []);
      } else {
        // Guest: fetch IDs from localStorage and query properties details
        const cachedHistory = localStorage.getItem('recentlyViewed');
        if (cachedHistory) {
          const ids: string[] = JSON.parse(cachedHistory);
          if (ids.length > 0) {
            const res = await propertyApi.getProperties({ propertyIds: ids, publishStatus: 2 });
            // Reorder properties according to the cached list
            const propMap = new Map(res.data.items.map(p => [p.id, p]));
            const ordered = ids.map(id => propMap.get(id)).filter(Boolean) as PropertyDto[];
            setProperties(ordered);
          } else {
            setProperties([]);
          }
        } else {
          setProperties([]);
        }
      }
    } catch (err) {
      console.error('Failed to load recently viewed history', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecentlyViewed();
    if (user) {
      const loadFavorites = async () => {
        try {
          const res = await favoritesApi.getFavorites();
          setFavoriteIds((res.data || []).map((p: any) => p.id));
        } catch (err) {
          console.error('Failed to load favorites', err);
        }
      };
      loadFavorites();
    } else {
      setFavoriteIds([]);
    }
  }, [user]);

  // Load Compare List from LocalStorage on mount
  useEffect(() => {
    const cachedCompare = localStorage.getItem('compareIds');
    if (cachedCompare) {
      setCompareIds(JSON.parse(cachedCompare));
    }
  }, []);

  const handleClearHistory = async () => {
    try {
      if (user) {
        await recentlyViewedApi.clearRecentlyViewed();
      } else {
        localStorage.removeItem('recentlyViewed');
      }
      setProperties([]);
      dispatch(showToast({ message: 'Viewing history cleared successfully.', type: 'success' }));
    } catch (err) {
      dispatch(showToast({ message: 'Failed to clear viewing history.', type: 'error' }));
    }
  };

  const handleFavoriteToggle = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      dispatch(showToast({ message: 'Please log in to save favorites.', type: 'info' }));
      return;
    }

    try {
      const isFav = favoriteIds.includes(id);
      if (isFav) {
        await favoritesApi.removeFavorite(id);
        setFavoriteIds(prev => prev.filter(favId => favId !== id));
      } else {
        await favoritesApi.addFavorite(id);
        setFavoriteIds(prev => [...prev, id]);
      }
      dispatch(showToast({ message: isFav ? 'Removed from favorites.' : 'Saved to favorites!', type: 'success' }));
    } catch (err) {
      dispatch(showToast({ message: 'Failed to update favorite.', type: 'error' }));
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
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center border-b border-border/40 pb-4">
        <h3 className="text-lg font-heading font-semibold flex items-center gap-2">
          <FiClockIcon className="text-accent" /> Recently Viewed Properties
        </h3>
        {properties.length > 0 && (
          <button
            onClick={handleClearHistory}
            className="text-xs text-error hover:underline flex items-center gap-1.5 cursor-pointer"
          >
            <FiTrashIcon /> Clear History
          </button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 animate-pulse">
          {[...Array(3)].map((_, i) => <div key={i} className="bg-slate-800/40 rounded-3xl h-[280px]" />)}
        </div>
      ) : properties.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-16 gap-3">
          <div className="p-4 bg-accent-light rounded-full text-accent">
            <FiSlashIcon size={24} />
          </div>
          <p className="text-sm text-text-secondary">Your viewing history is currently empty.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {properties.map(p => (
            <PropertyCard
              key={p.id}
              property={p}
              isFavorited={favoriteIds.includes(p.id)}
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
