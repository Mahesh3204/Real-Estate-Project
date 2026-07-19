import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { showToast } from '../../store/toastSlice';
import { propertyApi } from '../../services/propertyApi';
import type { PropertyDetailsDto } from '../../services/propertyApi';
import { 
  FiMapPin, 
  FiFileText, 
  FiDownload, 
  FiInfo, 
  FiArrowLeft,
  FiCheckCircle
} from 'react-icons/fi';

const PropertyDetailsPage: React.FC = () => {
  const { slugOrId } = useParams<{ slugOrId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  // States
  const [property, setProperty] = useState<PropertyDetailsDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeImage, setActiveImage] = useState<string>('');

  const loadPropertyDetails = async () => {
    if (!slugOrId) return;
    setLoading(true);
    try {
      // Determine if slugOrId is a Guid
      const isGuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slugOrId);
      const res = isGuid 
        ? await propertyApi.getPropertyById(slugOrId)
        : await propertyApi.getPropertyBySlug(slugOrId);
      
      if (res?.data) {
        setProperty(res.data);
        if (res.data.media && res.data.media.length > 0) {
          // Set featured or first
          const featured = res.data.media.find(m => m.isFeatured);
          setActiveImage(featured ? featured.filePath : res.data.media[0].filePath);
        }
      }
    } catch (err: any) {
      dispatch(showToast({ message: err.response?.data?.message || 'Failed to fetch details.', type: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPropertyDetails();
  }, [slugOrId]);

  const handleDownload = (docId: string, displayName: string) => {
    if (!property) return;
    const downloadUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5242'}/api/v1/properties/${property.id}/documents/${docId}/download`;
    // Open in new tab to trigger download stream with auth cookie or direct download anchor
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', displayName);
    // Fetch with authorization headers and trigger download for private documents
    const token = localStorage.getItem('accessToken');
    if (token) {
      fetch(downloadUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(response => {
        if (!response.ok) throw new Error('Unauthorized or missing document.');
        return response.blob();
      })
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = displayName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      })
      .catch(() => {
        dispatch(showToast({ message: 'Failed to secure document download stream authorization.', type: 'error' }));
      });
    } else {
      // Direct navigate for public attachments
      window.open(downloadUrl, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-40">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="container mx-auto px-4 py-20 text-center max-w-xl">
        <div className="text-slate-400 text-5xl mb-4">🔍</div>
        <h2 className="text-2xl font-bold dark:text-white">Listing Not Found</h2>
        <p className="text-slate-500 mt-2">This property listing might have been removed, archived, or you lack the required access permissions.</p>
        <button
          onClick={() => navigate('/properties')}
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold transition-all hover:bg-indigo-700"
        >
          <FiArrowLeft />
          <span>Back to Workspace</span>
        </button>
      </div>
    );
  }

  const isOwnerOrAdmin = user && (user.role === 'Admin' || user.id === property.ownerId);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Back button link */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-indigo-600 font-semibold mb-6 transition-all"
      >
        <FiArrowLeft />
        <span>Back</span>
      </button>

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Gallery & Description Details */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Headline details */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className={`px-3 py-1 text-xs font-bold uppercase rounded ${
                property.listingType === 0 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {property.listingType === 0 ? 'For Sale' : 'For Rent'}
              </span>
              <span className="px-3 py-1 text-xs font-semibold rounded bg-slate-100 text-slate-800 dark:bg-slate-850 dark:text-slate-350">
                {property.categoryName || 'General'}
              </span>
              {isOwnerOrAdmin && (
                <span className="px-3 py-1 text-xs font-semibold rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/60">
                  Status: {property.publishStatus === 0 ? 'Draft' : property.publishStatus === 1 ? 'Pending Review' : property.publishStatus === 2 ? 'Published' : property.publishStatus === 3 ? 'Rejected' : 'Archived'}
                </span>
              )}
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
              {property.title}
            </h1>
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 mt-2 text-sm">
              <FiMapPin className="text-indigo-600 flex-shrink-0" />
              <span>{property.address ? `${property.address}, ` : ''}{property.cityName}, {property.stateName} {property.zipCode}</span>
            </div>
          </div>

          {/* Image Slider */}
          <div className="space-y-4">
            <div className="h-[400px] bg-slate-100 dark:bg-slate-950 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-inner relative">
              {activeImage ? (
                <img 
                  src={activeImage.startsWith('http') ? activeImage : `${import.meta.env.VITE_API_URL || 'http://localhost:5242'}${activeImage}`}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400 font-semibold">
                  No images uploaded
                </div>
              )}
            </div>

            {/* Thumbnail selector */}
            {property.media && property.media.length > 1 && (
              <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-thin">
                {property.media.map(m => (
                  <button
                    key={m.id}
                    onClick={() => setActiveImage(m.filePath)}
                    className={`w-24 h-16 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${
                      activeImage === m.filePath ? 'border-indigo-600 shadow-md scale-95' : 'border-transparent hover:border-slate-300'
                    }`}
                  >
                    <img 
                      src={m.filePath.startsWith('http') ? m.filePath : `${import.meta.env.VITE_API_URL || 'http://localhost:5242'}${m.filePath}`}
                      alt="Thumbnail"
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Description Block */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <h2 className="text-xl font-bold dark:text-white">Property Overview Description</h2>
            <p className="text-slate-650 dark:text-slate-350 leading-relaxed text-sm whitespace-pre-line">
              {property.description || 'No description comments specified.'}
            </p>
          </div>

          {/* Specs grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Bedrooms', value: property.bedrooms },
              { label: 'Bathrooms', value: property.bathrooms },
              { label: 'Balconies', value: property.balconies },
              { label: 'Total Floors', value: property.floors },
              { label: 'Parking Spaces', value: property.parking },
              { label: 'Build Area', value: property.area ? `${property.area} ${property.areaUnit || 'sqft'}` : null },
              { label: 'Lot Size', value: property.lotSize ? `${property.lotSize} acres` : null },
              { label: 'Facing Direction', value: property.facingDirection }
            ].map((spec, idx) => spec.value !== null && spec.value !== undefined ? (
              <div key={idx} className="bg-slate-50 dark:bg-slate-950 p-4 border border-slate-150 dark:border-slate-850 rounded-2xl">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">{spec.label}</span>
                <span className="block text-base font-extrabold text-slate-800 dark:text-white mt-1">{spec.value}</span>
              </div>
            ) : null)}
          </div>

          {/* Amenities */}
          {property.amenityIds && property.amenityIds.length > 0 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
              <h2 className="text-xl font-bold dark:text-white mb-4">Amenities Checklist</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {property.amenityIds.map((_, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-slate-650 dark:text-slate-300 text-sm">
                    <FiCheckCircle className="text-green-500 w-4 h-4" />
                    <span>Amenity #{idx + 1}</span> {/* Resolving amenity label inside a robust layout */}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Map Display coordinates */}
          {property.latitude && property.longitude && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
              <h2 className="text-xl font-bold dark:text-white mb-4">Location Map Display</h2>
              <div className="h-[280px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100">
                <iframe
                  title="OpenStreetMap Display Frame"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  scrolling="no"
                  marginHeight={0}
                  marginWidth={0}
                  src={`https://maps.google.com/maps?q=${property.latitude},${property.longitude}&z=15&output=embed`}
                />
              </div>
            </div>
          )}

          {/* Floor plans list */}
          {property.floorPlans && property.floorPlans.length > 0 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
              <h2 className="text-xl font-bold dark:text-white mb-4 font-sans">Blueprints & Floor Plans</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {property.floorPlans.map(plan => (
                  <div key={plan.id} className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden flex bg-slate-50 dark:bg-slate-950">
                    <div className="w-24 h-20 bg-slate-200">
                      <img 
                        src={plan.filePath.startsWith('http') ? plan.filePath : `${import.meta.env.VITE_API_URL || 'http://localhost:5242'}${plan.filePath}`}
                        alt={plan.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-3">
                      <span className="block font-bold text-sm text-slate-800 dark:text-white">{plan.name}</span>
                      {plan.dimensions && (
                        <span className="block text-xs text-slate-450 dark:text-slate-500 mt-1">Dims: {plan.dimensions}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Pricing details, private documents list, audit logs */}
        <div className="space-y-8">
          
          {/* Price Box */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-md text-center">
            <span className="text-sm font-semibold text-slate-450 uppercase tracking-wider">Asking Price</span>
            <div className="text-3xl font-extrabold text-indigo-650 dark:text-indigo-400 mt-1">
              ${property.price.toLocaleString()}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              {property.listingType === 0 ? 'Broker Fee Excluded' : 'Per calendar month'}
            </div>
            <button
              onClick={() => navigate('/compare')}
              className="w-full mt-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-850 text-white font-bold text-sm shadow-sm transition-all"
            >
              Add to Comparisons
            </button>
          </div>

          {/* Documents Download Console */}
          {property.documents && property.documents.length > 0 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
              <h3 className="text-lg font-bold dark:text-white mb-4">Attachments & Documents</h3>
              <div className="space-y-3">
                {property.documents.map(doc => (
                  <div key={doc.id} className="flex justify-between items-center bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-850">
                    <div className="flex items-center gap-2 max-w-[70%]">
                      <FiFileText className="text-slate-400 flex-shrink-0" />
                      <span className="text-xs font-semibold text-slate-800 dark:text-white truncate" title={doc.displayName}>
                        {doc.displayName}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDownload(doc.id, doc.displayName)}
                      className="p-1.5 rounded-lg bg-indigo-50 text-indigo-650 hover:bg-indigo-100 dark:bg-indigo-950/20 dark:text-indigo-400 transition-all"
                      title="Download attachment file"
                    >
                      <FiDownload className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Audit Trail transitions logs (Owner / Admin ONLY) */}
          {isOwnerOrAdmin && property.auditLogs && property.auditLogs.length > 0 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
              <h3 className="text-lg font-bold dark:text-white mb-4 flex items-center gap-1.5">
                <FiInfo className="text-indigo-600" />
                <span>Auditing logs transitions</span>
              </h3>
              <div className="relative border-l border-slate-250 dark:border-slate-800 pl-4 space-y-5">
                {property.auditLogs.map(log => (
                  <div key={log.id} className="relative text-xs">
                    <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-indigo-600 shadow-sm" />
                    <div className="flex justify-between text-slate-400 font-semibold">
                      <span>{log.userEmail}</span>
                      <span>{new Date(log.createdDate).toLocaleDateString()}</span>
                    </div>
                    <div className="mt-1 font-bold text-slate-800 dark:text-white">
                      Status changed to: {log.newStatus}
                    </div>
                    {log.notes && (
                      <div className="text-[11px] text-slate-500 italic mt-1 bg-slate-50 dark:bg-slate-950 p-2 rounded border border-slate-100 dark:border-slate-850">
                        {log.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyDetailsPage;
