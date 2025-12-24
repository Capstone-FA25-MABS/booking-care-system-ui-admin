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

export enum AppointmentTime {
    T08_00 = 'T08_00',
    T08_30 = 'T08_30',
    T09_00 = 'T09_00',
    T09_30 = 'T09_30',
    T10_00 = 'T10_00',
    T10_30 = 'T10_30',
    T11_00 = 'T11_00',
    T11_30 = 'T11_30',
    T13_00 = 'T13_00',
    T13_30 = 'T13_30',
    T14_00 = 'T14_00',
    T14_30 = 'T14_30',
    T15_00 = 'T15_00',
    T15_30 = 'T15_30',
    T16_00 = 'T16_00',
    T16_30 = 'T16_30',
    T17_00 = 'T17_00',
    T17_30 = 'T17_30',
    T18_00 = 'T18_00',
    T18_30 = 'T18_30',
    T19_00 = 'T19_00',
    T19_30 = 'T19_30',
    T20_00 = 'T20_00',
    T20_30 = 'T20_30',
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
