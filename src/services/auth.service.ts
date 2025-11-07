import axiosInstance, { ApiResponse } from '@/configs/axios.config';
import {
    LoginRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    GoogleLoginRequest,
    FacebookLoginRequest,
    AuthResponse,
    AccountManagementResponse,
    RegisterDoctorRequest,
} from '@/types/auth.types';
import { EMAIL_REGEX, PHONE_REGEX_VN, PASSWORD_REGEX, PASSWORD_MIN_LENGTH } from '@/constants';
import { Role } from '@/enums/common.enums';
// Base API endpoint for auth
const AUTH_ENDPOINTS = {
    BASE: '/auth',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REGISTER_DOCTOR: '/auth/register/doctor-saga',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    GOOGLE_LOGIN: '/auth/google-login',
    FACEBOOK_LOGIN: '/auth/facebook-login',
    HEALTH: '/auth/health',
    ADMIN_ACCOUNTS: '/auth/admin/accounts',
    HOSPITAL_DOCTORS: (hospitalId: string) => `/auth/hospital/${hospitalId}/doctors`,
    BAN_UNBAN_ACCOUNT: (id: string) => `/auth/accounts/${id}/ban-unban`,
    LOCK_ACCOUNT: (id: string) => `/auth/accounts/${id}/lock`,
    UNLOCK_ACCOUNT: (id: string) => `/auth/accounts/${id}/unlock`,
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

    /**
     * Get accounts by role for admin management
     * @param role - The role to filter accounts (PATIENT/DOCTOR/STAFF)
     * @param pageNumber - Page number for pagination (default: 1)
     * @param pageSize - Number of items per page (default: 10)
     * @param searchTerm - Search term for filtering by name or email
     * @param sortBy - Sort field (FullName/Email/CreatedAt/Status)
     * @param sortOrder - Sort order (asc/desc)
     */
    static async getAccountsByRole(
        role: Role,
        pageNumber: number = 1,
        pageSize: number = 10,
        searchTerm?: string,
        sortBy: string = 'CreatedAt',
        sortOrder: 'asc' | 'desc' = 'desc'
    ): Promise<ApiResponse<AccountManagementResponse>> {
        try {
            // Map role enum to backend expected format (Patient/Doctor/Staff)
            const roleMap: Record<Role, string> = {
                [Role.PATIENT]: 'Patient',
                [Role.DOCTOR]: 'Doctor',
                [Role.STAFF]: 'Staff',
                [Role.ADMIN]: 'Admin',
            };

            const response: any = await axiosInstance.get(AUTH_ENDPOINTS.ADMIN_ACCOUNTS, {
                params: {
                    role: roleMap[role],
                    pageNumber,
                    pageSize,
                    searchTerm,
                    sortBy,
                    sortOrder,
                },
            });

            return {
                success: response.success ?? true,
                data: response.data,
                message: response.message || 'Accounts retrieved successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to fetch accounts');
        }
    }

    /**
     * Get doctors by hospital ID (for Staff role to manage their hospital's doctors)
     * @param hospitalId - Hospital ID
     * @param pageNumber - Page number for pagination (default: 1)
     * @param pageSize - Number of items per page (default: 10)
     * @param searchTerm - Search term for filtering by name or email
     * @param sortBy - Sort field (FullName/Email/CreatedAt/Status)
     * @param sortOrder - Sort order (asc/desc)
     */
    static async getDoctorsByHospital(
        hospitalId: string,
        pageNumber: number = 1,
        pageSize: number = 10,
        searchTerm?: string,
        sortBy: string = 'CreatedAt',
        sortOrder: 'asc' | 'desc' = 'desc'
    ): Promise<ApiResponse<AccountManagementResponse>> {
        try {
            const response: any = await axiosInstance.get(
                AUTH_ENDPOINTS.HOSPITAL_DOCTORS(hospitalId),
                {
                    params: {
                        pageNumber,
                        pageSize,
                        searchTerm,
                        sortBy,
                        sortOrder,
                    },
                }
            );

            return {
                success: response.success ?? true,
                data: response.data,
                message: response.message || 'Doctors retrieved successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to fetch doctors');
        }
    }

    /**
     * Ban/Unban account (toggle ACTIVE/INACTIVE status)
     * @param accountId - Account ID to ban/unban
     */
    static async toggleBanUnbanAccount(accountId: string): Promise<ApiResponse<void>> {
        try {
            const response: any = await axiosInstance.post(
                AUTH_ENDPOINTS.BAN_UNBAN_ACCOUNT(accountId)
            );

            return {
                success: response.success ?? true,
                data: response.data,
                message: response.message || 'Account status toggled successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to toggle account status');
        }
    }

    /**
     * Lock account
     * @param accountId - Account ID to lock
     */
    static async lockAccount(accountId: string): Promise<ApiResponse<void>> {
        try {
            const response: any = await axiosInstance.post(AUTH_ENDPOINTS.LOCK_ACCOUNT(accountId));

            return {
                success: response.success ?? true,
                data: response.data,
                message: response.message || 'Account locked successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to lock account');
        }
    }

    /**
     * Unlock account
     * @param accountId - Account ID to unlock
     */
    static async unlockAccount(accountId: string): Promise<ApiResponse<void>> {
        try {
            const response: any = await axiosInstance.post(
                AUTH_ENDPOINTS.UNLOCK_ACCOUNT(accountId)
            );

            return {
                success: response.success ?? true,
                data: response.data,
                message: response.message || 'Account unlocked successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to unlock account');
        }
    }

    /**
     * Register new doctor account using Saga pattern
     */
    static async registerDoctor(request: RegisterDoctorRequest): Promise<ApiResponse> {
        try {
            const axiosResponse: any = await axiosInstance.post(
                AUTH_ENDPOINTS.REGISTER_DOCTOR,
                request
            );

            // Axios wraps response in .data property
            const response = axiosResponse.data || axiosResponse;

            // Check if saga failed (status: "Failed")
            if (response.status === 'Failed' || response.success === false) {
                // Extract detailed error message from response
                // Priority: error field > message field > default
                const errorMessage =
                    response.error || response.message || 'Đăng ký bác sĩ thất bại';

                return {
                    success: false,
                    data: response,
                    message: errorMessage,
                };
            }

            return {
                success: response.success ?? true,
                data: response,
                message: response.message || 'Doctor registered successfully',
            };
        } catch (error: any) {
            // Extract error message from axios error response
            // Axios interceptor already extracts error message, but we can also check response.data
            let errorMessage = error.message || 'Đăng ký bác sĩ thất bại';

            // Double check error.response.data in case interceptor didn't extract correctly
            if (error.response?.data) {
                const errorData = error.response.data;
                // Priority: error field > message field > errors array > status field
                if (errorData.error) {
                    errorMessage = errorData.error;
                } else if (errorData.message) {
                    errorMessage = errorData.message;
                } else if (
                    errorData.errors &&
                    Array.isArray(errorData.errors) &&
                    errorData.errors.length > 0
                ) {
                    errorMessage = errorData.errors[0];
                } else if (errorData.status) {
                    errorMessage = errorData.status;
                }
            }

            throw new Error(errorMessage);
        }
    }
}

// Export individual methods for convenience
export const {
    healthCheck,
    login,
    logout,
    registerDoctor,
    forgotPassword,
    resetPassword,
    googleLogin,
    facebookLogin,
    validateEmail,
    validatePhoneNumber,
    validatePassword,
    clearAuthData,
    getAccountsByRole,
    getDoctorsByHospital,
    toggleBanUnbanAccount,
    lockAccount,
    unlockAccount,
} = AuthService;

// Default export
export default AuthService;
