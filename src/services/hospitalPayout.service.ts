import axiosInstance from '@/configs/axios.config';
import {
    HospitalPayoutResponse,
    GeneratePayoutsRequest,
    MarkPayoutCompletedRequest,
    PayoutQueryRequest,
    PayoutStatistics,
    PendingHospitalInfo,
    ApiResponse,
    PayoutsListResponse,
    PayoutDetailsResponse,
} from '../types/hospitalPayout.types';

export class HospitalPayoutService {
    /**
     * Get list of hospital payouts with optional filters
     */
    static async getPayouts(params?: PayoutQueryRequest): Promise<PayoutsListResponse> {
        try {
            const result: ApiResponse<PayoutsListResponse> = await axiosInstance.get(
                '/hospitalpayouts',
                { params }
            );

            if (!result.success) {
                throw new Error(result.message || 'Failed to fetch payouts');
            }

            return result.data;
        } catch (error: any) {
            console.error('Error fetching payouts:', error);
            throw new Error(error.message || 'Failed to fetch payouts');
        }
    }

    /**
     * Get payout details by ID
     */
    static async getPayoutById(payoutId: string): Promise<PayoutDetailsResponse> {
        try {
            const result: ApiResponse<PayoutDetailsResponse> = await axiosInstance.get(
                `/hospitalpayouts/${payoutId}`
            );

            if (!result.success) {
                throw new Error(result.message || 'Failed to fetch payout details');
            }

            return result.data;
        } catch (error: any) {
            console.error('Error fetching payout details:', error);
            throw new Error(error.message || 'Failed to fetch payout details');
        }
    }

    /**
     * Generate payouts for hospitals based on completed appointments in period
     */
    static async generatePayouts(
        request: GeneratePayoutsRequest
    ): Promise<HospitalPayoutResponse[]> {
        try {
            const result: ApiResponse<HospitalPayoutResponse[]> = await axiosInstance.post(
                '/hospitalpayouts/generate',
                request
            );

            if (!result.success) {
                throw new Error(result.message || 'Failed to generate payouts');
            }

            return result.data;
        } catch (error: any) {
            console.error('Error generating payouts:', error);
            throw new Error(error.message || 'Failed to generate payouts');
        }
    }

    /**
     * Mark a payout as completed
     */
    static async markPayoutCompleted(
        request: MarkPayoutCompletedRequest
    ): Promise<HospitalPayoutResponse> {
        try {
            const result: ApiResponse<HospitalPayoutResponse> = await axiosInstance.put(
                `/hospitalpayouts/${request.payoutId}/complete`,
                request
            );

            if (!result.success) {
                throw new Error(result.message || 'Failed to mark payout as completed');
            }

            return result.data;
        } catch (error: any) {
            console.error('Error marking payout as completed:', error);
            throw new Error(error.message || 'Failed to mark payout as completed');
        }
    }

    /**
     * Get payout statistics
     */
    static async getStatistics(
        periodStartDate?: string,
        periodEndDate?: string
    ): Promise<PayoutStatistics> {
        try {
            const result: ApiResponse<PayoutStatistics> = await axiosInstance.get(
                '/hospitalpayouts/statistics',
                {
                    params: { periodStartDate, periodEndDate },
                }
            );

            if (!result.success) {
                throw new Error(result.message || 'Failed to fetch statistics');
            }

            return result.data;
        } catch (error: any) {
            console.error('Error fetching statistics:', error);
            throw new Error(error.message || 'Failed to fetch statistics');
        }
    }

    /**
     * Get hospitals with pending payouts for a period
     */
    static async getPendingHospitals(
        periodStartDate: string,
        periodEndDate: string
    ): Promise<PendingHospitalInfo[]> {
        try {
            const result: ApiResponse<PendingHospitalInfo[]> = await axiosInstance.get(
                '/hospitalpayouts/pending-hospitals',
                {
                    params: { periodStartDate, periodEndDate },
                }
            );

            if (!result.success) {
                throw new Error(result.message || 'Failed to fetch pending hospitals');
            }

            return result.data;
        } catch (error: any) {
            console.error('Error fetching pending hospitals:', error);
            throw new Error(error.message || 'Failed to fetch pending hospitals');
        }
    }
}

export default HospitalPayoutService;
