// src/hooks/useAuth.ts
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import {
    loginAsync,
    logoutAsync,
    clearError,
    googleLoginAsync,
    facebookLoginAsync,
} from '@/store/slices/authSlice';
import { LoginRequest, GoogleLoginRequest, FacebookLoginRequest } from '@/types/auth.types';

export const useAuth = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { token, isAuthenticated, isLoading, error } = useSelector(
        (state: RootState) => state.auth
    );

    const login = useCallback(
        async (credentials: LoginRequest) => {
            await dispatch(loginAsync(credentials)).unwrap();
        },
        [dispatch]
    );

    const logout = useCallback(async () => {
        try {
            await dispatch(logoutAsync()).unwrap();
        } catch (error) {
            // Even if logout fails, we clear local state
            console.error('Logout error:', error);
        }
    }, [dispatch]);

    const googleLogin = useCallback(
        async (request: GoogleLoginRequest) => {
            await dispatch(googleLoginAsync(request)).unwrap();
        },
        [dispatch]
    );

    const facebookLogin = useCallback(
        async (request: FacebookLoginRequest) => {
            await dispatch(facebookLoginAsync(request)).unwrap();
        },
        [dispatch]
    );

    const clearAuthError = useCallback(() => {
        dispatch(clearError());
    }, [dispatch]);

    return {
        token,
        isAuthenticated,
        isLoading,
        error,
        login,
        logout,
        googleLogin,
        facebookLogin,
        clearError: clearAuthError,
    };
};
