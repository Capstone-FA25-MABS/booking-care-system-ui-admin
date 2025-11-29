/**
 * AI Service Types
 * Types for AI-powered medical summary generation
 */

export interface GenerateMedicalSummaryRequest {
    appointmentId: string;
    transcript: string;
    patientName?: string;
    doctorName?: string;
    appointmentDate?: string;
}

export interface MedicalSummaryResponse {
    summary: string;
    appointmentId: string;
    generatedAt: string;
    success: boolean;
    errorMessage?: string;
}

export interface SaveMedicalSummaryRequest {
    appointmentId: string;
    summary: string;
}

export interface UpdateAppointmentResultRequest {
    appointmentId: string;
    result: string;
}
