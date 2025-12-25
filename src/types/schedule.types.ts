// Schedule types for Schedule Management

export enum SchedulePattern {
    MORNING = 'MORNING',
    AFTERNOON = 'AFTERNOON',
    EVENING = 'EVENING',
    NIGHT = 'NIGHT',
}

export enum ExceptionType {
    BLOCK_SLOT = 'BLOCK_SLOT',
    UNBLOCK_SLOT = 'UNBLOCK_SLOT',
    DAY_OFF = 'DAY_OFF',
    CAPACITY_CHANGE = 'CAPACITY_CHANGE',
}

export enum ExceptionRequestStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    CANCELLED = 'CANCELLED',
}

// AppointmentTime enum matching backend format (30-minute intervals)
export enum AppointmentTime {
    AT_08_00_08_30 = 'AT_08_00_08_30',
    AT_08_30_09_00 = 'AT_08_30_09_00',
    AT_09_00_09_30 = 'AT_09_00_09_30',
    AT_09_30_10_00 = 'AT_09_30_10_00',
    AT_10_00_10_30 = 'AT_10_00_10_30',
    AT_10_30_11_00 = 'AT_10_30_11_00',
    AT_11_00_11_30 = 'AT_11_00_11_30',
    AT_11_30_12_00 = 'AT_11_30_12_00',
    AT_13_00_13_30 = 'AT_13_00_13_30',
    AT_13_30_14_00 = 'AT_13_30_14_00',
    AT_14_00_14_30 = 'AT_14_00_14_30',
    AT_14_30_15_00 = 'AT_14_30_15_00',
    AT_15_00_15_30 = 'AT_15_00_15_30',
    AT_15_30_16_00 = 'AT_15_30_16_00',
    AT_16_00_16_30 = 'AT_16_00_16_30',
    AT_16_30_17_00 = 'AT_16_30_17_00',
    AT_17_00_17_30 = 'AT_17_00_17_30',
    AT_17_30_18_00 = 'AT_17_30_18_00',
    AT_18_00_18_30 = 'AT_18_00_18_30',
    AT_18_30_19_00 = 'AT_18_30_19_00',
    AT_19_00_19_30 = 'AT_19_00_19_30',
    AT_19_30_20_00 = 'AT_19_30_20_00',
    AT_20_00_20_30 = 'AT_20_00_20_30',
    AT_20_30_21_00 = 'AT_20_30_21_00',
    AT_21_00_21_30 = 'AT_21_00_21_30',
    AT_21_30_22_00 = 'AT_21_30_22_00',
    AT_22_00_22_30 = 'AT_22_00_22_30',
    AT_22_30_23_00 = 'AT_22_30_23_00',
}

export interface AppointmentTimeDto {
    id: string;
    startTime: string;
    endTime: string;
}

export interface DoctorDailySchedule {
    id: string;
    doctorId: string;
    scheduleDate: string; // DateOnly format: yyyy-MM-dd
    schedulePatterns: SchedulePattern[];
    createdAt: string;
    updatedAt: string;
}

export interface ServiceMedicalDailySchedule {
    id: string;
    serviceMedicalId: string;
    scheduleDate: string; // DateOnly format: yyyy-MM-dd
    schedulePatterns: SchedulePattern[];
    createdAt: string;
    updatedAt: string;
}

export interface DoctorScheduleException {
    id: string;
    doctorId: string;
    exceptionDate: string; // DateOnly format: yyyy-MM-dd
    appointmentTime?: AppointmentTime;
    exceptionType: ExceptionType;
    isAvailable: boolean;
    reason?: string;
    status: ExceptionRequestStatus;
    reviewedBy?: string;
    reviewedAt?: string;
    reviewComments?: string;
    createdAt: string;
}

// Doctor schedule exception with doctor info (for Staff management)
export interface DoctorScheduleExceptionWithInfo {
    id: string;
    doctorId: string;
    doctorName: string;
    doctorAvatarUrl?: string;
    doctorEmail?: string;
    exceptionDate: string;
    appointmentTime?: AppointmentTime;
    exceptionType: ExceptionType;
    isAvailable: boolean;
    reason?: string;
    status: ExceptionRequestStatus;
    reviewedBy?: string;
    reviewedAt?: string;
    reviewComments?: string;
    createdAt: string;
}

