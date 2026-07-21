import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface MessageDto {
  id: string;
  conversationId: string;
  senderId: string;
  senderName?: string;
  content: string;
  contentType: number; // 0 = Text, 1 = Image, 2 = File, 3 = OfferCard
  isRead: boolean;
  isDelivered: boolean;
  createdAt: string;
}

export interface ConversationDto {
  id: string;
  propertyId: string;
  buyerId: string;
  sellerId: string;
  buyerName?: string;
  sellerName?: string;
  createdAt: string;
  lastMessageAt: string;
  propertyName?: string;
  lastMessageContent?: string;
  unreadCount: number;
}

interface ChatState {
  conversations: ConversationDto[];
  messages: { [conversationId: string]: MessageDto[] };
  currentConversationId: string | null;
  typingUsers: { [conversationId: string]: string[] }; // userIds currently typing
  connectionState: 'Connected' | 'Disconnected' | 'Connecting';
}

const initialState: ChatState = {
  conversations: [],
  messages: {},
  currentConversationId: null,
  typingUsers: {},
  connectionState: 'Disconnected',
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setConversations(state, action: PayloadAction<ConversationDto[]>) {
      state.conversations = action.payload;
    },
    updateConversation(state, action: PayloadAction<ConversationDto>) {
      const idx = state.conversations.findIndex((c) => c.id === action.payload.id);
      if (idx !== -1) {
        state.conversations[idx] = action.payload;
      } else {
        state.conversations.unshift(action.payload);
      }
      // Sort conversations by lastMessageAt descending
      state.conversations.sort(
        (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
      );
    },
    setCurrentConversationId(state, action: PayloadAction<string | null>) {
      state.currentConversationId = action.payload;
      if (action.payload) {
        // Clear unread count for the active conversation
        const idx = state.conversations.findIndex((c) => c.id === action.payload);
        if (idx !== -1) {
          state.conversations[idx].unreadCount = 0;
        }
      }
    },
    setMessages(state, action: PayloadAction<{ conversationId: string; messages: MessageDto[] }>) {
      state.messages[action.payload.conversationId] = action.payload.messages;
    },
    addMessage(state, action: PayloadAction<MessageDto>) {
      const { conversationId } = action.payload;
      if (!state.messages[conversationId]) {
        state.messages[conversationId] = [];
      }
      // Avoid duplicate messages
      if (!state.messages[conversationId].some((m) => m.id === action.payload.id)) {
        state.messages[conversationId].push(action.payload);
      }

      // Update last message details in conversations list
      const idx = state.conversations.findIndex((c) => c.id === conversationId);
      if (idx !== -1) {
        state.conversations[idx].lastMessageAt = action.payload.createdAt;
        state.conversations[idx].lastMessageContent = action.payload.content;
        if (state.currentConversationId !== conversationId && action.payload.senderId !== state.conversations[idx].buyerId) {
          state.conversations[idx].unreadCount += 1;
        }
      }
    },
    setConnectionState(state, action: PayloadAction<'Connected' | 'Disconnected' | 'Connecting'>) {
      state.connectionState = action.payload;
    },
    setUserTyping(
      state,
      action: PayloadAction<{ conversationId: string; userId: string; isTyping: boolean }>
    ) {
      const { conversationId, userId, isTyping } = action.payload;
      if (!state.typingUsers[conversationId]) {
        state.typingUsers[conversationId] = [];
      }
      if (isTyping) {
        if (!state.typingUsers[conversationId].includes(userId)) {
          state.typingUsers[conversationId].push(userId);
        }
      } else {
        state.typingUsers[conversationId] = state.typingUsers[conversationId].filter(
          (id) => id !== userId
        );
      }
    },
    markMessagesAsRead(state, action: PayloadAction<string>) {
      const conversationId = action.payload;
      if (state.messages[conversationId]) {
        state.messages[conversationId] = state.messages[conversationId].map((m) => ({
          ...m,
          isRead: true,
        }));
      }
      const idx = state.conversations.findIndex((c) => c.id === conversationId);
      if (idx !== -1) {
        state.conversations[idx].unreadCount = 0;
      }
    },
  },
});

export const {
  setConversations,
  updateConversation,
  setCurrentConversationId,
  setMessages,
  addMessage,
  setConnectionState,
  setUserTyping,
  markMessagesAsRead,
} = chatSlice.actions;

export default chatSlice.reducer;
