import apiClient from './apiClient';
import type { PropertyDto } from './propertyApi';

export interface PublicProfileDto {
  userId: string;
  firstName: string;
  lastName: string;
  company?: string;
  bio?: string;
  phoneNumber?: string;
  email?: string;
  profileImageUrl?: string;
  joinedDate: string;
  totalListings: number;
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    whatsapp?: string;
    linkedin?: string;
    instagram?: string;
  };
  publishedProperties: PropertyDto[];
}

export const profileApi = {
  getPublicProfile: async (userId: string) => {
    const response = await apiClient.get<{ success: boolean; data: any }>(
      `/api/v1/profiles/${userId}`
    );
    return response.data;
  },
};
