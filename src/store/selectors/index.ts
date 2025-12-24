import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../index';

// Auth selectors
export const selectAuth = (state: RootState) => state.auth;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectAuthLoading = (state: RootState) => state.auth.isLoading;
export const selectAuthError = (state: RootState) => state.auth.error;

// UI selectors
export const selectTheme = (state: RootState) => state.ui.theme;
export const selectSidebarCollapsed = (state: RootState) => state.ui.sidebarCollapsed;
export const selectNotifications = (state: RootState) => state.ui.notifications;
export const selectModals = (state: RootState) => state.ui.modals;
export const selectGlobalLoading = (state: RootState) => state.ui.globalLoading;
export const selectLoadingStates = (state: RootState) => state.ui.loadingStates;
export const selectIsMobile = (state: RootState) => state.ui.isMobile;
export const selectIsTablet = (state: RootState) => state.ui.isTablet;
export const selectScreenSize = (state: RootState) => ({
    width: state.ui.screenWidth,
    height: state.ui.screenHeight,
});
export const selectUserPreferences = (state: RootState) => state.ui.userPreferences;
export const selectIsOnline = (state: RootState) => state.ui.isOnline;

export const selectUnreadNotifications = createSelector(
    [selectNotifications],
    (notifications) => notifications.length
);

export const selectIsLoading = createSelector(
    [selectGlobalLoading, selectLoadingStates],
    (globalLoading, loadingStates) => {
        return globalLoading || Object.values(loadingStates).some((loading) => loading);
    }
);

// Factory selector for getting loading state by key
export const selectLoadingByKey = (key: string) =>
    createSelector([selectLoadingStates], (loadingStates) => loadingStates[key] || false);
