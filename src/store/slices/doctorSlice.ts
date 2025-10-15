import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { DoctorService } from '@/services/doctor.service';
import { DoctorOptimizedResponse, DoctorSearchParams } from '@/types/doctor.types';

// Doctor state interface
export interface DoctorState {
    // Doctors data
    doctors: DoctorOptimizedResponse[];
    currentDoctor: DoctorOptimizedResponse | null;

    // Filter options
    specialties: Array<{ id: string; name: string; imageUrl: string }>;
    positions: Array<{ id: string; name: string; doctorCount: number }>;
    serviceTypes: Array<{ id: string; name: string }>;
    languages: Array<{ id: string; name: string }>;

    // Pagination
    pagination: {
        totalCount: number;
        pageNumber: number;
        pageSize: number;
        totalPages: number;
    };

    // Loading states
    isLoading: boolean;
    isFilterOptionsLoading: boolean;

    // Error states
    error: string | null;
    filterOptionsError: string | null;
}

// Initial state
const initialState: DoctorState = {
    doctors: [],
    currentDoctor: null,
    specialties: [],
    positions: [],
    serviceTypes: [],
    languages: [],
    pagination: {
        totalCount: 0,
        pageNumber: 1,
        pageSize: 10,
        totalPages: 0,
    },
    isLoading: false,
    isFilterOptionsLoading: false,
    error: null,
    filterOptionsError: null,
};

// Async thunks
export const fetchDoctorsByHospital = createAsyncThunk(
    'doctor/fetchDoctorsByHospital',
    async (
        {
            hospitalId,
            pageNumber = 1,
            pageSize = 10,
        }: { hospitalId: string; pageNumber?: number; pageSize?: number },
        { rejectWithValue }
    ) => {
        try {
            const response = await DoctorService.getDoctorsByHospital(
                hospitalId,
                pageNumber,
                pageSize
            );
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to fetch doctors by hospital');
        }
    }
);

export const filterDoctors = createAsyncThunk(
    'doctor/filterDoctors',
    async (params: DoctorSearchParams, { rejectWithValue }) => {
        try {
            const response = await DoctorService.filterDoctors(params);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to filter doctors');
        }
    }
);

export const fetchFilterOptions = createAsyncThunk(
    'doctor/fetchFilterOptions',
    async (_, { rejectWithValue }) => {
        try {
            const [specialtiesRes, positionsRes, serviceTypesRes, languagesRes] = await Promise.all(
                [
                    DoctorService.getSpecialties(),
                    DoctorService.getPositions(),
                    DoctorService.getServiceTypes(),
                    DoctorService.getLanguages(),
                ]
            );

            return {
                specialties: specialtiesRes.data,
                positions: positionsRes.data,
                serviceTypes: serviceTypesRes.data,
                languages: languagesRes.data,
            };
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to fetch filter options');
        }
    }
);

// Doctor slice
const doctorSlice = createSlice({
    name: 'doctor',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearFilterOptionsError: (state) => {
            state.filterOptionsError = null;
        },
        setCurrentDoctor: (state, action) => {
            state.currentDoctor = action.payload;
        },
        clearCurrentDoctor: (state) => {
            state.currentDoctor = null;
        },
        resetDoctorState: () => {
            return { ...initialState };
        },
    },
    extraReducers: (builder) => {
        // Fetch doctors by hospital
        builder
            .addCase(fetchDoctorsByHospital.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchDoctorsByHospital.fulfilled, (state, action) => {
                state.isLoading = false;
                state.doctors = action.payload.doctors;
                state.pagination = {
                    totalCount: action.payload.totalCount,
                    pageNumber: action.payload.pageNumber,
                    pageSize: action.payload.pageSize,
                    totalPages: action.payload.totalPages,
                };
            })
            .addCase(fetchDoctorsByHospital.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Filter doctors
        builder
            .addCase(filterDoctors.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(filterDoctors.fulfilled, (state, action) => {
                state.isLoading = false;
                state.doctors = action.payload.doctors;
                state.pagination = {
                    totalCount: action.payload.totalCount,
                    pageNumber: action.payload.pageNumber,
                    pageSize: action.payload.pageSize,
                    totalPages: action.payload.totalPages,
                };
            })
            .addCase(filterDoctors.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Fetch filter options
        builder
            .addCase(fetchFilterOptions.pending, (state) => {
                state.isFilterOptionsLoading = true;
                state.filterOptionsError = null;
            })
            .addCase(fetchFilterOptions.fulfilled, (state, action) => {
                state.isFilterOptionsLoading = false;
                state.specialties = action.payload.specialties;
                state.positions = action.payload.positions;
                state.serviceTypes = action.payload.serviceTypes;
                state.languages = action.payload.languages;
            })
            .addCase(fetchFilterOptions.rejected, (state, action) => {
                state.isFilterOptionsLoading = false;
                state.filterOptionsError = action.payload as string;
            });
    },
});

// Export actions
export const {
    clearError,
    clearFilterOptionsError,
    setCurrentDoctor,
    clearCurrentDoctor,
    resetDoctorState,
} = doctorSlice.actions;

// Export reducer
export default doctorSlice.reducer;
