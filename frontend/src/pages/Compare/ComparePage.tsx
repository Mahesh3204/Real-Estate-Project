import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../store/hooks';
import { showToast } from '../../store/toastSlice';
import { propertyApi } from '../../services/propertyApi';
import type { PropertyDto } from '../../services/propertyApi';
import { FiTrash2, FiLayers, FiArrowLeft } from 'react-icons/fi';

export const ComparePage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [properties, setProperties] = useState<PropertyDto[]>([]);
  const [loading, setLoading] = useState(false);

  const loadCompareProperties = async () => {
    const cachedCompare = localStorage.getItem('compareIds');
    if (!cachedCompare) {
      setProperties([]);
      return;
    }

    const ids: string[] = JSON.parse(cachedCompare);
    if (ids.length === 0) {
      setProperties([]);
      return;
    }

    setLoading(true);
    try {
      // Query properties matching these specific IDs
      const res = await propertyApi.getProperties({ propertyIds: ids, publishStatus: 2 });
      if (res?.data) {
        setProperties(res.data.items || []);
      }
    } catch (err: any) {
      dispatch(showToast({ message: 'Failed to fetch comparison properties.', type: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompareProperties();
  }, []);

  const handleRemoveCompare = (id: string) => {
    const cachedCompare = localStorage.getItem('compareIds');
    if (cachedCompare) {
      const ids: string[] = JSON.parse(cachedCompare);
      const nextIds = ids.filter(compareId => compareId !== id);
      localStorage.setItem('compareIds', JSON.stringify(nextIds));
      setProperties(prev => prev.filter(p => p.id !== id));
      dispatch(showToast({ message: 'Property removed from comparison.', type: 'success' }));
    }
  };

  const handleClearAll = () => {
    localStorage.removeItem('compareIds');
    setProperties([]);
    dispatch(showToast({ message: 'Cleared comparison list.', type: 'info' }));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-border pb-6 mt-4">
        <div>
          <Link 
            to="/listings" 
            className="flex items-center gap-1.5 text-xs text-accent font-semibold hover:underline mb-1"
          >
            <FiArrowLeft /> Back to Listings
          </Link>
          <h2 className="text-2xl font-heading font-bold text-text-primary flex items-center gap-2">
            <FiLayers className="text-accent" /> Property Comparison Matrix
          </h2>
          <p className="text-text-secondary text-sm">
            Compare premium features, dimensions, pricing, and locations side-by-side.
          </p>
        </div>

        {properties.length > 0 && (
          <button
            onClick={handleClearAll}
            className="btn-primary !bg-transparent border border-error/50 hover:bg-error/10 text-error flex items-center gap-2 py-2 px-5 text-xs font-semibold rounded-full cursor-pointer transition-colors"
          >
            <FiTrash2 /> Clear All
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-32">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-accent border-t-transparent" />
        </div>
      ) : properties.length === 0 ? (
        <div className="glass-card text-center p-12 !max-w-full flex flex-col items-center justify-center gap-4 min-h-[300px]">
          <div className="p-4 bg-accent-light rounded-full text-accent">
            <FiLayers size={32} />
          </div>
          <h3 className="text-xl font-semibold">No Properties to Compare</h3>
          <p className="text-text-secondary text-sm max-w-sm">
            Select up to 4 listings on the browse page to inspect their characteristics side-by-side.
          </p>
          <Link to="/listings" className="btn-primary py-2.5 px-6 text-sm rounded-full mt-2">
            Browse Listings
          </Link>
        </div>
      ) : (
        /* Side-by-side Grid Table Card layout */
        <div className="overflow-x-auto border border-border rounded-3xl bg-bg-card backdrop-blur-md">
          <table className="w-full text-sm border-collapse min-w-[700px] text-left">
            <thead>
              <tr className="border-b border-border bg-slate-900/60">
                <th className="p-5 font-semibold text-text-secondary w-[200px]">Features</th>
                {properties.map(p => (
                  <th key={p.id} className="p-5 font-heading font-semibold text-text-primary text-base relative">
                    <div className="flex flex-col gap-2">
                      <div className="h-[120px] rounded-xl overflow-hidden bg-slate-800">
                        <img 
                          src={p.featuredImageUrl ? (p.featuredImageUrl.startsWith('http') ? p.featuredImageUrl : `http://localhost:5242/${p.featuredImageUrl.replace(/^\//, '')}`) : '/placeholder-house.jpg'} 
                          alt={p.title} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="truncate block font-bold text-text-primary hover:text-accent cursor-pointer" onClick={() => navigate(`/properties/view/${p.slug || p.id}`)}>
                        {p.title}
                      </span>
                      <button
                        onClick={() => handleRemoveCompare(p.id)}
                        className="absolute top-4 right-4 p-2 bg-black/60 rounded-full hover:text-error text-text-secondary transition-colors cursor-pointer"
                        title="Remove"
                      >
                        <FiTrash2 size={12} />
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {/* Price row */}
              <tr>
                <td className="p-5 font-semibold text-text-secondary bg-slate-950/20">Price</td>
                {properties.map(p => (
                  <td key={p.id} className="p-5 font-bold text-lg text-accent">
                    {formatPrice(p.price)}
                    {p.listingType === 1 && <span className="text-xs font-normal text-text-secondary">/mo</span>}
                  </td>
                ))}
              </tr>

              {/* Location City */}
              <tr>
                <td className="p-5 font-semibold text-text-secondary bg-slate-950/20">City</td>
                {properties.map(p => (
                  <td key={p.id} className="p-5 font-medium text-text-primary">
                    {p.cityName || '-'}
                  </td>
                ))}
              </tr>

              {/* Listing Type */}
              <tr>
                <td className="p-5 font-semibold text-text-secondary bg-slate-950/20">Listing Type</td>
                {properties.map(p => (
                  <td key={p.id} className="p-5 font-medium">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${p.listingType === 1 ? 'bg-blue-600/25 text-blue-400 border border-blue-500/30' : 'bg-accent-light text-accent border border-accent/20'}`}>
                      For {p.listingType === 1 ? 'Rent' : 'Sale'}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Category */}
              <tr>
                <td className="p-5 font-semibold text-text-secondary bg-slate-950/20">Category</td>
                {properties.map(p => (
                  <td key={p.id} className="p-5 font-medium text-text-primary">
                    {p.categoryName || '-'}
                  </td>
                ))}
              </tr>

              {/* Property Type */}
              <tr>
                <td className="p-5 font-semibold text-text-secondary bg-slate-950/20">Property Type</td>
                {properties.map(p => (
                  <td key={p.id} className="p-5 font-medium text-text-primary">
                    {p.propertyTypeName || '-'}
                  </td>
                ))}
              </tr>

              {/* Bedrooms */}
              <tr>
                <td className="p-5 font-semibold text-text-secondary bg-slate-950/20">Bedrooms</td>
                {properties.map(p => (
                  <td key={p.id} className="p-5 text-text-primary">
                    {(p as any).bedrooms || '-'}
                  </td>
                ))}
              </tr>

              {/* Bathrooms */}
              <tr>
                <td className="p-5 font-semibold text-text-secondary bg-slate-950/20">Bathrooms</td>
                {properties.map(p => (
                  <td key={p.id} className="p-5 text-text-primary">
                    {(p as any).bathrooms || '-'}
                  </td>
                ))}
              </tr>

              {/* Area Size */}
              <tr>
                <td className="p-5 font-semibold text-text-secondary bg-slate-950/20">Area Size</td>
                {properties.map(p => (
                  <td key={p.id} className="p-5 text-text-primary">
                    {(p as any).area ? `${(p as any).area} Sq Ft` : '-'}
                  </td>
                ))}
              </tr>

              {/* Year Built */}
              <tr>
                <td className="p-5 font-semibold text-text-secondary bg-slate-950/20">Year Built</td>
                {properties.map(p => (
                  <td key={p.id} className="p-5 text-text-primary">
                    {(p as any).yearBuilt || '-'}
                  </td>
                ))}
              </tr>

              {/* Action Link row */}
              <tr>
                <td className="p-5 bg-slate-950/20"></td>
                {properties.map(p => (
                  <td key={p.id} className="p-5">
                    <button
                      onClick={() => navigate(`/properties/view/${p.slug || p.id}`)}
                      className="btn-primary w-full py-2.5 px-4 text-xs rounded-xl font-semibold cursor-pointer"
                    >
                      View Details
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ComparePage;
