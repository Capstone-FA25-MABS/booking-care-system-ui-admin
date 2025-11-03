import axios, { AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { toast } from 'react-toastify';
import { API_CONFIG } from './api.config';
import AuthService from '@/services/auth.service';
import { resetAuthState } from '@/store/slices/authSlice';
import { clearAllUserProfiles } from '@/store/slices/userSlice';

// Extend Axios config to include metadata
interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
    metadata?: {
        startTime: Date;
    };
    // mark retry
    _retry?: boolean;
}

// Dependency injection for Redux store (to avoid circular dependency)
type ReduxStore = {
    dispatch: (action: any) => void;
};
let reduxStore: ReduxStore | null = null;

export const injectStore = (_store: ReduxStore) => {
    reduxStore = _store;
};

// Create axios instance
const instance = axios.create({
    baseURL: `${API_CONFIG.baseUrl}/${API_CONFIG.defaultVersion}`,
    timeout: API_CONFIG.timeout,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

// Request interceptor to add auth token
instance.interceptors.request.use(
    (config: ExtendedAxiosRequestConfig) => {
        // Backend does not require Authorization header; rely on HttpOnly cookies
        // Keep metadata timestamp for logging
        config.metadata = { startTime: new Date() };
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// ===== Refresh token queue handling =====
let isRefreshing = false;
let failedQueue: Array<{ resolve: (value?: any) => void; reject: (err: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (token) {
            prom.resolve();
        } else {
            prom.reject(error);
        }
    });
    failedQueue = [];
};

// Helper functions to reduce cognitive complexity
const handleNetworkError = (error: AxiosError) => {
    console.error('API Error:', {
        url: error.config?.url,
        method: error.config?.method,
        network: true,
    });
    return Promise.reject(new Error('Không thể kết nối đến máy chủ!'));
};

const handleForbiddenError = (err: any) => {
    console.error('[Security] 403 Forbidden - Possible role mismatch:', err);

    // Force logout if forbidden error (likely role mismatch)
    handleForceLogout('Role mismatch: 403 Forbidden');

    return Promise.reject(new Error(err?.message || 'Access forbidden'));
};

const queueFailedRequest = (originalRequest: ExtendedAxiosRequestConfig) => {
    return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
    })
        .then(() => instance(originalRequest))
        .catch((queueErr) => Promise.reject(new Error(String(queueErr))));
};

const handleForceLogout = (reason?: string) => {
    console.warn('[Security] Force logout initiated:', reason || 'Unauthorized access');

    AuthService.clearAuthData();

    // Clear Redux state using injected store
    try {
        if (reduxStore) {
            reduxStore?.dispatch(resetAuthState());
            reduxStore?.dispatch(clearAllUserProfiles());
        }
    } catch (error) {
        console.error('Failed to clear Redux state:', error);
    }

    // Show toast notification if role mismatch detected
    if (reason?.includes('Role mismatch')) {
        toast.error(
            'CẢNH BÁO BẢO MẬT: Phát hiện thông tin đăng nhập không hợp lệ. Bạn sẽ được đăng xuất để bảo vệ hệ thống.',
            {
                autoClose: 5000,
                closeOnClick: false,
                draggable: false,
            }
        );
    } else if (reason?.includes('Session expired')) {
        toast.warning('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.', {
            autoClose: 3000,
        });
    }

    // Fallback redirect to login if not already there
    // Note: ProtectedRoute will handle redirect in most cases,
    // but this ensures redirect even from public routes
    if (typeof globalThis !== 'undefined' && globalThis.location.pathname !== '/login') {
        // Use a longer timeout to avoid race condition with ProtectedRoute
        setTimeout(() => {
            // Double-check we're still not on login page (ProtectedRoute might have redirected)
            if (globalThis.location.pathname !== '/login') {
                globalThis.location.href = '/login';
            }
        }, 1000); // 1 second delay to let React Router handle redirect first
    }
};

const handleTokenRefresh = async (originalRequest: ExtendedAxiosRequestConfig) => {
    try {
        const refreshResponse: any = await instance.post('/auth/refresh-token');
        const newToken = refreshResponse?.data?.token || refreshResponse?.token;

        processQueue(null, newToken || '1');
        isRefreshing = false;
        return instance(originalRequest);
    } catch (refreshError) {
        processQueue(refreshError as any, null);
        isRefreshing = false;

        // Force logout and clear all state
        handleForceLogout('Session expired or invalid token');

        return Promise.reject(new Error(String(refreshError)));
    }
};

const handleResponseError = async (error: AxiosError) => {
    const err = error?.response?.data as any;
    const originalRequest = error.config as ExtendedAxiosRequestConfig;

    // Network error
    if (!error.response) {
        return handleNetworkError(error);
    }

    const url = (originalRequest.url || '').toString();
    const isLogin = url.includes('/auth/login');
    const isRefresh = url.includes('/auth/refresh-token');

    // Handle 403 errors
    if (error.response?.status === 403) {
        return handleForbiddenError(err);
    }

    // Handle 401 errors with token refresh
    if (error.response?.status === 401 && !isLogin && !isRefresh) {
        if (isRefreshing) {
            return queueFailedRequest(originalRequest);
        }

        originalRequest._retry = true;
        isRefreshing = true;
        return handleTokenRefresh(originalRequest);
    }

    // Log and reject other errors
    console.error('API Error:', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        data: err,
    });

    return Promise.reject(new Error(err?.message || error.message || 'An error occurred'));
};

// Response interceptor for handling responses and errors
instance.interceptors.response.use(function (response: AxiosResponse) {
    // Calculate response time for performance monitoring
    const endTime = new Date();
    const config = response.config as ExtendedAxiosRequestConfig;
    const startTime = config.metadata?.startTime;
    if (startTime) {
        const responseTime = endTime.getTime() - startTime.getTime();
        console.log(`API Response Time: ${responseTime}ms for ${response.config.url}`);
    }

    // Return the data directly for easier usage
    return response.data;
}, handleResponseError);

// Add a method to update the base URL if needed
export const updateBaseURL = (newBaseURL: string) => {
    instance.defaults.baseURL = newBaseURL;
};

// Add types for common API responses
export interface ApiResponse<T = any> {
    success: boolean;
    data: T;
    message?: string;
    errors?: string[];
}

export interface PaginatedResponse<T = any> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface ApiError {
    message: string;
    status?: number;
    code?: string;
    data?: any;
    isNetworkError: boolean;
}

export default instance;
