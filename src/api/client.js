const API_BASE_URL = '/api';

export const api = {
  // Chat
  startChat: async (mode, problemText, userCode) => {
    const response = await fetch(`${API_BASE_URL}/chat/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode, problemText, userCode }),
    });
    if (!response.ok) throw new Error('Failed to start chat');
    return response.json();
  },

  sendMessage: async (conversationId, content) => {
    const response = await fetch(`${API_BASE_URL}/chat/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversationId, content }),
    });
    if (!response.ok) throw new Error('Failed to send message');
    return response.json();
  },

  // History
  getHistory: async () => {
    const response = await fetch(`${API_BASE_URL}/history`);
    if (!response.ok) throw new Error('Failed to fetch history');
    return response.json();
  },

  getConversation: async (id) => {
    const response = await fetch(`${API_BASE_URL}/history/${id}`);
    if (!response.ok) throw new Error('Failed to fetch conversation');
    return response.json();
  },
};
