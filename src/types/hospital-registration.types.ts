/**
 * Hospital Registration Types
 */

export enum RegistrationStatus {
    PENDING = 'PENDING',
    CONTRACT_GENERATED = 'CONTRACT_GENERATED',
    CONTRACT_SIGNED = 'CONTRACT_SIGNED',
    CONFIRMED = 'CONFIRMED',
    CANCELLED = 'CANCELLED',
}

export interface HospitalRegistrationResponse {
    id: string;

    // Representative Information
    representativeName: string;
    representativeEmail: string;
    representativePhone: string;

    // Hospital Information
    hospitalName: string;
    hospitalEmail: string;
    hospitalPhone: string;
    address: string;
    taxCode: string;

    // Files
    licenseFile: string;
    businessCertificateFile: string;
    identityCardFile: string;

    // Status and metadata
    status: RegistrationStatus;
    statusText: string;

    // Contract Information
    contractNumber?: string;
    contractFile?: string;
    contractDraftFile?: string;
    hospitalSignature?: string;
    signedAt?: string;
    adminSignatureId?: string;

    hospitalId?: string;
    reason?: string;
    createdAt: string;
    updatedAt: string;
}

export interface HospitalRegistrationListResponse {
    registrations: HospitalRegistrationResponse[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

export interface HospitalRegistrationFilterRequest {
    searchTerm?: string;
    status?: RegistrationStatus;
    fromDate?: string;
    toDate?: string;
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: string;
}

// Tab counts interface
export interface RegistrationTabCounts {
    pending: number;
    contractGenerated: number;
    contractSigned: number;
    confirmed: number;
    cancelled: number;
}

// UI tab type
export type RegistrationUITab =
    | 'pending'
    | 'contract-generated'
    | 'contract-signed'
    | 'confirmed'
    | 'cancelled';

// Helper function to map UI tab to API status
export const mapUITabToStatus = (tab: RegistrationUITab): RegistrationStatus => {
    switch (tab) {
        case 'pending':
            return RegistrationStatus.PENDING;
        case 'contract-generated':
            return RegistrationStatus.CONTRACT_GENERATED;
        case 'contract-signed':
            return RegistrationStatus.CONTRACT_SIGNED;
        case 'confirmed':
            return RegistrationStatus.CONFIRMED;
        case 'cancelled':
            return RegistrationStatus.CANCELLED;
        default:
            return RegistrationStatus.PENDING;
    }
};

// Helper function to get status badge class
export const getStatusBadgeClass = (status: RegistrationStatus): string => {
    switch (status) {
        case RegistrationStatus.PENDING:
            return 'badge badge-outline-warning';
        case RegistrationStatus.CONTRACT_GENERATED:
            return 'badge badge-outline-info';
        case RegistrationStatus.CONTRACT_SIGNED:
            return 'badge badge-outline-primary';
        case RegistrationStatus.CONFIRMED:
            return 'badge badge-outline-success';
        case RegistrationStatus.CANCELLED:
            return 'badge badge-outline-danger';
        default:
            return 'badge badge-outline-secondary';
    }
};

// Helper function to get status text
export const getStatusText = (status: RegistrationStatus): string => {
    switch (status) {
        case RegistrationStatus.PENDING:
            return 'Chờ xử lý';
        case RegistrationStatus.CONTRACT_GENERATED:
            return 'Đã tạo hợp đồng';
        case RegistrationStatus.CONTRACT_SIGNED:
            return 'Đã ký hợp đồng';
        case RegistrationStatus.CONFIRMED:
            return 'Đã xác nhận';
        case RegistrationStatus.CANCELLED:
            return 'Đã hủy';
        default:
            return 'Không xác định';
    }
};
