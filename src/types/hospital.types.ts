export interface Hospital {
    id: string;
    name: string;
    status: 'ACTIVE' | 'INACTIVE';
}

export interface HospitalBasicInfo {
    id: string;
    name: string;
    address: string;
}
