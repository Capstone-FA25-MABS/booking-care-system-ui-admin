import axios, { AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_CONFIG } from './api.config';

// Extend Axios config to include metadata
interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
    metadata?: {
        startTime: Date;
    };
}

// Create axios instance
const instance = axios.create({
    baseURL: `${API_CONFIG.baseUrl}/${API_CONFIG.defaultVersion}`,
    timeout: API_CONFIG.timeout,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
instance.interceptors.request.use(
    (config: ExtendedAxiosRequestConfig) => {
        // Try to get token from localStorage (fallback for non-Redux usage)
        let token = localStorage.getItem('token');

        // Try to get token from Redux persist
        if (!token) {
            try {
                const persistedAuth = localStorage.getItem('persist:root');
                if (persistedAuth) {
                    const parsedAuth = JSON.parse(persistedAuth);
                    const authData = JSON.parse(parsedAuth.auth);
                    token = authData.token;
                }
            } catch (error) {
                console.warn('Failed to get token from persisted state', error);
            }
        }

        if (token) {
            config.headers = config.headers || {};
            config.headers['Authorization'] = `Bearer ${token}`;
        }

        // Add request timestamp for debugging
        config.metadata = { startTime: new Date() };

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

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
    function (error: AxiosError) {
        const err = error?.response?.data as any;

        // Log the error for debugging
        console.error('API Error:', {
            url: error.config?.url,
            method: error.config?.method,
            status: error.response?.status,
            data: err,
        });

        // Handle different error scenarios
        if (error.response?.status === 401) {
            // Unauthorized - clear auth data and redirect
            localStorage.removeItem('persist:root');
            localStorage.removeItem('token');

            // Dispatch logout action if Redux store is available
            if (typeof window !== 'undefined' && (window as any).__REDUX_STORE__) {
                const store = (window as any).__REDUX_STORE__;
                store.dispatch({ type: 'auth/logout' });
            }

            // Redirect to login page
            if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        } else if (error.response?.status === 403) {
            // Forbidden - user doesn't have permission
            console.warn('Access forbidden:', err?.message || 'Insufficient permissions');
        } else if (error.response && error.response.status >= 500) {
            // Server error
            console.error('Server error:', err?.message || 'Internal server error');
        }

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
