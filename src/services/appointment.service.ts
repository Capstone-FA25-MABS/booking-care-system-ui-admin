import axiosInstance, { ApiResponse } from '@/configs/axios.config';
import {
    AppointmentResponse,
    AppointmentListResponse,
    AppointmentQueryRequest,
    UpdateAppointmentStatusRequest,
} from '@/types/appointment.types';

// Base API endpoints for appointments
const APPOINTMENT_ENDPOINTS = {
    BASE: '/appointments',
    HEALTH: '/appointments/health',
    MANAGEMENT: '/appointments/management',
    STATUS: (id: string) => `/appointments/status/${id}`,
    CANCEL: (id: string) => `/appointments/cancel/${id}`,
    BY_ID: (id: string) => `/appointments/${id}`,
} as const;

/**
 * Appointment Service for Admin/Management
 * Handles all appointment-related API operations for clinic management
 */
export class AppointmentService {
    /**
     * Health check endpoint
     */
    static async healthCheck(): Promise<ApiResponse> {
        try {
            const response: any = await axiosInstance.get(APPOINTMENT_ENDPOINTS.HEALTH);
            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message,
            };
        } catch (error: any) {
            throw new Error(error.message || 'Appointment service health check failed');
        }
    }

    /**
     * Get appointment by ID with enriched data
     * Includes patient, doctor, service, and hospital information via gRPC
     */
    static async getAppointmentById(id: string): Promise<ApiResponse<AppointmentResponse>> {
        try {
            const response: any = await axiosInstance.get(APPOINTMENT_ENDPOINTS.BY_ID(id));
            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Appointment retrieved successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to get appointment');
        }
    }

    /**
     * Get appointments for management roles (Doctor, Staff, Admin) with role-based filtering
     * Uses POST method as specified in the controller with [FromBody]
     *
     * This endpoint automatically filters appointments based on user role:
     * - Doctor: Only appointments assigned to that doctor
     * - Staff/Admin: All appointments in their hospital/clinic
     *
     * @param query Query parameters for filtering and pagination
     * @returns Paginated list of appointments with enriched data
     */
    static async getAppointmentsForManagement(
        query: AppointmentQueryRequest
    ): Promise<ApiResponse<AppointmentListResponse>> {
        try {
            const response: any = await axiosInstance.post(APPOINTMENT_ENDPOINTS.MANAGEMENT, query);
            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Management appointments retrieved successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to get management appointments');
        }
    }

    /**
     * Update appointment status
     */
    static async updateAppointmentStatus(
        request: UpdateAppointmentStatusRequest
    ): Promise<ApiResponse<void>> {
        try {
            const response: any = await axiosInstance.put(
                APPOINTMENT_ENDPOINTS.STATUS(request.id),
                request
            );
            return {
                success: response.success ?? true,
                data: response.data,
                message: response.message || 'Appointment status updated successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to update appointment status');
        }
    }

    /**
     * Cancel an appointment (must be at least 24 hours before appointment)
     * Triggers refund process and sends notifications
     */
    static async cancelAppointment(
        appointmentId: string,
        cancellationReason: string,
        cancelledByStaffId?: string
    ): Promise<ApiResponse<void>> {
        try {
            const request = {
                appointmentId,
                cancellationReason,
                cancelledByStaffId,
            };
            const response: any = await axiosInstance.post(
                APPOINTMENT_ENDPOINTS.CANCEL(appointmentId),
                request
            );
            return {
                success: response.success ?? true,
                data: response.data,
                message:
                    response.message ||
                    'Appointment cancelled successfully. Refund process has been initiated.',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to cancel appointment');
        }
    }
}

// Export individual methods for convenience
export const {
    healthCheck,
    getAppointmentById,
    getAppointmentsForManagement,
    updateAppointmentStatus,
    cancelAppointment,
} = AppointmentService;

// Default export
export default AppointmentService;
