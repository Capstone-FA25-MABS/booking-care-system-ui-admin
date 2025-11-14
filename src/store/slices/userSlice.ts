import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { UserService } from '@/services/user.service';
import { HospitalService } from '@/services/hospital.service';
import { DoctorService } from '@/services/doctor.service';
import {
    AdminProfile,
    DoctorProfile,
    HospitalProfile,
    UserState,
    UpdateAdminRequest,
    UpdateDoctorRequest,
    UpdateHospitalRequest,
} from '@/types/user.types';
import { Role } from '@/enums/common.enums';

const initialState: UserState = {
    adminProfile: null,
    doctorProfile: null,
    hospitalProfile: null,
    isLoading: false,
    error: null,
};

// Helper type for management role-based fetching
// Note: STAFF uses hospital profile, PATIENT is not included as it's not a management role
type ManagementRole = Exclude<Role, Role.PATIENT>;

// ========== ADMIN ASYNC THUNKS ==========

export const fetchAdminProfile = createAsyncThunk(
    'user/fetchAdminProfile',
    async (_, { rejectWithValue }) => {
        try {
            const response = await UserService.getAdminProfile();
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error?.message || 'Failed to fetch admin profile');
        }
    }
);

export const updateAdminProfile = createAsyncThunk(
    'user/updateAdminProfile',
    async (updateData: UpdateAdminRequest, { rejectWithValue }) => {
        try {
            const response = await UserService.updateAdminProfile(updateData);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error?.message || 'Failed to update admin profile');
        }
    }
);

// ========== DOCTOR ASYNC THUNKS ==========

export const fetchDoctorProfile = createAsyncThunk(
    'user/fetchDoctorProfile',
    async (_, { rejectWithValue }) => {
        try {
            const response = await UserService.getDoctorProfileByAccountId();
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error?.message || 'Failed to fetch doctor profile');
        }
    }
);

export const updateDoctorProfile = createAsyncThunk(
    'user/updateDoctorProfile',
    async (
        { doctorId, updateData }: { doctorId: string; updateData: UpdateDoctorRequest },
        { rejectWithValue }
    ) => {
        try {
            const response = await UserService.updateDoctorProfile(doctorId, updateData);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error?.message || 'Failed to update doctor profile');
        }
    }
);

// ========== HOSPITAL ASYNC THUNKS ==========

export const fetchHospitalProfiles = createAsyncThunk(
    'user/fetchHospitalProfiles',
    async (_, { rejectWithValue }) => {
        try {
            const response = await HospitalService.getHospitalProfilesByAccountId();
            // Return first hospital profile (or null if empty)
            const profiles = response.data;
            return profiles && profiles.length > 0 ? profiles[0] : null;
        } catch (error: any) {
            return rejectWithValue(error?.message || 'Failed to fetch hospital profiles');
        }
    }
);

export const updateHospitalProfile = createAsyncThunk(
    'user/updateHospitalProfile',
    async (
        { hospitalId, updateData }: { hospitalId: string; updateData: UpdateHospitalRequest },
        { rejectWithValue }
    ) => {
        try {
            const response = await HospitalService.updateHospitalProfile(hospitalId, updateData);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error?.message || 'Failed to update hospital profile');
        }
    }
);

// ========== SMART FETCH BY ROLE ==========

/**
 * Smart fetch: Automatically fetch the correct profile based on user's role
 * @param role - User's primary management role (ADMIN, DOCTOR, or STAFF)
 */
export const fetchProfileByRole = createAsyncThunk<
    { role: ManagementRole; profile: AdminProfile | DoctorProfile | HospitalProfile | null },
    { role: ManagementRole },
    { rejectValue: string }
>('user/fetchProfileByRole', async ({ role }, { rejectWithValue }) => {
    try {
        if (role === Role.ADMIN) {
            const response = await UserService.getAdminProfile();
            return { role, profile: response.data };
        } else if (role === Role.DOCTOR) {
            const response = await DoctorService.getCurrentDoctorProfile();
            return { role, profile: response.data };
        } else if (role === Role.STAFF) {
            const response = await HospitalService.getCurrentHospitalProfile();
            return { role, profile: response.data };
        }
        throw new Error('Invalid role');
    } catch (error: any) {
        return rejectWithValue(error?.message || 'Failed to fetch user profile');
    }
});

// ========== SLICE ==========

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        clearAllUserProfiles: (state) => {
            state.adminProfile = null;
            state.doctorProfile = null;
            state.hospitalProfile = null;
            state.error = null;
        },
        clearAdminProfile: (state) => {
            state.adminProfile = null;
        },
        clearDoctorProfile: (state) => {
            state.doctorProfile = null;
        },
        clearHospitalProfile: (state) => {
            state.hospitalProfile = null;
        },
        clearUserError: (state) => {
            state.error = null;
        },
        setAdminProfile: (state, action: PayloadAction<AdminProfile>) => {
            state.adminProfile = action.payload;
        },
        setDoctorProfile: (state, action: PayloadAction<DoctorProfile>) => {
            state.doctorProfile = action.payload;
        },
        setHospitalProfile: (state, action: PayloadAction<HospitalProfile>) => {
            state.hospitalProfile = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            // ===== SMART FETCH BY ROLE =====
            .addCase(fetchProfileByRole.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchProfileByRole.fulfilled, (state, action) => {
                state.isLoading = false;
                const { role, profile } = action.payload;
                if (role === Role.ADMIN) {
                    state.adminProfile = profile as AdminProfile;
                } else if (role === Role.DOCTOR) {
                    state.doctorProfile = profile as DoctorProfile;
                } else if (role === Role.STAFF) {
                    state.hospitalProfile = profile as HospitalProfile | null;
                }
                state.error = null;
            })
            .addCase(fetchProfileByRole.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // ===== ADMIN =====
            .addCase(fetchAdminProfile.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchAdminProfile.fulfilled, (state, action) => {
                state.isLoading = false;
                state.adminProfile = action.payload;
                state.error = null;
            })
            .addCase(fetchAdminProfile.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            .addCase(updateAdminProfile.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateAdminProfile.fulfilled, (state, action) => {
                state.isLoading = false;
                state.adminProfile = action.payload;
                state.error = null;
            })
            .addCase(updateAdminProfile.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // ===== DOCTOR =====
            .addCase(fetchDoctorProfile.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchDoctorProfile.fulfilled, (state, action) => {
                state.isLoading = false;
                state.doctorProfile = action.payload;
                state.error = null;
            })
            .addCase(fetchDoctorProfile.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            .addCase(updateDoctorProfile.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateDoctorProfile.fulfilled, (state, action) => {
                state.isLoading = false;
                state.doctorProfile = action.payload;
                state.error = null;
            })
            .addCase(updateDoctorProfile.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // ===== HOSPITAL =====
            .addCase(fetchHospitalProfiles.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchHospitalProfiles.fulfilled, (state, action) => {
                state.isLoading = false;
                state.hospitalProfile = action.payload;
                state.error = null;
            })
            .addCase(fetchHospitalProfiles.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            .addCase(updateHospitalProfile.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateHospitalProfile.fulfilled, (state, action) => {
                state.isLoading = false;
                state.hospitalProfile = action.payload;
                state.error = null;
            })
            .addCase(updateHospitalProfile.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });
    },
});

export const {
    clearAllUserProfiles,
    clearAdminProfile,
    clearDoctorProfile,
    clearHospitalProfile,
    clearUserError,
    setAdminProfile,
    setDoctorProfile,
    setHospitalProfile,
} = userSlice.actions;

export default userSlice.reducer;
