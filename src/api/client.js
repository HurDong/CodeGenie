import { Capacitor } from '@capacitor/core';

const API_BASE_URL = Capacitor.isNativePlatform() ? 'http://10.0.2.2:8080/api' : '/api';

const getHeaders = () => {
  const token = localStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

const handleAuthError = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('user');
  localStorage.removeItem('isLoggedIn');
  window.location.href = '/';
};

const mockApiResponse = async (url, options) => {
  console.log(`[Mock API] ${options.method || 'GET'} ${url}`);
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));

  let data = null;
  const isJsonCheck = true; // Most endpoints follow { status: 'success', data: ... }

  if (url.includes('/history') && !url.includes('/history/')) {
      data = [
         { id: 'mock_chat_1', title: 'Admin Mode Test', mode: 'understanding_summary', updatedAt: new Date().toISOString(), messages: [] }
      ];
  } else if (url.includes('/chat/start')) {
      const body = JSON.parse(options.body);
      data = {
          id: 'mock_chat_' + Date.now(),
          title: body.title || 'New Chat',
          mode: body.mode,
          messages: [],
          updatedAt: new Date().toISOString()
      };
  } else if (url.includes('/chat/message')) {
      const body = JSON.parse(options.body);
      data = {
          id: 'msg_' + Date.now(),
          role: 'assistant',
          content: `[Admin Mode] I received: "${body.content}". Backend is bypassed.`,
          timestamp: new Date().toISOString()
      };
  } else if (url.includes('/execute')) {
      // Execute endpoint does NOT wrap in { status: success, data: ... } based on client.js usage
      const result = {
          output: "Execution simulated in Admin Mode.\nNo real code was run.",
          exitCode: 0,
          executionTimeMs: 10
      };
      return {
          ok: true,
          status: 200,
          json: async () => result
      };
  }

  return {
    ok: true,
    status: 200,
    json: async () => ({ status: 'success', data: data })
  };
};

const fetchWithAuth = async (url, options = {}) => {
  const token = localStorage.getItem('accessToken');
  
  // Intercept Mock Token requests
  if (token && token.startsWith('mock_dev_token_')) {
      return mockApiResponse(url, { ...options, body: options.body });
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...getHeaders(),
      ...options.headers
    }
  });

  if (response.status === 401) {
    handleAuthError();
    throw new Error('Session expired');
  }

  return response;
};

export const api = {
  // Chat
  startChat: async (mode, problemText, userCode, title) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/chat/start`, {
      method: 'POST',
      body: JSON.stringify({ mode, problemText, userCode, title }),
    });
    if (!response.ok) throw new Error('Failed to start chat');
    const result = await response.json();
    if (result.status === 'error') throw new Error(result.message);
    return result.data;
  },

  sendMessage: async (conversationId, content) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/chat/message`, {
      method: 'POST',
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
    const response = await fetchWithAuth(`${API_BASE_URL}/chat/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update conversation');
    const result = await response.json();
    if (result.status === 'error') throw new Error(result.message);
    return result.data;
  },

  deleteConversation: async (id) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/chat/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete conversation');
    const result = await response.json();
    if (result.status === 'error') throw new Error(result.message);
    return result.data;
  },

  // History
  getHistory: async () => {
    const response = await fetchWithAuth(`${API_BASE_URL}/history`);
    if (!response.ok) throw new Error('Failed to fetch history');
    const result = await response.json();
    if (result.status === 'error') throw new Error(result.message);
    return result.data;
  },

  getConversation: async (id) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/history/${id}`);
    if (!response.ok) throw new Error('Failed to fetch conversation');
    const result = await response.json();
    if (result.status === 'error') throw new Error(result.message);
    return result.data;
  },

  // Code Execution
  executeCode: async (language, code, testCases) => {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/execute`, {
        method: 'POST',
        body: JSON.stringify({ language, code, testCases }),
      });
      return await response.json();
    } catch (error) {
      console.error('Error executing code:', error);
      throw error;
    }
  }
};
