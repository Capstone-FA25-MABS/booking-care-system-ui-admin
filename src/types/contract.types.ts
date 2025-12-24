/**
 * Contract Types
 * For contract generation and signing workflow
 */

export interface GenerateContractResponse {
    registrationId: string;
    contractFileUrl: string;
    contractNumber: string;
    signingLink: string;
    generatedAt: string;
    linkExpiresAt: string;
    status: string;
}

export interface ContractSigningInfo {
    registrationId: string;
    hospitalName: string;
    representativeName: string;
    representativeEmail: string;
    contractDraftUrl: string;
    contractNumber: string;
    expiresAt: string;
}

export interface ValidateTokenResponse {
    isValid: boolean;
    errorMessage?: string;
    contractInfo?: ContractSigningInfo;
}

export interface SignContractRequest {
    token: string;
    signatureBase64: string;
    otpCode: string;
}

export interface SignContractResponse {
    success: boolean;
    message: string;
    signedContractUrl?: string;
    signedAt?: string;
}
