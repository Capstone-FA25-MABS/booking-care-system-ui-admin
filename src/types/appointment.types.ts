// ============================================
// API Types (matching backend exactly)
// ============================================

import { AppointmentStatus, AppointmentType, AppointmentTime } from '@/enums/appointment.enums';

// Patient Information from API
export interface PatientInfo {
    id: string;
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
    email?: string;
    phone?: string;
}

// Relative (Family Member) Information from API
export interface RelativeInfo {
    id: string;
    firstName?: string;
    lastName?: string;
    fullName?: string;
    gender?: string;
    dateOfBirth?: string;
    age?: number;
    phone?: string;
    relationship?: string;
    relationshipDisplay?: string;
}

// Doctor Information from API
export interface DoctorInfo {
    id: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    fullName?: string;
    specialtyName?: string;
    positionName?: string;
    hospitalId?: string;
    avatarUrl?: string;
}

// Service Information from API
export interface ServiceInfo {
    id: string;
    name?: string;
    price?: number;
    imageUrl?: string;
}

// Hospital Information from API
export interface HospitalInfo {
    id: string;
    name?: string;
    address?: string;
    phone?: string;
    email?: string;
    avatarUrl?: string;
}

// Appointment Response from API
export interface AppointmentResponse {
    id: string;
    patientId?: string;
    patientAccountId?: string;
    relativeId?: string; // When booking for a family member
    specialtyId: string;
    appointmentDate: string;
    appointmentTimeId: AppointmentTime;
    appointmentType: AppointmentType;
    status: AppointmentStatus;
    reason?: string;
    result?: string;
    symptoms?: string;
    attachmentUrls?: string[];
    createdAt: string;
    updatedAt: string;
    consultationFees?: number; // From backend for refund option check
    patientInfo?: PatientInfo; // Account owner (người đại diện)
    relativeInfo?: RelativeInfo; // Family member (bệnh nhân thực sự)
    doctorInfo?: DoctorInfo;
    serviceInfo?: ServiceInfo;
    hospitalInfo?: HospitalInfo;
}

// Status counts for all appointment statuses
export interface AppointmentStatusCounts {
    pending: number;
    confirmed: number;
    cancelled: number;
    completed: number;
    total: number;
}

