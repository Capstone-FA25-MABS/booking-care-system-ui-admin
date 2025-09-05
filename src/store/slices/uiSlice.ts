import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Types
export interface Notification {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    duration?: number; // in milliseconds, 0 means persistent
    action?: {
        label: string;
        onClick: () => void;
    };
    createdAt: number;
}

export interface Modal {
    id: string;
    type: string;
    title?: string;
    content?: any;
    size?: 'small' | 'medium' | 'large' | 'fullscreen';
    closable?: boolean;
    onClose?: () => void;
}

export interface LoadingState {
    [key: string]: boolean;
}

export interface UIState {
    // Theme and appearance
    theme: 'light' | 'dark' | 'auto';
    primaryColor: string;
    sidebarCollapsed: boolean;

    // Navigation
    currentPage: string;
    breadcrumbs: Array<{
        label: string;
        path?: string;
    }>;

    // Notifications
    notifications: Notification[];

    // Modals and dialogs
    modals: Modal[];

    // Loading states
    globalLoading: boolean;
    loadingStates: LoadingState;

    // Responsive design
    isMobile: boolean;
    isTablet: boolean;
    screenWidth: number;
    screenHeight: number;

    // Search
    globalSearchOpen: boolean;
    globalSearchQuery: string;

    // Filters and preferences
    userPreferences: {
        language: string;
        timezone: string;
        dateFormat: string;
        timeFormat: '12h' | '24h';
        currency: string;
        notifications: {
            email: boolean;
            push: boolean;
            sms: boolean;
        };
    };

    // Page-specific UI states
    pageStates: {
        [page: string]: any;
    };

    // Connection status
    isOnline: boolean;
    lastOnlineAt: number | null;

    // Performance monitoring
    performanceMetrics: {
        pageLoadTime: number;
        apiResponseTimes: { [endpoint: string]: number };
    };
}

// Initial state
const initialState: UIState = {
    theme: 'light',
    primaryColor: '#007bff',
    sidebarCollapsed: false,
    currentPage: '',
    breadcrumbs: [],
    notifications: [],
    modals: [],
    globalLoading: false,
    loadingStates: {},
    isMobile: false,
    isTablet: false,
    screenWidth: typeof window !== 'undefined' ? window.innerWidth : 1920,
    screenHeight: typeof window !== 'undefined' ? window.innerHeight : 1080,
    globalSearchOpen: false,
    globalSearchQuery: '',
    userPreferences: {
        language: 'en',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        dateFormat: 'MM/dd/yyyy',
        timeFormat: '12h',
        currency: 'USD',
        notifications: {
            email: true,
            push: true,
            sms: false,
        },
    },
    pageStates: {},
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    lastOnlineAt: null,
    performanceMetrics: {
        pageLoadTime: 0,
        apiResponseTimes: {},
    },
};

