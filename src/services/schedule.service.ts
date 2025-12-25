import axiosInstance, { ApiResponse } from '@/configs/axios.config';
import {
    DoctorDailySchedule,
    ServiceMedicalDailySchedule,
    DoctorScheduleException,
    DoctorScheduleExceptionWithInfo,
    ServiceMedicalScheduleException,
    CreateDoctorDailyScheduleRequest,
    CreateServiceMedicalDailyScheduleRequest,
    CreateDoctorScheduleExceptionRequest,
    CreateServiceMedicalScheduleExceptionRequest,
    ReviewExceptionRequest,
    AppointmentTimeDto,
    ListDoctorSchedulesResponse,
    ListServiceMedicalSchedulesResponse,
} from '@/types/schedule.types';

// Base API endpoints
const SCHEDULE_ENDPOINTS = {
    // Doctor Schedules
    DOCTOR_SCHEDULES: {
        GET_DAILY: (doctorId: string, date: string) =>
            `/schedules/doctor-schedule/${doctorId}/daily/${date}`,
        GET_RANGE: (doctorId: string) => `/schedules/doctor-schedule/${doctorId}/range`,
        CREATE_OR_UPDATE: '/schedules/doctor-schedule',
        DELETE: (doctorId: string, date: string) =>
            `/schedules/doctor-schedule/${doctorId}/daily/${date}`,
        GET_AVAILABLE_SLOTS: (doctorId: string) =>
            `/schedules/doctor-schedule/${doctorId}/available-slots`,
        LIST: '/schedules/doctor-schedule/list',
    },
    // Service Medical Schedules
    SERVICE_MEDICAL_SCHEDULES: {
        GET_DAILY: (serviceMedicalId: string, date: string) =>
            `/schedules/service-medical-schedules/${serviceMedicalId}/daily/${date}`,
        GET_RANGE: (serviceMedicalId: string) =>
            `/schedules/service-medical-schedules/${serviceMedicalId}/range`,
        CREATE_OR_UPDATE: '/schedules/service-medical-schedules',
        DELETE: (serviceMedicalId: string, date: string) =>
            `/schedules/service-medical-schedules/${serviceMedicalId}/daily/${date}`,
        GET_AVAILABLE_SLOTS: (serviceMedicalId: string) =>
            `/schedules/service-medical-schedules/${serviceMedicalId}/available-slots`,
        LIST: '/schedules/service-medical-schedules/list',
    },
    // Doctor Schedule Exceptions
    DOCTOR_EXCEPTIONS: {
        GET: (doctorId: string, date: string) =>
            `/schedules/doctor-schedule-exceptions/by-date/${doctorId}/${date}`,
        CREATE: '/schedules/doctor-schedule-exceptions',
        DELETE: (id: string) => `/schedules/doctor-schedule-exceptions/${id}`,
        GET_PENDING: '/schedules/doctor-schedule-exceptions/pending',
        GET_MY_REQUESTS: (doctorId: string) =>
            `/schedules/doctor-schedule-exceptions/my-requests/${doctorId}`,
        REVIEW: '/schedules/doctor-schedule-exceptions/review',
    },
    // Service Medical Schedule Exceptions
    SERVICE_MEDICAL_EXCEPTIONS: {
        GET: (serviceMedicalId: string, date: string) =>
            `/schedules/service-medical-schedule-exceptions/${serviceMedicalId}/${date}`,
        CREATE: '/schedules/service-medical-schedule-exceptions',
        DELETE: (id: string) => `/schedules/service-medical-schedule-exceptions/${id}`,
        GET_PENDING: '/schedules/service-medical-schedule-exceptions/pending',
        REVIEW: '/schedules/service-medical-schedule-exceptions/review',
    },
} as const;

export class ScheduleService {
    // ============================================
    // Doctor Schedule Operations
    // ============================================

