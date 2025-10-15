export interface Specialty {
    id: string;
    name: string;
    status: 'ACTIVE' | 'INACTIVE';
}

export interface SpecialtyBasicInfo {
    id: string;
    name: string;
}