// UI slice
const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        // Theme and appearance
        setTheme: (state, action: PayloadAction<'light' | 'dark' | 'auto'>) => {
            state.theme = action.payload;
        },
        setPrimaryColor: (state, action: PayloadAction<string>) => {
            state.primaryColor = action.payload;
        },
        toggleSidebar: (state) => {
            state.sidebarCollapsed = !state.sidebarCollapsed;
        },
        setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
            state.sidebarCollapsed = action.payload;
        },

        // Navigation
        setCurrentPage: (state, action: PayloadAction<string>) => {
            state.currentPage = action.payload;
        },
        setBreadcrumbs: (state, action: PayloadAction<Array<{ label: string; path?: string }>>) => {
            state.breadcrumbs = action.payload;
        },
        addBreadcrumb: (state, action: PayloadAction<{ label: string; path?: string }>) => {
            state.breadcrumbs.push(action.payload);
        },

        // Notifications
        addNotification: (state, action: PayloadAction<Omit<Notification, 'id' | 'createdAt'>>) => {
            const notification: Notification = {
                ...action.payload,
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                createdAt: Date.now(),
            };
            state.notifications.unshift(notification);
        },
        removeNotification: (state, action: PayloadAction<string>) => {
            state.notifications = state.notifications.filter((n) => n.id !== action.payload);
        },
        clearAllNotifications: (state) => {
            state.notifications = [];
        },

        // Modals
        openModal: (state, action: PayloadAction<Omit<Modal, 'id'>>) => {
            const modal: Modal = {
                ...action.payload,
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            };
            state.modals.push(modal);
        },
        closeModal: (state, action: PayloadAction<string>) => {
            state.modals = state.modals.filter((m) => m.id !== action.payload);
        },
        closeAllModals: (state) => {
            state.modals = [];
        },

        // Loading states
        setGlobalLoading: (state, action: PayloadAction<boolean>) => {
            state.globalLoading = action.payload;
        },
        setLoading: (state, action: PayloadAction<{ key: string; loading: boolean }>) => {
            state.loadingStates[action.payload.key] = action.payload.loading;
        },
        clearLoading: (state, action: PayloadAction<string>) => {
            delete state.loadingStates[action.payload];
        },

        // Responsive design
        setScreenSize: (state, action: PayloadAction<{ width: number; height: number }>) => {
            state.screenWidth = action.payload.width;
            state.screenHeight = action.payload.height;
            state.isMobile = action.payload.width < 768;
            state.isTablet = action.payload.width >= 768 && action.payload.width < 1024;
        },

        // Search
        setGlobalSearchOpen: (state, action: PayloadAction<boolean>) => {
            state.globalSearchOpen = action.payload;
        },
        setGlobalSearchQuery: (state, action: PayloadAction<string>) => {
            state.globalSearchQuery = action.payload;
        },

        // User preferences
        updateUserPreferences: (
            state,
            action: PayloadAction<Partial<UIState['userPreferences']>>
        ) => {
            state.userPreferences = { ...state.userPreferences, ...action.payload };
        },
        setLanguage: (state, action: PayloadAction<string>) => {
            state.userPreferences.language = action.payload;
        },
        setTimezone: (state, action: PayloadAction<string>) => {
            state.userPreferences.timezone = action.payload;
        },
        updateNotificationPreferences: (
            state,
            action: PayloadAction<Partial<UIState['userPreferences']['notifications']>>
        ) => {
            state.userPreferences.notifications = {
                ...state.userPreferences.notifications,
                ...action.payload,
            };
        },

        // Page states
        setPageState: (state, action: PayloadAction<{ page: string; state: any }>) => {
            state.pageStates[action.payload.page] = action.payload.state;
        },
        updatePageState: (state, action: PayloadAction<{ page: string; updates: any }>) => {
            if (state.pageStates[action.payload.page]) {
                state.pageStates[action.payload.page] = {
                    ...state.pageStates[action.payload.page],
                    ...action.payload.updates,
                };
            } else {
                state.pageStates[action.payload.page] = action.payload.updates;
            }
        },
        clearPageState: (state, action: PayloadAction<string>) => {
            delete state.pageStates[action.payload];
        },

        // Connection status
        setOnlineStatus: (state, action: PayloadAction<boolean>) => {
            state.isOnline = action.payload;
            if (!action.payload) {
                state.lastOnlineAt = Date.now();
            } else {
                state.lastOnlineAt = null;
            }
        },

        // Performance monitoring
        setPageLoadTime: (state, action: PayloadAction<number>) => {
            state.performanceMetrics.pageLoadTime = action.payload;
        },
        setApiResponseTime: (state, action: PayloadAction<{ endpoint: string; time: number }>) => {
            state.performanceMetrics.apiResponseTimes[action.payload.endpoint] =
                action.payload.time;
        },

        // Utility actions
        resetUIState: () => initialState,
    },
});

export const {
    setTheme,
    setPrimaryColor,
    toggleSidebar,
    setSidebarCollapsed,
    setCurrentPage,
    setBreadcrumbs,
    addBreadcrumb,
    addNotification,
    removeNotification,
    clearAllNotifications,
    openModal,
    closeModal,
    closeAllModals,
    setGlobalLoading,
    setLoading,
    clearLoading,
    setScreenSize,
    setGlobalSearchOpen,
    setGlobalSearchQuery,
    updateUserPreferences,
    setLanguage,
    setTimezone,
    updateNotificationPreferences,
    setPageState,
    updatePageState,
    clearPageState,
    setOnlineStatus,
    setPageLoadTime,
    setApiResponseTime,
    resetUIState,
} = uiSlice.actions;

export default uiSlice.reducer;
