// Shared types for Doctor forms
import { Position } from './position.types';
import { Specialty } from './specialty.types';
import { Language, DoctorLanguage } from './language.types';
import { ServiceType, DoctorPrice } from './serviceType.types';
import { Hospital } from './hospital.types';

// Re-export types for backward compatibility
export type { Position, Specialty, Language, ServiceType, Hospital, DoctorPrice, DoctorLanguage };

export interface DoctorFormData {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    address: string;
    gender: 'MALE' | 'FEMALE' | '';
    bio: string;
    yearsOfExperience: number;
    avatar: File | string | null;
    positionId: string;
    specialtyId: string;
    hospitalId: string;
    languageIds: string[];
    servicePrices: DoctorPrice[];
}

// API Response Types (matching backend)
import { PositionBasicInfo } from './position.types';
import { SpecialtyBasicInfo } from './specialty.types';
import { LanguageBasicInfo } from './language.types';
import { DoctorPriceBasicInfo } from './serviceType.types';
import { HospitalBasicInfo } from './hospital.types';

// Re-export types for backward compatibility
export type {
    PositionBasicInfo,
    SpecialtyBasicInfo,
    LanguageBasicInfo,
    DoctorPriceBasicInfo,
    HospitalBasicInfo,
};

export interface DoctorReviewStatisticsBasic {
    averageRating: number;
    totalReviews: number;
}

export interface DoctorOptimizedResponse {
    id: string;
    firstName: string;
    lastName: string;
    yearsOfExperience: number;
    avatarUrl: string;
    position?: PositionBasicInfo;
    specialty?: SpecialtyBasicInfo;
    prices: DoctorPriceBasicInfo[];
    languages: LanguageBasicInfo[];
    hospital?: HospitalBasicInfo;
    reviewStatistics?: DoctorReviewStatisticsBasic;
    isFavorited: boolean;
    status?: 'ACTIVE' | 'INACTIVE'; // Add status for admin UI
}

export interface DoctorSearchListResponse {
    doctors: DoctorOptimizedResponse[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
}

export interface DoctorSearchParams {
    searchTerm?: string;
    specialtyId?: string;
    hospitalId?: string;
    positionId?: string;
    status?: 'ACTIVE' | 'INACTIVE';
    pageNumber?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
