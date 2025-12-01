import axiosInstance, { ApiResponse } from '@/configs/axios.config';
import {
    AppointmentResponse,
    AppointmentListResponse,
    AppointmentQueryRequest,
    UpdateAppointmentStatusRequest,
    AssignDoctorToAppointmentResponse,
    DoctorsForAssignmentResponse,
} from '@/types/appointment.types';
import {
    StaffHospitalStatisticsRequest,
    StaffHospitalStatisticsResponse,
} from '@/types/statistics.types';

// Base API endpoints for appointments
const APPOINTMENT_ENDPOINTS = {
    BASE: '/appointments',
    HEALTH: '/appointments/health',
    MANAGEMENT: '/appointments/management',
    STATUS: (id: string) => `/appointments/status/${id}`,
    CANCEL: (id: string) => `/appointments/cancel/${id}`,
    BY_ID: (id: string) => `/appointments/${id}`,
    ASSIGN_NEW_DOCTOR: (id: string) => `/appointments/${id}/assign-new-doctor`,
    AVAILABLE_DOCTORS: '/appointments/available-doctors', // Now uses query params
    STAFF_STATISTICS: '/appointments/staff/statistics',
    // NEW: Assign doctor to appointment flow (for "Hospital assigns doctor" appointments)
    DOCTORS_FOR_ASSIGNMENT: (id: string) => `/appointments/${id}/doctors-for-assignment`,
    ASSIGN_DOCTOR: (id: string) => `/appointments/${id}/assign-doctor`,
} as const;

