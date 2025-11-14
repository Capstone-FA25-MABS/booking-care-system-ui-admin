import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { HospitalService } from '@/services/hospital.service';
import { Specialty } from '@/types/specialty.types';
import { ServiceType } from '@/types/serviceType.types';
import { getAllSpecialtiesSimple } from '@/services/specialty.service';
import { getAllServiceTypesSimple } from '@/services/serviceType.service';

// ========== STATE INTERFACES ==========

export interface HospitalSpecialtiesState {
    allSpecialties: Specialty[];
    selectedSpecialtyIds: string[];
    isLoading: boolean;
    isSaving: boolean;
    error: string | null;
}

export interface HospitalServiceTypesState {
    allServiceTypes: ServiceType[];
    selectedServiceTypeIds: string[];
    isLoading: boolean;
    isSaving: boolean;
    error: string | null;
}

export interface HospitalState {
    specialties: HospitalSpecialtiesState;
    serviceTypes: HospitalServiceTypesState;
}

// ========== INITIAL STATE ==========

const initialState: HospitalState = {
    specialties: {
        allSpecialties: [],
        selectedSpecialtyIds: [],
        isLoading: false,
        isSaving: false,
        error: null,
    },
    serviceTypes: {
        allServiceTypes: [],
        selectedServiceTypeIds: [],
        isLoading: false,
        isSaving: false,
        error: null,
    },
};

// ========== SPECIALTIES ASYNC THUNKS ==========

export const fetchAllSpecialties = createAsyncThunk(
    'hospital/fetchAllSpecialties',
    async (_, { rejectWithValue }) => {
        try {
            const response = await getAllSpecialtiesSimple();
            // Handle both response structures: array directly or wrapped in data
            let specialtiesList: Specialty[] = [];
            const responseData = response.data as any;

            if (Array.isArray(responseData)) {
                specialtiesList = responseData;
            } else if (responseData?.items && Array.isArray(responseData.items)) {
                specialtiesList = responseData.items;
            } else if (responseData?.specialties && Array.isArray(responseData.specialties)) {
                specialtiesList = responseData.specialties;
            }

            // Filter only ACTIVE specialties
            const activeSpecialties = specialtiesList.filter(
                (s: Specialty) => !s.status || s.status === 'ACTIVE'
            );

            return activeSpecialties.length > 0 ? activeSpecialties : specialtiesList;
        } catch (error: any) {
            return rejectWithValue(error?.message || 'Không thể tải danh sách chuyên khoa');
        }
    }
);

export const fetchHospitalSpecialties = createAsyncThunk(
    'hospital/fetchHospitalSpecialties',
    async (hospitalId: string, { rejectWithValue }) => {
        try {
            const response = await HospitalService.getHospitalSpecialtyIds(hospitalId);
            return response.data || [];
        } catch (error: any) {
            return rejectWithValue(error?.message || 'Không thể tải chuyên khoa của bệnh viện');
        }
    }
);

export const updateHospitalSpecialties = createAsyncThunk(
    'hospital/updateHospitalSpecialties',
    async (
        { hospitalId, specialtyIds }: { hospitalId: string; specialtyIds: string[] },
        { rejectWithValue }
    ) => {
        try {
            await HospitalService.updateHospitalSpecialties(hospitalId, specialtyIds);
            return specialtyIds;
        } catch (error: any) {
            return rejectWithValue(error?.message || 'Không thể cập nhật chuyên khoa');
        }
    }
);

// ========== SERVICE TYPES ASYNC THUNKS ==========

export const fetchAllServiceTypes = createAsyncThunk(
    'hospital/fetchAllServiceTypes',
    async (_, { rejectWithValue }) => {
        try {
            const response = await getAllServiceTypesSimple();
            // Handle both response structures: array directly or wrapped in data
            let serviceTypesList: ServiceType[] = [];
            const responseData = response.data as any;

            if (Array.isArray(responseData)) {
                serviceTypesList = responseData;
            } else if (responseData?.items && Array.isArray(responseData.items)) {
                serviceTypesList = responseData.items;
            } else if (responseData?.serviceTypes && Array.isArray(responseData.serviceTypes)) {
                serviceTypesList = responseData.serviceTypes;
            }

            // Filter only ACTIVE service types
            const activeServiceTypes = serviceTypesList.filter(
                (s: ServiceType) => !s.status || s.status === 'ACTIVE'
            );

            return activeServiceTypes.length > 0 ? activeServiceTypes : serviceTypesList;
        } catch (error: any) {
            return rejectWithValue(error?.message || 'Không thể tải danh sách loại dịch vụ');
        }
    }
);

export const fetchHospitalServiceTypes = createAsyncThunk(
    'hospital/fetchHospitalServiceTypes',
    async (hospitalId: string, { rejectWithValue }) => {
        try {
            const response = await HospitalService.getHospitalServiceTypeIds(hospitalId);
            return response.data || [];
        } catch (error: any) {
            return rejectWithValue(error?.message || 'Không thể tải loại dịch vụ của bệnh viện');
        }
    }
);

export const updateHospitalServiceTypes = createAsyncThunk(
    'hospital/updateHospitalServiceTypes',
    async (
        { hospitalId, serviceTypeIds }: { hospitalId: string; serviceTypeIds: string[] },
        { rejectWithValue }
    ) => {
        try {
            await HospitalService.updateHospitalServiceTypes(hospitalId, serviceTypeIds);
            return serviceTypeIds;
        } catch (error: any) {
            return rejectWithValue(error?.message || 'Không thể cập nhật loại dịch vụ');
        }
    }
);

