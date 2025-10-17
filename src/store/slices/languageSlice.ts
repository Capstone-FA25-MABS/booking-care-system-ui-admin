import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
    Language,
    LanguageFormData,
    LanguageSearchParams,
    LanguageListResponse,
} from '@/types/language.types';
import { LanguageService } from '@/services/language.service';

export interface LanguageState {
    languages: Language[];
    currentLanguage: Language | null;
    pagination: {
        totalCount: number;
        pageNumber: number;
        pageSize: number;
        totalPages: number;
    };
    isLoading: boolean;
    error: string | null;
}

// Initial state
const initialState: LanguageState = {
    languages: [],
    currentLanguage: null,
    pagination: {
        totalCount: 0,
        pageNumber: 1,
        pageSize: 10,
        totalPages: 0,
    },
    isLoading: false,
    error: null,
};

// Async thunks
export const fetchLanguages = createAsyncThunk(
    'language/fetchLanguages',
    async (
        {
            pageNumber = 1,
            pageSize = 10,
            sortBy,
            sortOrder,
        }: {
            pageNumber?: number;
            pageSize?: number;
            sortBy?: string;
            sortOrder?: 'asc' | 'desc';
        },
        { rejectWithValue }
    ) => {
        try {
            const response = await LanguageService.getAllLanguages(
                pageNumber,
                pageSize,
                sortBy,
                sortOrder
            );
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Không thể kết nối đến máy chủ!');
        }
    }
);

export const fetchLanguageById = createAsyncThunk(
    'language/fetchLanguageById',
    async (id: string, { rejectWithValue }) => {
        try {
            const response = await LanguageService.getLanguageById(id);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Không thể kết nối đến máy chủ!');
        }
    }
);

export const createLanguage = createAsyncThunk(
    'language/createLanguage',
    async (languageData: LanguageFormData, { rejectWithValue }) => {
        try {
            const response = await LanguageService.createLanguage(languageData);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Không thể kết nối đến máy chủ!');
        }
    }
);

export const updateLanguage = createAsyncThunk(
    'language/updateLanguage',
    async (
        { id, languageData }: { id: string; languageData: LanguageFormData },
        { rejectWithValue }
    ) => {
        try {
            const response = await LanguageService.updateLanguage(id, languageData);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Không thể kết nối đến máy chủ!');
        }
    }
);

export const deleteLanguage = createAsyncThunk(
    'language/deleteLanguage',
    async (id: string, { rejectWithValue }) => {
        try {
            await LanguageService.deleteLanguage(id);
            return id;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Không thể kết nối đến máy chủ!');
        }
    }
);

export const filterLanguages = createAsyncThunk(
    'language/filterLanguages',
    async (params: LanguageSearchParams, { rejectWithValue }) => {
        try {
            const response = await LanguageService.filterLanguages(params);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Không thể kết nối đến máy chủ!');
        }
    }
);

// Language slice
const languageSlice = createSlice({
    name: 'language',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearCurrentLanguage: (state) => {
            state.currentLanguage = null;
        },
        resetLanguageState: () => {
            return initialState;
        },
    },
    extraReducers: (builder) => {
        // Fetch languages
        builder
            .addCase(fetchLanguages.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(
                fetchLanguages.fulfilled,
                (state, action: PayloadAction<LanguageListResponse>) => {
                    state.isLoading = false;
                    state.languages = action.payload.languages;
                    state.pagination = {
                        totalCount: action.payload.totalCount,
                        pageNumber: action.payload.pageNumber,
                        pageSize: action.payload.pageSize,
                        totalPages: action.payload.totalPages,
                    };
                    state.error = null;
                }
            )
            .addCase(fetchLanguages.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Fetch language by ID
        builder
            .addCase(fetchLanguageById.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchLanguageById.fulfilled, (state, action: PayloadAction<Language>) => {
                state.isLoading = false;
                state.currentLanguage = action.payload;
                state.error = null;
            })
            .addCase(fetchLanguageById.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Create language
        builder
            .addCase(createLanguage.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(createLanguage.fulfilled, (state, action: PayloadAction<Language>) => {
                state.isLoading = false;
                state.languages.unshift(action.payload);
                state.pagination.totalCount += 1;
                state.error = null;
            })
            .addCase(createLanguage.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Update language
        builder
            .addCase(updateLanguage.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateLanguage.fulfilled, (state, action: PayloadAction<Language>) => {
                state.isLoading = false;
                const index = state.languages.findIndex((l) => l.id === action.payload.id);
                if (index !== -1) {
                    state.languages[index] = action.payload;
                }
                if (state.currentLanguage?.id === action.payload.id) {
                    state.currentLanguage = action.payload;
                }
                state.error = null;
            })
            .addCase(updateLanguage.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Delete language
        builder
            .addCase(deleteLanguage.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(deleteLanguage.fulfilled, (state, action: PayloadAction<string>) => {
                state.isLoading = false;
                state.languages = state.languages.filter((l) => l.id !== action.payload);
                state.pagination.totalCount -= 1;
                if (state.currentLanguage?.id === action.payload) {
                    state.currentLanguage = null;
                }
                state.error = null;
            })
            .addCase(deleteLanguage.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Filter languages
        builder
            .addCase(filterLanguages.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(
                filterLanguages.fulfilled,
                (state, action: PayloadAction<LanguageListResponse>) => {
                    state.isLoading = false;
                    state.languages = action.payload.languages;
                    state.pagination = {
                        totalCount: action.payload.totalCount,
                        pageNumber: action.payload.pageNumber,
                        pageSize: action.payload.pageSize,
                        totalPages: action.payload.totalPages,
                    };
                    state.error = null;
                }
            )
            .addCase(filterLanguages.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearError, clearCurrentLanguage, resetLanguageState } = languageSlice.actions;
export default languageSlice.reducer;