// Appointment List Response with Pagination
export interface AppointmentListResponse {
    appointments: AppointmentResponse[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
    statusCounts?: AppointmentStatusCounts;
}

// Appointment Query Request (for filtering and pagination)
export interface AppointmentQueryRequest {
    patientId?: string;
    doctorId?: string;
    hospitalId?: string;
    serviceId?: string;
    appointmentType?: AppointmentType;
    status?: AppointmentStatus;
    statuses?: AppointmentStatus[]; // For filtering multiple statuses
    fromDate?: string;
    toDate?: string;
    searchTerm?: string;
    pageNumber?: number;
    pageSize?: number;
    sortBy?: string;
    sortDescending?: boolean;
    includeStatusCounts?: boolean;
}

// Update Appointment Status Request
export interface UpdateAppointmentStatusRequest {
    id: string;
    status: AppointmentStatus;
    result?: string;
}

// ============================================
// UI Display Types (for components)
// ============================================

// UI Tab Status (for filtering in UI)
export type AppointmentUITab = 'waiting' | 'upcoming' | 'cancelled' | 'completed';

// Appointment Card Data (optimized for UI display)
export interface AppointmentCardData {
    appointmentId: string;
    patientId?: string;
    patientAccountId?: string;
    relativeId?: string; // When booking for a family member
    appointmentDate: string;
    appointmentTime: string;
    appointmentTimeId: AppointmentTime;
    appointmentType: AppointmentType;
    status: AppointmentStatus;
    reason?: string;
    result?: string;
    symptoms?: string;
    attachmentUrls?: string[];
    isNew?: boolean;
    hasReview?: boolean;
    specialtyId?: string; // For fetching available doctors
    consultationFees?: number; // For checking if refund option should be shown
    // Separate info sections
    // When relativeInfo exists: patientInfo = người đại diện, relativeInfo = bệnh nhân thực sự
    // When relativeInfo is null: patientInfo = bệnh nhân (đặt cho chính mình)
    patientInfo?: PatientInfo;
    relativeInfo?: RelativeInfo;
    doctorInfo?: DoctorInfo;
    serviceInfo?: ServiceInfo;
    hospitalInfo?: HospitalInfo;
}

// Appointment Detail Data (for detail page)
// Now uses same structure as AppointmentCardData with priority logic
export interface AppointmentDetailData extends AppointmentCardData {
    visitType?: string;
    consultationFees?: number;
    clinicLocation?: string;
    location?: string;
    personWithPatient?: string;
}

// Props for AppointmentDetail component
export interface AppointmentDetailProps {
    appointment: AppointmentDetailData;
    onStartSession?: () => void;
    onMessage?: () => void;
    onCancel?: () => void;
    onReschedule?: () => void;
    onDownloadPrescription?: () => void;
    onViewReason?: () => void;
}

// Filter Options for UI
export interface AppointmentFilterOptions {
    appointmentType: AppointmentType[];
    visitType: string[];
    dateRange: {
        from: string;
        to: string;
    };
}

// Types for new assign doctor flow
export interface DoctorForAssignment {
    id: string;
    accountId: string;
    fullName: string;
    avatarUrl?: string;
    positionName?: string;
    specialtyName?: string;
    yearsOfExperience: number;
    rating: number;
    reviewCount: number;
    bookingCount: number;
    consultationFee: number;
    isActive: boolean;
    isAvailableAtOriginalTime: boolean;
}

export interface DoctorsForAssignmentResponse {
    recommendedDoctors: DoctorForAssignment[];
    previousDoctors: DoctorForAssignment[];
    totalRecommended: number;
    totalPrevious: number;
}

export interface AssignDoctorToAppointmentResponse {
    success: boolean;
    appointmentId: string;
    doctorId: string;
    doctorName: string;
    appointmentDate: string;
    appointmentTime: string;
    message: string;
}

// ============================================
// Helper Functions
// ============================================

/**
 * Get Vietnamese text for appointment status
 */
export const getAppointmentStatusText = (status: AppointmentStatus): string => {
    switch (status) {
        case AppointmentStatus.PENDING:
            return 'Chờ xác nhận';
        case AppointmentStatus.CONFIRMED:
            return 'Đã xác nhận';
        case AppointmentStatus.CANCELLED:
            return 'Đã hủy';
        case AppointmentStatus.COMPLETED:
            return 'Hoàn thành';
        default:
            return 'Không xác định';
    }
};

/**
 * Get Vietnamese text for appointment type
 */
export const getAppointmentTypeText = (type: AppointmentType): string => {
    switch (type) {
        case AppointmentType.TELEHEALTH:
            return 'Tư vấn trực tuyến';
        case AppointmentType.IN_PERSON:
            return 'Trực tiếp';
        default:
            return 'Không xác định';
    }
};

/**
 * Format full name from first name and last name
 */
export const formatFullName = (firstName?: string, lastName?: string): string => {
    if (!firstName && !lastName) return 'N/A';
    if (!firstName) return lastName || 'N/A';
    if (!lastName) return firstName || 'N/A';
    return `${firstName} ${lastName}`.trim();
};

/**
 * Appointment time mapping - Using object mapping instead of switch to reduce complexity
 */
const APPOINTMENT_TIME_MAP: Record<AppointmentTime, string> = {
    // 30-minute intervals
    [AppointmentTime.AT_08_00_08_30]: '08:00 - 08:30',
    [AppointmentTime.AT_08_30_09_00]: '08:30 - 09:00',
    [AppointmentTime.AT_09_00_09_30]: '09:00 - 09:30',
    [AppointmentTime.AT_09_30_10_00]: '09:30 - 10:00',
    [AppointmentTime.AT_10_00_10_30]: '10:00 - 10:30',
    [AppointmentTime.AT_10_30_11_00]: '10:30 - 11:00',
    [AppointmentTime.AT_11_00_11_30]: '11:00 - 11:30',
    [AppointmentTime.AT_11_30_12_00]: '11:30 - 12:00',
    [AppointmentTime.AT_13_00_13_30]: '13:00 - 13:30',
    [AppointmentTime.AT_13_30_14_00]: '13:30 - 14:00',
    [AppointmentTime.AT_14_00_14_30]: '14:00 - 14:30',
    [AppointmentTime.AT_14_30_15_00]: '14:30 - 15:00',
    [AppointmentTime.AT_15_00_15_30]: '15:00 - 15:30',
    [AppointmentTime.AT_15_30_16_00]: '15:30 - 16:00',
    [AppointmentTime.AT_16_00_16_30]: '16:00 - 16:30',
    [AppointmentTime.AT_16_30_17_00]: '16:30 - 17:00',
    [AppointmentTime.AT_17_00_17_30]: '17:00 - 17:30',
    [AppointmentTime.AT_17_30_18_00]: '17:30 - 18:00',
    [AppointmentTime.AT_18_00_18_30]: '18:00 - 18:30',
    [AppointmentTime.AT_18_30_19_00]: '18:30 - 19:00',
    [AppointmentTime.AT_19_00_19_30]: '19:00 - 19:30',
    [AppointmentTime.AT_19_30_20_00]: '19:30 - 20:00',
    [AppointmentTime.AT_20_00_20_30]: '20:00 - 20:30',
    [AppointmentTime.AT_20_30_21_00]: '20:30 - 21:00',
    [AppointmentTime.AT_21_00_21_30]: '21:00 - 21:30',
    [AppointmentTime.AT_21_30_22_00]: '21:30 - 22:00',
    [AppointmentTime.AT_22_00_22_30]: '22:00 - 22:30',
    [AppointmentTime.AT_22_30_23_00]: '22:30 - 23:00',
    // 60-minute intervals
    [AppointmentTime.AT_08_00_09_00]: '08:00 - 09:00',
    [AppointmentTime.AT_09_00_10_00]: '09:00 - 10:00',
    [AppointmentTime.AT_10_00_11_00]: '10:00 - 11:00',
    [AppointmentTime.AT_11_00_12_00]: '11:00 - 12:00',
    [AppointmentTime.AT_13_00_14_00]: '13:00 - 14:00',
    [AppointmentTime.AT_14_00_15_00]: '14:00 - 15:00',
    [AppointmentTime.AT_15_00_16_00]: '15:00 - 16:00',
    [AppointmentTime.AT_16_00_17_00]: '16:00 - 17:00',
    [AppointmentTime.AT_17_00_18_00]: '17:00 - 18:00',
    [AppointmentTime.AT_18_00_19_00]: '18:00 - 19:00',
    [AppointmentTime.AT_19_00_20_00]: '19:00 - 20:00',
    [AppointmentTime.AT_20_00_21_00]: '20:00 - 21:00',
    [AppointmentTime.AT_21_00_22_00]: '21:00 - 22:00',
    [AppointmentTime.AT_22_00_23_00]: '22:00 - 23:00',
};

/**
 * Get time range text for appointment time slot
 */
export const getAppointmentTimeText = (timeSlot: AppointmentTime): string => {
    return APPOINTMENT_TIME_MAP[timeSlot] || 'Chưa xác định';
};

/**
 * Map AppointmentStatus to UI Tab
 */
export const mapStatusToUITab = (status: AppointmentStatus): AppointmentUITab => {
    switch (status) {
        case AppointmentStatus.PENDING:
            return 'waiting';
        case AppointmentStatus.CONFIRMED:
            return 'upcoming';
        case AppointmentStatus.CANCELLED:
            return 'cancelled';
        case AppointmentStatus.COMPLETED:
            return 'completed';
        default:
            return 'upcoming';
    }
};

/**
 * Map UI Tab to AppointmentStatus
 */
export const mapUITabToStatus = (tab: AppointmentUITab): AppointmentStatus => {
    switch (tab) {
        case 'waiting':
            return AppointmentStatus.PENDING;
        case 'upcoming':
            return AppointmentStatus.CONFIRMED;
        case 'cancelled':
            return AppointmentStatus.CANCELLED;
        case 'completed':
            return AppointmentStatus.COMPLETED;
        default:
            return AppointmentStatus.CONFIRMED;
    }
};

/**
 * Transform API AppointmentResponse to UI AppointmentCardData
 * Maps data as-is, components will handle display priority
 *
 * Display logic for patient info:
 * - If relativeInfo exists: patientInfo = người đại diện, relativeInfo = bệnh nhân thực sự
 * - If relativeInfo is null: patientInfo = bệnh nhân (đặt cho chính mình)
 */
export const transformToCardData = (apiResponse: AppointmentResponse): AppointmentCardData => {
    return {
        appointmentId: apiResponse.id,
        patientId: apiResponse.patientId,
        patientAccountId: apiResponse.patientAccountId,
        relativeId: apiResponse.relativeId,
        appointmentDate: apiResponse.appointmentDate,
        appointmentTime: getAppointmentTimeText(apiResponse.appointmentTimeId),
        appointmentTimeId: apiResponse.appointmentTimeId,
        appointmentType: apiResponse.appointmentType,
        specialtyId: apiResponse.specialtyId,
        status: apiResponse.status,
        reason: apiResponse.reason,
        result: apiResponse.result,
        symptoms: apiResponse.symptoms,
        attachmentUrls: apiResponse.attachmentUrls,
        consultationFees: apiResponse.consultationFees, // For refund option check
        isNew: false, // Can be calculated based on createdAt
        hasReview: false, // Needs review data from another endpoint
        // Map info sections directly from API response
        patientInfo: apiResponse.patientInfo,
        relativeInfo: apiResponse.relativeInfo,
        doctorInfo: apiResponse.doctorInfo,
        serviceInfo: apiResponse.serviceInfo,
        hospitalInfo: apiResponse.hospitalInfo,
    };
};

/**
 * Transform API AppointmentResponse to UI AppointmentDetailData
 * Includes additional detail fields
 */
export const transformToDetailData = (apiResponse: AppointmentResponse): AppointmentDetailData => {
    return {
        ...transformToCardData(apiResponse),
        // Note: These fields will be added in future API updates
        visitType: undefined,
        consultationFees: undefined,
        clinicLocation: undefined,
        location: apiResponse.hospitalInfo?.address, // Use hospital address as location
        personWithPatient: undefined,
    };
};

/**
 * Check if appointment is new (created within last 24 hours)
 */
export const isNewAppointment = (createdAt: string): boolean => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffHours = (now.getTime() - created.getTime()) / (1000 * 60 * 60);
    return diffHours <= 24;
};

