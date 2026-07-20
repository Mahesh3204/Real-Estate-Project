import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../services/apiClient';
import { propertyApi } from '../../services/propertyApi';
import type { PropertyDto } from '../../services/propertyApi';
import { favoritesApi } from '../../services/favoritesApi';
import { PropertyCard } from '../../components/Property/PropertyCard';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { showToast } from '../../store/toastSlice';
import { 
  FiSearch, 
  FiMapPin 
} from 'react-icons/fi';

interface Category { id: string; name: string }

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  // Home states
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProperties, setFeaturedProperties] = useState<PropertyDto[]>([]);
  const [rentProperties, setRentProperties] = useState<PropertyDto[]>([]);
  const [saleProperties, setSaleProperties] = useState<PropertyDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [compareIds, setCompareIds] = useState<string[]>([]);

  // Search parameters on hero
  const [keyword, setKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    const loadHomeData = async () => {
      setLoading(true);
      try {
        // Fetch categories
        const catRes = await apiClient.get('/api/v1/master-data/categories', { hideLoader: true });
        setCategories(catRes.data.data || []);

        // Fetch properties for home page sections
        const [featuredRes, rentRes, saleRes] = await Promise.all([
          propertyApi.getProperties({ pageSize: 3, sortBy: 'newest', publishStatus: 2 }), // featured mockup
          propertyApi.getProperties({ pageSize: 3, listingType: 1, publishStatus: 2 }), // rent
          propertyApi.getProperties({ pageSize: 3, listingType: 0, publishStatus: 2 })  // sale
        ]);

        setFeaturedProperties(featuredRes.data.items || []);
        setRentProperties(rentRes.data.items || []);
        setSaleProperties(saleRes.data.items || []);

        if (user) {
          const favRes = await favoritesApi.getFavorites();
          setFavoriteIds((favRes.data || []).map(p => p.id));
        }

        const cachedCompare = localStorage.getItem('compareIds');
        if (cachedCompare) {
          setCompareIds(JSON.parse(cachedCompare));
        }
      } catch (err) {
        console.error('Failed to load home page data', err);
      } finally {
        setLoading(false);
      }
    };
    loadHomeData();
  }, [user]);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params: string[] = [];
    if (keyword) params.push(`searchQuery=${encodeURIComponent(keyword)}`);
    if (selectedCategory) params.push(`categoryId=${selectedCategory}`);
    navigate(`/listings?${params.join('&')}`);
  };

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
      } else {
        await favoritesApi.addFavorite(id);
        setFavoriteIds(prev => [...prev, id]);
      }
      dispatch(showToast({ message: isFav ? 'Removed from favorites.' : 'Saved to favorites!', type: 'success' }));
    } catch (err: any) {
      dispatch(showToast({ message: 'Failed to update favorites.', type: 'error' }));
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
    dispatch(showToast({ message: 'Listing link copied to clipboard!', type: 'success' }));
  };

  // Static mockup items matching seeded entities
  const popularCities = [
    { name: 'Los Angeles', count: 12, img: '/los-angeles.jpg', id: '4fa85f64-5717-4562-b3fc-2c963f66afa1' },
    { name: 'San Francisco', count: 8, img: '/san-francisco.jpg', id: '4fa85f64-5717-4562-b3fc-2c963f66afa2' },
    { name: 'New York City', count: 18, img: '/new-york.jpg', id: '4fa85f64-5717-4562-b3fc-2c963f66afa3' },
    { name: 'Miami', count: 15, img: '/miami-city.jpg', id: '4fa85f64-5717-4562-b3fc-2c963f66afa4' }
  ];

  return (
    <div className="flex flex-col gap-16">
      {/* Hero Banner Section */}
      <section className="relative rounded-[32px] overflow-hidden py-24 md:py-32 px-6 md:px-12 text-center bg-gradient-to-r from-bg-primary/90 to-bg-primary/50 border border-border">
        {/* Luxury Background Overlay */}
        <div className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-30 pointer-events-none" style={{ backgroundImage: "url('/luxury-bg.png')" }} />
        
        <div className="relative max-w-3xl mx-auto flex flex-col items-center gap-6 z-10">
          <h1 className="font-heading text-4xl md:text-6xl font-bold tracking-tight leading-tight">
            Find Your <span className="text-accent bg-clip-text">Gentry Estate</span>
          </h1>
          <p className="text-text-secondary text-base md:text-lg max-w-xl">
            Browse through curated premium real estate, luxury apartments, and architectural masterworks.
          </p>

          {/* Quick Search Form */}
          <form 
            onSubmit={handleHeroSearch}
            className="w-full mt-6 bg-bg-card border border-border/80 p-4 rounded-3xl backdrop-blur-md shadow-2xl flex flex-col md:flex-row gap-4 items-center"
          >
            <div className="flex-1 w-full flex items-center gap-2.5 bg-input-bg border border-border rounded-2xl px-4 py-3 box-border">
              <FiSearch className="text-text-secondary flex-shrink-0" />
              <input
                type="text"
                placeholder="Enter keyword, area or address..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="bg-transparent border-none text-sm text-text-primary focus:outline-none w-full"
              />
            </div>

            <div className="w-full md:w-[180px] bg-input-bg border border-border rounded-2xl px-4 py-3 flex items-center box-border">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-transparent border-none text-sm text-text-primary focus:outline-none w-full cursor-pointer"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="btn-primary w-full md:w-auto py-3 px-8 text-sm font-semibold rounded-2xl cursor-pointer shadow-lg hover:shadow-accent/20 transition-all flex items-center justify-center gap-2"
            >
              <FiSearch /> Search
            </button>
          </form>
        </div>
      </section>

      {/* Popular Cities Section */}
      <section className="flex flex-col gap-6">
        <div className="flex justify-between items-end border-b border-border/40 pb-4">
          <div>
            <h2 className="text-2xl font-heading font-bold text-text-primary">Popular Cities</h2>
            <p className="text-sm text-text-secondary">Discover premium listings in sought-after metropolises</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {popularCities.map((city, idx) => (
            <div 
              key={idx}
              onClick={() => navigate(`/listings?searchQuery=${encodeURIComponent(city.name)}`)}
              className="glass-card !max-w-full p-0 overflow-hidden relative h-[240px] cursor-pointer group rounded-3xl"
            >
              {/* Cover photo */}
              <div className="absolute inset-0 bg-slate-800">
                <div className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500 opacity-60" style={{ backgroundImage: `url('${city.img}')` }} />
                <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/20 to-transparent" />
              </div>
              <div className="absolute bottom-6 left-6 z-10">
                <h3 className="text-xl font-heading font-bold text-text-primary mb-1">{city.name}</h3>
                <span className="text-xs text-text-secondary font-medium flex items-center gap-1.5">
                  <FiMapPin className="text-accent" /> {city.count} listings
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Properties */}
      <section className="flex flex-col gap-6">
        <div>
          <h2 className="text-2xl font-heading font-bold text-text-primary">Featured Properties</h2>
          <p className="text-sm text-text-secondary">Our top-tier architectural highlights selected for you</p>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
            {[...Array(3)].map((_, i) => <div key={i} className="bg-slate-800/40 rounded-3xl h-[360px]" />)}
          </div>
        ) : featuredProperties.length === 0 ? (
          <div className="glass-card text-center p-8 text-text-secondary text-sm">No featured listings found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredProperties.map((p) => (
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
      </section>

      {/* Properties for Sale */}
      <section className="flex flex-col gap-6">
        <div>
          <h2 className="text-2xl font-heading font-bold text-text-primary">Properties for Sale</h2>
          <p className="text-sm text-text-secondary">Explore luxury homes and commercial assets for acquisition</p>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
            {[...Array(3)].map((_, i) => <div key={i} className="bg-slate-800/40 rounded-3xl h-[360px]" />)}
          </div>
        ) : saleProperties.length === 0 ? (
          <div className="glass-card text-center p-8 text-text-secondary text-sm">No properties for sale found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {saleProperties.map((p) => (
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
      </section>

      {/* Properties for Rent */}
      <section className="flex flex-col gap-6">
        <div>
          <h2 className="text-2xl font-heading font-bold text-text-primary">Properties for Rent</h2>
          <p className="text-sm text-text-secondary">Browse premium estates available for temporary leasing</p>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
            {[...Array(3)].map((_, i) => <div key={i} className="bg-slate-800/40 rounded-3xl h-[360px]" />)}
          </div>
        ) : rentProperties.length === 0 ? (
          <div className="glass-card text-center p-8 text-text-secondary text-sm">No properties for rent found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {rentProperties.map((p) => (
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
      </section>

      {/* CTA Section */}
      <section className="w-full p-8 md:p-12 bg-gradient-to-br from-accent-light/10 to-bg-card border border-accent/20 backdrop-blur-md flex flex-col md:flex-row justify-between items-center gap-8 rounded-[32px]">
        <div className="max-w-xl flex flex-col gap-2.5">
          <h2 className="text-2xl font-heading font-bold text-text-primary">List Your Property with Gentry Estates</h2>
          <p className="text-sm text-text-secondary">
            Are you a seller or professional real estate agent? List your luxury estates on Gentry Estates and reach high-intent buyers worldwide.
          </p>
        </div>
        <button 
          onClick={() => navigate(user ? '/properties/wizard' : '/register')}
          className="btn-primary whitespace-nowrap py-3 px-8 text-sm font-semibold rounded-full cursor-pointer shadow-lg shadow-accent/20 transition-all flex-shrink-0 !w-auto"
        >
          Get Started Today
        </button>
      </section>
    </div>
  );
};
