import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { showToast } from '../../store/toastSlice';
import { propertyApi } from '../../services/propertyApi';
import type { PropertyDto, PropertyFilters } from '../../services/propertyApi';
import { getCategories } from '../../services/adminApi';
import { 
  FiEdit2, 
  FiTrash2, 
  FiEye, 
  FiPlus, 
  FiCopy, 
  FiArchive, 
  FiCheckCircle, 
  FiRotateCcw, 
  FiGrid, 
  FiList, 
  FiSearch, 
  FiInfo 
} from 'react-icons/fi';
import ConfirmationModal from '../../components/Common/ConfirmationModal';

const PropertyListPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  // States
  const [properties, setProperties] = useState<PropertyDto[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  
  // Filtering & Pagination state
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedListingType, setSelectedListingType] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<string>('all'); // 'all', 'draft', 'pending', 'published', 'archived', 'rejected'
  const [page, setPage] = useState(1);
  const [pageSize] = useState(8);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);

  // Bulk Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void | Promise<void>;
    type?: 'danger' | 'warning' | 'info' | 'success';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Fetch Categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await getCategories({ includeInactive: false });
        if (res?.data) {
          setCategories(res.data);
        }
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    };
    loadCategories();
  }, []);

  // Fetch listings
  const loadProperties = async () => {
    setLoading(true);
    try {
      const filters: PropertyFilters = {
        pageNumber: page,
        pageSize,
        searchQuery: search || undefined,
        categoryId: selectedCategory || undefined,
        onlyOwner: user?.role === 'Agent', // If agent, restrict to owner's own listings. Otherwise (buyer, admin) show all.
        sortBy: 'newest',
      };

      // Set publishStatus filters based on tabs
      if (activeTab === 'draft') filters.publishStatus = 0;
      else if (activeTab === 'pending') filters.publishStatus = 1;
      else if (activeTab === 'published') filters.publishStatus = 2;
      else if (activeTab === 'rejected') filters.publishStatus = 3;
      else if (activeTab === 'archived') filters.publishStatus = 4;

      if (selectedListingType !== 'all') {
        filters.listingType = selectedListingType === 'sale' ? 0 : 1;
      }

      const res = await propertyApi.getProperties(filters);
      if (res?.data) {
        setProperties(res.data.items);
        setTotalPages(res.data.totalPages);
        setTotalRecords(res.data.totalRecords);
      }
    } catch (err: any) {
      dispatch(showToast({ message: err.response?.data?.message || 'Failed to fetch properties.', type: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProperties();
  }, [page, activeTab, selectedCategory, selectedListingType]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadProperties();
  };

  // Bulk Action implementation
  const handleBulkAction = (action: 'Publish' | 'Archive' | 'Restore' | 'Delete') => {
    if (!selectedIds.length) return;

    setConfirmModal({
      isOpen: true,
      title: `${action} Selected Listings`,
      message: `Are you sure you want to ${action.toLowerCase()} the selected ${selectedIds.length} properties?`,
      confirmText: action,
      type: action === 'Delete' ? 'danger' : action === 'Restore' ? 'warning' : 'info',
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        try {
          await propertyApi.bulkAction({
            propertyIds: selectedIds,
            action,
          });
          dispatch(showToast({ message: `Successfully executed bulk ${action.toLowerCase()} action.`, type: 'success' }));
          setSelectedIds([]);
          loadProperties();
        } catch (err: any) {
          dispatch(showToast({ message: err.response?.data?.message || 'Failed to execute bulk action.', type: 'error' }));
        }
      }
    });
  };

  // Single Action handlers
  const handleDuplicate = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Clone Property Listing',
      message: 'Do you want to clone this property listing?',
      confirmText: 'Clone',
      type: 'info',
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        try {
          const res = await propertyApi.duplicateProperty(id);
          dispatch(showToast({ message: 'Listing cloned successfully!', type: 'success' }));
          navigate(`/properties/wizard?id=${res.data.id}`);
        } catch (err: any) {
          dispatch(showToast({ message: 'Failed to duplicate listing.', type: 'error' }));
        }
      }
    });
  };

  const handleSingleDelete = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Property Listing',
      message: 'Are you sure you want to delete this property listing?',
      confirmText: 'Delete',
      type: 'danger',
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        try {
          await propertyApi.bulkAction({ propertyIds: [id], action: 'Delete' });
          dispatch(showToast({ message: 'Listing deleted successfully.', type: 'success' }));
          loadProperties();
        } catch (err: any) {
          dispatch(showToast({ message: 'Failed to delete listing.', type: 'error' }));
        }
      }
    });
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === properties.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(properties.map(p => p.id));
    }
  };

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 0:
        return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Draft</span>;
      case 1:
        return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">Pending Review</span>;
      case 2:
        return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Published</span>;
      case 3:
        return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Rejected</span>;
      case 4:
        return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">Archived</span>;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {user?.role === 'Buyer' ? 'Properties Directory' : 'Properties Workspace'}
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {user?.role === 'Buyer' 
              ? 'Browse and search for premium verified property listings available for sale or rent.' 
              : 'Manage your real estate listings, drafts, and approval requests in one single place.'}
          </p>
        </div>
        {user?.role !== 'Buyer' && (
          <button
            onClick={() => navigate('/properties/wizard')}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-all shadow-lg hover:shadow-indigo-500/20 active:scale-95"
          >
            <FiPlus className="w-5 h-5" />
            <span>Add Property</span>
          </button>
        )}
      </div>

      {/* Tabs list */}
      {user?.role !== 'Buyer' && (
        <div className="flex overflow-x-auto gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 mb-6">
          {['all', 'draft', 'pending', 'published', 'archived', 'rejected'].map(tab => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setPage(1); }}
              className={`px-4 py-2 text-sm font-semibold rounded-lg capitalize whitespace-nowrap transition-all ${
                activeTab === tab 
                  ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/60'
                  : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-900'
              }`}
            >
              {tab === 'all' ? 'All Listings' : tab === 'pending' ? 'Pending Approval' : tab}
            </button>
          ))}
        </div>
      )}

      {/* Filters form */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 mb-8 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
          {/* Search box */}
          <div className="flex-1 relative">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search title, address, description..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm outline-none dark:text-white"
            />
          </div>

          {/* Category Dropdown */}
          <div className="w-full lg:w-48">
            <select
              value={selectedCategory}
              onChange={e => { setSelectedCategory(e.target.value); setPage(1); }}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm outline-none text-slate-900 dark:text-white"
            >
              <option value="" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{c.name}</option>
              ))}
            </select>
          </div>

          {/* Listing Type Select */}
          <div className="w-full lg:w-44">
            <select
              value={selectedListingType}
              onChange={e => { setSelectedListingType(e.target.value); setPage(1); }}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm outline-none text-slate-900 dark:text-white"
            >
              <option value="all" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">All Modes</option>
              <option value="sale" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">For Sale</option>
              <option value="rent" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">For Rent</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white font-semibold text-sm transition-all"
            >
              Search
            </button>
            <button
              type="button"
              onClick={() => { setSearch(''); setSelectedCategory(''); setSelectedListingType('all'); setPage(1); }}
              className="px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-semibold transition-all"
            >
              Reset
            </button>
          </div>

          {/* Table/Grid Toggle */}
          <div className="h-10 w-[1px] bg-slate-200 dark:bg-slate-800 hidden lg:block mx-2" />
          <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl self-end lg:self-center">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-800 shadow-sm text-indigo-600' : 'text-slate-400'}`}
              title="Grid View"
            >
              <FiGrid className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'table' ? 'bg-white dark:bg-slate-800 shadow-sm text-indigo-600' : 'text-slate-400'}`}
              title="Table View"
            >
              <FiList className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>

      {/* Bulk action buttons */}
      {selectedIds.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-150 dark:border-indigo-900/60 p-4 rounded-xl mb-6 animate-fade-in">
          <span className="text-sm font-semibold text-indigo-800 dark:text-indigo-300">
            {selectedIds.length} properties selected:
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleBulkAction('Publish')}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-green-600 hover:bg-green-700 text-white transition-all"
            >
              <FiCheckCircle className="w-3.5 h-3.5" />
              <span>Publish</span>
            </button>
            <button
              onClick={() => handleBulkAction('Archive')}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-gray-600 hover:bg-gray-700 text-white transition-all"
            >
              <FiArchive className="w-3.5 h-3.5" />
              <span>Archive</span>
            </button>
            <button
              onClick={() => handleBulkAction('Restore')}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-yellow-600 hover:bg-yellow-700 text-white transition-all"
            >
              <FiRotateCcw className="w-3.5 h-3.5" />
              <span>Restore to Draft</span>
            </button>
            <button
              onClick={() => handleBulkAction('Delete')}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-red-600 hover:bg-red-700 text-white transition-all"
            >
              <FiTrash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      )}

      {/* Main content listings view */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-600 border-t-transparent" />
        </div>
      ) : properties.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-16 text-center shadow-sm">
          <div className="inline-flex items-center justify-center p-4 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-full mb-4">
            <FiInfo className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-white">No Listings Found</h3>
          <p className="mt-2 text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            You don't have any properties matching this filter criteria. Get started by creating your first draft.
          </p>
          <button
            onClick={() => navigate('/properties/wizard')}
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-all shadow-md"
          >
            <FiPlus className="w-5 h-5" />
            <span>Create Draft Listing</span>
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid Layout */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {properties.map(p => (
            <div 
              key={p.id}
              className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col relative"
            >
              {/* Checkbox selector */}
              <input
                type="checkbox"
                checked={selectedIds.includes(p.id)}
                onChange={() => toggleSelect(p.id)}
                className="absolute top-4 left-4 z-10 w-5 h-5 rounded border-slate-350 text-indigo-600 focus:ring-indigo-500/20 cursor-pointer"
              />

              {/* Status Badge */}
              <div className="absolute top-4 right-4 z-10">
                {getStatusBadge(p.publishStatus)}
              </div>

              {/* Featured Image */}
              <div className="h-48 overflow-hidden bg-slate-100 dark:bg-slate-950 relative">
                {p.featuredImageUrl ? (
                  <img 
                    src={p.featuredImageUrl.startsWith('http') ? p.featuredImageUrl : `${import.meta.env.VITE_API_URL || 'http://localhost:5242'}${p.featuredImageUrl}`}
                    alt={p.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 font-medium text-xs">
                    No Featured Image
                  </div>
                )}
                {/* Price tag */}
                <div className="absolute bottom-3 right-3 px-3 py-1.5 bg-slate-900/80 backdrop-blur-md rounded-lg text-white font-bold text-sm">
                  ${p.price.toLocaleString()}
                </div>
              </div>

              {/* Details card content */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex gap-2 items-center text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-2">
                    <span className="uppercase">{p.listingType === 0 ? 'For Sale' : 'For Rent'}</span>
                    <span>•</span>
                    <span>{p.categoryName || 'General'}</span>
                  </div>
                  <h3 className="font-bold text-slate-800 dark:text-white line-clamp-1 group-hover:text-indigo-600 transition-all">
                    {p.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {p.shortDescription || p.description || 'No description provided.'}
                  </p>
                  <p className="text-xs text-slate-450 mt-3 font-semibold dark:text-slate-450">
                    {p.address ? `${p.address}, ` : ''}{p.cityName || ''}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <div className="text-[10px] text-slate-400">
                    Created: {new Date(p.createdDate).toLocaleDateString()}
                  </div>
                  <div className="flex gap-1.5 flex-wrap justify-end">
                    <button
                      onClick={() => navigate(`/properties/view/${p.slug || p.id}`)}
                      className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white rounded-lg dark:hover:bg-slate-800 transition-all"
                      title="View Details"
                    >
                      <FiEye className="w-4 h-4" />
                    </button>
                    {p.publishStatus === 0 && (
                      <button
                        onClick={() => navigate(`/properties/wizard?id=${p.id}`)}
                        className="p-1.5 text-slate-500 hover:text-yellow-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-yellow-400 rounded-lg dark:hover:bg-slate-800 transition-all"
                        title="Edit Details"
                      >
                        <FiEdit2 className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDuplicate(p.id)}
                      className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-blue-400 rounded-lg dark:hover:bg-slate-800 transition-all"
                      title="Clone"
                    >
                      <FiCopy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleSingleDelete(p.id)}
                      className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-red-400 rounded-lg dark:hover:bg-slate-800 transition-all"
                      title="Delete"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table Layout */
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-4 px-6 w-12 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === properties.length && properties.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded border-slate-350 text-indigo-600 cursor-pointer w-4 h-4"
                    />
                  </th>
                  <th className="py-4 px-6 whitespace-nowrap">Image</th>
                  <th className="py-4 px-6 whitespace-nowrap">Property Title</th>
                  <th className="py-4 px-6 whitespace-nowrap">Category</th>
                  <th className="py-4 px-6 whitespace-nowrap">Listing Type</th>
                  <th className="py-4 px-6 whitespace-nowrap">Price</th>
                  <th className="py-4 px-6 whitespace-nowrap">Status</th>
                  <th className="py-4 px-6 text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                {properties.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-all">
                    <td className="py-4 px-6 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(p.id)}
                        onChange={() => toggleSelect(p.id)}
                        className="rounded border-slate-305 text-indigo-600 cursor-pointer w-4 h-4"
                      />
                    </td>
                    <td className="py-4 px-6">
                      <div className="w-14 h-10 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-950">
                        {p.featuredImageUrl ? (
                          <img 
                            src={p.featuredImageUrl.startsWith('http') ? p.featuredImageUrl : `${import.meta.env.VITE_API_URL || 'http://localhost:5242'}${p.featuredImageUrl}`}
                            alt={p.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[8px] text-slate-400">None</div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-800 dark:text-white line-clamp-1">{p.title}</div>
                      <div className="text-xs text-slate-450 dark:text-slate-450 mt-0.5 line-clamp-1">
                        {p.address ? `${p.address}, ` : ''}{p.cityName || ''}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-600 dark:text-slate-350 whitespace-nowrap">{p.categoryName || 'General'}</td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded whitespace-nowrap ${
                        p.listingType === 0 
                          ? 'bg-amber-50 text-amber-800 dark:bg-amber-950/20 dark:text-amber-400' 
                          : 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400'
                      }`}>
                        {p.listingType === 0 ? 'Sale' : 'Rent'}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-800 dark:text-white whitespace-nowrap">${p.price.toLocaleString()}</td>
                    <td className="py-4 px-6 whitespace-nowrap">{getStatusBadge(p.publishStatus)}</td>
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <div className="flex gap-1 justify-end">
                        <button
                          onClick={() => navigate(`/properties/view/${p.slug || p.id}`)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
                          title="View"
                        >
                          <FiEye className="w-4 h-4" />
                        </button>
                        {p.publishStatus === 0 && (
                          <button
                            onClick={() => navigate(`/properties/wizard?id=${p.id}`)}
                            className="p-1.5 text-slate-500 hover:text-yellow-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
                            title="Edit"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDuplicate(p.id)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
                          title="Clone"
                        >
                          <FiCopy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleSingleDelete(p.id)}
                          className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
                          title="Delete"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center gap-4 mt-8">
          <span className="text-sm text-slate-500 dark:text-slate-400">
            Showing Page <span className="font-semibold text-slate-800 dark:text-white">{page}</span> of <span className="font-semibold text-slate-800 dark:text-white">{totalPages}</span> ({totalRecords} records)
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(prev => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Next
            </button>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        cancelText={confirmModal.cancelText}
        type={confirmModal.type}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};

export default PropertyListPage;
