import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../store/hooks';
import { showToast } from '../../store/toastSlice';
import { savedSearchApi } from '../../services/savedSearchApi';
import type { SavedSearchDto } from '../../services/savedSearchApi';
import { FiSearch, FiTrash2, FiPlay, FiCalendar } from 'react-icons/fi';

export const SavedSearches: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searches, setSearches] = useState<SavedSearchDto[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSavedSearches = async () => {
    try {
      setLoading(true);
      const res = await savedSearchApi.getSavedSearches();
      setSearches(res.data || []);
    } catch (err: any) {
      dispatch(showToast({ message: err.response?.data?.message || 'Failed to load saved searches.', type: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSavedSearches();
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await savedSearchApi.deleteSavedSearch(id);
      setSearches(prev => prev.filter(s => s.id !== id));
      dispatch(showToast({ message: 'Saved search deleted.', type: 'success' }));
    } catch (err: any) {
      dispatch(showToast({ message: 'Failed to delete saved search.', type: 'error' }));
    }
  };

  const handleRunSearch = (queryParameters: string) => {
    // Strip leading ? if present
    const q = queryParameters.startsWith('?') ? queryParameters : `?${queryParameters}`;
    navigate(`/properties${q}`);
  };

  // Helper to format query parameters into human readable text
  const formatParams = (queryString: string) => {
    if (!queryString) return 'All properties';
    const params = new URLSearchParams(queryString);
    const parts: string[] = [];

    const city = params.get('city');
    if (city) parts.push(`City: ${city}`);

    const state = params.get('state');
    if (state) parts.push(`State: ${state}`);

    const minPrice = params.get('minPrice');
    const maxPrice = params.get('maxPrice');
    if (minPrice && maxPrice) parts.push(`$${Number(minPrice).toLocaleString()} - $${Number(maxPrice).toLocaleString()}`);
    else if (minPrice) parts.push(`Min: $${Number(minPrice).toLocaleString()}`);
    else if (maxPrice) parts.push(`Max: $${Number(maxPrice).toLocaleString()}`);

    const bedrooms = params.get('bedrooms');
    if (bedrooms) parts.push(`${bedrooms}+ Beds`);

    const bathrooms = params.get('bathrooms');
    if (bathrooms) parts.push(`${bathrooms}+ Baths`);

    const listingType = params.get('listingType');
    if (listingType) parts.push(listingType === '0' ? 'For Sale' : 'For Rent');

    return parts.join(' • ') || 'Custom Filter Query';
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center border-b border-border/40 pb-4">
        <h3 className="text-lg font-heading font-semibold flex items-center gap-2">
          <FiSearch className="text-accent" /> Saved Searches & Alerts
        </h3>
      </div>

      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-slate-800/40 rounded-2xl h-[90px]" />
          ))}
        </div>
      ) : searches.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-16 gap-3">
          <div className="p-4 bg-accent-light rounded-full text-accent">
            <FiSearch size={24} />
          </div>
          <p className="text-sm text-text-secondary">You haven't saved any search configurations yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {searches.map(s => (
            <div
              key={s.id}
              onClick={() => handleRunSearch(s.queryParameters)}
              className="flex justify-between items-center bg-slate-800/10 border border-border/40 p-5 rounded-2xl cursor-pointer hover:border-accent/40 transition-all group"
            >
              <div className="flex-1 min-w-0 pr-4">
                <div className="flex items-center gap-2">
                  <h4 className="font-heading font-semibold text-text-primary group-hover:text-accent transition-colors truncate">
                    {s.name}
                  </h4>
                  <span className="text-[10px] text-text-secondary flex items-center gap-1">
                    <FiCalendar size={10} /> {new Date(s.createdDate).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-text-secondary mt-1 truncate">
                  {formatParams(s.queryParameters)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleRunSearch(s.queryParameters)}
                  className="p-2 rounded-xl bg-accent-light text-accent hover:bg-accent hover:text-white transition-all cursor-pointer"
                  title="Run Search Query"
                >
                  <FiPlay size={16} />
                </button>
                <button
                  onClick={(e) => handleDelete(s.id, e)}
                  className="p-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all cursor-pointer"
                  title="Delete Config"
                >
                  <FiTrash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
