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
import { getRolesFromJwt } from '@/utils/jwt';

// Helper function to validate roles
const validateRoles = (response: any, rejectWithValue: any) => {
    const token = response.data?.token;
    if (token) {
        const roles = getRolesFromJwt(token).map((r) => r.toUpperCase());
        const allowed = ['ADMIN', 'DOCTOR', 'STAFF'];
        const hasAllowed = roles.some((r) => allowed.includes(r));
        if (!hasAllowed) {
            return rejectWithValue(
                'Tài khoản của bạn không có quyền truy cập vào cổng thông tin này.'
            );
        }
        // Only save roles, not token
        AuthService.setRoles(roles);
        return { roles }; // Return roles data
    }
    return null; // No error
};

// Initial state
const initialState: AuthState = {
    roles: AuthService.getRoles(),
    isAuthenticated: AuthService.isAuthenticated(),
    isLoading: false,
    error: null,
};

// Async thunks
export const loginAsync = createAsyncThunk(
    'auth/login',
    async (credentials: LoginRequest, { rejectWithValue }) => {
        try {
            const response = await AuthService.login(credentials);

            // Validate roles using helper function
            const validationResult = validateRoles(response, rejectWithValue);
            if (validationResult?.roles) {
                return { roles: validationResult.roles };
            }
            if (validationResult === null) {
                // No token found, return empty roles
                return { roles: [] };
            }
            return validationResult; // This is the error case
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
            if (validationResult?.roles) {
                return { roles: validationResult.roles };
            }
            if (validationResult === null) {
                // No token found, return empty roles
                return { roles: [] };
            }
            return validationResult; // This is the error case
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
            if (validationResult?.roles) {
                return { roles: validationResult.roles };
            }
            if (validationResult === null) {
                // No token found, return empty roles
                return { roles: [] };
            }
            return validationResult; // This is the error case
        } catch (error: any) {
            return rejectWithValue(error.message || 'Facebook login failed');
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
            })
            // Google login cases
            .addCase(googleLoginAsync.pending, (state) => {
                state.error = null;
            })
            .addCase(googleLoginAsync.fulfilled, (state, action) => {
                state.roles = action.payload?.roles || [];
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
                state.isAuthenticated = state.roles.length > 0;
                state.error = null;
            })
            .addCase(facebookLoginAsync.rejected, (state, action) => {
                state.error = action.payload as string;
            });
    },
});

export const { clearError } = authSlice.actions;

export default authSlice.reducer;
