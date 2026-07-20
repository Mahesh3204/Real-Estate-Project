import apiClient from './apiClient';
import type { PropertyDto } from './propertyApi';

export interface FavoriteDto {
  id: string;
  userId: string;
  propertyId: string;
  createdAt: string;
  property?: PropertyDto;
}

export const favoritesApi = {
  getFavorites: async () => {
    const response = await apiClient.get<{ success: boolean; data: PropertyDto[] }>(
      '/api/v1/favorites'
    );
    return response.data;
  },

  addFavorite: async (propertyId: string) => {
    const response = await apiClient.post<{ success: boolean; message: string }>(
      '/api/v1/favorites',
      { propertyId }
    );
    return response.data;
  },

  removeFavorite: async (propertyId: string) => {
    const response = await apiClient.delete<{ success: boolean; message: string }>(
      `/api/v1/favorites/${propertyId}`
    );
    return response.data;
  },

  getFavoriteCount: async () => {
    const response = await apiClient.get<{ success: boolean; data: number }>(
      '/api/v1/favorites/count'
    );
    return response.data;
  },
};
