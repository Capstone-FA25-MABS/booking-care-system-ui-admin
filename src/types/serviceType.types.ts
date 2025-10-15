export interface ServiceType {
    id: string;
    name: string;
    status: 'ACTIVE' | 'INACTIVE';
}

export interface DoctorPrice {
    id: string;
    serviceTypeId: string;
    amount: number;
}

export interface DoctorPriceBasicInfo {
    id: string;
    serviceTypeName: string;
    amount: number;
}