// Schedule Service endpoints
const SCHEDULE_ENDPOINTS = {
    AVAILABLE_SLOTS: (doctorId: string, date: string) =>
        `/schedules/doctor-schedule/${doctorId}/available-slots?date=${date}`,
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
        cancelledByStaffId?: string,
        enableRescheduleOptions?: boolean,
        rescheduleOptions?: {
            enableSameDoctorReschedule: boolean;
            enableNewDoctorAssignment: boolean;
            enableDoctorSelection: boolean;
            enableRefundRequest: boolean;
        }
    ): Promise<ApiResponse<void>> {
        try {
            const request = {
                appointmentId,
                cancellationReason,
                cancelledByStaffId,
                enableRescheduleOptions,
                rescheduleOptions,
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

    /**
     * Staff assigns new doctor to cancelled appointment (Option 2)
     * Creates soft reservation for patient confirmation
     */
    static async assignNewDoctor(
        appointmentId: string,
        newDoctorId: string,
        assignedByStaffId: string,
        newAppointmentDate?: string,
        newAppointmentTimeId?: string,
        cancellationReason?: string,
        staffNote?: string
    ): Promise<ApiResponse<{ confirmationUrl: string }>> {
        try {
            const request = {
                appointmentId,
                newDoctorId,
                assignedByStaffId,
                newAppointmentDate,
                newAppointmentTimeId,
                cancellationReason,
                staffNote,
            };
            const response: any = await axiosInstance.post(
                APPOINTMENT_ENDPOINTS.ASSIGN_NEW_DOCTOR(appointmentId),
                request
            );
            return {
                success: response.success ?? true,
                data: response.data,
                message: response.message || 'Doctor assigned successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to assign new doctor');
        }
    }

    /**
     * Get available doctors for staff to assign (Option 2)
     * Returns doctors from same hospital + specialty
     * @param checkAvailability - If true, only return doctors available at specified date/time. If false, return all doctors.
     */
    static async getAvailableDoctors(
        hospitalId: string,
        specialtyId: string,
        appointmentDate?: string,
        appointmentTimeId?: string,
        checkAvailability: boolean = true
    ): Promise<
        ApiResponse<{
            doctors: Array<{
                id: string;
                email: string;
                firstName: string;
                lastName: string;
                fullName: string;
                avatarUrl?: string;
                positionName?: string;
                specialtyName?: string;
                yearsOfExperience: number;
            }>;
            totalCount: number;
        }>
    > {
        try {
            const params = new URLSearchParams({
                hospitalId,
                specialtyId,
                checkAvailability: String(checkAvailability),
            });

            // Add optional params if provided
            if (appointmentDate) {
                params.append('appointmentDate', appointmentDate);
            }
            if (appointmentTimeId) {
                params.append('appointmentTimeId', appointmentTimeId);
            }

            const response: any = await axiosInstance.get(
                `${APPOINTMENT_ENDPOINTS.AVAILABLE_DOCTORS}?${params.toString()}`
            );
            return {
                success: response.success ?? true,
                data: response.data,
                message: response.message || 'Doctors retrieved successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to fetch doctors');
        }
    }

    /**
     * Get available slots for a doctor on a specific date
     * Calls Schedule Service API
     */
    static async getAvailableSlots(
        doctorId: string,
        date: string
    ): Promise<
        ApiResponse<
            Array<{
                id: string;
                startTime: string;
                endTime: string;
            }>
        >
    > {
        try {
            const response: any = await axiosInstance.get(
                SCHEDULE_ENDPOINTS.AVAILABLE_SLOTS(doctorId, date)
            );
            return {
                success: response.success ?? true,
                data: response.data,
                message: response.message || 'Available slots retrieved successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to fetch available slots');
        }
    }

    /**
     * Get staff dashboard statistics for a hospital
     */
    static async getHospitalStaffStatistics(
        params: StaffHospitalStatisticsRequest
    ): Promise<ApiResponse<StaffHospitalStatisticsResponse>> {
        try {
            const response: any = await axiosInstance.get(APPOINTMENT_ENDPOINTS.STAFF_STATISTICS, {
                params,
            });

            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Staff statistics retrieved successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to fetch hospital statistics');
        }
    }

    // ==================== NEW: Assign Doctor To Appointment Flow ====================

    /**
     * Get doctors for assignment to a pending specialty appointment
     * Returns recommended doctors (sorted by experience, rating, booking count) and previous doctors
     */
    static async getDoctorsForAssignment(
        appointmentId: string,
        checkAvailabilityAtOriginalTime: boolean = true
    ): Promise<ApiResponse<DoctorsForAssignmentResponse>> {
        try {
            const response: any = await axiosInstance.get(
                APPOINTMENT_ENDPOINTS.DOCTORS_FOR_ASSIGNMENT(appointmentId),
                { params: { checkAvailabilityAtOriginalTime } }
            );
            return {
                success: response.success ?? true,
                data: response.data,
                message: response.message || 'Doctors retrieved successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to fetch doctors for assignment');
        }
    }

    /**
     * Assign doctor to a pending specialty appointment (NEW flow for "Hospital assigns doctor")
     * This directly assigns the doctor and confirms the appointment
     */
    static async assignDoctorToAppointment(
        appointmentId: string,
        doctorId: string,
        staffId: string,
        newAppointmentDate?: string,
        newAppointmentTimeId?: string,
        staffNote?: string
    ): Promise<ApiResponse<AssignDoctorToAppointmentResponse>> {
        try {
            const response: any = await axiosInstance.post(
                APPOINTMENT_ENDPOINTS.ASSIGN_DOCTOR(appointmentId),
                {
                    appointmentId,
                    doctorId,
                    assignedByStaffId: staffId,
                    newAppointmentDate: newAppointmentDate || undefined,
                    newAppointmentTimeId: newAppointmentTimeId || undefined,
                    staffNote: staffNote || undefined,
                }
            );
            return {
                success: response.success ?? true,
                data: response.data,
                message: response.message || 'Doctor assigned successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to assign doctor');
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
    assignNewDoctor,
    getAvailableDoctors,
    getAvailableSlots,
    getHospitalStaffStatistics,
    // NEW: Assign doctor to appointment flow
    getDoctorsForAssignment,
    assignDoctorToAppointment,
} = AppointmentService;

// Default export
export default AppointmentService;
