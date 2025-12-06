import { Capacitor } from '@capacitor/core';

const API_BASE_URL = Capacitor.isNativePlatform() ? 'http://10.0.2.2:8080/api/auth' : '/api/auth';

const getHeaders = () => {
    const token = localStorage.getItem('accessToken');
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
};

export const register = async (email, password, name) => {
    const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
    }

    const data = await response.json();
    const user = { email: data.email, name: data.name };
    setSession(data.accessToken, user);
    return user;
};

export const login = async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
    }

    const data = await response.json();
    const user = { email: data.email, name: data.name };
    setSession(data.accessToken, user);
    return user;
};

export const updateProfile = async (name, email) => {
    const response = await fetch(`${API_BASE_URL}/profile`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ name, email }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Profile update failed');
    }

    const data = await response.json();
    const user = { email: data.email, name: data.name };

    // Update session if new token is provided
    if (data.accessToken) {
        setSession(data.accessToken, user);
    } else {
        // Update user in local storage
        const currentUser = getCurrentUser();
        const updatedUser = { ...currentUser, ...user };
        localStorage.setItem('user', JSON.stringify(updatedUser));
    }

    return user;
};

export const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
};

export const getCurrentUser = () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
        return JSON.parse(userStr);
    } catch (e) {
        return null;
    }
};

export const setSession = (accessToken, user) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('isLoggedIn', 'true');
};
