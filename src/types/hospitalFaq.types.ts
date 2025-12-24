// Hospital FAQ DTOs
export interface HospitalFaqResponse {
    id: string;
    hospitalId: string;
    question: string;
    answer: string;
    createdBy: string;
    displayOrder: number;
    createdAt: string;
    updatedAt: string;
}

export interface CreateHospitalFaqRequest {
    hospitalId: string;
    question: string;
    answer: string;
    displayOrder: number;
}

export interface UpdateHospitalFaqRequest {
    question: string;
    answer: string;
    displayOrder: number;
}

export interface HospitalFaqFilterRequest {
    hospitalId?: string;
    pageNumber?: number;
    pageSize?: number;
}

export interface HospitalFaqListResponse {
    items: HospitalFaqResponse[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
}
