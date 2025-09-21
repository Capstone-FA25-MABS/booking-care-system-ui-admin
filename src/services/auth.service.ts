import axiosInstance, { ApiResponse } from '@/configs/axios.config';
import {
    LoginRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    GoogleLoginRequest,
    FacebookLoginRequest,
    AuthResponse,
} from '@/types/auth.types';
import { EMAIL_REGEX, PHONE_REGEX_VN, PASSWORD_REGEX, PASSWORD_MIN_LENGTH } from '@/constants';
// Base API endpoint for auth
const AUTH_ENDPOINTS = {
    BASE: '/auth',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    GOOGLE_LOGIN: '/auth/google-login',
    FACEBOOK_LOGIN: '/auth/facebook-login',
    HEALTH: '/auth/health',
} as const;

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
            throw new Error(error.message || 'Logout failed');
        }
    }

    /**
     * Request password reset
     */
    static async forgotPassword(request: ForgotPasswordRequest): Promise<ApiResponse> {
        try {
            const response: any = await axiosInstance.post(AUTH_ENDPOINTS.FORGOT_PASSWORD, request);

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
            const response: any = await axiosInstance.post(AUTH_ENDPOINTS.RESET_PASSWORD, request);

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
        return EMAIL_REGEX.test(email);
    }

    /**
     * Validate phone number format (Vietnamese format)
     */
    static validatePhoneNumber(phone: string): boolean {
        return PHONE_REGEX_VN.test(phone);
    }

    /**
     * Validate password strength (simple boolean check)
     */
    static validatePassword(password: string): boolean {
        // Check minimum length
        if (password.length < PASSWORD_MIN_LENGTH) {
            return false;
        }

        // Use more efficient regex patterns without lookaheads to prevent ReDoS
        const hasLowercase = PASSWORD_REGEX.LOWERCASE.test(password);
        const hasUppercase = PASSWORD_REGEX.UPPERCASE.test(password);
        const hasDigit = PASSWORD_REGEX.DIGIT.test(password);
        const hasSpecialChar = PASSWORD_REGEX.SPECIAL_CHAR.test(password);

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

        if (password.length < PASSWORD_MIN_LENGTH) {
            errors.push(`Password must be at least ${PASSWORD_MIN_LENGTH} characters long`);
        }

        if (!PASSWORD_REGEX.HAS_LOWERCASE.test(password)) {
            errors.push('Password must contain at least one lowercase letter');
        }

        if (!PASSWORD_REGEX.HAS_UPPERCASE.test(password)) {
            errors.push('Password must contain at least one uppercase letter');
        }

        if (!PASSWORD_REGEX.HAS_DIGIT.test(password)) {
            errors.push('Password must contain at least one digit');
        }

        if (!PASSWORD_REGEX.HAS_SPECIAL.test(password)) {
            errors.push('Password must contain at least one special character');
        }

        return {
            isValid: errors.length === 0,
            errors,
        };
    }

    /**
     * Check if user is authenticated based on roles
     */
    static isAuthenticated(): boolean {
        const roles = this.getRoles();
        return roles.length > 0;
    }

    /**
     * Get stored roles
     */
    static getRoles(): string[] {
        const roles = localStorage.getItem('roles');
        return roles ? JSON.parse(roles) : [];
    }

    /**
     * Set roles in localStorage
     */
    static setRoles(roles: string[]): void {
        localStorage.setItem('roles', JSON.stringify(roles));
    }

    /**
     * Remove roles from localStorage
     */
    static removeRoles(): void {
        localStorage.removeItem('roles');
    }

    /**
     * Clear all auth data
     */
    static clearAuthData(): void {
        this.removeRoles();
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
    getRoles,
    setRoles,
    removeRoles,
    clearAuthData,
} = AuthService;

// Default export
export default AuthService;