// ========== SLICE ==========

const hospitalSlice = createSlice({
    name: 'hospital',
    initialState,
    reducers: {
        // Specialties reducers
        setSelectedSpecialtyIds: (state, action: PayloadAction<string[]>) => {
            state.specialties.selectedSpecialtyIds = action.payload;
        },
        toggleSpecialty: (state, action: PayloadAction<string>) => {
            const specialtyId = action.payload;
            const index = state.specialties.selectedSpecialtyIds.indexOf(specialtyId);
            if (index > -1) {
                state.specialties.selectedSpecialtyIds.splice(index, 1);
            } else {
                state.specialties.selectedSpecialtyIds.push(specialtyId);
            }
        },
        clearSpecialtiesError: (state) => {
            state.specialties.error = null;
        },

        // Service Types reducers
        setSelectedServiceTypeIds: (state, action: PayloadAction<string[]>) => {
            state.serviceTypes.selectedServiceTypeIds = action.payload;
        },
        toggleServiceType: (state, action: PayloadAction<string>) => {
            const serviceTypeId = action.payload;
            const index = state.serviceTypes.selectedServiceTypeIds.indexOf(serviceTypeId);
            if (index > -1) {
                state.serviceTypes.selectedServiceTypeIds.splice(index, 1);
            } else {
                state.serviceTypes.selectedServiceTypeIds.push(serviceTypeId);
            }
        },
        clearServiceTypesError: (state) => {
            state.serviceTypes.error = null;
        },

        // Reset all state
        resetHospitalState: (state) => {
            state.specialties = initialState.specialties;
            state.serviceTypes = initialState.serviceTypes;
        },
    },
    extraReducers: (builder) => {
        builder
            // ===== SPECIALTIES =====
            .addCase(fetchAllSpecialties.pending, (state) => {
                state.specialties.isLoading = true;
                state.specialties.error = null;
            })
            .addCase(fetchAllSpecialties.fulfilled, (state, action) => {
                state.specialties.isLoading = false;
                state.specialties.allSpecialties = action.payload;
            })
            .addCase(fetchAllSpecialties.rejected, (state, action) => {
                state.specialties.isLoading = false;
                state.specialties.error = action.payload as string;
            })
            .addCase(fetchHospitalSpecialties.pending, (state) => {
                state.specialties.isLoading = true;
                state.specialties.error = null;
            })
            .addCase(fetchHospitalSpecialties.fulfilled, (state, action) => {
                state.specialties.isLoading = false;
                state.specialties.selectedSpecialtyIds = action.payload;
            })
            .addCase(fetchHospitalSpecialties.rejected, (state, action) => {
                state.specialties.isLoading = false;
                state.specialties.error = action.payload as string;
            })
            .addCase(updateHospitalSpecialties.pending, (state) => {
                state.specialties.isSaving = true;
                state.specialties.error = null;
            })
            .addCase(updateHospitalSpecialties.fulfilled, (state, action) => {
                state.specialties.isSaving = false;
                state.specialties.selectedSpecialtyIds = action.payload;
            })
            .addCase(updateHospitalSpecialties.rejected, (state, action) => {
                state.specialties.isSaving = false;
                state.specialties.error = action.payload as string;
            })
            // ===== SERVICE TYPES =====
            .addCase(fetchAllServiceTypes.pending, (state) => {
                state.serviceTypes.isLoading = true;
                state.serviceTypes.error = null;
            })
            .addCase(fetchAllServiceTypes.fulfilled, (state, action) => {
                state.serviceTypes.isLoading = false;
                state.serviceTypes.allServiceTypes = action.payload;
            })
            .addCase(fetchAllServiceTypes.rejected, (state, action) => {
                state.serviceTypes.isLoading = false;
                state.serviceTypes.error = action.payload as string;
            })
            .addCase(fetchHospitalServiceTypes.pending, (state) => {
                state.serviceTypes.isLoading = true;
                state.serviceTypes.error = null;
            })
            .addCase(fetchHospitalServiceTypes.fulfilled, (state, action) => {
                state.serviceTypes.isLoading = false;
                state.serviceTypes.selectedServiceTypeIds = action.payload;
            })
            .addCase(fetchHospitalServiceTypes.rejected, (state, action) => {
                state.serviceTypes.isLoading = false;
                state.serviceTypes.error = action.payload as string;
            })
            .addCase(updateHospitalServiceTypes.pending, (state) => {
                state.serviceTypes.isSaving = true;
                state.serviceTypes.error = null;
            })
            .addCase(updateHospitalServiceTypes.fulfilled, (state, action) => {
                state.serviceTypes.isSaving = false;
                state.serviceTypes.selectedServiceTypeIds = action.payload;
            })
            .addCase(updateHospitalServiceTypes.rejected, (state, action) => {
                state.serviceTypes.isSaving = false;
                state.serviceTypes.error = action.payload as string;
            });
    },
});

export const {
    setSelectedSpecialtyIds,
    toggleSpecialty,
    clearSpecialtiesError,
    setSelectedServiceTypeIds,
    toggleServiceType,
    clearServiceTypesError,
    resetHospitalState,
} = hospitalSlice.actions;

export default hospitalSlice.reducer;
