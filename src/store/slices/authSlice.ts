import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { AuthService } from '@/services/auth.service';
import {
    AuthState,
    LoginRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    GoogleLoginRequest,
    FacebookLoginRequest,
} from '@/types/auth.types';
import { getAllJwtInfo } from '@/utils/jwt';

// Helper function to validate roles for admin front-end
const validateRoles = (response: any, rejectWithValue: any) => {
    // Check if 2FA is required
    if (response.data?.requires2FA) {
        return {
            requires2FA: true,
            accountId: response.data.accountId,
            roles: [],
            emailConfirmed: false,
            phoneConfirmed: false,
            hasExternalProvider: false,
            mustChangePassword: false,
            accessToken: null,
        };
    }

    const token = response.data?.token;
    if (token) {
        // Get all JWT information
        const jwtInfo = getAllJwtInfo(token);
        const roles = jwtInfo.roles.map((r) => r.toUpperCase());

        // For admin front-end, allow ADMIN, DOCTOR, STAFF roles
        const allowed = ['ADMIN', 'DOCTOR', 'STAFF'];
        const hasAllowed = roles.some((r) => allowed.includes(r));
        if (!hasAllowed) {
            return rejectWithValue(
                'Tài khoản của bạn không có quyền truy cập vào cổng quản trị này.'
            );
        }
        // Return all JWT information including token
        return {
            roles,
            emailConfirmed: jwtInfo.emailConfirmed,
            phoneConfirmed: jwtInfo.phoneConfirmed,
            hasExternalProvider: jwtInfo.hasExternalProvider,
            mustChangePassword: jwtInfo.mustChangePassword,
            accessToken: token,
        };
    }
    return null; // No error
};

// Helper function to handle validation result (DRY principle)
const handleValidationResult = (validationResult: any) => {
    // Check if 2FA is required
    if (validationResult?.requires2FA) {
        return {
            requires2FA: true,
            accountId: validationResult.accountId,
            roles: [],
            emailConfirmed: false,
            phoneConfirmed: false,
            hasExternalProvider: false,
            mustChangePassword: false,
            accessToken: null,
        };
    }

    if (validationResult?.roles) {
        return {
            roles: validationResult.roles,
            emailConfirmed: validationResult.emailConfirmed,
            phoneConfirmed: validationResult.phoneConfirmed,
            hasExternalProvider: validationResult.hasExternalProvider,
            mustChangePassword: validationResult.mustChangePassword || false,
            accessToken: validationResult.accessToken || null,
        };
    }
    if (validationResult === null) {
        return {
            roles: [],
            emailConfirmed: false,
            phoneConfirmed: false,
            hasExternalProvider: false,
            mustChangePassword: false,
            accessToken: null,
        };
    }
    return validationResult; // This is the error case
};

// Initial state - Redux Persist will automatically restore
const initialState: AuthState = {
    roles: [],
    isAuthenticated: false,
    isLoading: false,
    error: null,
    emailConfirmed: false,
    phoneConfirmed: false,
    hasExternalProvider: false,
    mustChangePassword: false,
    accessToken: null,
};

// Async thunks
export const loginAsync = createAsyncThunk(
    'auth/login',
    async (credentials: LoginRequest, { rejectWithValue }) => {
        try {
            const response = await AuthService.login(credentials);

            // Validate roles using helper function
            const validationResult = validateRoles(response, rejectWithValue);
            return handleValidationResult(validationResult);
        } catch (error: any) {
            return rejectWithValue(error.message || 'Login failed');
        }
    }
);

export const forgotPasswordAsync = createAsyncThunk(
    'auth/forgotPassword',
    async (request: ForgotPasswordRequest, { rejectWithValue }) => {
        try {
            const response = await AuthService.forgotPassword(request);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Forgot password request failed');
        }
    }
);

export const resetPasswordAsync = createAsyncThunk(
    'auth/resetPassword',
    async (request: ResetPasswordRequest, { rejectWithValue }) => {
        try {
            const response = await AuthService.resetPassword(request);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Password reset failed');
        }
    }
);

export const logoutAsync = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
    try {
        await AuthService.logout();
        AuthService.clearAuthData();
        return true;
    } catch (error: any) {
        // Clear auth data even if API call fails
        AuthService.clearAuthData();
        return rejectWithValue(error.message || 'Logout failed');
    }
});

export const googleLoginAsync = createAsyncThunk(
    'auth/googleLogin',
    async (request: GoogleLoginRequest, { rejectWithValue }) => {
        try {
            const response = await AuthService.googleLogin(request);

            // Validate roles using helper function
            const validationResult = validateRoles(response, rejectWithValue);
            return handleValidationResult(validationResult);
        } catch (error: any) {
            return rejectWithValue(error.message || 'Google login failed');
        }
    }
);

export const facebookLoginAsync = createAsyncThunk(
    'auth/facebookLogin',
    async (request: FacebookLoginRequest, { rejectWithValue }) => {
        try {
            const response = await AuthService.facebookLogin(request);

            // Validate roles using helper function
            const validationResult = validateRoles(response, rejectWithValue);
            return handleValidationResult(validationResult);
        } catch (error: any) {
            return rejectWithValue(error.message || 'Facebook login failed');
        }
    }
);

