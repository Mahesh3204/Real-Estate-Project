import apiClient from './apiClient';

export interface RoleRequestDto {
  id: string;
  userId: string;
  userName: string;
  requestedRole: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';
  reason: string;
  submittedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
}

export interface PaginatedList<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
}

export interface RoleRequestFilters {
  pageNumber?: number;
  pageSize?: number;
  status?: number;
  searchQuery?: string;
}

export const roleApi = {
  createRequest: async (requestedRoleName: string, reason: string) => {
    const response = await apiClient.post<{ 
      success: boolean; 
      message: string; 
      data: { requestId: string } 
    }>('/api/v1/roles/requests', { requestedRoleName, reason });
    return response.data;
  },

  cancelRequest: async (id: string) => {
    const response = await apiClient.post<{ 
      success: boolean; 
      message: string 
    }>(`/api/v1/roles/requests/${id}/cancel`);
    return response.data;
  },

  switchActiveRole: async (roleName: string) => {
     const response = await apiClient.post<{ 
       success: boolean; 
       data: { activeRole: string; token?: string } 
     }>('/api/v1/roles/switch-active', { roleName });
     return response.data;
   },

  getRoleRequests: async (filters: RoleRequestFilters) => {
    const response = await apiClient.get<{ 
      success: boolean; 
      data: PaginatedList<RoleRequestDto> 
    }>('/api/v1/roles/requests', { params: filters });
    return response.data;
  },

  approveRequest: async (id: string, notes: string) => {
    const response = await apiClient.post<{ 
      success: boolean; 
      message: string 
    }>(`/api/v1/roles/requests/${id}/approve`, { notes });
    return response.data;
  },

  rejectRequest: async (id: string, notes: string) => {
    const response = await apiClient.post<{ 
      success: boolean; 
      message: string 
    }>(`/api/v1/roles/requests/${id}/reject`, { notes });
    return response.data;
  },
};
