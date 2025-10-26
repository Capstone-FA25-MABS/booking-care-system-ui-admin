import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Position, PositionFormData, PositionSearchParams } from '@/types/position.types';
import { BaseEntityListResponse } from '@/services/baseEntity.service';

// Extended interface to support both API response formats
interface PositionListResponse extends BaseEntityListResponse<Position> {
    positions?: Position[];
}
import {
    getAllPositions as serviceGetAllPositions,
    getPositionById as serviceGetPositionById,
    createPosition as serviceCreatePosition,
    updatePosition as serviceUpdatePosition,
    deletePosition as serviceDeletePosition,
    filterPositions as serviceFilterPositions,
} from '@/services/position.service';

export interface PositionState {
    positions: Position[];
    currentPosition: Position | null;
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
const initialState: PositionState = {
    positions: [],
    currentPosition: null,
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
export const fetchPositions = createAsyncThunk(
    'position/fetchPositions',
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
            const response = await serviceGetAllPositions(pageNumber, pageSize, sortBy, sortOrder);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Không thể kết nối đến máy chủ!');
        }
    }
);

export const fetchPositionById = createAsyncThunk(
    'position/fetchPositionById',
    async (id: string, { rejectWithValue }) => {
        try {
            const response = await serviceGetPositionById(id);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Không thể kết nối đến máy chủ!');
        }
    }
);

export const createPosition = createAsyncThunk(
    'position/createPosition',
    async (positionData: PositionFormData, { rejectWithValue }) => {
        try {
            const response = await serviceCreatePosition(positionData);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Không thể kết nối đến máy chủ!');
        }
    }
);

export const updatePosition = createAsyncThunk(
    'position/updatePosition',
    async (
        { id, positionData }: { id: string; positionData: PositionFormData },
        { rejectWithValue }
    ) => {
        try {
            const response = await serviceUpdatePosition(id, positionData);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Không thể kết nối đến máy chủ!');
        }
    }
);

export const deletePosition = createAsyncThunk(
    'position/deletePosition',
    async (id: string, { rejectWithValue }) => {
        try {
            await serviceDeletePosition(id);
            return id;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Không thể kết nối đến máy chủ!');
        }
    }
);

export const filterPositions = createAsyncThunk(
    'position/filterPositions',
    async (params: PositionSearchParams, { rejectWithValue }) => {
        try {
            const response = await serviceFilterPositions(params);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Không thể kết nối đến máy chủ!');
        }
    }
);

// Position slice
const positionSlice = createSlice({
    name: 'position',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearCurrentPosition: (state) => {
            state.currentPosition = null;
        },
        resetPositionState: () => {
            return initialState;
        },
    },
    extraReducers: (builder) => {
        // Fetch positions
        builder
            .addCase(fetchPositions.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(
                fetchPositions.fulfilled,
                (state, action: PayloadAction<PositionListResponse>) => {
                    state.isLoading = false;
                    state.positions = action.payload.positions || action.payload.items;
                    state.pagination = {
                        totalCount: action.payload.totalCount,
                        pageNumber: action.payload.pageNumber,
                        pageSize: action.payload.pageSize,
                        totalPages: action.payload.totalPages,
                    };
                    state.error = null;
                }
            )
            .addCase(fetchPositions.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Fetch position by ID
        builder
            .addCase(fetchPositionById.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchPositionById.fulfilled, (state, action: PayloadAction<Position>) => {
                state.isLoading = false;
                state.currentPosition = action.payload;
                state.error = null;
            })
            .addCase(fetchPositionById.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Create position
        builder
            .addCase(createPosition.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(createPosition.fulfilled, (state, action: PayloadAction<Position>) => {
                state.isLoading = false;
                state.positions.unshift(action.payload);
                state.pagination.totalCount += 1;
                state.error = null;
            })
            .addCase(createPosition.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Update position
        builder
            .addCase(updatePosition.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updatePosition.fulfilled, (state, action: PayloadAction<Position>) => {
                state.isLoading = false;
                const index = state.positions.findIndex((p) => p.id === action.payload.id);
                if (index !== -1) {
                    state.positions[index] = action.payload;
                }
                if (state.currentPosition?.id === action.payload.id) {
                    state.currentPosition = action.payload;
                }
                state.error = null;
            })
            .addCase(updatePosition.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Delete position
        builder
            .addCase(deletePosition.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(deletePosition.fulfilled, (state, action: PayloadAction<string>) => {
                state.isLoading = false;
                state.positions = state.positions.filter((p) => p.id !== action.payload);
                state.pagination.totalCount -= 1;
                if (state.currentPosition?.id === action.payload) {
                    state.currentPosition = null;
                }
                state.error = null;
            })
            .addCase(deletePosition.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Filter positions
        builder
            .addCase(filterPositions.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(
                filterPositions.fulfilled,
                (state, action: PayloadAction<PositionListResponse>) => {
                    state.isLoading = false;
                    state.positions = action.payload.positions || action.payload.items;
                    state.pagination = {
                        totalCount: action.payload.totalCount,
                        pageNumber: action.payload.pageNumber,
                        pageSize: action.payload.pageSize,
                        totalPages: action.payload.totalPages,
                    };
                    state.error = null;
                }
            )
            .addCase(filterPositions.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearError, clearCurrentPosition, resetPositionState } = positionSlice.actions;
export default positionSlice.reducer;
