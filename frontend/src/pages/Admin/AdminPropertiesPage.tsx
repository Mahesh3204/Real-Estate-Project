import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../store/hooks';
import { showToast } from '../../store/toastSlice';
import { propertyApi } from '../../services/propertyApi';
import type { PropertyDto, PropertyFilters } from '../../services/propertyApi';
import { 
  FiCheckCircle, 
  FiXCircle, 
  FiTrash2, 
  FiEye, 
  FiSearch, 
  FiFileText, 
  FiX 
} from 'react-icons/fi';
import ConfirmationModal from '../../components/Common/ConfirmationModal';

const AdminPropertiesPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // States
  const [properties, setProperties] = useState<PropertyDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<string>('pending'); // 'pending', 'published', 'rejected', 'all'
  
  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Rejection Modal
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [submittingRejection, setSubmittingRejection] = useState(false);

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

  const loadProperties = async () => {
    setLoading(true);
    try {
      const filters: PropertyFilters = {
        pageNumber: page,
        pageSize,
        searchQuery: search || undefined,
        sortBy: 'newest',
        onlyOwner: false, // Admin views all listings
      };

      if (activeTab === 'pending') filters.publishStatus = 1;
      else if (activeTab === 'published') filters.publishStatus = 2;
      else if (activeTab === 'rejected') filters.publishStatus = 3;

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
  }, [page, activeTab]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadProperties();
  };

  const handleApprove = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Approve Listing',
      message: 'Are you sure you want to approve this property listing for public publishing?',
      confirmText: 'Approve',
      type: 'success',
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        try {
          await propertyApi.approveProperty(id);
          dispatch(showToast({ message: 'Listing approved successfully!', type: 'success' }));
          loadProperties();
        } catch (err: any) {
          dispatch(showToast({ message: 'Failed to approve listing.', type: 'error' }));
        }
      }
    });
  };

  const handleOpenRejectModal = (id: string) => {
    setRejectingId(id);
    setRejectReason('');
  };

  const handleCloseRejectModal = () => {
    setRejectingId(null);
    setRejectReason('');
  };

  const handleRejectSubmit = async () => {
    if (!rejectingId || !rejectReason.trim()) {
      dispatch(showToast({ message: 'Rejection comments are required.', type: 'error' }));
      return;
    }

    setSubmittingRejection(true);
    try {
      await propertyApi.rejectProperty(rejectingId, rejectReason.trim());
      dispatch(showToast({ message: 'Listing rejected. Owner has been logged.', type: 'success' }));
      handleCloseRejectModal();
      loadProperties();
    } catch (err: any) {
      dispatch(showToast({ message: 'Failed to reject listing.', type: 'error' }));
    } finally {
      setSubmittingRejection(false);
    }
  };

  const handleForceDelete = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Purge Listing (Critical Action)',
      message: 'CRITICAL WARNING: This will permanently purge this listing from the database. Proceed?',
      confirmText: 'Purge Listing',
      type: 'danger',
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        try {
          await propertyApi.forceDeleteProperty(id);
          dispatch(showToast({ message: 'Listing permanently purged.', type: 'success' }));
          loadProperties();
        } catch (err: any) {
          dispatch(showToast({ message: 'Failed to purge listing.', type: 'error' }));
        }
      }
    });
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Moderate Listings</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Review, approve, reject, or purge properties submitted by platform agents.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 mb-6">
        {[
          { key: 'pending', label: 'Pending Approval' },
          { key: 'published', label: 'Published' },
          { key: 'rejected', label: 'Rejected' },
          { key: 'all', label: 'All Listings' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); setPage(1); }}
            className={`px-4 py-2 text-sm font-semibold rounded-lg whitespace-nowrap transition-all ${
              activeTab === tab.key 
                ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/60'
                : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search box filters bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 mb-8 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="flex gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search title, owner address, slug..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm outline-none dark:text-white"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white font-semibold text-sm transition-all"
          >
            Search
          </button>
        </form>
      </div>

      {/* Table grid */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-600 border-t-transparent" />
        </div>
      ) : properties.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-16 text-center shadow-sm">
          <FiFileText className="w-12 h-12 text-slate-350 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">No Properties Found</h3>
          <p className="text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">There are no property listings currently matching this moderation view.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-4 px-6 whitespace-nowrap">Property Title</th>
                  <th className="py-4 px-6 whitespace-nowrap">Owner Agent</th>
                  <th className="py-4 px-6 whitespace-nowrap">Price</th>
                  <th className="py-4 px-6 whitespace-nowrap">Category</th>
                  <th className="py-4 px-6 whitespace-nowrap">Listing Mode</th>
                  <th className="py-4 px-6 whitespace-nowrap">Status</th>
                  <th className="py-4 px-6 text-right whitespace-nowrap">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                {properties.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-all">
                    <td className="py-4 px-6 font-bold text-slate-800 dark:text-white whitespace-nowrap">
                      <div>{p.title}</div>
                      <div className="text-xs text-slate-450 dark:text-slate-555 font-normal mt-0.5">{p.cityName}, {p.stateName}</div>
                    </td>
                    <td className="py-4 px-6 text-slate-600 dark:text-slate-300 font-semibold whitespace-nowrap">{p.ownerName}</td>
                    <td className="py-4 px-6 font-extrabold text-slate-800 dark:text-white whitespace-nowrap">${p.price.toLocaleString()}</td>
                    <td className="py-4 px-6 text-slate-500 whitespace-nowrap">{p.categoryName || 'General'}</td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-0.5 text-xs font-bold rounded ${
                        p.listingType === 0 ? 'bg-amber-50 text-amber-800' : 'bg-emerald-50 text-emerald-800'
                      }`}>
                        {p.listingType === 0 ? 'Sale' : 'Rent'}
                      </span>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">{getStatusBadge(p.publishStatus)}</td>
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => navigate(`/properties/view/${p.slug || p.id}`)}
                          className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
                          title="View detailed draft layout"
                        >
                          <FiEye className="w-4 h-4" />
                        </button>
                        {p.publishStatus === 1 && (
                          <>
                            <button
                              onClick={() => handleApprove(p.id)}
                              className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-950/20 rounded-lg transition-all"
                              title="Approve and Publish"
                            >
                              <FiCheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleOpenRejectModal(p.id)}
                              className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-all"
                              title="Reject and Log Comments"
                            >
                              <FiXCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleForceDelete(p.id)}
                          className="p-2 text-red-700 hover:bg-red-100 dark:hover:bg-red-950/35 rounded-lg transition-all"
                          title="Permanently purge listing records"
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center gap-4 mt-8">
          <span className="text-sm text-slate-500">
            Showing Page <span className="font-semibold text-slate-800 dark:text-white">{page}</span> of <span className="font-semibold text-slate-800 dark:text-white">{totalPages}</span> ({totalRecords} records)
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(prev => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 disabled:opacity-40 transition-all"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 disabled:opacity-40 transition-all"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Rejection comment popup modal */}
      {rejectingId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-scale-up">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">Reject Property Listing</h3>
              <button onClick={handleCloseRejectModal} className="text-slate-400 hover:text-slate-600 transition-all">
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-350 uppercase tracking-wider mb-2">Rejection Reason Notes *</label>
                <textarea
                  rows={4}
                  placeholder="e.g. Missing valid Land Deed attachment, or listing price is incorrectly formatted."
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-900 outline-none text-sm dark:text-white resize-none"
                />
              </div>
            </div>
            <div className="p-6 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
              <button
                onClick={handleCloseRejectModal}
                className="px-4 py-2 text-sm font-semibold rounded-lg text-slate-655 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectSubmit}
                disabled={submittingRejection}
                className="px-5 py-2 text-sm font-semibold rounded-lg bg-red-650 hover:bg-red-700 text-white shadow transition-all disabled:opacity-40"
              >
                {submittingRejection ? 'Rejecting...' : 'Reject Listing'}
              </button>
            </div>
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

export default AdminPropertiesPage;
