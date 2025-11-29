/**
 * Admin Signature Types
 * For managing admin signatures used in contract signing
 */

export interface AdminSignature {
    id: string;
    adminId: string;
    fullName: string;
    position: string;
    signatureImageUrl: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateAdminSignatureRequest {
    fullName: string;
    position: string;
    signatureFile: File;
}

export interface UpdateAdminSignatureRequest {
    fullName?: string;
    position?: string;
    signatureFile?: File;
    isActive?: boolean;
}

export interface AdminSignatureResponse {
    success: boolean;
    message?: string;
    data?: AdminSignature;
}

export interface AdminSignatureListResponse {
    success: boolean;
    message?: string;
    data?: AdminSignature[];
}
