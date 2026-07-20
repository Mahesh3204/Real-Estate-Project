import React, { useEffect, useState } from 'react';
import apiClient from '../../services/apiClient';
import type { PropertyFilters } from '../../services/propertyApi';
import { FiFilter, FiRefreshCw, FiChevronDown, FiChevronUp } from 'react-icons/fi';

interface FilterPanelProps {
  filters: PropertyFilters;
  onFilterChange: (newFilters: PropertyFilters) => void;
  onReset: () => void;
}

interface Category { id: string; name: string }
interface PropertyType { id: string; name: string; categoryId: string }
interface PropertyCondition { id: string; name: string }
interface State { id: string; name: string }
interface City { id: string; name: string }
interface Amenity { id: string; name: string; category: string }

export const FilterPanel: React.FC<FilterPanelProps> = ({ filters, onFilterChange, onReset }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [allPropertyTypes, setAllPropertyTypes] = useState<PropertyType[]>([]);
  const [filteredPropertyTypes, setFilteredPropertyTypes] = useState<PropertyType[]>([]);
  const [conditions, setConditions] = useState<PropertyCondition[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [amenities, setAmenities] = useState<Amenity[]>([]);

  // UI state
  const [selectedStateId, setSelectedStateId] = useState<string>('');
  const [expandAmenities, setExpandAmenities] = useState(false);

  // Load master data on mount
  useEffect(() => {
    const loadMasterData = async () => {
      try {
        const [catRes, typeRes, condRes, countryRes, amenRes] = await Promise.all([
          apiClient.get('/api/v1/master-data/categories', { hideLoader: true }),
          apiClient.get('/api/v1/master-data/types', { hideLoader: true }),
          apiClient.get('/api/v1/master-data/conditions', { hideLoader: true }),
          apiClient.get('/api/v1/locations/countries', { hideLoader: true }),
          apiClient.get('/api/v1/master-data/amenities', { hideLoader: true })
        ]);

        setCategories(catRes.data.data || []);
        setAllPropertyTypes(typeRes.data.data || []);
        setConditions(condRes.data.data || []);
        setAmenities(amenRes.data.data || []);

        // Default to USA if available
        const countriesList = countryRes.data.data || [];
        const usa = countriesList.find((c: any) => c.name.toLowerCase().includes('united states'));
        if (usa) {
          const stateRes = await apiClient.get(`/api/v1/locations/states?countryId=${usa.id}`, { hideLoader: true });
          setStates(stateRes.data.data || []);
        }
      } catch (err) {
        console.error('Failed to load filter metadata:', err);
      }
    };
    loadMasterData();
  }, []);

  // Filter property types when category changes
  useEffect(() => {
    if (filters.categoryId) {
      setFilteredPropertyTypes(allPropertyTypes.filter(t => t.categoryId === filters.categoryId));
    } else {
      setFilteredPropertyTypes(allPropertyTypes);
    }
  }, [filters.categoryId, allPropertyTypes]);

  // Load cities when state changes
  const handleStateChange = async (stateId: string) => {
    setSelectedStateId(stateId);
    setCities([]);
    onFilterChange({ ...filters, cityId: undefined });
    if (stateId) {
      try {
        const cityRes = await apiClient.get(`/api/v1/locations/cities?stateId=${stateId}`, { hideLoader: true });
        setCities(cityRes.data.data || []);
      } catch (err) {
        console.error('Failed to load cities:', err);
      }
    }
  };

  const handleAmenityToggle = (amenityId: string) => {
    const currentAmenityIds = (filters as any).amenityIds || [];
    let nextAmenityIds: string[];

    if (currentAmenityIds.includes(amenityId)) {
      nextAmenityIds = currentAmenityIds.filter((id: string) => id !== amenityId);
    } else {
      nextAmenityIds = [...currentAmenityIds, amenityId];
    }

    onFilterChange({ ...filters, amenityIds: nextAmenityIds.length > 0 ? nextAmenityIds : undefined } as any);
  };

  return (
    <div className="glass-card !max-w-full p-6 flex flex-col gap-6 text-sm">
      <div className="flex justify-between items-center border-b border-border pb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <FiFilter className="text-accent" /> Search Filters
        </h3>
        <button
          onClick={onReset}
          className="text-xs text-text-secondary hover:text-accent flex items-center gap-1.5 cursor-pointer transition-colors"
        >
          <FiRefreshCw /> Reset All
        </button>
      </div>

      {/* Grid of Standard Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
        {/* Keyword Search */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-text-secondary font-medium">Search Keyword</label>
          <input
            type="text"
            placeholder="Search title, area, address..."
            value={filters.searchQuery || ''}
            onChange={(e) => onFilterChange({ ...filters, searchQuery: e.target.value || undefined })}
            className="w-full bg-input-bg border border-border rounded-xl p-3 text-text-primary focus:border-accent focus:outline-none transition-colors"
          />
        </div>

        {/* Listing Type */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-text-secondary font-medium">Listing Type</label>
          <select
            value={filters.listingType !== undefined ? filters.listingType : ''}
            onChange={(e) => onFilterChange({ ...filters, listingType: e.target.value !== '' ? Number(e.target.value) : undefined })}
            className="w-full bg-input-bg border border-border rounded-xl p-3 text-text-primary focus:border-accent focus:outline-none transition-colors cursor-pointer"
          >
            <option value="">All Types</option>
            <option value="0">For Sale</option>
            <option value="1">For Rent</option>
          </select>
        </div>

        {/* Category */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-text-secondary font-medium">Category</label>
          <select
            value={filters.categoryId || ''}
            onChange={(e) => onFilterChange({ ...filters, categoryId: e.target.value || undefined, propertyTypeId: undefined })}
            className="w-full bg-input-bg border border-border rounded-xl p-3 text-text-primary focus:border-accent focus:outline-none transition-colors cursor-pointer"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Property Sub-type */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-text-secondary font-medium">Property Sub-type</label>
          <select
            value={filters.propertyTypeId || ''}
            disabled={!filters.categoryId}
            onChange={(e) => onFilterChange({ ...filters, propertyTypeId: e.target.value || undefined })}
            className="w-full bg-input-bg border border-border rounded-xl p-3 text-text-primary focus:border-accent focus:outline-none transition-colors disabled:opacity-50 cursor-pointer"
          >
            <option value="">All Sub-types</option>
            {filteredPropertyTypes.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>

        {/* Price Range */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-text-secondary font-medium">Price Range ($)</label>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Min"
              value={(filters as any).minPrice || ''}
              onChange={(e) => onFilterChange({ ...filters, minPrice: e.target.value ? Number(e.target.value) : undefined } as any)}
              className="w-1/2 bg-input-bg border border-border rounded-xl p-3 text-text-primary focus:border-accent focus:outline-none transition-colors"
            />
            <input
              type="number"
              placeholder="Max"
              value={(filters as any).maxPrice || ''}
              onChange={(e) => onFilterChange({ ...filters, maxPrice: e.target.value ? Number(e.target.value) : undefined } as any)}
              className="w-1/2 bg-input-bg border border-border rounded-xl p-3 text-text-primary focus:border-accent focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Bed and Bath counts */}
        <div className="flex gap-4">
          <div className="flex-1 flex flex-col gap-1.5">
            <label className="text-xs text-text-secondary font-medium">Bedrooms</label>
            <input
              type="number"
              placeholder="Any"
              value={(filters as any).bedrooms || ''}
              onChange={(e) => onFilterChange({ ...filters, bedrooms: e.target.value ? Number(e.target.value) : undefined } as any)}
              className="w-full bg-input-bg border border-border rounded-xl p-3 text-text-primary focus:border-accent focus:outline-none transition-colors"
            />
          </div>
          <div className="flex-1 flex flex-col gap-1.5">
            <label className="text-xs text-text-secondary font-medium">Bathrooms</label>
            <input
              type="number"
              placeholder="Any"
              value={(filters as any).bathrooms || ''}
              onChange={(e) => onFilterChange({ ...filters, bathrooms: e.target.value ? Number(e.target.value) : undefined } as any)}
              className="w-full bg-input-bg border border-border rounded-xl p-3 text-text-primary focus:border-accent focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Location - State & City Dropdowns */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-text-secondary font-medium">Location State</label>
          <select
            value={selectedStateId}
            onChange={(e) => handleStateChange(e.target.value)}
            className="w-full bg-input-bg border border-border rounded-xl p-3 text-text-primary focus:border-accent focus:outline-none transition-colors cursor-pointer"
          >
            <option value="">All States</option>
            {states.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-text-secondary font-medium">Location City</label>
          <select
            value={(filters as any).cityId || ''}
            disabled={!selectedStateId}
            onChange={(e) => onFilterChange({ ...filters, cityId: e.target.value || undefined } as any)}
            className="w-full bg-input-bg border border-border rounded-xl p-3 text-text-primary focus:border-accent focus:outline-none transition-colors disabled:opacity-50 cursor-pointer"
          >
            <option value="">All Cities</option>
            {cities.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Area Range */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-text-secondary font-medium">Area Range (Sq Ft)</label>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Min Sq Ft"
              value={(filters as any).minArea || ''}
              onChange={(e) => onFilterChange({ ...filters, minArea: e.target.value ? Number(e.target.value) : undefined } as any)}
              className="w-1/2 bg-input-bg border border-border rounded-xl p-3 text-text-primary focus:border-accent focus:outline-none transition-colors"
            />
            <input
              type="number"
              placeholder="Max Sq Ft"
              value={(filters as any).maxArea || ''}
              onChange={(e) => onFilterChange({ ...filters, maxArea: e.target.value ? Number(e.target.value) : undefined } as any)}
              className="w-1/2 bg-input-bg border border-border rounded-xl p-3 text-text-primary focus:border-accent focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Condition */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-text-secondary font-medium">Structural Condition</label>
          <select
            value={filters.conditionId || ''}
            onChange={(e) => onFilterChange({ ...filters, conditionId: e.target.value || undefined })}
            className="w-full bg-input-bg border border-border rounded-xl p-3 text-text-primary focus:border-accent focus:outline-none transition-colors cursor-pointer"
          >
            <option value="">Any Condition</option>
            {conditions.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Furnished status */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-text-secondary font-medium">Furnishing Status</label>
          <select
            value={(filters as any).furnishedStatus || ''}
            onChange={(e) => onFilterChange({ ...filters, furnishedStatus: e.target.value || undefined } as any)}
            className="w-full bg-input-bg border border-border rounded-xl p-3 text-text-primary focus:border-accent focus:outline-none transition-colors cursor-pointer"
          >
            <option value="">Any Status</option>
            <option value="Furnished">Furnished</option>
            <option value="Semi-Furnished">Semi-Furnished</option>
            <option value="Unfurnished">Unfurnished</option>
          </select>
        </div>

        {/* Parking */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-text-secondary font-medium">Minimum Parking Spaces</label>
          <input
            type="number"
            placeholder="e.g. 1, 2"
            value={(filters as any).parking || ''}
            onChange={(e) => onFilterChange({ ...filters, parking: e.target.value ? Number(e.target.value) : undefined } as any)}
            className="w-full bg-input-bg border border-border rounded-xl p-3 text-text-primary focus:border-accent focus:outline-none transition-colors"
          />
        </div>

        {/* Year built */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-text-secondary font-medium">Minimum Year Built</label>
          <input
            type="number"
            placeholder="e.g. 2010"
            value={(filters as any).yearBuilt || ''}
            onChange={(e) => onFilterChange({ ...filters, yearBuilt: e.target.value ? Number(e.target.value) : undefined } as any)}
            className="w-full bg-input-bg border border-border rounded-xl p-3 text-text-primary focus:border-accent focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Accordion list of combinable amenities */}
      <div className="flex flex-col gap-2.5">
        <button
          onClick={() => setExpandAmenities(!expandAmenities)}
          className="flex justify-between items-center w-full py-2 text-text-primary hover:text-accent font-medium border-t border-border/50 pt-4 cursor-pointer focus:outline-none"
        >
          <span>Select Amenities</span>
          {expandAmenities ? <FiChevronUp /> : <FiChevronDown />}
        </button>

        {expandAmenities && (
          <div className="grid grid-cols-2 gap-3 mt-2 animate-fade-in">
            {amenities.map((a) => {
              const checked = ((filters as any).amenityIds || []).includes(a.id);
              return (
                <label key={a.id} className="flex items-center gap-2.5 text-xs text-text-secondary hover:text-text-primary cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => handleAmenityToggle(a.id)}
                    className="accent-accent w-4 h-4 rounded border-border bg-input-bg focus:ring-accent"
                  />
                  <span>{a.name}</span>
                </label>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