export interface ServiceMedicalScheduleException {
    id: string;
    serviceMedicalId: string;
    exceptionDate: string; // DateOnly format: yyyy-MM-dd
    appointmentTime?: AppointmentTime;
    exceptionType: ExceptionType;
    isAvailable: boolean;
    reason?: string;
    status: ExceptionRequestStatus;
    reviewedBy?: string;
    reviewedAt?: string;
    reviewComments?: string;
    createdAt: string;
}

// Type aliases for convenience
export type DoctorScheduleDto = DoctorDailySchedule;
export type ServiceMedicalScheduleDto = ServiceMedicalDailySchedule;
export type DoctorScheduleExceptionDto = DoctorScheduleException;
export type ServiceMedicalScheduleExceptionDto = ServiceMedicalScheduleException;
export type CreateDoctorScheduleRequest = CreateDoctorDailyScheduleRequest;
export type CreateServiceMedicalScheduleRequest = CreateServiceMedicalDailyScheduleRequest;

// Request types
export interface CreateDoctorDailyScheduleRequest {
    doctorId: string;
    scheduleDate: string; // DateOnly format: yyyy-MM-dd
    schedulePatterns: SchedulePattern[];
}

export interface CreateServiceMedicalDailyScheduleRequest {
    serviceMedicalId: string;
    scheduleDate: string; // DateOnly format: yyyy-MM-dd
    schedulePatterns: SchedulePattern[];
}

export interface CreateDoctorScheduleExceptionRequest {
    doctorId: string;
    exceptionDate: string; // DateOnly format: yyyy-MM-dd
    appointmentTimes?: AppointmentTime[]; // NULL or empty for full day off
    exceptionType: ExceptionType;
    isAvailable: boolean;
    reason?: string;
}

export interface CreateServiceMedicalScheduleExceptionRequest {
    serviceMedicalId: string;
    exceptionDate: string; // DateOnly format: yyyy-MM-dd
    appointmentTimes?: AppointmentTime[]; // NULL or empty for full day off
    exceptionType: ExceptionType;
    isAvailable: boolean;
    reason?: string;
}

export interface ReviewExceptionRequest {
    exceptionId: string;
    status: ExceptionRequestStatus; // APPROVED or REJECTED
    reviewComments?: string;
}

export interface ListDoctorSchedulesRequest {
    doctorId?: string;
    hospitalId?: string;
    startDate?: string;
    endDate?: string;
    pageNumber?: number;
    pageSize?: number;
}

export interface ListServiceMedicalSchedulesRequest {
    serviceMedicalId?: string;
    hospitalId?: string;
    startDate?: string;
    endDate?: string;
    pageNumber?: number;
    pageSize?: number;
}

// Response types
export interface ListSchedulesResponse<T> {
    items: T[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
}

// Doctor schedule with doctor info (for Staff management)
export interface DoctorScheduleWithInfo {
    id: string;
    doctorId: string;
    doctorName: string;
    doctorAvatarUrl?: string;
    doctorEmail?: string;
    scheduleDate: string;
    schedulePatterns: SchedulePattern[];
    createdAt: string;
    updatedAt: string;
}

// Response for listing doctor schedules by hospital
export interface ListDoctorSchedulesResponse {
    items: DoctorScheduleWithInfo[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
}

// Service medical schedule with service info (for Staff management)
export interface ServiceMedicalScheduleWithInfo {
    id: string;
    serviceMedicalId: string;
    serviceMedicalName: string;
    serviceMedicalImageUrl?: string;
    serviceCategoryName?: string;
    scheduleDate: string;
    schedulePatterns: SchedulePattern[];
    createdAt: string;
    updatedAt: string;
}

// Response for listing service medical schedules by hospital
export interface ListServiceMedicalSchedulesResponse {
    items: ServiceMedicalScheduleWithInfo[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
}