/**
 * Get display avatar based on priority: Patient > Doctor > Hospital (for admin view)
 */
export const getDisplayAvatar = (appointment: AppointmentCardData): string => {
    if (appointment.patientInfo?.id) {
        return ''; // No avatar for patient by default
    }
    if (appointment.doctorInfo?.avatarUrl) {
        return appointment.doctorInfo.avatarUrl;
    }
    if (appointment.hospitalInfo?.avatarUrl) {
        return appointment.hospitalInfo.avatarUrl;
    }
    return ''; // No avatar for service
};

/**
 * Get display email based on priority: Patient > Doctor > Hospital
 */
export const getDisplayEmail = (appointment: AppointmentCardData): string => {
    if (appointment.patientInfo?.email) {
        return appointment.patientInfo.email;
    }
    if (appointment.doctorInfo?.email) {
        return appointment.doctorInfo.email;
    }
    if (appointment.hospitalInfo?.email) {
        return appointment.hospitalInfo.email;
    }
    return '';
};

/**
 * Get display phone - prioritize patient phone for admin view
 */
export const getDisplayPhone = (appointment: AppointmentCardData): string => {
    if (appointment.patientInfo?.phone) {
        return appointment.patientInfo?.phone;
    }
    if (appointment.hospitalInfo?.phone) {
        return appointment.hospitalInfo.phone;
    }
    return '';
};

