import { DoctorPrice } from './service.types';

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