export const complete2FALoginAsync = createAsyncThunk(
    'auth/complete2FALogin',
    async ({ accountId, code }: { accountId: string; code: string }, { rejectWithValue }) => {
        try {
            const response = await AuthService.verify2FA(accountId, code);

            // Validate roles using helper function (same as regular login)
            const validationResult = validateRoles(response, rejectWithValue);
            return handleValidationResult(validationResult);
        } catch (error: any) {
            return rejectWithValue(error.message || '2FA verification failed');
        }
    }
);

// Auth slice
const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        resetAuthState: (state) => {
            // Reset to initial state (used for force logout)
            state.roles = [];
            state.isAuthenticated = false;
            state.isLoading = false;
            state.error = null;
            state.emailConfirmed = false;
            state.phoneConfirmed = false;
            state.hasExternalProvider = false;
            state.mustChangePassword = false;
            state.accessToken = null;
        },
        updateAccessToken: (state, action) => {
            // Update access token after refresh (used by axios interceptor)
            state.accessToken = action.payload;
        },
        clearMustChangePassword: (state) => {
            // Clear mustChangePassword flag after user changes password
            state.mustChangePassword = false;
        },
    },
    extraReducers: (builder) => {
        builder
            // Login cases
            .addCase(loginAsync.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(loginAsync.fulfilled, (state, action) => {
                state.isLoading = false;
                state.roles = action.payload?.roles || [];
                state.emailConfirmed = action.payload?.emailConfirmed || false;
                state.phoneConfirmed = action.payload?.phoneConfirmed || false;
                state.hasExternalProvider = action.payload?.hasExternalProvider || false;
                state.mustChangePassword = action.payload?.mustChangePassword || false;
                state.accessToken = action.payload?.accessToken || null;
                state.isAuthenticated = state.roles.length > 0;
                state.error = null;
            })
            .addCase(loginAsync.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Forgot password cases
            .addCase(forgotPasswordAsync.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(forgotPasswordAsync.fulfilled, (state) => {
                state.isLoading = false;
                state.error = null;
            })
            .addCase(forgotPasswordAsync.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Reset password cases
            .addCase(resetPasswordAsync.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(resetPasswordAsync.fulfilled, (state) => {
                state.isLoading = false;
                state.error = null;
            })
            .addCase(resetPasswordAsync.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Logout cases
            .addCase(logoutAsync.fulfilled, (state) => {
                state.roles = [];
                state.isAuthenticated = false;
                state.error = null;
                state.isLoading = false;
                state.mustChangePassword = false;
                state.accessToken = null;
            })
            // Google login cases
            .addCase(googleLoginAsync.pending, (state) => {
                state.error = null;
            })
            .addCase(googleLoginAsync.fulfilled, (state, action) => {
                state.roles = action.payload?.roles || [];
                state.emailConfirmed = action.payload?.emailConfirmed || false;
                state.phoneConfirmed = action.payload?.phoneConfirmed || false;
                state.hasExternalProvider = action.payload?.hasExternalProvider || false;
                state.mustChangePassword = action.payload?.mustChangePassword || false;
                state.accessToken = action.payload?.accessToken || null;
                state.isAuthenticated = state.roles.length > 0;
                state.error = null;
            })
            .addCase(googleLoginAsync.rejected, (state, action) => {
                state.error = action.payload as string;
            })
            // Facebook login cases
            .addCase(facebookLoginAsync.pending, (state) => {
                state.error = null;
            })
            .addCase(facebookLoginAsync.fulfilled, (state, action) => {
                state.roles = action.payload?.roles || [];
                state.emailConfirmed = action.payload?.emailConfirmed || false;
                state.phoneConfirmed = action.payload?.phoneConfirmed || false;
                state.hasExternalProvider = action.payload?.hasExternalProvider || false;
                state.mustChangePassword = action.payload?.mustChangePassword || false;
                state.accessToken = action.payload?.accessToken || null;
                state.isAuthenticated = state.roles.length > 0;
                state.error = null;
            })
            .addCase(facebookLoginAsync.rejected, (state, action) => {
                state.error = action.payload as string;
            })
            // 2FA verification cases
            .addCase(complete2FALoginAsync.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(complete2FALoginAsync.fulfilled, (state, action) => {
                state.isLoading = false;
                state.roles = action.payload?.roles || [];
                state.emailConfirmed = action.payload?.emailConfirmed || false;
                state.phoneConfirmed = action.payload?.phoneConfirmed || false;
                state.hasExternalProvider = action.payload?.hasExternalProvider || false;
                state.mustChangePassword = action.payload?.mustChangePassword || false;
                state.accessToken = action.payload?.accessToken || null;
                state.isAuthenticated = state.roles.length > 0;
                state.error = null;
            })
            .addCase(complete2FALoginAsync.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearError, resetAuthState, updateAccessToken, clearMustChangePassword } =
    authSlice.actions;

export default authSlice.reducer;
