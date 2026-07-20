import apiClient from './apiClient';
import type { PropertyDto } from './propertyApi';

export interface RecentlyViewedDto {
  propertyId: string;
  title: string;
  viewedAt: string;
  property?: PropertyDto;
}

export const recentlyViewedApi = {
  getRecentlyViewed: async () => {
    const response = await apiClient.get<{ success: boolean; data: PropertyDto[] }>(
      '/api/v1/recently-viewed'
    );
    return response.data;
  },

  logRecentlyViewed: async (propertyId: string) => {
    const response = await apiClient.post<{ success: boolean }>(
      '/api/v1/recently-viewed',
      { propertyId }
    );
    return response.data;
  },

  clearRecentlyViewed: async () => {
    const response = await apiClient.delete<{ success: boolean; message: string }>(
      '/api/v1/recently-viewed'
    );
    return response.data;
  },
};
