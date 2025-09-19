import axiosInstance, { ApiResponse } from '@/configs/axios.config';
import {
    LoginRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    GoogleLoginRequest,
    FacebookLoginRequest,
    AuthResponse,
} from '@/types/auth.types';
// Base API endpoint for auth
const AUTH_ENDPOINTS = {
    BASE: '/auth',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    GOOGLE_LOGIN: '/auth/google-login',
    FACEBOOK_LOGIN: '/auth/facebook-login',
    HEALTH: '/auth/health',
} as const;

import { API_ENDPOINTS, PASSWORD_VALIDATION_DETAILS } from '@/constants/validation';

/**
 * Auth Service
 * Handles all authentication-related API operations
 */
export class AuthService {
    /**
     * Health check endpoint
     */
    static async healthCheck(): Promise<ApiResponse> {
        try {
            const response: any = await axiosInstance.get(AUTH_ENDPOINTS.HEALTH);
            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message,
            };
        } catch (error: any) {
            throw new Error(error.message || 'Health check failed');
        }
    }

    /**
     * Login user with email/phone and password
     */
    static async login(credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> {
        try {
            const response: any = await axiosInstance.post(AUTH_ENDPOINTS.LOGIN, credentials);

            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Login successful',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Login failed');
        }
    }

    /**
     * Logout user and invalidate refresh token
     */
    static async logout(): Promise<ApiResponse> {
        try {
            const response: any = await axiosInstance.post(AUTH_ENDPOINTS.LOGOUT);

            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Logout successful',
            };
        } catch (error: any) {
            throw {
                success: false,
                message: error.message || 'Logout failed',
                data: null,
            };
        }
    }

    /**
     * Request password reset
     */
    static async forgotPassword(request: ForgotPasswordRequest): Promise<ApiResponse> {
        try {
            const response: any = await axiosInstance.post(API_ENDPOINTS.FORGOT_PASSWORD, request);

            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'If the account exists, instructions have been sent',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Password reset request failed');
        }
    }

    /**
     * Reset password with token
     */
    static async resetPassword(request: ResetPasswordRequest): Promise<ApiResponse> {
        try {
            const response: any = await axiosInstance.post(API_ENDPOINTS.RESET_PASSWORD, request);

            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Password reset successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Password reset failed');
        }
    }

    /**
     * Validate email format
     */
    static validateEmail(email: string): boolean {
        //const emailRegex = ;
        //return emailRegex.test(email);
        return email ? true : false;
    }

    /**
     * Validate phone number format (Vietnamese format)
     */
    static validatePhoneNumber(phone: string): boolean {
        const phoneRegex = /^0\d{9}$/;
        return phoneRegex.test(phone);
    }

    /**
     * Validate password strength (simple boolean check)
     */
    static validatePassword(password: string): boolean {
        // Check minimum length
        if (password.length < 8) {
            return false;
        }

        // Use more efficient regex patterns without lookaheads to prevent ReDoS
        const hasLowercase = /[a-z]/.test(password);
        const hasUppercase = /[A-Z]/.test(password);
        const hasDigit = /\d/.test(password);
        const hasSpecialChar = /[@$!%*?&]/.test(password);

        return hasLowercase && hasUppercase && hasDigit && hasSpecialChar;
    }

    /**
     * Validate password strength with detailed errors
     */
    static validatePasswordDetailed(password: string): {
        isValid: boolean;
        errors: string[];
    } {
        const errors: string[] = [];

        if (password.length < 8) {
            errors.push(PASSWORD_VALIDATION_DETAILS.MIN_LENGTH);
        }

        // Use efficient regex patterns without lookaheads to prevent ReDoS
        if (!/[a-z]/.test(password)) {
            errors.push(PASSWORD_VALIDATION_DETAILS.LOWERCASE_REQUIRED);
        }

        if (!/[A-Z]/.test(password)) {
            errors.push(PASSWORD_VALIDATION_DETAILS.UPPERCASE_REQUIRED);
        }

        if (!/\d/.test(password)) {
            errors.push(PASSWORD_VALIDATION_DETAILS.DIGIT_REQUIRED);
        }

        if (!/[@$!%*?&]/.test(password)) {
            errors.push(PASSWORD_VALIDATION_DETAILS.SPECIAL_CHAR_REQUIRED);
        }

        return {
            isValid: errors.length === 0,
            errors,
        };
    }

    /**
     * Check if user is authenticated
     */
    static isAuthenticated(): boolean {
        const token = localStorage.getItem('token');
        return !!token;
    }

    /**
     * Get stored token
     */
    static getToken(): string | null {
        return localStorage.getItem('token');
    }

    /**
     * Set token in localStorage
     */
    static setToken(token: string): void {
        localStorage.setItem('token', token);
    }

    /**
     * Remove token from localStorage
     */
    static removeToken(): void {
        localStorage.removeItem('token');
    }

    /**
     * Clear all auth data
     */
    static clearAuthData(): void {
        this.removeToken();
    }

    /**
     * Authenticate with Google ID token
     */
    static async googleLogin(request: GoogleLoginRequest): Promise<ApiResponse<AuthResponse>> {
        try {
            const response: any = await axiosInstance.post(AUTH_ENDPOINTS.GOOGLE_LOGIN, request);
            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Google login successful',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Google login failed');
        }
    }

    /**
     * Authenticate with Facebook access token
     */
    static async facebookLogin(request: FacebookLoginRequest): Promise<ApiResponse<AuthResponse>> {
        try {
            const response: any = await axiosInstance.post(AUTH_ENDPOINTS.FACEBOOK_LOGIN, request);
            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Facebook login successful',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Facebook login failed');
        }
    }
}

// Export individual methods for convenience
export const {
    healthCheck,
    login,
    logout,
    forgotPassword,
    resetPassword,
    googleLogin,
    facebookLogin,
    validateEmail,
    validatePhoneNumber,
    validatePassword,
    isAuthenticated,
    getToken,
    setToken,
    removeToken,
    clearAuthData,
} = AuthService;

// Default export
export default AuthService;
