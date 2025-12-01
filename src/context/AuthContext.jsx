import React, { createContext, useState, useEffect, useContext } from 'react';
import * as authService from '../api/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
            setUser(currentUser);
            setIsLoggedIn(true);
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const data = await authService.login(email, password);
            setUser(data);
            setIsLoggedIn(true);
            return data;
        } catch (error) {
            throw error;
        }
    };

    const register = async (email, password, name) => {
        try {
            const data = await authService.register(email, password, name);
            setUser(data);
            setIsLoggedIn(true);
            return data;
        } catch (error) {
            throw error;
        }
    };

    const loginWithToken = (accessToken, refreshToken, userData) => {
        const user = { ...userData, accessToken, refreshToken };
        authService.setSession(accessToken, user);
        setUser(user);
        setIsLoggedIn(true);
    };

    const logout = () => {
        authService.logout();
        setUser(null);
        setIsLoggedIn(false);
    };

    return (
        <AuthContext.Provider value={{ user, isLoggedIn, login, register, loginWithToken, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
