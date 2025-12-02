const API_BASE_URL = '/api';

const getHeaders = () => {
  const token = localStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const api = {
  // Chat
  startChat: async (mode, problemText, userCode, title) => {
    const response = await fetch(`${API_BASE_URL}/chat/start`, {
      method: 'POST',
      headers: getHeaders(),
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
      headers: getHeaders(),
      body: JSON.stringify({ conversationId, content }),
    });
    if (!response.ok) {
      let errorMessage = 'Failed to send message';
      try {
        const result = await response.json();
        if (result.message) errorMessage = result.message;
      } catch (e) {
        // ignore
      }
      throw new Error(errorMessage);
    }
    const result = await response.json();
    if (result.status === 'error') throw new Error(result.message);
    return result.data;
  },

  updateConversation: async (id, data) => {
    const response = await fetch(`${API_BASE_URL}/chat/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update conversation');
    const result = await response.json();
    if (result.status === 'error') throw new Error(result.message);
    return result.data;
  },

  deleteConversation: async (id) => {
    const response = await fetch(`${API_BASE_URL}/chat/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete conversation');
    const result = await response.json();
    if (result.status === 'error') throw new Error(result.message);
    return result.data;
  },

  // History
  getHistory: async () => {
    const response = await fetch(`${API_BASE_URL}/history`, {
      headers: getHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch history');
    const result = await response.json();
    if (result.status === 'error') throw new Error(result.message);
    return result.data;
  },

  getConversation: async (id) => {
    const response = await fetch(`${API_BASE_URL}/history/${id}`, {
      headers: getHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch conversation');
    const result = await response.json();
    if (result.status === 'error') throw new Error(result.message);
    return result.data;
  },

  // Code Execution
  executeCode: async (language, code, testCases) => {
    try {
      const response = await fetch(`${API_BASE_URL}/execute`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ language, code, testCases }),
      });
    } catch (error) {
      console.error('Error executing code:', error);
      throw error;
    }
  }
};
