import axiosInstance, { ApiResponse } from '@/configs/axios.config';
import type {
    HospitalRegistrationFilterRequest,
    HospitalRegistrationListResponse,
    HospitalRegistrationResponse,
} from '@/types/hospital-registration.types';

const HOSPITAL_REGISTRATION_ENDPOINTS = {
    GET_ALL: '/hospital-registrations',
    APPROVE: (id: string) => `/hospital-registrations/${id}/approve`,
    REJECT: (id: string) => `/hospital-registrations/${id}/reject`,
} as const;

export class HospitalRegistrationService {
    /**
     * Get all hospital registrations with filters
     */
    static async getAllRegistrations(
        filters: HospitalRegistrationFilterRequest
    ): Promise<HospitalRegistrationListResponse> {
        const response = await axiosInstance.get<HospitalRegistrationListResponse>(
            HOSPITAL_REGISTRATION_ENDPOINTS.GET_ALL,
            { params: filters }
        );
        return response.data;
    }

    /**
     * Approve registration
     */
    static async approveRegistration(
        id: string,
        contractFile: File
    ): Promise<ApiResponse<HospitalRegistrationResponse>> {
        try {
            const formData = new FormData();
            formData.append('ContractFile', contractFile);

            const response: any = await axiosInstance.post(
                HOSPITAL_REGISTRATION_ENDPOINTS.APPROVE(id),
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Đơn đăng ký đã được phê duyệt thành công',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Phê duyệt đơn đăng ký thất bại');
        }
    }

    /**
     * Reject registration
     */
    static async rejectRegistration(
        id: string,
        reason: string
    ): Promise<ApiResponse<HospitalRegistrationResponse>> {
        try {
            const response: any = await axiosInstance.post(
                HOSPITAL_REGISTRATION_ENDPOINTS.REJECT(id),
                { Reason: reason },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Đơn đăng ký đã bị từ chối',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Từ chối đơn đăng ký thất bại');
        }
    }
}

export const { getAllRegistrations, approveRegistration, rejectRegistration } =
    HospitalRegistrationService;

export default HospitalRegistrationService;