    /**
     * Get doctor's daily schedule
     */
    static async getDoctorDailySchedule(
        doctorId: string,
        date: string
    ): Promise<ApiResponse<DoctorDailySchedule>> {
        try {
            const response: any = await axiosInstance.get(
                SCHEDULE_ENDPOINTS.DOCTOR_SCHEDULES.GET_DAILY(doctorId, date)
            );
            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Doctor schedule retrieved successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to retrieve doctor schedule');
        }
    }

    /**
     * Get doctor's schedule for a date range
     */
    static async getDoctorScheduleRange(
        doctorId: string,
        startDate: string,
        endDate: string
    ): Promise<ApiResponse<DoctorDailySchedule[]>> {
        try {
            const response: any = await axiosInstance.get(
                SCHEDULE_ENDPOINTS.DOCTOR_SCHEDULES.GET_RANGE(doctorId),
                { params: { startDate, endDate } }
            );
            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Doctor schedule range retrieved successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to retrieve doctor schedule range');
        }
    }

    /**
     * Create or update doctor's daily schedule
     */
    static async createOrUpdateDoctorSchedule(
        request: CreateDoctorDailyScheduleRequest
    ): Promise<ApiResponse<DoctorDailySchedule>> {
        try {
            const response: any = await axiosInstance.post(
                SCHEDULE_ENDPOINTS.DOCTOR_SCHEDULES.CREATE_OR_UPDATE,
                request
            );
            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Doctor schedule created/updated successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to create/update doctor schedule');
        }
    }

    /**
     * Delete doctor's daily schedule
     */
    static async deleteDoctorSchedule(doctorId: string, date: string): Promise<ApiResponse> {
        try {
            const response: any = await axiosInstance.delete(
                SCHEDULE_ENDPOINTS.DOCTOR_SCHEDULES.DELETE(doctorId, date)
            );
            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Doctor schedule deleted successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to delete doctor schedule');
        }
    }

    /**
     * Get available slots for a doctor
     */
    static async getDoctorAvailableSlots(
        doctorId: string,
        date: string,
        serviceId?: string
    ): Promise<ApiResponse<AppointmentTimeDto[]>> {
        try {
            const response: any = await axiosInstance.get(
                SCHEDULE_ENDPOINTS.DOCTOR_SCHEDULES.GET_AVAILABLE_SLOTS(doctorId),
                { params: { date, serviceId } }
            );
            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Available slots retrieved successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to retrieve available slots');
        }
    }

    /**
     * List doctor schedules with filters
     */
    static async listDoctorSchedules(filters: {
        doctorId?: string;
        hospitalId?: string;
        startDate?: string;
        endDate?: string;
        pageNumber?: number;
        pageSize?: number;
    }): Promise<ApiResponse<ListDoctorSchedulesResponse>> {
        try {
            const response: any = await axiosInstance.get(
                SCHEDULE_ENDPOINTS.DOCTOR_SCHEDULES.LIST,
                { params: filters }
            );
            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Doctor schedules retrieved successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to retrieve doctor schedules');
        }
    }

    // ============================================
    // Service Medical Schedule Operations
    // ============================================

    /**
     * Get service medical's daily schedule
     */
    static async getServiceMedicalDailySchedule(
        serviceMedicalId: string,
        date: string
    ): Promise<ApiResponse<ServiceMedicalDailySchedule>> {
        try {
            const response: any = await axiosInstance.get(
                SCHEDULE_ENDPOINTS.SERVICE_MEDICAL_SCHEDULES.GET_DAILY(serviceMedicalId, date)
            );
            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Service medical schedule retrieved successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to retrieve service medical schedule');
        }
    }

