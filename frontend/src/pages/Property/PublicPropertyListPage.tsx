import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { showToast } from '../../store/toastSlice';
import { propertyApi } from '../../services/propertyApi';
import type { PropertyFilters, PropertyDto } from '../../services/propertyApi';
import { favoritesApi } from '../../services/favoritesApi';
import { savedSearchApi } from '../../services/savedSearchApi';
import { FilterPanel } from '../../components/Property/FilterPanel';
import { PropertyCard } from '../../components/Property/PropertyCard';
import { CompareDrawer } from '../../components/Property/CompareDrawer';
import { 
  FiGrid, 
  FiList, 
  FiChevronLeft, 
  FiChevronRight, 
  FiBookmark, 
  FiShare2, 
  FiCopy, 
  FiX, 
  FiSlash, 
  FiSliders 
} from 'react-icons/fi';

const PublicPropertyListPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAppSelector((state) => state.auth);

  // Core listings states
  const [properties, setProperties] = useState<PropertyDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Filters State (initialized from Query Params if available)
  const [filters, setFilters] = useState<PropertyFilters>({
    pageNumber: Number(searchParams.get('pageNumber')) || 1,
    pageSize: 6,
    searchQuery: searchParams.get('searchQuery') || undefined,
    categoryId: searchParams.get('categoryId') || undefined,
    propertyTypeId: searchParams.get('propertyTypeId') || undefined,
    statusId: searchParams.get('statusId') || undefined,
    conditionId: searchParams.get('conditionId') || undefined,
    listingType: searchParams.get('listingType') !== null ? Number(searchParams.get('listingType')) : undefined,
    sortBy: searchParams.get('sortBy') || 'newest',
    // Advanced filters
    minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
    maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
    bedrooms: searchParams.get('bedrooms') ? Number(searchParams.get('bedrooms')) : undefined,
    bathrooms: searchParams.get('bathrooms') ? Number(searchParams.get('bathrooms')) : undefined,
    minArea: searchParams.get('minArea') ? Number(searchParams.get('minArea')) : undefined,
    maxArea: searchParams.get('maxArea') ? Number(searchParams.get('maxArea')) : undefined,
    cityId: searchParams.get('cityId') || undefined,
    furnishedStatus: searchParams.get('furnishedStatus') || undefined,
    parking: searchParams.get('parking') ? Number(searchParams.get('parking')) : undefined,
    yearBuilt: searchParams.get('yearBuilt') ? Number(searchParams.get('yearBuilt')) : undefined,
  });

  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Favorites & Compare Cache
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [shareProperty, setShareProperty] = useState<PropertyDto | null>(null);

  // Save Search Modal State
  const [showSaveSearchModal, setShowSaveSearchModal] = useState(false);
  const [savedSearchName, setSavedSearchName] = useState('');

  // Load User Favorites on Mount/Auth change
  useEffect(() => {
    if (user) {
      const loadFavorites = async () => {
        try {
          const res = await favoritesApi.getFavorites();
          if (res?.data) {
            setFavoriteIds(res.data.map(p => p.id));
          }
        } catch (err) {
          console.error('Failed to load user favorites', err);
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

  // Sync filters to search query parameters
  useEffect(() => {
    const params: Record<string, string> = {};
    Object.entries(filters).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        if (Array.isArray(val)) {
          params[key] = val.join(',');
        } else {
          params[key] = String(val);
        }
      }
    });
    setSearchParams(params);
  }, [filters]);

  // Fetch properties list
  const loadProperties = async () => {
    setLoading(true);
    try {
      // Force loading only published properties for public browse
      const queryFilters = {
        ...filters,
        publishStatus: 2 // Published only
      };
      const res = await propertyApi.getProperties(queryFilters);
      if (res?.data) {
        setProperties(res.data.items);
        setTotalPages(res.data.totalPages || 1);
        setTotalRecords(res.data.totalRecords || 0);
      }
    } catch (err: any) {
      dispatch(showToast({ message: 'Failed to fetch properties.', type: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProperties();
  }, [filters]);

  const handleFilterChange = (newFilters: PropertyFilters) => {
    setFilters({ ...newFilters, pageNumber: 1 }); // reset page on filter change
  };

  const handleResetFilters = () => {
    setFilters({
      pageNumber: 1,
      pageSize: 6,
      sortBy: 'newest'
    });
  };

  // Favorite handler
  const handleFavoriteToggle = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      dispatch(showToast({ message: 'Please log in to save favorites.', type: 'info' }));
      navigate('/login');
      return;
    }

    try {
      const isFav = favoriteIds.includes(id);
      if (isFav) {
        await favoritesApi.removeFavorite(id);
        setFavoriteIds(prev => prev.filter(favId => favId !== id));
        dispatch(showToast({ message: 'Property removed from favorites.', type: 'success' }));
      } else {
        await favoritesApi.addFavorite(id);
        setFavoriteIds(prev => [...prev, id]);
        dispatch(showToast({ message: 'Property saved to favorites.', type: 'success' }));
      }
    } catch (err: any) {
      dispatch(showToast({ message: err.response?.data?.message || 'Action failed.', type: 'error' }));
    }
  };

  // Compare handler
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

  // Clear compare history
  const handleClearCompare = () => {
    setCompareIds([]);
    localStorage.removeItem('compareIds');
  };

  // Share handlers
  const handleShareToggle = (property: PropertyDto, e: React.MouseEvent) => {
    e.stopPropagation();
    setShareProperty(property);
  };

  const copyShareLink = () => {
    if (!shareProperty) return;
    const canonicalUrl = `${window.location.origin}/properties/view/${shareProperty.slug || shareProperty.id}`;
    navigator.clipboard.writeText(canonicalUrl);
    dispatch(showToast({ message: 'Canonical link copied to clipboard!', type: 'success' }));
  };

  // Save Search handlers
  const handleSaveSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      dispatch(showToast({ message: 'Please sign in to save your searches.', type: 'info' }));
      navigate('/login');
      return;
    }

    if (!savedSearchName.trim()) {
      dispatch(showToast({ message: 'Please enter a name for your search.', type: 'info' }));
      return;
    }

    try {
      // Serialize current active filters (excluding page controls)
      const { pageNumber, pageSize, ...searchParams } = filters;
      await savedSearchApi.createSavedSearch({
        name: savedSearchName,
        queryParameters: JSON.stringify(searchParams)
      });

      dispatch(showToast({ message: 'Search query saved successfully!', type: 'success' }));
      setShowSaveSearchModal(false);
      setSavedSearchName('');
    } catch (err: any) {
      dispatch(showToast({ message: err.response?.data?.message || 'Failed to save search query.', type: 'error' }));
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Banner and Quick Search info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-6 mt-4">
        <div>
          <h2 className="text-2xl font-heading font-bold text-text-primary">
            Explore Property Listings
          </h2>
          <p className="text-text-secondary text-sm">
            Discover {totalRecords} active premium real estate listings
          </p>
        </div>

        {/* List controls */}
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          {/* Save Search Button */}
          {user && (
            <button
              onClick={() => setShowSaveSearchModal(true)}
              className="btn-primary !bg-transparent border border-accent hover:bg-accent-light text-accent flex items-center gap-2 py-2 px-4 text-xs font-semibold rounded-full cursor-pointer transition-colors"
            >
              <FiBookmark /> Save This Search
            </button>
          )}

          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setShowMobileFilters(true)}
            className="lg:hidden flex items-center gap-2 py-2 px-4 border border-border rounded-full text-xs text-text-primary bg-bg-card cursor-pointer hover:border-accent hover:text-accent transition-colors"
          >
            <FiSliders /> Filters
          </button>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 bg-input-bg border border-border rounded-full px-3 py-1.5 text-xs">
            <span className="text-text-secondary">Sort:</span>
            <select
              value={filters.sortBy || 'newest'}
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value, pageNumber: 1 })}
              className="bg-transparent border-none text-text-primary focus:outline-none cursor-pointer"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="area_desc">Largest Area</option>
              <option value="area_asc">Smallest Area</option>
            </select>
          </div>

          {/* Layout view toggle */}
          <div className="hidden sm:flex items-center border border-border rounded-full overflow-hidden p-0.5 bg-input-bg">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-full cursor-pointer transition-colors ${viewMode === 'grid' ? 'bg-accent text-white' : 'text-text-secondary hover:text-text-primary'}`}
              title="Grid View"
            >
              <FiGrid size={15} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-full cursor-pointer transition-colors ${viewMode === 'list' ? 'bg-accent text-white' : 'text-text-secondary hover:text-text-primary'}`}
              title="List View"
            >
              <FiList size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Browse Panel */}
      <div className="flex gap-[30px] items-start w-full">
        {/* Desktop Filter Panel (Left Sidebar) */}
        <aside className="hidden lg:block w-[320px] flex-shrink-0 sticky top-24 max-h-[82vh] overflow-y-auto pr-2">
          <FilterPanel 
            filters={filters}
            onFilterChange={handleFilterChange}
            onReset={handleResetFilters}
          />
        </aside>

        {/* Listings Display Area */}
        <div className="flex-1 flex flex-col gap-6 w-full">
          {loading ? (
            /* Loading Skeleton */
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' : 'flex flex-col gap-6'}>
              {[...Array(6)].map((_, i) => (
                <div key={i} className="glass-card animate-pulse h-[360px] !max-w-full p-4 flex flex-col justify-between">
                  <div className="bg-slate-800 h-[180px] rounded-2xl w-full"></div>
                  <div className="h-4 bg-slate-800 rounded w-2/3 my-4"></div>
                  <div className="h-3 bg-slate-800 rounded w-1/2 mb-4"></div>
                  <div className="flex justify-between items-center border-t border-border/30 pt-3">
                    <div className="h-3 bg-slate-800 rounded w-1/3"></div>
                    <div className="h-6 bg-slate-800 rounded-full w-12"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : properties.length === 0 ? (
            /* Empty State */
            <div className="glass-card flex flex-col items-center justify-center text-center p-12 !max-w-full gap-4 min-h-[400px]">
              <div className="p-4 bg-accent-light rounded-full text-accent mb-2">
                <FiSlash size={32} />
              </div>
              <h3 className="text-xl font-semibold">No Properties Found</h3>
              <p className="text-text-secondary text-sm max-w-sm">
                We couldn't find any properties matching your selected filter options. Try adjusting your parameters.
              </p>
              <button 
                onClick={handleResetFilters}
                className="btn-primary py-2.5 px-6 text-sm mt-2 rounded-full cursor-pointer"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            /* Cards list */
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' : 'flex flex-col gap-6'}>
              {properties.map((p) => (
                <PropertyCard
                  key={p.id}
                  property={p}
                  isFavorited={favoriteIds.includes(p.id)}
                  isComparing={compareIds.includes(p.id)}
                  onFavoriteToggle={handleFavoriteToggle}
                  onCompareToggle={handleCompareToggle}
                  onShareToggle={handleShareToggle}
                  viewMode={viewMode}
                />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {properties.length > 0 && totalPages > 1 && (
            <div className="flex justify-between items-center border-t border-border/40 pt-6 mt-6">
              <button
                disabled={filters.pageNumber === 1}
                onClick={() => setFilters({ ...filters, pageNumber: (filters.pageNumber || 1) - 1 })}
                className="flex items-center gap-1 text-xs font-semibold py-2.5 px-4 border border-border rounded-full hover:border-accent hover:text-accent disabled:opacity-30 disabled:pointer-events-none cursor-pointer transition-colors"
              >
                <FiChevronLeft /> Previous
              </button>

              <span className="text-xs text-text-secondary">
                Page <strong className="text-text-primary font-semibold">{filters.pageNumber}</strong> of <strong className="text-text-primary font-semibold">{totalPages}</strong>
              </span>

              <button
                disabled={filters.pageNumber === totalPages}
                onClick={() => setFilters({ ...filters, pageNumber: (filters.pageNumber || 1) + 1 })}
                className="flex items-center gap-1 text-xs font-semibold py-2.5 px-4 border border-border rounded-full hover:border-accent hover:text-accent disabled:opacity-30 disabled:pointer-events-none cursor-pointer transition-colors"
              >
                Next <FiChevronRight />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Sticky Bottom Compare Bar */}
      <CompareDrawer 
        selectedProperties={properties.filter(p => compareIds.includes(p.id))}
        onRemove={(id) => handleCompareToggle(id, { stopPropagation: () => {} } as any)}
        onClear={handleClearCompare}
      />

      {/* Mobile Drawer Filter Modal */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm lg:hidden">
          <div className="w-full max-w-[340px] h-full bg-bg-primary border-l border-border p-6 overflow-y-auto flex flex-col gap-6">
            <div className="flex justify-between items-center border-b border-border pb-4">
              <span className="text-lg font-heading font-bold text-text-primary">Search Filters</span>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="p-1 text-text-secondary hover:text-text-primary cursor-pointer"
              >
                <FiX size={20} />
              </button>
            </div>
            <FilterPanel 
              filters={filters}
              onFilterChange={handleFilterChange}
              onReset={handleResetFilters}
            />
            <button
              onClick={() => setShowMobileFilters(false)}
              className="btn-primary w-full py-3 mt-auto rounded-full cursor-pointer"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {/* Share Modal Dialog */}
      {shareProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="glass-card max-w-sm p-6 flex flex-col gap-4 relative animate-scale-in">
            <button
              onClick={() => setShareProperty(null)}
              className="absolute top-4 right-4 text-text-secondary hover:text-text-primary cursor-pointer"
            >
              <FiX size={18} />
            </button>
            
            <h3 className="text-lg font-heading font-semibold text-text-primary flex items-center gap-2">
              <FiShare2 className="text-accent" /> Share Property
            </h3>
            
            <p className="text-xs text-text-secondary">
              Copy canonical link or share this luxury property listing with others.
            </p>

            <div className="flex items-center gap-2 bg-input-bg border border-border rounded-xl p-2 mt-2">
              <input
                type="text"
                readOnly
                value={`${window.location.origin}/properties/view/${shareProperty.slug || shareProperty.id}`}
                className="bg-transparent border-none text-xs text-text-primary flex-1 focus:outline-none overflow-hidden select-all"
              />
              <button 
                onClick={copyShareLink}
                className="p-2 text-accent hover:text-accent-hover cursor-pointer"
                title="Copy URL"
              >
                <FiCopy size={16} />
              </button>
            </div>

            {/* Social icons */}
            <div className="grid grid-cols-4 gap-4 mt-2 text-center text-xs text-text-secondary">
              <a
                href={`https://api.whatsapp.com/send?text=Check%20out%20this%20property%3A%20${encodeURIComponent(`${window.location.origin}/properties/view/${shareProperty.slug || shareProperty.id}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-accent flex flex-col items-center gap-1.5 transition-colors"
              >
                <span className="p-3 bg-slate-800 rounded-full text-base">💬</span>
                WhatsApp
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`${window.location.origin}/properties/view/${shareProperty.slug || shareProperty.id}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-accent flex flex-col items-center gap-1.5 transition-colors"
              >
                <span className="p-3 bg-slate-800 rounded-full text-base">📘</span>
                Facebook
              </a>
              <a
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(`${window.location.origin}/properties/view/${shareProperty.slug || shareProperty.id}`)}&text=Check%20out%20this%20amazing%20property%21`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-accent flex flex-col items-center gap-1.5 transition-colors"
              >
                <span className="p-3 bg-slate-800 rounded-full text-base">🐦</span>
                Twitter/X
              </a>
              <a
                href={`mailto:?subject=Amazing%20Property%20Listing&body=I%20found%20this%20amazing%20property%20listing%2C%20check%20it%20out%3A%20${encodeURIComponent(`${window.location.origin}/properties/view/${shareProperty.slug || shareProperty.id}`)}`}
                className="hover:text-accent flex flex-col items-center gap-1.5 transition-colors"
              >
                <span className="p-3 bg-slate-800 rounded-full text-base">✉️</span>
                Email
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Save Search Modal Dialog */}
      {showSaveSearchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <form 
            onSubmit={handleSaveSearchSubmit}
            className="glass-card max-w-sm p-6 flex flex-col gap-4 relative animate-scale-in"
          >
            <button
              type="button"
              onClick={() => setShowSaveSearchModal(false)}
              className="absolute top-4 right-4 text-text-secondary hover:text-text-primary cursor-pointer"
            >
              <FiX size={18} />
            </button>

            <h3 className="text-lg font-heading font-semibold text-text-primary flex items-center gap-2">
              <FiBookmark className="text-accent" /> Save Search Query
            </h3>

            <p className="text-xs text-text-secondary">
              Save your current filters and keywords. You can execute this search at any time from your profile dashboard.
            </p>

            <div className="flex flex-col gap-1.5 mt-2">
              <label className="text-xs text-text-secondary font-medium">Search Config Name</label>
              <input
                type="text"
                placeholder="e.g. Budget 3 Bed Apartments"
                value={savedSearchName}
                onChange={(e) => setSavedSearchName(e.target.value)}
                className="w-full bg-input-bg border border-border rounded-xl p-3 text-text-primary focus:border-accent focus:outline-none transition-colors"
                required
              />
            </div>

            <div className="flex gap-3 mt-4">
              <button
                type="button"
                onClick={() => setShowSaveSearchModal(false)}
                className="w-1/2 py-2.5 text-xs text-text-secondary border border-border rounded-full hover:text-text-primary transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary w-1/2 py-2.5 text-xs rounded-full font-semibold cursor-pointer"
              >
                Save Search
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default PublicPropertyListPage;
