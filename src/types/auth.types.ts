// Base request interface for email or phone validation
export interface EmailOrPhoneRequest {
    email?: string;
    phoneNumber?: string;
}

// Authentication Request DTOs
export interface LoginRequest extends EmailOrPhoneRequest {
    password: string;
}

// External Authentication Request DTOs
export interface GoogleLoginRequest {
    accessToken: string; // Changed from idToken to accessToken for modern OAuth flow
}

export interface FacebookLoginRequest {
    accessToken: string;
}

export interface ForgotPasswordRequest extends EmailOrPhoneRequest {
    deviceId?: string;
}

export interface ResetPasswordRequest {
    email: string;
    resetToken: string;
    newPassword: string;
    confirmNewPassword: string;
}

// Authentication Response DTOs
export interface AuthResponse {
    message: string;
    token?: string;
}

// Form validation types
export interface LoginFormData {
    email: string;
    password: string;
    rememberMe: boolean;
}

export interface ForgotPasswordFormData {
    email: string;
}

export interface ResetPasswordFormData {
    email: string;
    resetToken: string;
    newPassword: string;
    confirmNewPassword: string;
}

// Auth state types
export interface AuthState {
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}