    /**
     * Get service medical's schedule for a date range
     */
    static async getServiceMedicalScheduleRange(
        serviceMedicalId: string,
        startDate: string,
        endDate: string
    ): Promise<ApiResponse<ServiceMedicalDailySchedule[]>> {
        try {
            const response: any = await axiosInstance.get(
                SCHEDULE_ENDPOINTS.SERVICE_MEDICAL_SCHEDULES.GET_RANGE(serviceMedicalId),
                { params: { startDate, endDate } }
            );
            return {
                success: response.success ?? true,
                data: response.data || response,
                message:
                    response.message || 'Service medical schedule range retrieved successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to retrieve service medical schedule range');
        }
    }

    /**
     * Create or update service medical's daily schedule
     */
    static async createOrUpdateServiceMedicalSchedule(
        request: CreateServiceMedicalDailyScheduleRequest
    ): Promise<ApiResponse<ServiceMedicalDailySchedule>> {
        try {
            const response: any = await axiosInstance.post(
                SCHEDULE_ENDPOINTS.SERVICE_MEDICAL_SCHEDULES.CREATE_OR_UPDATE,
                request
            );
            return {
                success: response.success ?? true,
                data: response.data || response,
                message:
                    response.message || 'Service medical schedule created/updated successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to create/update service medical schedule');
        }
    }

    /**
     * Delete service medical's daily schedule
     */
    static async deleteServiceMedicalSchedule(
        serviceMedicalId: string,
        date: string
    ): Promise<ApiResponse> {
        try {
            const response: any = await axiosInstance.delete(
                SCHEDULE_ENDPOINTS.SERVICE_MEDICAL_SCHEDULES.DELETE(serviceMedicalId, date)
            );
            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Service medical schedule deleted successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to delete service medical schedule');
        }
    }

    /**
     * List service medical schedules with filters
     */
    static async listServiceMedicalSchedules(filters: {
        serviceMedicalId?: string;
        hospitalId?: string;
        startDate?: string;
        endDate?: string;
        pageNumber?: number;
        pageSize?: number;
    }): Promise<ApiResponse<ListServiceMedicalSchedulesResponse>> {
        try {
            const response: any = await axiosInstance.get(
                SCHEDULE_ENDPOINTS.SERVICE_MEDICAL_SCHEDULES.LIST,
                { params: filters }
            );
            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Service medical schedules retrieved successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to retrieve service medical schedules');
        }
    }

    // ============================================
    // Doctor Exception Operations
    // ============================================

    /**
     * Get doctor's schedule exceptions
     */
    static async getDoctorExceptions(
        doctorId: string,
        date: string
    ): Promise<ApiResponse<DoctorScheduleException[]>> {
        try {
            const response: any = await axiosInstance.get(
                SCHEDULE_ENDPOINTS.DOCTOR_EXCEPTIONS.GET(doctorId, date)
            );
            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Doctor exceptions retrieved successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to retrieve doctor exceptions');
        }
    }

    /**
     * Create doctor schedule exception (for request day off)
     */
    static async createDoctorException(
        request: CreateDoctorScheduleExceptionRequest
    ): Promise<ApiResponse<DoctorScheduleException[]>> {
        try {
            const response: any = await axiosInstance.post(
                SCHEDULE_ENDPOINTS.DOCTOR_EXCEPTIONS.CREATE,
                request
            );
            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Doctor exception created successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to create doctor exception');
        }
    }

    /**
     * Delete doctor schedule exception
     */
    static async deleteDoctorException(id: string): Promise<ApiResponse> {
        try {
            const response: any = await axiosInstance.delete(
                SCHEDULE_ENDPOINTS.DOCTOR_EXCEPTIONS.DELETE(id)
            );
            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Doctor exception deleted successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to delete doctor exception');
        }
    }

    /**
     * Get pending doctor exception requests (with doctor info for Staff management)
     */
    static async getPendingDoctorExceptions(
        hospitalId?: string,
        doctorId?: string
    ): Promise<ApiResponse<DoctorScheduleExceptionWithInfo[]>> {
        try {
            const response: any = await axiosInstance.get(
                SCHEDULE_ENDPOINTS.DOCTOR_EXCEPTIONS.GET_PENDING,
                { params: { hospitalId, doctorId } }
            );
            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Pending doctor exceptions retrieved successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to retrieve pending doctor exceptions');
        }
    }

