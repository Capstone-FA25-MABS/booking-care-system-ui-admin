export interface ServiceType {
    id: string;
    name: string;
    status: 'ACTIVE' | 'INACTIVE';
}

export interface DoctorPrice {
    serviceTypeId: string;
    amount: number;
    note: string;
}
