// src/hooks/useAuth.ts
import { useState, useEffect, useCallback } from 'react';
import { User, UserLogin, UserRegister } from '../types/user.type';
import { userService } from '../services/user.service';

export const useAuth = () => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            userService
                .getUserProfile(token)
                .then(setUser)
                .catch(() => logout())
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [token]);

    const login = async (credentials: UserLogin) => {
        const res = await userService.login(credentials);
        setToken(res.token);
        setUser(res.user);
        localStorage.setItem('token', res.token);
    };

    const register = async (data: UserRegister) => {
        const res = await userService.register(data);
        setToken(res.token);
        setUser(res.user);
        localStorage.setItem('token', res.token);
    };

    const logout = useCallback(() => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
    }, []);

    return {
        user,
        token,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
    };
};
