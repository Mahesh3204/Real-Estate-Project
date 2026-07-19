import apiClient from './apiClient';

// --- Roles ---
export interface Role {
  id: string;
  name: string;
  permissions: string[];
}

export interface Permission {
  id: string;
  name: string;
  description: string;
}

export const getRoles = async (params: { pageNumber: number; pageSize: number; searchTerm?: string }) => {
  const response = await apiClient.get('/api/v1/admin/roles', { params });
  return response.data;
};

export const getRoleById = async (id: string) => {
  const response = await apiClient.get(`/api/v1/admin/roles/${id}`);
  return response.data;
};

export const createRole = async (data: { name: string }) => {
  const response = await apiClient.post('/api/v1/admin/roles', data);
  return response.data;
};

export const updateRole = async (id: string, data: { id: string; name: string }) => {
  const response = await apiClient.put(`/api/v1/admin/roles/${id}`, data);
  return response.data;
};

export const deleteRole = async (id: string) => {
  const response = await apiClient.delete(`/api/v1/admin/roles/${id}`);
  return response.data;
};

export const assignPermissionsToRole = async (id: string, permissionNames: string[]) => {
  const response = await apiClient.post(`/api/v1/admin/roles/${id}/permissions`, { roleId: id, permissionNames });
  return response.data;
};

export const removePermissionsFromRole = async (id: string, permissionNames: string[]) => {
  const response = await apiClient.delete(`/api/v1/admin/roles/${id}/permissions`, { data: { roleId: id, permissionNames } });
  return response.data;
};

// --- Permissions ---
export const getPermissions = async (params: { pageNumber: number; pageSize: number; searchTerm?: string }) => {
  const response = await apiClient.get('/api/v1/admin/permissions', { params });
  return response.data;
};

export const createPermission = async (data: { name: string; description: string }) => {
  const response = await apiClient.post('/api/v1/admin/permissions', data);
  return response.data;
};

export const updatePermission = async (id: string, data: { id: string; name: string; description: string }) => {
  const response = await apiClient.put(`/api/v1/admin/permissions/${id}`, data);
  return response.data;
};

export const deletePermission = async (id: string) => {
  const response = await apiClient.delete(`/api/v1/admin/permissions/${id}`);
  return response.data;
};

// --- Locations ---
export const getCountries = async (params?: { includeInactive?: boolean; includeDeleted?: boolean }) => {
  const response = await apiClient.get('/api/v1/locations/countries', { params });
  return response.data;
};

export const createCountry = async (data: { name: string; code: string }) => {
  const response = await apiClient.post('/api/v1/locations/countries', data);
  return response.data;
};

export const updateCountry = async (id: string, data: { id: string; name: string; code: string; isActive: boolean }) => {
  const response = await apiClient.put(`/api/v1/locations/countries/${id}`, data);
  return response.data;
};

export const deleteCountry = async (id: string) => {
  const response = await apiClient.delete(`/api/v1/locations/countries/${id}`);
  return response.data;
};

export const getStates = async (countryId: string, params?: { includeInactive?: boolean; includeDeleted?: boolean }) => {
  const response = await apiClient.get('/api/v1/locations/states', { params: { countryId, ...params } });
  return response.data;
};

export const createState = async (data: { countryId: string; name: string }) => {
  const response = await apiClient.post('/api/v1/locations/states', data);
  return response.data;
};

export const updateState = async (id: string, data: { id: string; name: string; isActive: boolean }) => {
  const response = await apiClient.put(`/api/v1/locations/states/${id}`, data);
  return response.data;
};

export const deleteState = async (id: string) => {
  const response = await apiClient.delete(`/api/v1/locations/states/${id}`);
  return response.data;
};

export const getCities = async (stateId: string, params?: { includeInactive?: boolean; includeDeleted?: boolean }) => {
  const response = await apiClient.get('/api/v1/locations/cities', { params: { stateId, ...params } });
  return response.data;
};

export const createCity = async (data: { stateId: string; name: string }) => {
  const response = await apiClient.post('/api/v1/locations/cities', data);
  return response.data;
};

export const updateCity = async (id: string, data: { id: string; name: string; isActive: boolean }) => {
  const response = await apiClient.put(`/api/v1/locations/cities/${id}`, data);
  return response.data;
};

export const deleteCity = async (id: string) => {
  const response = await apiClient.delete(`/api/v1/locations/cities/${id}`);
  return response.data;
};

export const getAreas = async (cityId: string, params?: { includeInactive?: boolean; includeDeleted?: boolean }) => {
  const response = await apiClient.get('/api/v1/locations/areas', { params: { cityId, ...params } });
  return response.data;
};

export const createArea = async (data: { cityId: string; name: string }) => {
  const response = await apiClient.post('/api/v1/locations/areas', data);
  return response.data;
};

export const updateArea = async (id: string, data: { id: string; name: string; isActive: boolean }) => {
  const response = await apiClient.put(`/api/v1/locations/areas/${id}`, data);
  return response.data;
};

