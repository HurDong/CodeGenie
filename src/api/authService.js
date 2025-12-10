import { Capacitor } from '@capacitor/core';
import toast from 'react-hot-toast';



// DEBUG: Force Emulator URL for testing
const API_BASE_URL = Capacitor.isNativePlatform() ? 'http://10.0.2.2:8080/api/auth' : '/api/auth';
// alert(`Current Platform: ${Capacitor.getPlatform()}, URL: ${API_BASE_URL}`); // Uncomment for debugging

const getHeaders = () => {
    const token = localStorage.getItem('accessToken');
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
};


export const register = async (email, password, name) => {
    try {
        const response = await fetch(`${API_BASE_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, name }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            let errorMessage;
            try {
                const error = JSON.parse(errorText);
                errorMessage = error.message || 'Registration failed';
            } catch (e) {
                errorMessage = errorText || `Registration failed (${response.status})`;
            }
            throw new Error(errorMessage);
        }

        const data = await response.json();
        const user = { email: data.email, name: data.name };
        setSession(data.accessToken, user);
        return user;
    } catch (error) {
        console.error(`Request Failed: ${API_BASE_URL}/register`, error);
        throw error;
    }
};

export const login = async (email, password) => {
    // Dev Bypass
    if (email === 'admin' && password === 'admin') {
        const user = { email: 'admin@codegenie.com', name: 'Admin Developer' };
        setSession('mock_dev_token_' + Date.now(), user);
        toast.success('관리자 모드로 접속합니다.');
        return user;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            let errorMessage;
            try {
                const error = JSON.parse(errorText);
                errorMessage = error.message || 'Login failed';
            } catch (e) {
                errorMessage = errorText || `Login failed (${response.status})`;
            }
            throw new Error(errorMessage);
        }

        const data = await response.json();
        const user = { email: data.email, name: data.name };
        setSession(data.accessToken, user);
        return user;
    } catch (error) {
        console.error(`Request Failed: ${API_BASE_URL}/login`, error);
        throw error;
    }
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
