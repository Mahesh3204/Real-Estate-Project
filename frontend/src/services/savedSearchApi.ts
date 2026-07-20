import apiClient from './apiClient';

export interface SavedSearchDto {
  id: string;
  userId: string;
  name: string;
  queryParameters: string;
  createdDate: string;
}

export interface CreateSavedSearchDto {
  name: string;
  queryParameters: string;
}

export const savedSearchApi = {
  getSavedSearches: async () => {
    const response = await apiClient.get<{ success: boolean; data: SavedSearchDto[] }>(
      '/api/v1/saved-searches'
    );
    return response.data;
  },

  createSavedSearch: async (data: CreateSavedSearchDto) => {
    const response = await apiClient.post<{ success: boolean; data: { id: string } }>(
      '/api/v1/saved-searches',
      data
    );
    return response.data;
  },

  deleteSavedSearch: async (id: string) => {
    const response = await apiClient.delete<{ success: boolean; message: string }>(
      `/api/v1/saved-searches/${id}`
    );
    return response.data;
  },
};
