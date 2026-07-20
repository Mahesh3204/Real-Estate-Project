import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { PropertyDto } from '../../services/propertyApi';
import { FiX, FiLayers, FiTrash2 } from 'react-icons/fi';

interface CompareDrawerProps {
  selectedProperties: PropertyDto[];
  onRemove: (id: string) => void;
  onClear: () => void;
}

export const CompareDrawer: React.FC<CompareDrawerProps> = ({
  selectedProperties,
  onRemove,
  onClear
}) => {
  const navigate = useNavigate();

  if (selectedProperties.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900 border-t border-border/40 text-white shadow-2xl animate-slide-up">
      <div className="container mx-auto px-4 py-4 max-w-6xl flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: Summary info */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-accent-light rounded-xl text-accent">
            <FiLayers size={20} />
          </div>
          <div>
            <h4 className="font-heading font-bold text-sm">Compare Properties</h4>
            <p className="text-xs text-text-secondary">
              Selected {selectedProperties.length} of 4 properties to compare side-by-side.
            </p>
          </div>
        </div>

        {/* Center: Selected thumbnails */}
        <div className="flex flex-wrap items-center gap-3">
          {selectedProperties.map(p => (
            <div 
              key={p.id} 
              className="relative flex items-center bg-slate-805/50 border border-border/30 rounded-xl p-1.5 pr-8 gap-2 bg-slate-800"
            >
              <img 
                src={p.featuredImageUrl ? (p.featuredImageUrl.startsWith('http') ? p.featuredImageUrl : `http://localhost:5242/${p.featuredImageUrl.replace(/^\//, '')}`) : '/placeholder-house.jpg'} 
                alt={p.title} 
                className="w-10 h-10 object-cover rounded-lg"
              />
              <span className="text-xs font-semibold max-w-[100px] truncate text-slate-205">
                {p.title}
              </span>
              <button
                onClick={() => onRemove(p.id)}
                className="absolute top-1/2 -translate-y-1/2 right-2 text-text-secondary hover:text-red-500 cursor-pointer"
                title="Remove from compare"
              >
                <FiX size={14} />
              </button>
            </div>
          ))}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={onClear}
            className="flex-1 md:flex-none px-4 py-2.5 rounded-xl border border-border/40 text-xs font-semibold hover:bg-slate-800 text-slate-300 transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <FiTrash2 size={13} /> Clear All
          </button>
          <button
            onClick={() => navigate('/compare')}
            className="flex-1 md:flex-none px-6 py-2.5 rounded-xl bg-accent hover:bg-accent/90 text-white text-xs font-bold transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
          >
            Compare Now
          </button>
        </div>
      </div>
    </div>
  );
};
