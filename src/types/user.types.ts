// src/types/user.types.ts

import { Gender, Status } from '../enums/common.enums';

// ========== ADMIN PROFILE (from User Service) ==========
export interface AdminProfile {
    id: string;
    accountId: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    gender?: Gender;
    dateOfBirth?: string;
    address?: string;
    avatarUrl?: string;
    createdAt: string;
    updatedAt: string;
}

// ========== DOCTOR PROFILE (from Doctor Service) ==========
export interface DoctorProfile {
    id: string;
    accountId: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    gender?: Gender;
    dateOfBirth?: string;
    avatarUrl?: string;
    hospitalId?: string;
    specialtyId?: string;
    positionId?: string;
    yearsOfExperience?: number;
    consultationFee?: number;
    biography?: string;
    status?: Status;
    createdAt: string;
    updatedAt: string;
}

// ========== HOSPITAL PROFILE (from Hospital Service) ==========
export interface HospitalProfile {
    id: string;
    accountId: string;
    name: string;
    email: string;
    phone?: string;
    address?: string;
    logoUrl?: string; // Legacy field name
    avatarUrl?: string; // Actual field from backend
    backgroundUrl?: string;
    description?: string;
    specialties?: Array<{ specialtyId: string; specialtyName?: string }>;
    serviceTypes?: Array<{ serviceTypeId: string; serviceTypeName?: string }>;
    serviceMedicals?: Array<{ serviceMedicalId: string; serviceMedicalName?: string }>;
    images?: Array<{ id: string; imageUrl: string }>;
    status?: Status;
    createdAt: string;
    updatedAt: string;
}

// ========== UPDATE REQUESTS ==========
export interface UpdateAdminRequest {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    gender?: Gender;
    dateOfBirth?: string;
    address?: string;
    avatarUrl?: string;
}

export interface UpdateDoctorRequest {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    gender?: Gender;
    dateOfBirth?: string;
    avatarUrl?: string;
    hospitalId?: string;
    specialtyId?: string;
    positionId?: string;
    yearsOfExperience?: number;
    consultationFee?: number;
    biography?: string;
}

export interface UpdateHospitalRequest {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    avatarUrl?: string;
    backgroundUrl?: string;
    description?: string;
    specialtyIds?: string[];
    serviceTypeIds?: string[];
    serviceMedicalIds?: string[];
}

// ========== USER STATE (Multi-role support) ==========
export interface UserState {
    adminProfile: AdminProfile | null;
    doctorProfile: DoctorProfile | null;
    hospitalProfile: HospitalProfile | null;
    isLoading: boolean;
    error: string | null;
}
