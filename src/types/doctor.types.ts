// Shared types for Doctor forms
export type Guid = string; // UUID/GUID type alias

export interface Position {
    id: Guid;
    name: string;
    status: 'ACTIVE' | 'INACTIVE';
}

export interface Specialty {
    id: Guid;
    name: string;
    status: 'ACTIVE' | 'INACTIVE';
}

export interface Language {
    id: Guid;
    name: string;
    flag: string;
    status: 'ACTIVE' | 'INACTIVE';
}

export interface ServiceType {
    id: Guid;
    name: string;
    status: 'ACTIVE' | 'INACTIVE';
}

export interface Hospital {
    id: Guid;
    name: string;
    status: 'ACTIVE' | 'INACTIVE';
}

export interface DoctorPrice {
    serviceTypeId: Guid;
    amount: number;
    note: string;
}

export interface DoctorLanguage {
    languageId: Guid;
    proficiency: 'BASIC' | 'INTERMEDIATE' | 'ADVANCED' | 'NATIVE';
}

export interface DoctorFormData {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    address: string;
    gender: 'MALE' | 'FEMALE' | '';
    bio: string;
    yearsOfExperience: number;
    avatar: File | string | null;
    positionId: Guid;
    specialtyId: Guid;
    hospitalId: Guid;
    languageIds: Guid[];
    servicePrices: DoctorPrice[];
}
