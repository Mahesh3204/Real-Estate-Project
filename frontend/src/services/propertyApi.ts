import apiClient from './apiClient';

export interface PropertyDto {
  id: string;
  title: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  price: number;
  listingType: number; // 0 = Sale, 1 = Rent
  publishStatus: number; // 0 = Draft, 1 = PendingApproval, 2 = Published, 3 = Rejected, 4 = Archived
  ownerId: string;
  ownerName: string;
  categoryName: string;
  propertyTypeName: string;
  statusName: string;
  conditionName: string;
  createdDate: string;
  address?: string;
  featuredImageUrl?: string;
  countryName: string;
  stateName: string;
  cityName: string;
  areaText?: string;
}

export interface PropertyDetailsDto extends PropertyDto {
  bedrooms?: number;
  bathrooms?: number;
  balconies?: number;
  floors?: number;
  parking?: number;
  area?: number;
  areaUnit?: string;
  lotSize?: number;
  furnishedStatus?: string;
  yearBuilt?: number;
  facingDirection?: string;
  countryId?: string;
  stateId?: string;
  cityId?: string;
  categoryId?: string;
  propertyTypeId?: string;
  statusId?: string;
  conditionId?: string;
  landmark?: string;
  zipCode?: string;
  latitude?: number;
  longitude?: number;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  amenityIds: string[];
  media: PropertyMediaDto[];
  documents: PropertyDocumentDto[];
  floorPlans: PropertyFloorPlanDto[];
  auditLogs: PropertyAuditLogDto[];
}

export interface PropertyMediaDto {
  id: string;
  filePath: string;
  fileType: string;
  isFeatured: boolean;
  displayOrder: number;
}

export interface PropertyDocumentDto {
  id: string;
  filePath: string;
  displayName: string;
  isPublic: boolean;
}

export interface PropertyFloorPlanDto {
  id: string;
  filePath: string;
  name: string;
  dimensions?: string;
}

export interface PropertyAuditLogDto {
  id: string;
  userId: string;
  userEmail: string;
  oldStatus: string;
  newStatus: string;
  notes?: string;
  createdDate: string;
}

export interface PaginatedList<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
}

export interface PropertyFilters {
  pageNumber?: number;
  pageSize?: number;
  searchQuery?: string;
  categoryId?: string;
  propertyTypeId?: string;
  statusId?: string;
  conditionId?: string;
  publishStatus?: number;
  listingType?: number;
  onlyOwner?: boolean;
  sortBy?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  minArea?: number;
  maxArea?: number;
  cityId?: string;
  furnishedStatus?: string;
  parking?: number;
  yearBuilt?: number;
  amenityIds?: string[];
  propertyIds?: string[];
}

export const propertyApi = {
  getProperties: async (filters: PropertyFilters) => {
    const response = await apiClient.get<{ success: boolean; data: PaginatedList<PropertyDto> }>(
      '/api/v1/properties',
      { params: filters }
    );
    return response.data;
  },

  getPropertyById: async (id: string) => {
    const response = await apiClient.get<{ success: boolean; data: PropertyDetailsDto }>(
      `/api/v1/properties/${id}`
    );
    return response.data;
  },

  getPropertyBySlug: async (slug: string) => {
    const response = await apiClient.get<{ success: boolean; data: PropertyDetailsDto }>(
      `/api/v1/properties/slug/${slug}`
    );
    return response.data;
  },

  createDraft: async (data: { title: string; price: number; listingType: number }) => {
    const response = await apiClient.post<{ success: boolean; data: { id: string } }>(
      '/api/v1/properties/draft',
      data
    );
    return response.data;
  },

  updateDraft: async (id: string, data: Partial<PropertyDetailsDto> & { amenityIds?: string[] }) => {
    const response = await apiClient.put<{ success: boolean; message: string }>(
      `/api/v1/properties/draft/${id}`,
      data
    );
    return response.data;
  },

  submitForApproval: async (id: string) => {
    const response = await apiClient.post<{ success: boolean; message: string }>(
      `/api/v1/properties/${id}/submit`
    );
    return response.data;
  },

  bulkAction: async (data: { propertyIds: string[]; action: string }) => {
    const response = await apiClient.post<{ success: boolean; message: string }>(
      '/api/v1/properties/bulk-action',
      data
    );
    return response.data;
  },

  uploadMedia: async (id: string, file: File, isFeatured: boolean = false, onProgress?: (percent: number) => void) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('isFeatured', String(isFeatured));

    const response = await apiClient.post<{ success: boolean; data: PropertyMediaDto }>(
      `/api/v1/properties/${id}/media`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total && onProgress) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(percent);
          }
        },
      }
    );
    return response.data;
  },

  deleteMedia: async (id: string, mediaId: string) => {
    const response = await apiClient.delete<{ success: boolean; message: string }>(
      `/api/v1/properties/${id}/media/${mediaId}`
    );
    return response.data;
  },

  updateMediaOrder: async (id: string, orderedMediaIds: string[]) => {
    const response = await apiClient.put<{ success: boolean; message: string }>(
      `/api/v1/properties/${id}/media/order`,
      { orderedMediaIds }
    );
    return response.data;
  },

  uploadDocument: async (id: string, file: File, displayName: string, isPublic: boolean, onProgress?: (percent: number) => void) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('displayName', displayName);
    formData.append('isPublic', String(isPublic));

    const response = await apiClient.post<{ success: boolean; data: PropertyDocumentDto }>(
      `/api/v1/properties/${id}/documents`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total && onProgress) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(percent);
          }
        },
      }
    );
    return response.data;
  },

  deleteDocument: async (id: string, docId: string) => {
    const response = await apiClient.delete<{ success: boolean; message: string }>(
      `/api/v1/properties/${id}/documents/${docId}`
    );
    return response.data;
  },

  uploadFloorPlan: async (id: string, file: File, name: string, dimensions?: string, onProgress?: (percent: number) => void) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', name);
    if (dimensions) {
      formData.append('dimensions', dimensions);
    }

    const response = await apiClient.post<{ success: boolean; data: PropertyFloorPlanDto }>(
      `/api/v1/properties/${id}/floor-plans`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total && onProgress) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(percent);
          }
        },
      }
    );
    return response.data;
  },

  deleteFloorPlan: async (id: string, planId: string) => {
    const response = await apiClient.delete<{ success: boolean; message: string }>(
      `/api/v1/properties/${id}/floor-plans/${planId}`
    );
    return response.data;
  },

  // --- Admin Moderation ---
  approveProperty: async (id: string) => {
    const response = await apiClient.post<{ success: boolean; message: string }>(
      `/api/v1/admin/properties/${id}/approve`
    );
    return response.data;
  },

  rejectProperty: async (id: string, reason: string) => {
    const response = await apiClient.post<{ success: boolean; message: string }>(
      `/api/v1/admin/properties/${id}/reject`,
      { reason }
    );
    return response.data;
  },

  forceDeleteProperty: async (id: string) => {
    const response = await apiClient.delete<{ success: boolean; message: string }>(
      `/api/v1/admin/properties/${id}`
    );
    return response.data;
  },

  duplicateProperty: async (id: string) => {
    const response = await apiClient.post<{ success: boolean; data: { id: string } }>(
      `/api/v1/properties/${id}/duplicate`
    );
    return response.data;
  },

  getRelatedProperties: async (id: string, count: number = 3) => {
    const response = await apiClient.get<{ success: boolean; data: PropertyDto[] }>(
      `/api/v1/properties/${id}/related`,
      { params: { count } }
    );
    return response.data;
  },
};
