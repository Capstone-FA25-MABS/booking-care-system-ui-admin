import axiosInstance, { ApiResponse } from '@/configs/axios.config';

/**
 * Request to generate medical summary from conversation transcript
 */
export interface GenerateMedicalSummaryRequest {
    appointmentId: string;
    transcript: string;
    patientName?: string;
    doctorName?: string;
    appointmentDate?: string;
}

/**
 * Response containing AI-generated medical summary
 */
export interface MedicalSummaryResponse {
    summary: string;
    appointmentId: string;
    generatedAt: string;
    success: boolean;
    errorMessage?: string;
}

// AI Service endpoints (via API Gateway)
// Note: AI service endpoints are accessed through API Gateway with versioning
// The actual backend route is: api/v1/Ais/generate-medical-summary
// Through gateway it becomes: /ais/generate-medical-summary (gateway handles versioning)
const AI_ENDPOINTS = {
    GENERATE_SUMMARY: '/ais/generate-medical-summary',
} as const;

/**
 * AI Service
 * Handles AI-powered medical summary generation
 */
export class AIService {
    /**
     * Generate medical summary from conversation transcript using AI
     * Calls AI Service via API Gateway
     */
    static async generateMedicalSummary(
        request: GenerateMedicalSummaryRequest
    ): Promise<ApiResponse<MedicalSummaryResponse>> {
        try {
            console.log('[AIService] 📤 Sending request to:', AI_ENDPOINTS.GENERATE_SUMMARY);
            console.log('[AIService] Request payload:', {
                ...request,
                transcriptLength: request.transcript?.length || 0,
            });

            const response: any = await axiosInstance.post(AI_ENDPOINTS.GENERATE_SUMMARY, request);

            console.log('[AIService] ✅ Received response:', {
                success: response.success,
                hasData: !!response.data,
                message: response.message,
            });

            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Medical summary generated successfully',
            };
        } catch (error: any) {
            console.error('[AIService] ❌ Request failed:', {
                message: error.message,
                status: error.response?.status,
                statusText: error.response?.statusText,
                responseData: error.response?.data,
            });
            throw new Error(error.message || 'Failed to generate medical summary');
        }
    }
}

// Export individual methods for convenience
export const { generateMedicalSummary } = AIService;

// Default export
export default AIService;
