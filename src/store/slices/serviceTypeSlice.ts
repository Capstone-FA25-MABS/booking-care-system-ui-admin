import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
    ServiceType,
    ServiceTypeFormData,
    ServiceTypeSearchParams,
} from '@/types/serviceType.types';
import { BaseEntityListResponse } from '@/services/baseEntity.service';

// Extended interface to support both API response formats
interface ServiceTypeListResponse extends BaseEntityListResponse<ServiceType> {
    serviceTypes?: ServiceType[];
}

import {
    getAllServiceTypes as serviceGetAllServiceTypes,
    getServiceTypeById as serviceGetServiceTypeById,
    createServiceType as serviceCreateServiceType,
    updateServiceType as serviceUpdateServiceType,
    deleteServiceType as serviceDeleteServiceType,
    filterServiceTypes as serviceFilterServiceTypes,
    serviceTypeService,
} from '@/services/serviceType.service';

export interface ServiceTypeState {
    serviceTypes: ServiceType[];
    currentServiceType: ServiceType | null;
    pagination: {
        pageNumber: number;
        pageSize: number;
        totalPages: number;
        totalCount: number;
    };
    isLoading: boolean;
    error: string | null;
}

const initialState: ServiceTypeState = {
    serviceTypes: [],
    currentServiceType: null,
    pagination: {
        pageNumber: 1,
        pageSize: 10,
        totalPages: 0,
        totalCount: 0,
    },
    isLoading: false,
    error: null,
};

// Async thunks
export const fetchServiceTypes = createAsyncThunk(
    'serviceType/fetchServiceTypes',
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
            const response = await serviceGetAllServiceTypes(
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

export const fetchServiceTypeById = createAsyncThunk(
    'serviceType/fetchServiceTypeById',
    async (id: string, { rejectWithValue }) => {
        try {
            const response = await serviceGetServiceTypeById(id);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Không thể kết nối đến máy chủ!');
        }
    }
);

export const createServiceType = createAsyncThunk(
    'serviceType/createServiceType',
    async (serviceTypeData: ServiceTypeFormData, { rejectWithValue }) => {
        try {
            const response = await serviceCreateServiceType(serviceTypeData);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Không thể kết nối đến máy chủ!');
        }
    }
);

export const updateServiceType = createAsyncThunk(
    'serviceType/updateServiceType',
    async ({ id, data }: { id: string; data: ServiceTypeFormData }, { rejectWithValue }) => {
        try {
            const response = await serviceUpdateServiceType(id, data);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Không thể kết nối đến máy chủ!');
        }
    }
);

export const deleteServiceType = createAsyncThunk(
    'serviceType/deleteServiceType',
    async (id: string, { rejectWithValue }) => {
        try {
            await serviceDeleteServiceType(id);
            return id;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Không thể kết nối đến máy chủ!');
        }
    }
);

export const toggleServiceTypeStatus = createAsyncThunk(
    'serviceType/toggleServiceTypeStatus',
    async (id: string, { rejectWithValue }) => {
        try {
            await serviceTypeService.toggleEntityStatus(id);
            return id;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Không thể kết nối đến máy chủ!');
        }
    }
);

export const fetchActiveServiceTypes = createAsyncThunk(
    'serviceType/fetchActiveServiceTypes',
    async (_, { rejectWithValue }) => {
        try {
            const response = await serviceTypeService.getActiveEntities();
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Không thể kết nối đến máy chủ!');
        }
    }
);

export const fetchActiveServiceTypesSimple = createAsyncThunk(
    'serviceType/fetchActiveServiceTypesSimple',
    async (_, { rejectWithValue }) => {
        try {
            const response = await serviceTypeService.getActiveServiceTypesSimple();
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Không thể kết nối đến máy chủ!');
        }
    }
);

export const filterServiceTypes = createAsyncThunk(
    'serviceType/filterServiceTypes',
    async (params: ServiceTypeSearchParams, { rejectWithValue }) => {
        try {
            const response = await serviceFilterServiceTypes(params);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Không thể kết nối đến máy chủ!');
        }
    }
);

const serviceTypeSlice = createSlice({
    name: 'serviceType',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        setCurrentServiceType: (state, action: PayloadAction<ServiceType | null>) => {
            state.currentServiceType = action.payload;
        },
        clearCurrentServiceType: (state) => {
            state.currentServiceType = null;
        },
        resetServiceTypeState: () => {
            return initialState;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch service types
            .addCase(fetchServiceTypes.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(
                fetchServiceTypes.fulfilled,
                (state, action: PayloadAction<ServiceTypeListResponse>) => {
                    state.isLoading = false;
                    state.serviceTypes = action.payload.serviceTypes || action.payload.items;
                    state.pagination = {
                        totalCount: action.payload.totalCount,
                        pageNumber: action.payload.pageNumber,
                        pageSize: action.payload.pageSize,
                        totalPages: action.payload.totalPages,
                    };
                    state.error = null;
                }
            )
            .addCase(fetchServiceTypes.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Fetch service type by ID
            .addCase(fetchServiceTypeById.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchServiceTypeById.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentServiceType = action.payload;
            })
            .addCase(fetchServiceTypeById.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Create service type
            .addCase(createServiceType.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(createServiceType.fulfilled, (state, action) => {
                state.isLoading = false;
                state.serviceTypes.unshift(action.payload);
                state.pagination.totalCount += 1;
            })
            .addCase(createServiceType.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Update service type
            .addCase(updateServiceType.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateServiceType.fulfilled, (state, action) => {
                state.isLoading = false;
                const index = state.serviceTypes.findIndex((st) => st.id === action.payload.id);
                if (index !== -1) {
                    state.serviceTypes[index] = action.payload;
                }
                if (state.currentServiceType?.id === action.payload.id) {
                    state.currentServiceType = action.payload;
                }
            })
            .addCase(updateServiceType.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Delete service type
            .addCase(deleteServiceType.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(deleteServiceType.fulfilled, (state, action) => {
                state.isLoading = false;
                state.serviceTypes = state.serviceTypes.filter((st) => st.id !== action.payload);
                state.pagination.totalCount -= 1;
            })
            .addCase(deleteServiceType.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Toggle service type status
            .addCase(toggleServiceTypeStatus.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(toggleServiceTypeStatus.fulfilled, (state, action) => {
                state.isLoading = false;
                const serviceType = state.serviceTypes.find((st) => st.id === action.payload);
                if (serviceType) {
                    serviceType.status = serviceType.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
                }
                if (state.currentServiceType?.id === action.payload) {
                    state.currentServiceType.status =
                        state.currentServiceType.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
                }
            })
            .addCase(toggleServiceTypeStatus.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Fetch active service types
            .addCase(fetchActiveServiceTypes.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchActiveServiceTypes.fulfilled, (state, action) => {
                state.isLoading = false;
                state.serviceTypes = action.payload;
            })
            .addCase(fetchActiveServiceTypes.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Fetch active service types simple
            .addCase(fetchActiveServiceTypesSimple.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchActiveServiceTypesSimple.fulfilled, (state, action) => {
                state.isLoading = false;
                state.serviceTypes = action.payload;
            })
            .addCase(fetchActiveServiceTypesSimple.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearError, setCurrentServiceType, clearCurrentServiceType, resetServiceTypeState } =
    serviceTypeSlice.actions;

export default serviceTypeSlice.reducer;