/**
 * Get display specialty or service name
 */
export const getDisplaySpecialty = (appointment: AppointmentCardData): string => {
    if (appointment.doctorInfo?.specialtyName) {
        return appointment.doctorInfo.specialtyName;
    }
    if (appointment.serviceInfo?.name) {
        return appointment.serviceInfo.name;
    }
    return '';
};

/**
 * Check if appointment is for a family member (relative)
 */
export const isRelativeAppointment = (appointment: AppointmentCardData): boolean => {
    return !!appointment.relativeId && !!appointment.relativeInfo;
};

/**
 * Get actual patient name (the person receiving medical care)
 * - If relativeInfo exists: return relative's name (bệnh nhân thực sự)
 * - If relativeInfo is null: return patientInfo's name (đặt cho chính mình)
 */
export const getActualPatientName = (appointment: AppointmentCardData): string => {
    if (appointment.relativeInfo?.fullName) {
        return appointment.relativeInfo.fullName;
    }
    if (appointment.relativeInfo?.firstName || appointment.relativeInfo?.lastName) {
        return formatFullName(
            appointment.relativeInfo.firstName,
            appointment.relativeInfo.lastName
        );
    }
    // Fallback to patientInfo (booking for self)
    return formatFullName(appointment.patientInfo?.firstName, appointment.patientInfo?.lastName);
};

/**
 * Get representative name (the person who booked the appointment)
 * This is always the patientInfo (account owner)
 */
export const getRepresentativeName = (appointment: AppointmentCardData): string => {
    return formatFullName(appointment.patientInfo?.firstName, appointment.patientInfo?.lastName);
};

/**
 * Get actual patient phone
 * - If relativeInfo exists: return relative's phone
 * - If relativeInfo is null: return patientInfo's phone
 */
export const getActualPatientPhone = (appointment: AppointmentCardData): string => {
    if (appointment.relativeInfo?.phone) {
        return appointment.relativeInfo.phone;
    }
    return appointment.patientInfo?.phone || '';
};

/**
 * Get relationship display text (e.g., "Con", "Bố", "Mẹ")
 */
export const getRelationshipDisplay = (appointment: AppointmentCardData): string => {
    return appointment.relativeInfo?.relationshipDisplay || '';
};

/**
 * Get display name for provider (Doctor or Service)
 */
export const getProviderName = (appointment: AppointmentCardData): string => {
    if (appointment.doctorInfo?.fullName) {
        return appointment.doctorInfo.fullName;
    }
    if (appointment.doctorInfo?.firstName || appointment.doctorInfo?.lastName) {
        return formatFullName(appointment.doctorInfo.firstName, appointment.doctorInfo.lastName);
    }
    if (appointment.serviceInfo?.name) {
        return appointment.serviceInfo.name;
    }
    return 'N/A';
};

/**
 * Get display fee (from doctor or service)
 */
export const getDisplayFee = (appointment: AppointmentCardData): number => {
    return appointment.consultationFees || appointment.serviceInfo?.price || 0;
};
