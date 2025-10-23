import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
    Specialty,
    SpecialtyFormData,
    SpecialtySearchParams,
    SpecialtyListResponse,
} from '@/types/specialty.types';
import { SpecialtyService } from '@/services/specialty.service';

export interface SpecialtyState {
    specialties: Specialty[];
    currentSpecialty: Specialty | null;
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
const initialState: SpecialtyState = {
    specialties: [],
    currentSpecialty: null,
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
export const fetchSpecialties = createAsyncThunk(
    'specialty/fetchSpecialties',
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
            const response = await SpecialtyService.getAllSpecialties(
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

export const fetchSpecialtyById = createAsyncThunk(
    'specialty/fetchSpecialtyById',
    async (id: string, { rejectWithValue }) => {
        try {
            const response = await SpecialtyService.getSpecialtyById(id);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Không thể kết nối đến máy chủ!');
        }
    }
);

export const createSpecialty = createAsyncThunk(
    'specialty/createSpecialty',
    async (specialtyData: SpecialtyFormData, { rejectWithValue }) => {
        try {
            const response = await SpecialtyService.createSpecialty(specialtyData);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Không thể kết nối đến máy chủ!');
        }
    }
);

export const createSpecialtyWithImage = createAsyncThunk(
    'specialty/createSpecialtyWithImage',
    async (specialtyData: SpecialtyFormData & { imageFile: File }, { rejectWithValue }) => {
        try {
            const response = await SpecialtyService.createSpecialtyWithImage(specialtyData);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Không thể kết nối đến máy chủ!');
        }
    }
);

export const updateSpecialty = createAsyncThunk(
    'specialty/updateSpecialty',
    async (
        { id, specialtyData }: { id: string; specialtyData: SpecialtyFormData },
        { rejectWithValue }
    ) => {
        try {
            const response = await SpecialtyService.updateSpecialty(id, specialtyData);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Không thể kết nối đến máy chủ!');
        }
    }
);

export const updateSpecialtyWithImage = createAsyncThunk(
    'specialty/updateSpecialtyWithImage',
    async (
        {
            id,
            specialtyData,
        }: { id: string; specialtyData: SpecialtyFormData & { imageFile: File } },
        { rejectWithValue }
    ) => {
        try {
            const response = await SpecialtyService.updateSpecialtyWithImage(id, specialtyData);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Không thể kết nối đến máy chủ!');
        }
    }
);

export const deleteSpecialty = createAsyncThunk(
    'specialty/deleteSpecialty',
    async (id: string, { rejectWithValue }) => {
        try {
            await SpecialtyService.deleteSpecialty(id);
            return id;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Không thể kết nối đến máy chủ!');
        }
    }
);

export const filterSpecialties = createAsyncThunk(
    'specialty/filterSpecialties',
    async (params: SpecialtySearchParams, { rejectWithValue }) => {
        try {
            const response = await SpecialtyService.filterSpecialties(params);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Không thể kết nối đến máy chủ!');
        }
    }
);

// Specialty slice
const specialtySlice = createSlice({
    name: 'specialty',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearCurrentSpecialty: (state) => {
            state.currentSpecialty = null;
        },
        resetSpecialtyState: () => {
            return initialState;
        },
    },
    extraReducers: (builder) => {
        // Fetch specialties
        builder
            .addCase(fetchSpecialties.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(
                fetchSpecialties.fulfilled,
                (state, action: PayloadAction<SpecialtyListResponse>) => {
                    state.isLoading = false;
                    state.specialties = action.payload.specialties;
                    state.pagination = {
                        totalCount: action.payload.totalCount,
                        pageNumber: action.payload.pageNumber,
                        pageSize: action.payload.pageSize,
                        totalPages: action.payload.totalPages,
                    };
                    state.error = null;
                }
            )
            .addCase(fetchSpecialties.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Fetch specialty by ID
        builder
            .addCase(fetchSpecialtyById.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchSpecialtyById.fulfilled, (state, action: PayloadAction<Specialty>) => {
                state.isLoading = false;
                state.currentSpecialty = action.payload;
                state.error = null;
            })
            .addCase(fetchSpecialtyById.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Create specialty
        builder
            .addCase(createSpecialty.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(createSpecialty.fulfilled, (state, action: PayloadAction<Specialty>) => {
                state.isLoading = false;
                state.specialties.unshift(action.payload);
                state.pagination.totalCount += 1;
                state.error = null;
            })
            .addCase(createSpecialty.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Create specialty with image
        builder
            .addCase(createSpecialtyWithImage.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(
                createSpecialtyWithImage.fulfilled,
                (state, action: PayloadAction<Specialty>) => {
                    state.isLoading = false;
                    state.specialties.unshift(action.payload);
                    state.pagination.totalCount += 1;
                    state.error = null;
                }
            )
            .addCase(createSpecialtyWithImage.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Update specialty
        builder
            .addCase(updateSpecialty.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateSpecialty.fulfilled, (state, action: PayloadAction<Specialty>) => {
                state.isLoading = false;
                const index = state.specialties.findIndex((s) => s.id === action.payload.id);
                if (index !== -1) {
                    state.specialties[index] = action.payload;
                }
                if (state.currentSpecialty?.id === action.payload.id) {
                    state.currentSpecialty = action.payload;
                }
                state.error = null;
            })
            .addCase(updateSpecialty.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Update specialty with image
        builder
            .addCase(updateSpecialtyWithImage.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(
                updateSpecialtyWithImage.fulfilled,
                (state, action: PayloadAction<Specialty>) => {
                    state.isLoading = false;
                    const index = state.specialties.findIndex((s) => s.id === action.payload.id);
                    if (index !== -1) {
                        state.specialties[index] = action.payload;
                    }
                    if (state.currentSpecialty?.id === action.payload.id) {
                        state.currentSpecialty = action.payload;
                    }
                    state.error = null;
                }
            )
            .addCase(updateSpecialtyWithImage.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Delete specialty
        builder
            .addCase(deleteSpecialty.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(deleteSpecialty.fulfilled, (state, action: PayloadAction<string>) => {
                state.isLoading = false;
                state.specialties = state.specialties.filter((s) => s.id !== action.payload);
                state.pagination.totalCount -= 1;
                if (state.currentSpecialty?.id === action.payload) {
                    state.currentSpecialty = null;
                }
                state.error = null;
            })
            .addCase(deleteSpecialty.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Filter specialties
        builder
            .addCase(filterSpecialties.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(
                filterSpecialties.fulfilled,
                (state, action: PayloadAction<SpecialtyListResponse>) => {
                    state.isLoading = false;
                    state.specialties = action.payload.specialties;
                    state.pagination = {
                        totalCount: action.payload.totalCount,
                        pageNumber: action.payload.pageNumber,
                        pageSize: action.payload.pageSize,
                        totalPages: action.payload.totalPages,
                    };
                    state.error = null;
                }
            )
            .addCase(filterSpecialties.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearError, clearCurrentSpecialty, resetSpecialtyState } = specialtySlice.actions;
export default specialtySlice.reducer;
