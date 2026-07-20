import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { PropertyDto } from '../../services/propertyApi';
import { 
  FiHeart, 
  FiLayers, 
  FiShare2, 
  FiCalendar, 
  FiUser 
} from 'react-icons/fi';

interface PropertyCardProps {
  property: PropertyDto;
  isFavorited: boolean;
  isComparing: boolean;
  onFavoriteToggle: (id: string, e: React.MouseEvent) => void;
  onCompareToggle: (id: string, e: React.MouseEvent) => void;
  onShareToggle: (property: PropertyDto, e: React.MouseEvent) => void;
  viewMode?: 'grid' | 'list';
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  isFavorited,
  isComparing,
  onFavoriteToggle,
  onCompareToggle,
  onShareToggle,
  viewMode = 'grid'
}) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    // Navigate to property details
    navigate(`/properties/view/${property.slug || property.id}`);
  };

  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(property.price);

  const formattedDate = new Date(property.createdDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const getMediaUrl = (url?: string) => {
    if (!url) return '/placeholder-house.jpg'; // fallback placeholder image
    if (url.startsWith('http')) return url;
    const base = 'http://localhost:5242'; // default API base URL
    return `${base.replace(/\/$/, '')}/${url.replace(/^\//, '')}`;
  };

  const isRent = property.listingType === 1;

  if (viewMode === 'list') {
    return (
      <div 
        onClick={handleCardClick}
        className="glass-card !max-w-full p-4 flex flex-col sm:flex-row gap-6 cursor-pointer hover:border-accent/40 transition-all duration-300 group"
      >
        {/* Left Side: Thumbnail image */}
        <div className="relative w-full sm:w-[260px] h-[180px] rounded-2xl overflow-hidden bg-slate-800 flex-shrink-0">
          <img 
            src={getMediaUrl(property.featuredImageUrl)} 
            alt={property.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {/* Listing status badge */}
          <span className={`absolute top-3 left-3 text-[11px] font-bold uppercase tracking-wider py-1.5 px-3 rounded-full text-white ${isRent ? 'bg-blue-600' : 'bg-accent'}`}>
            For {isRent ? 'Rent' : 'Sale'}
          </span>
        </div>

        {/* Right Side: Description */}
        <div className="flex-1 flex flex-col justify-between py-1">
          <div>
            <div className="flex justify-between items-start gap-4">
              <span className="text-xs text-accent font-semibold tracking-wider uppercase">
                {property.categoryName} • {property.propertyTypeName}
              </span>
              <span className="text-xl font-bold text-accent">{formattedPrice}{isRent && <span className="text-sm font-normal text-text-secondary">/mo</span>}</span>
            </div>
            
            <h3 className="text-lg font-heading font-semibold text-text-primary mt-1 mb-2 group-hover:text-accent transition-colors">
              {property.title}
            </h3>

            <p className="text-sm text-text-secondary line-clamp-2 mb-3">
              {property.shortDescription || property.description || 'No description provided.'}
            </p>

            {/* Attributes */}
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-text-secondary font-medium mb-3">
              {(property as any).bedrooms && <span>{(property as any).bedrooms} Beds</span>}
              {(property as any).bathrooms && <span>{(property as any).bathrooms} Baths</span>}
              {(property as any).area && <span>{(property as any).area} Sq Ft</span>}
              <span>{property.cityName || 'Unknown Location'}</span>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-border/40 pt-3 text-xs text-text-secondary">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <FiUser /> {property.ownerName || 'Agent'}
              </span>
              <span className="flex items-center gap-1.5">
                <FiCalendar /> {formattedDate}
              </span>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2">
              <button 
                onClick={(e) => onFavoriteToggle(property.id, e)}
                className={`p-2.5 rounded-full border border-border hover:border-accent hover:text-accent transition-colors cursor-pointer ${isFavorited ? 'bg-accent/20 border-accent text-accent' : 'bg-transparent text-text-secondary'}`}
                title="Save Favorite"
              >
                <FiHeart className={isFavorited ? 'fill-accent' : ''} />
              </button>
              <button 
                onClick={(e) => onCompareToggle(property.id, e)}
                className={`p-2.5 rounded-full border border-border hover:border-accent hover:text-accent transition-colors cursor-pointer ${isComparing ? 'bg-accent/20 border-accent text-accent' : 'bg-transparent text-text-secondary'}`}
                title="Compare Property"
              >
                <FiLayers />
              </button>
              <button 
                onClick={(e) => onShareToggle(property, e)}
                className="p-2.5 rounded-full border border-border hover:border-accent hover:text-accent text-text-secondary transition-colors cursor-pointer"
                title="Share Property"
              >
                <FiShare2 />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default Grid View
  return (
    <div 
      onClick={handleCardClick}
      className="glass-card !max-w-full p-0 overflow-hidden flex flex-col cursor-pointer hover:border-accent/40 transition-all duration-300 group rounded-3xl"
    >
      {/* Property Image */}
      <div className="relative w-full h-[220px] bg-slate-800 overflow-hidden">
        <img 
          src={getMediaUrl(property.featuredImageUrl)} 
          alt={property.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Listing status badge */}
        <span className={`absolute top-4 left-4 text-[11px] font-bold uppercase tracking-wider py-1.5 px-3 rounded-full text-white ${isRent ? 'bg-blue-600' : 'bg-accent'}`}>
          For {isRent ? 'Rent' : 'Sale'}
        </span>

        {/* Favorite Icon inside image */}
        <button 
          onClick={(e) => onFavoriteToggle(property.id, e)}
          className={`absolute top-4 right-4 p-2.5 rounded-full backdrop-blur-md transition-all cursor-pointer ${isFavorited ? 'bg-accent text-white' : 'bg-bg-primary/60 border border-border text-text-primary hover:bg-bg-primary'}`}
        >
          <FiHeart className={isFavorited ? 'fill-white' : ''} />
        </button>
      </div>

      {/* Property Details */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-[11px] text-accent font-semibold tracking-wider uppercase">
              {property.categoryName} • {property.propertyTypeName}
            </span>
            <span className="text-[11px] text-text-secondary flex items-center gap-1">
              <FiCalendar /> {formattedDate}
            </span>
          </div>

          <h3 className="text-base font-heading font-semibold text-text-primary mb-2 group-hover:text-accent line-clamp-1 transition-colors">
            {property.title}
          </h3>

          <div className="text-xl font-bold text-accent mb-4">
            {formattedPrice}{isRent && <span className="text-sm font-normal text-text-secondary">/mo</span>}
          </div>

          {/* Quick Specs */}
          <div className="grid grid-cols-3 gap-2 border-t border-b border-border/40 py-3 mb-4 text-center text-xs text-text-secondary font-medium">
            <div>
              <div className="text-text-primary font-bold">{(property as any).bedrooms || '-'}</div>
              <div>Beds</div>
            </div>
            <div>
              <div className="text-text-primary font-bold">{(property as any).bathrooms || '-'}</div>
              <div>Baths</div>
            </div>
            <div>
              <div className="text-text-primary font-bold">{(property as any).area || '-'}</div>
              <div>Sq Ft</div>
            </div>
          </div>
        </div>

        {/* Card Footer Actions */}
        <div className="flex items-center justify-between text-xs text-text-secondary pt-1">
          <span className="flex items-center gap-1.5 font-medium truncate max-w-[140px]">
            <FiUser className="flex-shrink-0" /> {property.ownerName || 'Agent'}
          </span>

          <div className="flex gap-1.5 flex-shrink-0">
            <button 
              onClick={(e) => onCompareToggle(property.id, e)}
              className={`p-2 rounded-full border border-border/60 hover:border-accent hover:text-accent transition-colors cursor-pointer ${isComparing ? 'bg-accent/20 border-accent text-accent' : 'bg-transparent text-text-secondary'}`}
              title="Compare Property"
            >
              <FiLayers size={14} />
            </button>
            <button 
              onClick={(e) => onShareToggle(property, e)}
              className="p-2 rounded-full border border-border/60 hover:border-accent hover:text-accent text-text-secondary transition-colors cursor-pointer"
              title="Share Property"
            >
              <FiShare2 size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
