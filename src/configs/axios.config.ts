import axios, { AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_CONFIG } from './api.config';

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
    if (typeof window !== 'undefined') {
        window.location.href = '/error-403';
    }
    return Promise.reject(new Error(err?.message || 'Access forbidden'));
};

const queueFailedRequest = (originalRequest: ExtendedAxiosRequestConfig) => {
    return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
    })
        .then(() => instance(originalRequest))
        .catch((queueErr) => Promise.reject(new Error(String(queueErr))));
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

        try {
            localStorage.removeItem('persist:booking-care-root');
        } catch {
            // Ignore localStorage errors
        }

        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
            window.location.href = '/login';
        }
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
