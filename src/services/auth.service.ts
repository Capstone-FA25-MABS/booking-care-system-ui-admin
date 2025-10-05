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
     * Validate email format (ReDoS-safe implementation)
     */
    static validateEmail(email: string): boolean {
        if (!email || typeof email !== 'string') {
            return false;
        }

        const parts = email.split('@');
        if (parts.length !== 2) return false;

        const [local, domainFull] = parts;
        if (!EMAIL_REGEX.LOCAL_PART.test(local)) return false;

        const domainParts = domainFull.split('.');
        if (domainParts.length < 2) return false;

        const tld = domainParts.pop()!;
        if (!EMAIL_REGEX.TLD_PART.test(tld)) return false;

        return EMAIL_REGEX.DOMAIN_PART.test(domainParts.join('.'));
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
     * Clear all auth data
     */
    static clearAuthData(): void {
        localStorage.removeItem('persist:booking-care-root');
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
    clearAuthData,
} = AuthService;

// Default export
export default AuthService;
