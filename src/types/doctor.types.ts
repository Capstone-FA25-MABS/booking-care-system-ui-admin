// Shared types for Doctor forms

export interface Position {
    id: string;
    name: string;
    status: 'ACTIVE' | 'INACTIVE';
}

export interface Specialty {
    id: string;
    name: string;
    status: 'ACTIVE' | 'INACTIVE';
}

export interface Language {
    id: string;
    name: string;
    flag: string;
    status: 'ACTIVE' | 'INACTIVE';
}

export interface ServiceType {
    id: string;
    name: string;
    status: 'ACTIVE' | 'INACTIVE';
}

export interface Hospital {
    id: string;
    name: string;
    status: 'ACTIVE' | 'INACTIVE';
}

export interface DoctorPrice {
    serviceTypeId: string;
    amount: number;
    note: string;
}

export interface DoctorLanguage {
    languageId: string;
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
    positionId: string;
    specialtyId: string;
    hospitalId: string;
    languageIds: string[];
    servicePrices: DoctorPrice[];
}