    /**
     * Review (approve/reject) doctor exception request
     */
    static async reviewDoctorException(
        request: ReviewExceptionRequest
    ): Promise<ApiResponse<DoctorScheduleException>> {
        try {
            const response: any = await axiosInstance.put(
                SCHEDULE_ENDPOINTS.DOCTOR_EXCEPTIONS.REVIEW,
                request
            );
            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Doctor exception reviewed successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to review doctor exception');
        }
    }

    /**
     * Get doctor's own exception requests (all statuses)
     */
    static async getMyExceptionRequests(
        doctorId: string
    ): Promise<ApiResponse<DoctorScheduleException[]>> {
        try {
            const response: any = await axiosInstance.get(
                SCHEDULE_ENDPOINTS.DOCTOR_EXCEPTIONS.GET_MY_REQUESTS(doctorId)
            );
            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'My exception requests retrieved successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to retrieve my exception requests');
        }
    }

    // ============================================
    // Service Medical Exception Operations
    // ============================================

    /**
     * Get service medical's schedule exceptions
     */
    static async getServiceMedicalExceptions(
        serviceMedicalId: string,
        date: string
    ): Promise<ApiResponse<ServiceMedicalScheduleException[]>> {
        try {
            const response: any = await axiosInstance.get(
                SCHEDULE_ENDPOINTS.SERVICE_MEDICAL_EXCEPTIONS.GET(serviceMedicalId, date)
            );
            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Service medical exceptions retrieved successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to retrieve service medical exceptions');
        }
    }

    /**
     * Create service medical schedule exception
     */
    static async createServiceMedicalException(
        request: CreateServiceMedicalScheduleExceptionRequest
    ): Promise<ApiResponse<ServiceMedicalScheduleException[]>> {
        try {
            const response: any = await axiosInstance.post(
                SCHEDULE_ENDPOINTS.SERVICE_MEDICAL_EXCEPTIONS.CREATE,
                request
            );
            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Service medical exception created successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to create service medical exception');
        }
    }

    /**
     * Delete service medical schedule exception
     */
    static async deleteServiceMedicalException(id: string): Promise<ApiResponse> {
        try {
            const response: any = await axiosInstance.delete(
                SCHEDULE_ENDPOINTS.SERVICE_MEDICAL_EXCEPTIONS.DELETE(id)
            );
            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Service medical exception deleted successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to delete service medical exception');
        }
    }

    /**
     * Get pending service medical exception requests
     */
    static async getPendingServiceMedicalExceptions(
        hospitalId?: string,
        serviceMedicalId?: string
    ): Promise<ApiResponse<ServiceMedicalScheduleException[]>> {
        try {
            const response: any = await axiosInstance.get(
                SCHEDULE_ENDPOINTS.SERVICE_MEDICAL_EXCEPTIONS.GET_PENDING,
                { params: { hospitalId, serviceMedicalId } }
            );
            return {
                success: response.success ?? true,
                data: response.data || response,
                message:
                    response.message || 'Pending service medical exceptions retrieved successfully',
            };
        } catch (error: any) {
            throw new Error(
                error.message || 'Failed to retrieve pending service medical exceptions'
            );
        }
    }

    /**
     * Review (approve/reject) service medical exception request
     */
    static async reviewServiceMedicalException(
        request: ReviewExceptionRequest
    ): Promise<ApiResponse<ServiceMedicalScheduleException>> {
        try {
            const response: any = await axiosInstance.put(
                SCHEDULE_ENDPOINTS.SERVICE_MEDICAL_EXCEPTIONS.REVIEW,
                request
            );
            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Service medical exception reviewed successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to review service medical exception');
        }
    }
}
