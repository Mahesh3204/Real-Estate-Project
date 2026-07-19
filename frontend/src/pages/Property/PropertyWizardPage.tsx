import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppDispatch } from '../../store/hooks';
import { showToast } from '../../store/toastSlice';
import { propertyApi } from '../../services/propertyApi';
import type { 
  PropertyMediaDto, 
  PropertyDocumentDto, 
  PropertyFloorPlanDto 
} from '../../services/propertyApi';
import { 
  getCountries, 
  getStates, 
  getCities, 
  getCategories, 
  getPropertyTypes, 
  getStatuses, 
  getConditions, 
  getAmenities 
} from '../../services/adminApi';
import { 
  FiCheckCircle, 
  FiArrowLeft, 
  FiArrowRight, 
  FiUpload, 
  FiTrash2, 
  FiImage, 
  FiFileText, 
  FiStar, 
  FiInfo, 
  FiMapPin, 
  FiSliders, 
  FiGlobe 
} from 'react-icons/fi';

const STEPS = [
  { number: 1, label: 'Basic Details' },
  { number: 2, label: 'Location' },
  { number: 3, label: 'Specifications' },
  { number: 4, label: 'Amenities' },
  { number: 5, label: 'Photos & Videos' },
  { number: 6, label: 'Documents' },
  { number: 7, label: 'Floor Plans' },
  { number: 8, label: 'SEO' },
  { number: 9, label: 'Review & Submit' }
];

const PropertyWizardPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const propertyIdParam = searchParams.get('id');

  // Core wizard state
  const [step, setStep] = useState(1);
  const [propertyId, setPropertyId] = useState<string | null>(propertyIdParam);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form Fields State
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [listingType, setListingType] = useState<number>(0); // 0 = Sale, 1 = Rent
  const [description, setDescription] = useState('');
  const [shortDescription, setShortDescription] = useState('');

  // Taxonomies Dropdowns
  const [categoryId, setCategoryId] = useState('');
  const [propertyTypeId, setPropertyTypeId] = useState('');
  const [statusId, setStatusId] = useState('');
  const [conditionId, setConditionId] = useState('');

  const [categories, setCategories] = useState<any[]>([]);
  const [propertyTypes, setPropertyTypes] = useState<any[]>([]);
  const [statuses, setStatuses] = useState<any[]>([]);
  const [conditions, setConditions] = useState<any[]>([]);
  const [allAmenities, setAllAmenities] = useState<any[]>([]);
  const [selectedAmenityIds, setSelectedAmenityIds] = useState<string[]>([]);

  // Location Selector
  const [countryId, setCountryId] = useState('');
  const [stateId, setStateId] = useState('');
  const [cityId, setCityId] = useState('');
  const [address, setAddress] = useState('');
  const [areaText, setAreaText] = useState('');
  const [landmark, setLandmark] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [latitude, setLatitude] = useState<number | ''>('');
  const [longitude, setLongitude] = useState<number | ''>('');

  const [countries, setCountries] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);

  // Specs
  const [bedrooms, setBedrooms] = useState<number | ''>('');
  const [bathrooms, setBathrooms] = useState<number | ''>('');
  const [balconies, setBalconies] = useState<number | ''>('');
  const [floors, setFloors] = useState<number | ''>('');
  const [parking, setParking] = useState<number | ''>('');
  const [area, setArea] = useState<number | ''>('');
  const [areaUnit, setAreaUnit] = useState('sqft');
  const [lotSize, setLotSize] = useState<number | ''>('');
  const [furnishedStatus, setFurnishedStatus] = useState('Unfurnished');
  const [yearBuilt, setYearBuilt] = useState<number | ''>('');
  const [facingDirection, setFacingDirection] = useState('North');

  // SEO
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [metaKeywords, setMetaKeywords] = useState('');

  // Media, Documents, Floor Plans arrays
  const [mediaList, setMediaList] = useState<PropertyMediaDto[]>([]);
  const [documentList, setDocumentList] = useState<PropertyDocumentDto[]>([]);
  const [floorPlanList, setFloorPlanList] = useState<PropertyFloorPlanDto[]>([]);

  // Upload States
  const [mediaUploading, setMediaUploading] = useState(false);
  const [docUploading, setDocUploading] = useState(false);
  const [floorPlanUploading, setFloorPlanUploading] = useState(false);

  // Document Display Name & Public flag
  const [docDisplayName, setDocDisplayName] = useState('');
  const [docIsPublic, setDocIsPublic] = useState(true);

  // Floor plan name & dimensions
  const [floorPlanName, setFloorPlanName] = useState('');
  const [floorPlanDimensions, setFloorPlanDimensions] = useState('');

  // Initial lookup loaders
  useEffect(() => {
    const loadLookups = async () => {
      try {
        const [cRes, sRes, condRes, amRes, cntRes] = await Promise.all([
          getCategories({ includeInactive: false }),
          getStatuses({ includeInactive: false }),
          getConditions(),
          getAmenities({ includeInactive: false }),
          getCountries({ includeInactive: false })
        ]);
        setCategories(cRes?.data || []);
        setStatuses(sRes?.data || []);
        setConditions(condRes?.data || []);
        setAllAmenities(amRes?.data || []);
        setCountries(cntRes?.data || []);
      } catch (err) {
        console.error('Failed to load taxonomies lookups', err);
      }
    };
    loadLookups();
  }, []);

  // Fetch Types when category changes
  useEffect(() => {
    if (categoryId) {
      getPropertyTypes(categoryId).then(res => setPropertyTypes(res?.data || []));
    } else {
      setPropertyTypes([]);
    }
  }, [categoryId]);

  // Fetch States when country changes
  useEffect(() => {
    if (countryId) {
      getStates(countryId).then(res => setStates(res?.data || []));
    } else {
      setStates([]);
    }
  }, [countryId]);

  // Fetch Cities when state changes
  useEffect(() => {
    if (stateId) {
      getCities(stateId).then(res => setCities(res?.data || []));
    } else {
      setCities([]);
    }
  }, [stateId]);

  // Load existing draft if ID is in params
  useEffect(() => {
    if (propertyIdParam) {
      setPropertyId(propertyIdParam);
      loadDraftDetails(propertyIdParam);
    }
  }, [propertyIdParam]);

  const loadDraftDetails = async (id: string) => {
    setLoading(true);
    try {
      const res = await propertyApi.getPropertyById(id);
      if (res?.data) {
        const d = res.data;
        setTitle(d.title || '');
        setPrice(d.price || 0);
        setListingType(d.listingType ?? 0);
        setDescription(d.description || '');
        setShortDescription(d.shortDescription || '');
        setCategoryId(d.categoryId || '');
        setPropertyTypeId(d.propertyTypeId || '');
        setStatusId(d.statusId || '');
        setConditionId(d.conditionId || '');
        setCountryId(d.countryId || '');
        setStateId(d.stateId || '');
        setCityId(d.cityId || '');
        setAddress(d.address || '');
        setAreaText(d.areaText || '');
        setLandmark(d.landmark || '');
        setZipCode(d.zipCode || '');
        setLatitude(d.latitude ?? '');
        setLongitude(d.longitude ?? '');
        setBedrooms(d.bedrooms ?? '');
        setBathrooms(d.bathrooms ?? '');
        setBalconies(d.balconies ?? '');
        setFloors(d.floors ?? '');
        setParking(d.parking ?? '');
        setArea(d.area ?? '');
        setAreaUnit(d.areaUnit || 'sqft');
        setLotSize(d.lotSize ?? '');
        setFurnishedStatus(d.furnishedStatus || 'Unfurnished');
        setYearBuilt(d.yearBuilt ?? '');
        setFacingDirection(d.facingDirection || 'North');
        setMetaTitle(d.metaTitle || '');
        setMetaDescription(d.metaDescription || '');
        setMetaKeywords(d.metaKeywords || '');
        setSelectedAmenityIds(d.amenityIds || []);
        setMediaList(d.media || []);
        setDocumentList(d.documents || []);
        setFloorPlanList(d.floorPlans || []);
      }
    } catch (err) {
      dispatch(showToast({ message: 'Failed to load property draft details.', type: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  // Auto-save logic
  const handleAutoSave = async () => {
    if (!propertyId) return;
    setSaving(true);
    try {
      await propertyApi.updateDraft(propertyId, {
        id: propertyId,
        title,
        price,
        listingType,
        description: description || undefined,
        shortDescription: shortDescription || undefined,
        categoryId: categoryId || undefined,
        propertyTypeId: propertyTypeId || undefined,
        statusId: statusId || undefined,
        conditionId: conditionId || undefined,
        countryId: countryId || undefined,
        stateId: stateId || undefined,
        cityId: cityId || undefined,
        address: address || undefined,
        areaText: areaText || undefined,
        landmark: landmark || undefined,
        zipCode: zipCode || undefined,
        latitude: latitude === '' ? undefined : Number(latitude),
        longitude: longitude === '' ? undefined : Number(longitude),
        bedrooms: bedrooms === '' ? undefined : Number(bedrooms),
        bathrooms: bathrooms === '' ? undefined : Number(bathrooms),
        balconies: balconies === '' ? undefined : Number(balconies),
        floors: floors === '' ? undefined : Number(floors),
        parking: parking === '' ? undefined : Number(parking),
        area: area === '' ? undefined : Number(area),
        areaUnit: areaUnit || undefined,
        lotSize: lotSize === '' ? undefined : Number(lotSize),
        furnishedStatus: furnishedStatus || undefined,
        yearBuilt: yearBuilt === '' ? undefined : Number(yearBuilt),
        facingDirection: facingDirection || undefined,
        metaTitle: metaTitle || undefined,
        metaDescription: metaDescription || undefined,
        metaKeywords: metaKeywords || undefined,
        amenityIds: selectedAmenityIds
      });
    } catch (err) {
      console.error('Autosave background task failure', err);
    } finally {
      setSaving(false);
    }
  };

  // Trigger auto-save when moving between steps
  const goToNextStep = async () => {
    if (step === 1) {
      // Create draft if not exists
      if (!title.trim()) {
        dispatch(showToast({ message: 'Title is required to initialize a draft.', type: 'error' }));
        return;
      }
      setLoading(true);
      try {
        if (!propertyId) {
          const res = await propertyApi.createDraft({ title, price, listingType });
          setPropertyId(res.data.id);
          setSearchParams({ id: res.data.id });
          dispatch(showToast({ message: 'Draft initiated successfully.', type: 'success' }));
        } else {
          await handleAutoSave();
        }
        setStep(2);
      } catch (err) {
        dispatch(showToast({ message: 'Failed to save basic draft details.', type: 'error' }));
      } finally {
        setLoading(false);
      }
    } else {
      await handleAutoSave();
      setStep(prev => Math.min(prev + 1, 9));
    }
  };

  const goToPrevStep = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  // Media uploads
  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !files.length || !propertyId) return;

    setMediaUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const isFeatured = mediaList.length === 0; // Default first media featured
        const res = await propertyApi.uploadMedia(propertyId, file, isFeatured);
        setMediaList(prev => [...prev, res.data]);
      }
      dispatch(showToast({ message: 'Media files uploaded successfully.', type: 'success' }));
    } catch (err) {
      dispatch(showToast({ message: 'Failed to upload one or more media files.', type: 'error' }));
    } finally {
      setMediaUploading(false);
    }
  };

  const handleSetFeaturedMedia = async (mediaId: string) => {
    if (!propertyId) return;
    try {
      // Find the media item in mediaList and set isFeatured to true, others false
      await propertyApi.updateDraft(propertyId, {
        id: propertyId,
        title,
        price,
        listingType
      });
      // Set featured query parameter
      const updatedMediaList = mediaList.map(m => ({
        ...m,
        isFeatured: m.id === mediaId
      }));
      setMediaList(updatedMediaList);

      // Re-trigger load to ensure server-side updates are aligned
      loadDraftDetails(propertyId);
      dispatch(showToast({ message: 'Featured image set.', type: 'success' }));
    } catch (err) {
      dispatch(showToast({ message: 'Failed to set featured image.', type: 'error' }));
    }
  };

  const handleDeleteMedia = async (mediaId: string) => {
    if (!propertyId || !window.confirm('Delete this image?')) return;
    try {
      await propertyApi.deleteMedia(propertyId, mediaId);
      setMediaList(prev => prev.filter(m => m.id !== mediaId));
      dispatch(showToast({ message: 'Image deleted.', type: 'success' }));
    } catch (err) {
      dispatch(showToast({ message: 'Failed to delete media asset.', type: 'error' }));
    }
  };

  // Documents
  const handleDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !propertyId) return;

    setDocUploading(true);
    try {
      const name = docDisplayName.trim() || file.name;
      const res = await propertyApi.uploadDocument(propertyId, file, name, docIsPublic);
      setDocumentList(prev => [...prev, res.data]);
      setDocDisplayName('');
      dispatch(showToast({ message: 'Document uploaded.', type: 'success' }));
    } catch (err) {
      dispatch(showToast({ message: 'Failed to upload document.', type: 'error' }));
    } finally {
      setDocUploading(false);
    }
  };

  const handleDeleteDoc = async (docId: string) => {
    if (!propertyId || !window.confirm('Delete this document?')) return;
    try {
      await propertyApi.deleteDocument(propertyId, docId);
      setDocumentList(prev => prev.filter(d => d.id !== docId));
      dispatch(showToast({ message: 'Document removed.', type: 'success' }));
    } catch (err) {
      dispatch(showToast({ message: 'Failed to delete document.', type: 'error' }));
    }
  };

  // Floor Plans
  const handleFloorPlanUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !propertyId) return;

    setFloorPlanUploading(true);
    try {
      const name = floorPlanName.trim() || file.name;
      const res = await propertyApi.uploadFloorPlan(propertyId, file, name, floorPlanDimensions || undefined);
      setFloorPlanList(prev => [...prev, res.data]);
      setFloorPlanName('');
      setFloorPlanDimensions('');
      dispatch(showToast({ message: 'Floor plan uploaded.', type: 'success' }));
    } catch (err) {
      dispatch(showToast({ message: 'Failed to upload floor plan.', type: 'error' }));
    } finally {
      setFloorPlanUploading(false);
    }
  };

  const handleDeleteFloorPlan = async (planId: string) => {
    if (!propertyId || !window.confirm('Delete this floor plan?')) return;
    try {
      await propertyApi.deleteFloorPlan(propertyId, planId);
      setFloorPlanList(prev => prev.filter(f => f.id !== planId));
      dispatch(showToast({ message: 'Floor plan deleted.', type: 'success' }));
    } catch (err) {
      dispatch(showToast({ message: 'Failed to delete floor plan.', type: 'error' }));
    }
  };

  // Submit Draft for approval
  const handleSubmitProperty = async () => {
    if (!propertyId) return;
    setLoading(true);
    try {
      await handleAutoSave();
      await propertyApi.submitForApproval(propertyId);
      dispatch(showToast({ message: 'Property listing submitted for review and approval!', type: 'success' }));
      navigate('/properties');
    } catch (err: any) {
      dispatch(showToast({ message: err.response?.data?.message || 'Failed to submit property.', type: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  const toggleAmenity = (id: string) => {
    setSelectedAmenityIds(prev => 
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Step Indicators */}
      <div className="mb-10 overflow-x-auto pb-4">
        <div className="flex justify-between items-center min-w-[700px]">
          {STEPS.map((s, idx) => (
            <React.Fragment key={s.number}>
              <div className="flex flex-col items-center gap-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                  step === s.number 
                    ? 'bg-indigo-600 text-white shadow-lg ring-4 ring-indigo-500/20'
                    : step > s.number 
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-100 text-slate-400 dark:bg-slate-800'
                }`}>
                  {step > s.number ? <FiCheckCircle className="w-5 h-5" /> : s.number}
                </div>
                <span className={`text-xs font-semibold ${step === s.number ? 'text-indigo-650 dark:text-indigo-400' : 'text-slate-400'}`}>
                  {s.label}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div className={`flex-1 h-[2px] mx-2 ${step > s.number ? 'bg-emerald-400' : 'bg-slate-200 dark:bg-slate-800'}`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Main card box */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-600 border-t-transparent" />
          </div>
        ) : (
          <div>
            {/* Step 1: Basic Details */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold dark:text-white flex items-center gap-2">
                    <FiSliders className="text-indigo-600 w-6 h-6" />
                    <span>Basic Property Information</span>
                  </h2>
                  <p className="text-sm text-slate-450 dark:text-slate-400 mt-1">Provide the headline and core details of your listing.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Listing Title *</label>
                    <input
                      type="text"
                      placeholder="e.g. Modern 3-Bedroom Villa in Sunnyvale"
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-900 outline-none text-sm dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Asking Price ($) *</label>
                    <input
                      type="number"
                      value={price}
                      onChange={e => setPrice(Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-900 outline-none text-sm dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Listing Type</label>
                    <select
                      value={listingType}
                      onChange={e => setListingType(Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-900 outline-none text-sm dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    >
                      <option value={0}>For Sale</option>
                      <option value={1}>For Rent</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Category</label>
                    <select
                      value={categoryId}
                      onChange={e => setCategoryId(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-900 outline-none text-sm dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    >
                      <option value="">Select Category</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Property Type</label>
                    <select
                      value={propertyTypeId}
                      onChange={e => setPropertyTypeId(e.target.value)}
                      disabled={!categoryId}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-900 outline-none text-sm dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:opacity-50"
                    >
                      <option value="">Select Type</option>
                      {propertyTypes.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Listing Status</label>
                    <select
                      value={statusId}
                      onChange={e => setStatusId(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-900 outline-none text-sm dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    >
                      <option value="">Select Status</option>
                      {statuses.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Property Condition</label>
                    <select
                      value={conditionId}
                      onChange={e => setConditionId(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-900 outline-none text-sm dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    >
                      <option value="">Select Condition</option>
                      {conditions.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Short Pitch Description</label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Beautiful penthouse with panoramas over downtown..."
                      value={shortDescription}
                      onChange={e => setShortDescription(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-900 outline-none text-sm dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Detailed Description</label>
                    <textarea
                      rows={5}
                      placeholder="e.g. Welcome to this absolute gem of a penthouse..."
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-900 outline-none text-sm dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Location */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold dark:text-white flex items-center gap-2">
                    <FiMapPin className="text-indigo-600 w-6 h-6" />
                    <span>Location Address Details</span>
                  </h2>
                  <p className="text-sm text-slate-450 dark:text-slate-400 mt-1">Provide geographic details and geo-coordinates.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Country</label>
                    <select
                      value={countryId}
                      onChange={e => setCountryId(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-900 outline-none text-sm dark:text-white"
                    >
                      <option value="">Select Country</option>
                      {countries.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">State / Province</label>
                    <select
                      value={stateId}
                      onChange={e => setStateId(e.target.value)}
                      disabled={!countryId}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-900 outline-none text-sm dark:text-white disabled:opacity-50"
                    >
                      <option value="">Select State</option>
                      {states.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">City</label>
                    <select
                      value={cityId}
                      onChange={e => setCityId(e.target.value)}
                      disabled={!stateId}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-900 outline-none text-sm dark:text-white disabled:opacity-50"
                    >
                      <option value="">Select City</option>
                      {cities.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Street Address</label>
                    <input
                      type="text"
                      placeholder="e.g. 100 Main St, Suite 400"
                      value={address}
                      onChange={e => setAddress(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-900 outline-none text-sm dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Neighborhood / Area</label>
                    <input
                      type="text"
                      placeholder="e.g. Downtown, West Side"
                      value={areaText}
                      onChange={e => setAreaText(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-900 outline-none text-sm dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Landmark</label>
                    <input
                      type="text"
                      placeholder="e.g. Opposite Central Park"
                      value={landmark}
                      onChange={e => setLandmark(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-900 outline-none text-sm dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Zip Code</label>
                    <input
                      type="text"
                      placeholder="e.g. 94086"
                      value={zipCode}
                      onChange={e => setZipCode(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-900 outline-none text-sm dark:text-white"
                    />
                  </div>

                  <div className="md:col-span-3 grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Latitude</label>
                      <input
                        type="number"
                        step="0.000001"
                        placeholder="e.g. 37.7749"
                        value={latitude}
                        onChange={e => setLatitude(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-900 outline-none text-sm dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Longitude</label>
                      <input
                        type="number"
                        step="0.000001"
                        placeholder="e.g. -122.4194"
                        value={longitude}
                        onChange={e => setLongitude(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-900 outline-none text-sm dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Specs */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold dark:text-white flex items-center gap-2">
                    <FiSliders className="text-indigo-600 w-6 h-6" />
                    <span>Technical Specifications</span>
                  </h2>
                  <p className="text-sm text-slate-450 dark:text-slate-400 mt-1">Specify detailed room counts, year built, and layouts parameters.</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Bedrooms</label>
                    <input
                      type="number"
                      value={bedrooms}
                      onChange={e => setBedrooms(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-900 outline-none text-sm dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Bathrooms</label>
                    <input
                      type="number"
                      value={bathrooms}
                      onChange={e => setBathrooms(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-900 outline-none text-sm dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Balconies</label>
                    <input
                      type="number"
                      value={balconies}
                      onChange={e => setBalconies(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-900 outline-none text-sm dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Total Floors</label>
                    <input
                      type="number"
                      value={floors}
                      onChange={e => setFloors(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-900 outline-none text-sm dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Parking Spaces</label>
                    <input
                      type="number"
                      value={parking}
                      onChange={e => setParking(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-900 outline-none text-sm dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Build Area</label>
                    <input
                      type="number"
                      value={area}
                      onChange={e => setArea(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-900 outline-none text-sm dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Area Unit</label>
                    <select
                      value={areaUnit}
                      onChange={e => setAreaUnit(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-900 outline-none text-sm dark:text-white"
                    >
                      <option value="sqft">Sq. Ft.</option>
                      <option value="sqm">Sq. M.</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Lot size (acres)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={lotSize}
                      onChange={e => setLotSize(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-900 outline-none text-sm dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Furnished Status</label>
                    <select
                      value={furnishedStatus}
                      onChange={e => setFurnishedStatus(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-900 outline-none text-sm dark:text-white"
                    >
                      <option value="Furnished">Furnished</option>
                      <option value="Semi-Furnished">Semi-Furnished</option>
                      <option value="Unfurnished">Unfurnished</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Year Built</label>
                    <input
                      type="number"
                      value={yearBuilt}
                      onChange={e => setYearBuilt(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-900 outline-none text-sm dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Facing Direction</label>
                    <select
                      value={facingDirection}
                      onChange={e => setFacingDirection(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-900 outline-none text-sm dark:text-white"
                    >
                      <option value="North">North</option>
                      <option value="South">South</option>
                      <option value="East">East</option>
                      <option value="West">West</option>
                      <option value="Northeast">Northeast</option>
                      <option value="Northwest">Northwest</option>
                      <option value="Southeast">Southeast</option>
                      <option value="Southwest">Southwest</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Amenities */}
            {step === 4 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold dark:text-white flex items-center gap-2">
                    <FiCheckCircle className="text-indigo-600 w-6 h-6" />
                    <span>Amenities & Facilities Checklist</span>
                  </h2>
                  <p className="text-sm text-slate-450 dark:text-slate-400 mt-1">Tick all high-value amenities offered by the property listing.</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {allAmenities.map(amenity => (
                    <label 
                      key={amenity.id}
                      className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer select-none transition-all ${
                        selectedAmenityIds.includes(amenity.id)
                          ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-400 font-semibold'
                          : 'border-slate-200 dark:border-slate-800 text-slate-650 hover:bg-slate-50 dark:hover:bg-slate-950'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedAmenityIds.includes(amenity.id)}
                        onChange={() => toggleAmenity(amenity.id)}
                        className="rounded border-slate-350 text-indigo-600 focus:ring-indigo-500/20 w-4 h-4"
                      />
                      <span className="text-sm">{amenity.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Step 5: Photos & Videos Upload */}
            {step === 5 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold dark:text-white flex items-center gap-2">
                    <FiImage className="text-indigo-600 w-6 h-6" />
                    <span>Media Upload Workspace</span>
                  </h2>
                  <p className="text-sm text-slate-455 dark:text-slate-400 mt-1">Upload JPEG/PNG pictures and MP4 video tours.</p>
                </div>

                {/* Upload drag drop box */}
                <div className="relative border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-10 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 transition-all hover:border-indigo-400 group">
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    onChange={handleMediaUpload}
                    disabled={mediaUploading}
                    className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
                  />
                  <FiUpload className="w-10 h-10 text-slate-400 group-hover:text-indigo-500 transition-all mb-3" />
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Drag & Drop files or click to Browse</span>
                  <span className="text-xs text-slate-450 dark:text-slate-500 mt-1">Supports JPG, PNG, WEBP, MP4 files up to 20MB</span>
                  {mediaUploading && (
                    <div className="mt-4 flex items-center gap-2 text-indigo-600 font-semibold text-xs">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-indigo-600 border-t-transparent" />
                      <span>Processing files upload...</span>
                    </div>
                  )}
                </div>

                {/* List uploads */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  {mediaList.map(m => (
                    <div key={m.id} className="relative group border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-950 h-32">
                      <img 
                        src={m.filePath.startsWith('http') ? m.filePath : `${import.meta.env.VITE_API_URL || 'http://localhost:5242'}${m.filePath}`}
                        alt="Property asset"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleSetFeaturedMedia(m.id)}
                          className={`p-1.5 rounded-lg text-white ${m.isFeatured ? 'bg-indigo-600' : 'bg-slate-800/80 hover:bg-indigo-600'} transition-all`}
                          title={m.isFeatured ? 'Featured Image' : 'Set as Featured'}
                        >
                          <FiStar className="w-4 h-4 fill-current" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteMedia(m.id)}
                          className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-red-650 text-white transition-all"
                          title="Delete image"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                      {m.isFeatured && (
                        <div className="absolute bottom-2 left-2 bg-indigo-600 text-white text-[9px] font-bold px-2 py-0.5 rounded shadow-sm">
                          Featured
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 6: Documents manager */}
            {step === 6 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold dark:text-white flex items-center gap-2">
                    <FiFileText className="text-indigo-600 w-6 h-6" />
                    <span>Legal Documents Manager</span>
                  </h2>
                  <p className="text-sm text-slate-450 dark:text-slate-400 mt-1">Upload deeds, blueprints, and tax certifications.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Display Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Land Deed Certificate"
                      value={docDisplayName}
                      onChange={e => setDocDisplayName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 outline-none text-sm dark:text-white"
                    />
                  </div>

                  <div className="flex items-center gap-3 h-12 select-none">
                    <input
                      type="checkbox"
                      id="isPublic"
                      checked={docIsPublic}
                      onChange={e => setDocIsPublic(e.target.checked)}
                      className="rounded border-slate-305 text-indigo-600 focus:ring-indigo-500/20 w-4 h-4 cursor-pointer"
                    />
                    <label htmlFor="isPublic" className="text-sm font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                      Public Visibility
                    </label>
                  </div>

                  <div className="md:col-span-3">
                    <div className="relative border border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-6 flex flex-col items-center justify-center bg-white dark:bg-slate-900 hover:border-indigo-400 transition-all cursor-pointer">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg"
                        onChange={handleDocUpload}
                        disabled={docUploading}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      <FiUpload className="w-8 h-8 text-slate-400 mb-2" />
                      <span className="text-xs font-bold text-indigo-600">Click to upload document file</span>
                    </div>
                  </div>
                </div>

                {/* Uploaded Documents List */}
                <div className="space-y-3 mt-6">
                  {documentList.map(doc => (
                    <div key={doc.id} className="flex justify-between items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm">
                      <div className="flex items-center gap-3">
                        <FiFileText className="text-slate-400 w-6 h-6" />
                        <div>
                          <span className="font-semibold text-slate-800 dark:text-white">{doc.displayName}</span>
                          <div className="flex gap-2 mt-0.5">
                            <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${doc.isPublic ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                              {doc.isPublic ? 'Public' : 'Confidential'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteDoc(doc.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-all"
                        title="Delete Document"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 7: Floor Plans */}
            {step === 7 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold dark:text-white flex items-center gap-2">
                    <FiSliders className="text-indigo-600 w-6 h-6" />
                    <span>Floor Plans layout specs</span>
                  </h2>
                  <p className="text-sm text-slate-450 dark:text-slate-400 mt-1">Upload blueprint configurations with measurements.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Floor Plan Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Ground Floor Layout"
                      value={floorPlanName}
                      onChange={e => setFloorPlanName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 outline-none text-sm dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Dimensions (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. 1500 sq ft, 40 x 50 ft"
                      value={floorPlanDimensions}
                      onChange={e => setFloorPlanDimensions(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 outline-none text-sm dark:text-white"
                    />
                  </div>

                  <div>
                    <div className="relative border border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-3 flex flex-col items-center justify-center bg-white dark:bg-slate-900 hover:border-indigo-400 transition-all cursor-pointer h-12">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFloorPlanUpload}
                        disabled={floorPlanUploading}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      <span className="text-xs font-bold text-indigo-600 flex items-center gap-1">
                        <FiUpload /> Upload Plan Image
                      </span>
                    </div>
                  </div>
                </div>

                {/* Uploaded Plans list */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  {floorPlanList.map(plan => (
                    <div key={plan.id} className="flex border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-950">
                      <div className="w-24 h-20 bg-slate-200 overflow-hidden">
                        <img 
                          src={plan.filePath.startsWith('http') ? plan.filePath : `${import.meta.env.VITE_API_URL || 'http://localhost:5242'}${plan.filePath}`}
                          alt={plan.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 p-3 flex justify-between items-center">
                        <div>
                          <div className="font-semibold text-sm text-slate-800 dark:text-white">{plan.name}</div>
                          {plan.dimensions && (
                            <div className="text-xs text-slate-450 dark:text-slate-550 mt-1">Dims: {plan.dimensions}</div>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteFloorPlan(plan.id)}
                          className="p-1.5 text-slate-400 hover:text-red-655 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 8: SEO Slug */}
            {step === 8 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold dark:text-white flex items-center gap-2">
                    <FiGlobe className="text-indigo-600 w-6 h-6" />
                    <span>Search Engine Optimization (SEO)</span>
                  </h2>
                  <p className="text-sm text-slate-450 dark:text-slate-400 mt-1">Tune how your property listing will surface on search pages.</p>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Meta Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Penthouse for Sale in Manhattan | Luxury Listings"
                      value={metaTitle}
                      onChange={e => setMetaTitle(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-900 outline-none text-sm dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Meta Description</label>
                    <textarea
                      rows={3}
                      placeholder="e.g. Luxurious 3 bedroom penthouse for sale in Midtown Manhattan..."
                      value={metaDescription}
                      onChange={e => setMetaDescription(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-900 outline-none text-sm dark:text-white resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Keywords (comma separated)</label>
                    <input
                      type="text"
                      placeholder="e.g. penthouse, luxury real estate, Manhattan condo"
                      value={metaKeywords}
                      onChange={e => setMetaKeywords(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-900 outline-none text-sm dark:text-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 9: Review & Submit */}
            {step === 9 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold dark:text-white flex items-center gap-2">
                    <FiInfo className="text-indigo-600 w-6 h-6" />
                    <span>Review and Moderation Submission</span>
                  </h2>
                  <p className="text-sm text-slate-450 dark:text-slate-400 mt-1">Review the summaries of your listing before routing to administrators.</p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-800">
                    <span className="font-bold text-slate-800 dark:text-white text-base">{title || '(No Title)'}</span>
                    <span className="font-extrabold text-indigo-650 dark:text-indigo-400 text-lg">${price.toLocaleString()}</span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-slate-650 dark:text-slate-350">
                    <div><strong>Listing Mode:</strong> {listingType === 0 ? 'Sale' : 'Rent'}</div>
                    <div><strong>Bedrooms:</strong> {bedrooms || 'N/A'}</div>
                    <div><strong>Bathrooms:</strong> {bathrooms || 'N/A'}</div>
                    <div><strong>Area:</strong> {area ? `${area} ${areaUnit}` : 'N/A'}</div>
                    <div><strong>City:</strong> {cityName || 'Not selected'}</div>
                    <div><strong>Landmark:</strong> {landmark || 'N/A'}</div>
                  </div>

                  <div className="pt-3 border-t border-slate-200 dark:border-slate-800 text-sm text-slate-500">
                    <strong>Photos uploaded:</strong> {mediaList.length} files • <strong>Floor plans:</strong> {floorPlanList.length} files • <strong>Attached Documents:</strong> {documentList.length} files
                  </div>
                </div>

                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 p-5 rounded-2xl flex gap-3 text-amber-800 dark:text-amber-300">
                  <FiInfo className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <strong>Submission for Approval:</strong> By submitting, this draft property status will become `Pending Review`. An administrator will review your files, taxonomy mappings, and prices. You will receive notifications upon approval or rejection comments.
                  </div>
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="mt-10 pt-6 border-t border-slate-200 dark:border-slate-850 flex justify-between items-center">
              <button
                type="button"
                onClick={step === 1 ? () => navigate('/properties') : goToPrevStep}
                className="flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 font-bold text-sm text-slate-655 dark:text-slate-400 transition-all active:scale-95"
              >
                <FiArrowLeft />
                <span>{step === 1 ? 'Discard & Exit' : 'Back'}</span>
              </button>

              <div className="flex items-center gap-2">
                {saving && (
                  <span className="text-xs text-slate-400 animate-pulse">Saving draft...</span>
                )}
                <button
                  type="button"
                  onClick={step === 9 ? handleSubmitProperty : goToNextStep}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-650 hover:bg-indigo-700 text-white font-bold text-sm shadow-md hover:shadow-indigo-500/10 transition-all active:scale-95"
                >
                  <span>{step === 9 ? 'Submit Property' : 'Next Step'}</span>
                  {step < 9 && <FiArrowRight />}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper resolver for city label in step 9 review
const cityName = ''; // In a robust app, we'll map cityId to city name lookup state

export default PropertyWizardPage;
