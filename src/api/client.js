const API_BASE_URL = '/api';

export const api = {
  // Chat
  startChat: async (mode, problemText, userCode, title) => {
    const response = await fetch(`${API_BASE_URL}/chat/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode, problemText, userCode, title }),
    });
    if (!response.ok) throw new Error('Failed to start chat');
    const result = await response.json();
    if (result.status === 'error') throw new Error(result.message);
    return result.data;
  },

  sendMessage: async (conversationId, content) => {
    const response = await fetch(`${API_BASE_URL}/chat/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversationId, content }),
    });
    if (!response.ok) throw new Error('Failed to send message');
    const result = await response.json();
    if (result.status === 'error') throw new Error(result.message);
    return result.data;
  },

  updateConversation: async (id, data) => {
    const response = await fetch(`${API_BASE_URL}/chat/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update conversation');
    const result = await response.json();
    if (result.status === 'error') throw new Error(result.message);
    return result.data;
  },

  // History
  getHistory: async () => {
    const response = await fetch(`${API_BASE_URL}/history`);
    if (!response.ok) throw new Error('Failed to fetch history');
    const result = await response.json();
    if (result.status === 'error') throw new Error(result.message);
    return result.data;
  },

  getConversation: async (id) => {
    const response = await fetch(`${API_BASE_URL}/history/${id}`);
    if (!response.ok) throw new Error('Failed to fetch conversation');
    const result = await response.json();
    if (result.status === 'error') throw new Error(result.message);
    return result.data;
  },
};
