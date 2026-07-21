import apiClient from './apiClient';

// ── Inquiry ──────────────────────────────────────────────────────────────────

export interface CreateInquiryPayload {
  propertyId: string;
  message: string;
  contactPhone?: string;
  contactEmail?: string;
}

export interface InquiryDto {
  id: string;
  propertyId: string;
  propertyName?: string;
  buyerId: string;
  buyerName?: string;
  message: string;
  contactPhone?: string;
  contactEmail?: string;
  status: number; // 0=Pending, 1=Replied, 2=Closed
  replyMessage?: string;
  createdAt: string;
  isDeleted: boolean;
}

export const inquiryApi = {
  create: (payload: CreateInquiryPayload) =>
    apiClient.post<InquiryDto>('/api/inquiries', payload),

  getAll: (params?: { propertyId?: string; status?: number }) =>
    apiClient.get<InquiryDto[]>('/api/inquiries', { params }),

  reply: (id: string, replyMessage: string) =>
    apiClient.post(`/api/inquiries/${id}/reply`, { replyMessage }),

  updateStatus: (id: string, status: number) =>
    apiClient.put(`/api/inquiries/${id}/status`, { status }),

  softDelete: (id: string) =>
    apiClient.delete(`/api/inquiries/${id}`),
};

// ── Appointment ───────────────────────────────────────────────────────────────

export interface BookAppointmentPayload {
  propertyId: string;
  scheduledAt: string;
  notes?: string;
  numberOfVisitors?: number;
}

export interface AppointmentDto {
  id: string;
  propertyId: string;
  propertyName?: string;
  propertyAddress?: string;
  buyerId: string;
  buyerName?: string;
  sellerId: string;
  scheduledAt: string;
  notes?: string;
  numberOfVisitors: number;
  status: number; // 0=Pending, 1=Approved, 2=Rejected, 3=Cancelled, 4=Completed
  createdAt: string;
}

export const appointmentApi = {
  book: (payload: BookAppointmentPayload) =>
    apiClient.post<AppointmentDto>('/api/appointments', payload),

  getAll: (params?: { propertyId?: string; status?: number }) =>
    apiClient.get<AppointmentDto[]>('/api/appointments', { params }),

  updateStatus: (id: string, status: number, reason?: string) =>
    apiClient.put(`/api/appointments/${id}/status`, { status, reason }),
};

// ── Chat ──────────────────────────────────────────────────────────────────────

export interface ConversationDto {
  id: string;
  propertyId: string;
  propertyName?: string;
  buyerId: string;
  sellerId: string;
  buyerName?: string;
  sellerName?: string;
  createdAt: string;
  lastMessageAt: string;
  lastMessageContent?: string;
  unreadCount: number;
}

export interface MessageDto {
  id: string;
  conversationId: string;
  senderId: string;
  senderName?: string;
  content: string;
  contentType: number; // 0=Text, 1=Image, 2=File, 3=OfferCard
  isRead: boolean;
  isDelivered: boolean;
  createdAt: string;
}

export const chatApi = {
  getOrCreateConversation: (propertyId: string, sellerId: string) =>
    apiClient.post<ConversationDto>('/api/chat/conversations', { propertyId, sellerId }),

  getConversations: (params?: { search?: string }) =>
    apiClient.get<ConversationDto[]>('/api/chat/conversations', { params }),

  getMessages: (conversationId: string, params?: { page?: number; pageSize?: number }) =>
    apiClient.get<MessageDto[]>(`/api/chat/conversations/${conversationId}/messages`, { params }),

  sendMessage: (conversationId: string, content: string, contentType: number = 0) =>
    apiClient.post<MessageDto>(`/api/chat/conversations/${conversationId}/messages`, { content, contentType }),

  markAsRead: (conversationId: string) =>
    apiClient.post(`/api/chat/conversations/${conversationId}/read`),
};

// ── Offers ────────────────────────────────────────────────────────────────────

export interface SubmitOfferPayload {
  propertyId: string;
  amount: number;
  message?: string;
  validUntil?: string;
}

export interface CounterOfferPayload {
  amount: number;
  message?: string;
  validUntil?: string;
}

export interface OfferDto {
  id: string;
  propertyId: string;
  propertyName?: string;
  buyerId: string;
  buyerName?: string;
  sellerId: string;
  amount: number;
  message?: string;
  status: number; // 0=Pending, 1=Accepted, 2=Rejected, 3=Countered, 4=Withdrawn
  counterOfferAmount?: number;
  counterOfferMessage?: string;
  validUntil?: string;
  createdAt: string;
  updatedAt?: string;
  parentOfferId?: string;
}

export const offerApi = {
  submit: (payload: SubmitOfferPayload) =>
    apiClient.post<OfferDto>('/api/offers', payload),

  getOffers: (params?: { propertyId?: string }) =>
    apiClient.get<OfferDto[]>('/api/offers', { params }),

  getNegotiationTimeline: (propertyId: string) =>
    apiClient.get<OfferDto[]>(`/api/offers/timeline/${propertyId}`),

  counter: (offerId: string, payload: CounterOfferPayload) =>
    apiClient.post<OfferDto>(`/api/offers/${offerId}/counter`, payload),

  updateStatus: (offerId: string, status: number) =>
    apiClient.put(`/api/offers/${offerId}/status`, { status }),
};

// ── Notifications ─────────────────────────────────────────────────────────────

export interface NotificationDto {
  id: string;
  recipientId: string;
  type: number;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export const notificationApi = {
  getAll: () =>
    apiClient.get<NotificationDto[]>('/api/notifications'),

  markAsRead: (id: string) =>
    apiClient.post(`/api/notifications/${id}/read`),

  markAllAsRead: () =>
    apiClient.post('/api/notifications/read-all'),
};

// ── Reviews ───────────────────────────────────────────────────────────────────

export interface SubmitReviewPayload {
  propertyId: string;
  sellerId: string;
  rating: number;
  comment: string;
  imageUrls?: string[];
}

export interface ReviewDto {
  id: string;
  propertyId: string;
  sellerId: string;
  buyerId: string;
  buyerName?: string;
  buyerAvatarUrl?: string;
  rating: number;
  comment: string;
  imageUrls?: string[];
  replyMessage?: string;
  replyAt?: string;
  isReported: boolean;
  createdAt: string;
}

export interface ReviewSummaryDto {
  averageRating: number;
  totalReviews: number;
  distribution: { [star: number]: number };
  reviews: ReviewDto[];
}

export const reviewApi = {
  submit: (payload: SubmitReviewPayload) =>
    apiClient.post<ReviewDto>('/api/reviews', payload),

  getReviews: (params: { sellerId?: string; propertyId?: string }) =>
    apiClient.get<ReviewSummaryDto>('/api/reviews', { params }),

  reply: (reviewId: string, replyMessage: string) =>
    apiClient.post(`/api/reviews/${reviewId}/reply`, { replyMessage }),

  report: (reviewId: string, reason: string) =>
    apiClient.post(`/api/reviews/${reviewId}/report`, { reason }),
};
