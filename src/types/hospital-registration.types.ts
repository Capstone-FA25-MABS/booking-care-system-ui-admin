/**
 * Hospital Registration Types
 */

export enum RegistrationStatus {
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    CANCELLED = 'CANCELLED',
}

export interface HospitalRegistrationResponse {
    id: string;
    hospitalName: string;
    email: string;
    phone: string;
    address: string;
    licenseFile: string;
    businessCertificateFile: string;
    identityCardFile: string;
    taxCode: string;
    status: RegistrationStatus;
    statusText: string;
    contractFile?: string;
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
    confirmed: number;
    cancelled: number;
}

// UI tab type
export type RegistrationUITab = 'pending' | 'confirmed' | 'cancelled';

// Helper function to map UI tab to API status
export const mapUITabToStatus = (tab: RegistrationUITab): RegistrationStatus => {
    switch (tab) {
        case 'pending':
            return RegistrationStatus.PENDING;
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
        case RegistrationStatus.CONFIRMED:
            return 'Đã xác nhận';
        case RegistrationStatus.CANCELLED:
            return 'Đã hủy';
        default:
            return 'Không xác định';
    }
};
