import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { showToast } from '../../store/toastSlice';
import { profileApi } from '../../services/profileApi';
import { favoritesApi } from '../../services/favoritesApi';
import type { PropertyDto } from '../../services/propertyApi';
import { PropertyCard } from '../../components/Property/PropertyCard';
import { CompareDrawer } from '../../components/Property/CompareDrawer';
import { FiMail, FiPhone, FiUser, FiArrowLeft, FiGrid, FiList } from 'react-icons/fi';

export const PublicProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  // Profile data
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Cache/toggles states
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [compareIds, setCompareIds] = useState<string[]>([]);

  const loadPublicProfile = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await profileApi.getPublicProfile(id);
      if (res?.data) {
        setProfile(res.data);
      }
    } catch (err: any) {
      dispatch(showToast({ message: err.response?.data?.message || 'Failed to load public profile.', type: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPublicProfile();

    const cachedCompare = localStorage.getItem('compareIds');
    if (cachedCompare) {
      setCompareIds(JSON.parse(cachedCompare));
    }
  }, [id]);

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

  const handleFavoriteToggle = async (propId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      dispatch(showToast({ message: 'Please log in to save favorites.', type: 'info' }));
      return;
    }

    try {
      const isFav = favoriteIds.includes(propId);
      if (isFav) {
        await favoritesApi.removeFavorite(propId);
        setFavoriteIds(prev => prev.filter(favId => favId !== propId));
        dispatch(showToast({ message: 'Property removed from favorites.', type: 'success' }));
      } else {
        await favoritesApi.addFavorite(propId);
        setFavoriteIds(prev => [...prev, propId]);
        dispatch(showToast({ message: 'Property saved to favorites.', type: 'success' }));
      }
    } catch (err: any) {
      dispatch(showToast({ message: err.response?.data?.message || 'Action failed.', type: 'error' }));
    }
  };

  const handleCompareToggle = (propId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const isComparing = compareIds.includes(propId);
    let nextCompareIds: string[];

    if (isComparing) {
      nextCompareIds = compareIds.filter(compareId => compareId !== propId);
    } else {
      if (compareIds.length >= 4) {
        dispatch(showToast({ message: 'You can compare a maximum of 4 properties.', type: 'info' }));
        return;
      }
      nextCompareIds = [...compareIds, propId];
    }

    setCompareIds(nextCompareIds);
    localStorage.setItem('compareIds', JSON.stringify(nextCompareIds));
  };

  const handleClearCompare = () => {
    setCompareIds([]);
    localStorage.removeItem('compareIds');
    dispatch(showToast({ message: 'Comparisons cleared.', type: 'info' }));
  };

  const handleShareToggle = (property: PropertyDto, e: React.MouseEvent) => {
    e.stopPropagation();
    const canonicalUrl = `${window.location.origin}/properties/view/${property.slug || property.id}`;
    navigator.clipboard.writeText(canonicalUrl);
    dispatch(showToast({ message: 'Canonical link copied to clipboard!', type: 'success' }));
  };

  const getAvatarUrl = (url?: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `http://localhost:5242/${url.replace(/^\//, '')}`;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center animate-pulse">
        <div className="w-24 h-24 rounded-full bg-slate-800 mx-auto mb-4" />
        <div className="h-6 bg-slate-800 rounded w-48 mx-auto mb-2" />
        <div className="h-4 bg-slate-800 rounded w-32 mx-auto" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-20 text-center max-w-md">
        <h2 className="text-2xl font-bold dark:text-white">Profile Not Found</h2>
        <p className="text-slate-500 mt-2">The requested seller or agent profile could not be found.</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-all"
        >
          <FiArrowLeft /> Back
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-650 hover:text-accent font-semibold mb-6 transition-all cursor-pointer"
      >
        <FiArrowLeft /> Back
      </button>

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left column: Card profile info */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col items-center text-center">
            {profile.avatarUrl ? (
              <img
                src={getAvatarUrl(profile.avatarUrl)}
                alt={`${profile.firstName} ${profile.lastName}`}
                className="w-24 h-24 rounded-full object-cover border-2 border-accent mb-4 shadow"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-accent-light text-accent flex items-center justify-center text-3xl font-bold border-2 border-accent mb-4">
                {profile.firstName?.[0]?.toUpperCase()}{profile.lastName?.[0]?.toUpperCase()}
              </div>
            )}

            <h2 className="text-xl font-heading font-bold text-text-primary">
              {profile.firstName} {profile.lastName}
            </h2>
            <span className="mt-1 text-xs font-semibold px-3 py-1 rounded-full bg-accent-light text-accent uppercase tracking-wider">
              {profile.role || 'Partner'}
            </span>

            <div className="w-full border-t border-border/40 my-5" />

            <div className="w-full space-y-4 text-left">
              {profile.email && (
                <div className="flex items-center gap-3 text-sm text-text-secondary">
                  <FiMail className="text-accent flex-shrink-0" />
                  <a href={`mailto:${profile.email}`} className="truncate hover:underline">
                    {profile.email}
                  </a>
                </div>
              )}
              {profile.phone && (
                <div className="flex items-center gap-3 text-sm text-text-secondary">
                  <FiPhone className="text-accent flex-shrink-0" />
                  <a href={`tel:${profile.phone}`} className="hover:underline">
                    {profile.phone}
                  </a>
                </div>
              )}
              <div className="flex items-center gap-3 text-sm text-text-secondary">
                <FiUser className="text-accent flex-shrink-0" />
                <span>{profile.listings?.length || 0} Public Listings</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Active public listings grid */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          <div className="flex justify-between items-center border-b border-border/40 pb-4">
            <h3 className="text-xl font-heading font-bold text-text-primary">
              Active Listings ({profile.listings?.length || 0})
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg border transition-all cursor-pointer ${viewMode === 'grid' ? 'border-accent text-accent bg-accent/10' : 'border-border text-text-secondary hover:border-text-primary'}`}
              >
                <FiGrid size={16} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg border transition-all cursor-pointer ${viewMode === 'list' ? 'border-accent text-accent bg-accent/10' : 'border-border text-text-secondary hover:border-text-primary'}`}
              >
                <FiList size={16} />
              </button>
            </div>
          </div>

          {profile.listings?.length === 0 ? (
            <div className="py-20 text-center text-text-secondary">
              This partner has no active public listings on the marketplace.
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : 'flex flex-col gap-6'}>
              {profile.listings.map((p: any) => (
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
        </div>
      </div>

      {/* Sticky Bottom Compare Bar */}
      <CompareDrawer 
        selectedProperties={profile.listings?.filter((p: any) => compareIds.includes(p.id)) || []}
        onRemove={(propId) => handleCompareToggle(propId, { stopPropagation: () => {} } as any)}
        onClear={handleClearCompare}
      />
    </div>
  );
};

export default PublicProfilePage;
