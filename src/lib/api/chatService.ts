import { apiClient } from './apiClient';

export interface OrderChat {
  id: string;
  order_id: string;
  is_open: boolean;
  is_litige: boolean;
  litige_resolved: boolean;
  created_at: string;
  updated_at: string;
}

export interface OrderMessage {
  id: string;
  chat_id: string;
  order_id: string;
  sender_id: string;
  sender_role: 'customer' | 'store' | 'admin';
  sender_name: string;
  content?: string;
  image_url?: string;
  content_type: 'text' | 'image';
  is_deleted: boolean;
  deleted_at?: string;
  created_at: string;
}

export const chatService = {
  getChatByOrder: async (orderId: string) => {
    return apiClient.get<OrderChat>(`/chats/order/${orderId}`);
  },

  createChat: async (orderId: string, isLitige?: boolean) => {
    return apiClient.post<OrderChat>('/chats', {
      order_id: orderId,
      is_open: true,
      is_litige: isLitige || false,
      litige_resolved: false,
    });
  },

  updateChat: async (chatId: string, data: Partial<OrderChat>) => {
    return apiClient.patch<OrderChat>(`/chats/${chatId}`, data);
  },

  resolveChat: async (chatId: string) => {
    return apiClient.patch<OrderChat>(`/chats/${chatId}`, {
      litige_resolved: true,
      is_open: false,
    });
  },

  getMessages: async (chatId: string) => {
    return apiClient.get<OrderMessage[]>(`/chats/${chatId}/messages`);
  },

  sendMessage: async (
    chatId: string,
    orderId: string,
    data: {
      sender_id: string;
      sender_role: 'customer' | 'store' | 'admin';
      sender_name: string;
      message: string;
      attachment_url?: string;
    }
  ) => {
    return apiClient.post<OrderMessage>(`/chats/${chatId}/messages`, {
      chat_id: chatId,
      order_id: orderId,
      sender_id: data.sender_id,
      sender_role: data.sender_role,
      sender_name: data.sender_name,
      content: data.message,
      image_url: data.attachment_url,
      content_type: data.attachment_url ? 'image' : 'text',
      is_deleted: false,
    });
  },

  deleteMessage: async (messageId: string) => {
    return apiClient.patch<OrderMessage>(`/messages/${messageId}`, {
      is_deleted: true,
      deleted_at: new Date().toISOString(),
    });
  },
};