export const deleteArea = async (id: string) => {
  const response = await apiClient.delete(`/api/v1/locations/areas/${id}`);
  return response.data;
};

// --- Master Data ---

export const getCategories = async (params?: { includeInactive?: boolean; includeDeleted?: boolean }) => {
  const response = await apiClient.get('/api/v1/master-data/categories', { params });
  return response.data;
};

export const createCategory = async (data: { name: string; description?: string; imageUrl?: string; displayOrder: number }) => {
  const response = await apiClient.post('/api/v1/master-data/categories', data);
  return response.data;
};

export const updateCategory = async (id: string, data: { id: string; name: string; description?: string; imageUrl?: string; displayOrder: number; isActive: boolean }) => {
  const response = await apiClient.put(`/api/v1/master-data/categories/${id}`, data);
  return response.data;
};

export const deleteCategory = async (id: string) => {
  const response = await apiClient.delete(`/api/v1/master-data/categories/${id}`);
  return response.data;
};

export const getPropertyTypes = async (categoryId?: string, params?: { includeInactive?: boolean }) => {
  const response = await apiClient.get('/api/v1/master-data/types', { params: { categoryId, ...params } });
  return response.data;
};

export const createPropertyType = async (data: { categoryId: string; name: string; description?: string; displayOrder: number }) => {
  const response = await apiClient.post('/api/v1/master-data/types', data);
  return response.data;
};

export const updatePropertyType = async (id: string, data: { id: string; name: string; description?: string; displayOrder: number; isActive: boolean }) => {
  const response = await apiClient.put(`/api/v1/master-data/types/${id}`, data);
  return response.data;
};

export const deletePropertyType = async (id: string) => {
  const response = await apiClient.delete(`/api/v1/master-data/types/${id}`);
  return response.data;
};

export const getStatuses = async (params?: { includeInactive?: boolean }) => {
  const response = await apiClient.get('/api/v1/master-data/statuses', { params });
  return response.data;
};

export const createStatus = async (data: { name: string; displayOrder: number }) => {
  const response = await apiClient.post('/api/v1/master-data/statuses', data);
  return response.data;
};

export const updateStatus = async (id: string, data: { id: string; name: string; displayOrder: number; isActive: boolean }) => {
  const response = await apiClient.put(`/api/v1/master-data/statuses/${id}`, data);
  return response.data;
};

export const deleteStatus = async (id: string) => {
  const response = await apiClient.delete(`/api/v1/master-data/statuses/${id}`);
  return response.data;
};

export const getConditions = async () => {
  const response = await apiClient.get('/api/v1/master-data/conditions');
  return response.data;
};

export const createCondition = async (data: { name: string }) => {
  const response = await apiClient.post('/api/v1/master-data/conditions', data);
  return response.data;
};

export const updateCondition = async (id: string, data: { id: string; name: string }) => {
  const response = await apiClient.put(`/api/v1/master-data/conditions/${id}`, data);
  return response.data;
};

export const deleteCondition = async (id: string) => {
  const response = await apiClient.delete(`/api/v1/master-data/conditions/${id}`);
  return response.data;
};

export const getAmenities = async (params?: { includeInactive?: boolean; includeDeleted?: boolean }) => {
  const response = await apiClient.get('/api/v1/master-data/amenities', { params });
  return response.data;
};

export const createAmenity = async (data: { name: string; iconUrl?: string; category: string; description?: string; displayOrder: number }) => {
  const response = await apiClient.post('/api/v1/master-data/amenities', data);
  return response.data;
};

export const updateAmenity = async (id: string, data: { id: string; name: string; iconUrl?: string; category: string; description?: string; displayOrder: number; isActive: boolean }) => {
  const response = await apiClient.put(`/api/v1/master-data/amenities/${id}`, data);
  return response.data;
};

export const deleteAmenity = async (id: string) => {
  const response = await apiClient.delete(`/api/v1/master-data/amenities/${id}`);
  return response.data;
};

// --- Audit Logs ---
export const getAuditLogs = async (params: { pageNumber: number; pageSize: number; searchTerm?: string }) => {
  const response = await apiClient.get('/api/v1/admin/audit-logs', { params });
  return response.data;
};

// --- Settings ---
export const getSettings = async () => {
  const response = await apiClient.get<{ success: boolean; data: Record<string, string> }>('/api/v1/admin/settings');
  return response.data;
};

export const updateSetting = async (key: string, value: string) => {
  const response = await apiClient.post<{ success: boolean; message: string }>('/api/v1/admin/settings', { key, value });
  return response.data;
};

// --- User Management ---
export const getUsers = async (params: { pageNumber: number; pageSize: number; searchQuery?: string }) => {
  const response = await apiClient.get('/api/v1/admin/users', { params });
  return response.data;
};

export const updateUserRoles = async (userId: string, roles: string[]) => {
  const response = await apiClient.post<{ success: boolean; message: string }>(`/api/v1/admin/users/${userId}/roles`, { roles });
  return response.data;
};

