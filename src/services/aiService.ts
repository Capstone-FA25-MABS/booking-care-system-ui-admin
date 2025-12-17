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

export interface GenerateAiInsightRequest {
    period?: 'week' | 'month';
    fromDate?: string; // ISO date string (YYYY-MM-DD)
    toDate?: string; // ISO date string (YYYY-MM-DD)
}

export interface FuturePrediction {
    period: string; // "next_week", "next_month", "next_quarter"
    predictedAppointments: number;
    predictedGrowthPercent: number;
    predictedCancellationRate: number;
    predictedRevenue: number;
    topSpecialtyPrediction?: string;
    confidence: 'high' | 'medium' | 'low';
    reasoning: string;
}

export interface Alert {
    type: 'warning' | 'critical' | 'info' | 'success';
    title: string;
    message: string;
    severity: 'high' | 'medium' | 'low';
    metric?: string;
    currentValue?: number;
    thresholdValue?: number;
    recommendedAction?: string;
}

export interface RootCauseAnalysis {
    metric: string;
    issue: string;
    potentialCauses: string[];
    mostLikelyCause?: string;
    analysis: string;
    impactScore: number; // 0-100
}

export interface AiInsightMetrics {
    currentTotal: number;
    previousTotal: number;
    growthPercent: number;
    currentCompleted: number;
    currentCancelled: number;
    cancellationRate: number;
    cancellationDeltaPercent: number;
    topSpecialtyId?: string;
    topSpecialtyName?: string;
    topSpecialtyCount: number;
    topSpecialtyShare: number;
}

export interface AiInsightResponse {
    summary: string;
    period: string;
    periodStart: string;
    periodEnd: string;
    generatedAt: string;
    model: string;
    metrics: AiInsightMetrics;
    predictions?: FuturePrediction[];
    alerts?: Alert[];
    rootCauseAnalyses?: RootCauseAnalysis[];
    analysisConclusion?: string; // Kết luận phân tích dạng văn bản
    predictionConclusion?: string; // Kết luận dự đoán dạng văn bản
}

// AI Service endpoints (via API Gateway)
// Note: AI service endpoints are accessed through API Gateway with versioning
// The actual backend route is: api/v1/Ais/generate-medical-summary
// Through gateway it becomes: /ais/generate-medical-summary (gateway handles versioning)
const AI_ENDPOINTS = {
    GENERATE_SUMMARY: '/ais/generate-medical-summary',
    GENERATE_INSIGHTS: '/ai-insights/generate',
    GENERATE_INSIGHTS_FOR_DOCTOR: '/ai-insights/generate-for-doctor',
    GENERATE_INSIGHTS_FOR_HOSPITAL: '/ai-insights/generate-for-hospital',
} as const;

/**
 * AI Service
 * Handles AI-powered medical summary generation
 */
export class AIService {
    /**
     * Generate AI Insights summary for admin dashboard
     */
    static async generateInsights(
        request: GenerateAiInsightRequest = { period: 'week' }
    ): Promise<ApiResponse<AiInsightResponse>> {
        try {
            const response: any = await axiosInstance.post(AI_ENDPOINTS.GENERATE_INSIGHTS, request);

            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Tạo báo cáo AI thành công',
            };
        } catch (error: any) {
            console.error('[AIService] ❌ generateInsights failed:', {
                message: error.message,
                status: error.response?.status,
                statusText: error.response?.statusText,
                responseData: error.response?.data,
            });
            throw new Error(error.message || 'Không thể tạo báo cáo AI');
        }
    }

    /**
     * Generate AI Insights summary for doctor dashboard
     */
    static async generateInsightsForDoctor(
        doctorId: string,
        request: GenerateAiInsightRequest = { period: 'week' }
    ): Promise<ApiResponse<AiInsightResponse>> {
        try {
            const response: any = await axiosInstance.post(
                `${AI_ENDPOINTS.GENERATE_INSIGHTS_FOR_DOCTOR}/${doctorId}`,
                request
            );

            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Tạo báo cáo AI thành công cho bác sĩ',
            };
        } catch (error: any) {
            console.error('[AIService] ❌ generateInsightsForDoctor failed:', {
                message: error.message,
                status: error.response?.status,
                statusText: error.response?.statusText,
                responseData: error.response?.data,
            });
            throw new Error(error.message || 'Không thể tạo báo cáo AI cho bác sĩ');
        }
    }

    /**
     * Generate AI Insights summary for hospital/staff dashboard
     */
    static async generateInsightsForHospital(
        hospitalId: string,
        request: GenerateAiInsightRequest = { period: 'week' }
    ): Promise<ApiResponse<AiInsightResponse>> {
        try {
            const response: any = await axiosInstance.post(
                `${AI_ENDPOINTS.GENERATE_INSIGHTS_FOR_HOSPITAL}/${hospitalId}`,
                request
            );

            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Tạo báo cáo AI thành công cho bệnh viện',
            };
        } catch (error: any) {
            console.error('[AIService] ❌ generateInsightsForHospital failed:', {
                message: error.message,
                status: error.response?.status,
                statusText: error.response?.statusText,
                responseData: error.response?.data,
            });
            throw new Error(error.message || 'Không thể tạo báo cáo AI cho bệnh viện');
        }
    }
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
export const {
    generateMedicalSummary,
    generateInsights,
    generateInsightsForDoctor,
    generateInsightsForHospital,
} = AIService;

// Default export
export default AIService;
