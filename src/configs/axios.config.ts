import axios, { AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_CONFIG } from './api.config';
import { updateToken } from '@/store/slices/authSlice';
// ⚠️ Store injection pattern to avoid circular dependency
let reduxStore: any = null;

// ✅ Function to inject store from outside
export const injectStore = (store: any) => {
    reduxStore = store;
};

// Extend Axios config to include metadata
interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
    metadata?: {
        startTime: Date;
    };
    // mark retry
    _retry?: boolean;
}

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

// Response interceptor for handling responses and errors
instance.interceptors.response.use(
    function (response: AxiosResponse) {
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
    },
    async function (error: AxiosError) {
        const err = error?.response?.data as any;
        const originalRequest = error.config as ExtendedAxiosRequestConfig;

        // Network error
        if (!error.response) {
            console.error('API Error:', {
                url: error.config?.url,
                method: error.config?.method,
                network: true,
            });
            return Promise.reject({
                message: 'Không thể kết nối đến máy chủ!',
                isNetworkError: true,
            });
        }

        // 🛑 Do not attempt refresh for login endpoint
        const url = (originalRequest.url || '').toString();
        const isLogin = url.includes('/auth/login');
        const isRefresh = url.includes('/auth/refresh-token');

        // General 403 handling for protected resources
        if (error.response?.status === 403) {
            if (typeof window !== 'undefined') {
                window.location.href = '/error-403';
            }
            return Promise.reject({
                message: err?.message || 'Access forbidden',
                status: 403,
                data: err,
            });
        }

        // ✅ Attempt refresh on 401 (except for login/refresh endpoints)
        if (error.response?.status === 401 && !isLogin && !isRefresh) {
            if (isRefreshing) {
                // Queue the request until refresh completes
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then(() => instance(originalRequest))
                    .catch((queueErr) => Promise.reject(queueErr));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Backend reads refresh token from HttpOnly cookie
                const refreshResponse: any = await instance.post('/auth/refresh-token');

                // Try to grab new access token (if backend returns it in body)
                const newToken = refreshResponse?.data?.token || refreshResponse?.token;
                if (newToken) {
                    localStorage.setItem('token', newToken);

                    // ✅ Update Redux state using injected store
                    if (reduxStore) {
                        reduxStore.dispatch(updateToken(newToken));
                    }
                }

                processQueue(null, newToken || '1');
                isRefreshing = false;

                return instance(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError as any, null);
                isRefreshing = false;

                // Clear and redirect on refresh failure
                try {
                    localStorage.removeItem('persist:booking-care-root');
                    localStorage.removeItem('token');
                } catch {
                    // Ignore localStorage errors in case it's not available
                }

                if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
                    window.location.href = '/login';
                }
                return Promise.reject(refreshError);
            }
        }

        // Log the error for debugging (fallback)
        console.error('API Error:', {
            url: error.config?.url,
            method: error.config?.method,
            status: error.response?.status,
            data: err,
        });

        // Return structured error object
        return Promise.reject({
            message: err?.message || error.message || 'An error occurred',
            status: error.response?.status,
            code: err?.code,
            data: err,
            isNetworkError: !error.response,
        });
    }
);

// Add a method to update the base URL if needed
export const updateBaseURL = (newBaseURL: string) => {
    instance.defaults.baseURL = newBaseURL;
};

// Add a method to set auth token
export const setAuthToken = (token: string | null) => {
    if (token) {
        instance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        localStorage.setItem('token', token);
    } else {
        delete instance.defaults.headers.common['Authorization'];
        localStorage.removeItem('token');
    }
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
