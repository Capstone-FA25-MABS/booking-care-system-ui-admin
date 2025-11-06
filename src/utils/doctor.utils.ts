/**
 * Utility functions for doctor-related operations
 */

import { DoctorFormData } from '@/types/doctor.types';

interface MappedDataItem {
    id: string;
    name: string;
}

/**
 * Maps API response data to the format needed for dropdowns
 */
export const mapApiDataToOptions = (data: any[]): MappedDataItem[] => {
    return (data || []).map((item: any) => ({
        id: item.id,
        name: item.name,
    }));
};

/**
 * Maps multiple API responses to dropdown options
 */
export const mapDoctorFormOptions = (responses: {
    positions: any;
    specialties: any;
    languages: any;
    serviceTypes: any;
}) => {
    return {
        positions: mapApiDataToOptions(responses.positions.data),
        specialties: mapApiDataToOptions(responses.specialties.data),
        languages: mapApiDataToOptions(responses.languages.data),
        serviceTypes: mapApiDataToOptions(responses.serviceTypes.data),
    };
};

/**
 * Maps doctor API response data to DoctorFormData format
 */
export const mapDoctorApiResponseToFormData = (
    doctorData: any,
    pricesData: any[] = []
): DoctorFormData => {
    return {
        firstName: doctorData.firstName || '',
        lastName: doctorData.lastName || '',
        email: doctorData.email || '',
        phone: '',
        dateOfBirth: '',
        address: doctorData.address || '',
        gender: (doctorData.gender as any) || '',
        bio: doctorData.bio || '',
        yearsOfExperience: doctorData.yearsOfExperience || 0,
        avatar: doctorData.avatarUrl || null,
        positionId: doctorData.position?.id || '',
        specialtyId: doctorData.specialty?.id || '',
        hospitalId: doctorData.hospital?.id || '',
        languageIds: (doctorData.languages || []).map((l: any) => l.id),
        servicePrices: (pricesData || []).map((p: any) => ({
            id: p.id,
            serviceTypeId: p.serviceTypeId,
            amount: Number(p.amount),
        })),
    };
};

/**
 * Parses server error messages and maps them to form field errors
 */
export const parseServerErrorMessages = (errorMessages: string[]): Record<string, string> => {
    const fieldErrorMap: Record<string, string> = {};

    errorMessages.forEach((msg: string) => {
        const [field, ...rest] = msg.split(':');
        const message = rest.join(':').trim() || msg;
        const key = (field || '').trim().toLowerCase();

        if (key.includes('email')) fieldErrorMap.email = message;
        if (key.includes('firstname')) fieldErrorMap.firstName = message;
        if (key.includes('lastname')) fieldErrorMap.lastName = message;
        if (key.includes('address')) fieldErrorMap.address = message;
        if (key.includes('gender')) fieldErrorMap.gender = message;
        if (key.includes('bio')) fieldErrorMap.bio = message;
        if (key.includes('years')) fieldErrorMap.yearsOfExperience = message;
        if (key.includes('position')) fieldErrorMap.positionId = message;
        if (key.includes('specialty')) fieldErrorMap.specialtyId = message;
        if (key.includes('hospital')) fieldErrorMap.hospitalId = message;
        if (key.includes('language')) fieldErrorMap.languageIds = message;
        if (key.includes('price') || key.includes('amount')) fieldErrorMap.servicePrices = message;
    });

    return fieldErrorMap;
};

/**
 * Prepares doctor update payload
 * Note: Email is not included in update payload as it should not be changed
 */
export const prepareDoctorUpdatePayload = (params: {
    id: string;
    doctorData: {
        firstName: string;
        lastName: string;
        address: string;
        gender: string;
        bio: string;
        yearsOfExperience: number;
        positionId: string;
        specialtyId: string;
        hospitalId: string;
        avatar?: File | string | null;
    };
    languageIds: string[];
    doctorPrices: Array<{
        serviceTypeId: string;
        amount: number;
    }>;
}) => {
    const { id, doctorData, languageIds, doctorPrices } = params;

    return {
        id,
        // Email is intentionally excluded to prevent updates
        firstName: doctorData.firstName,
        lastName: doctorData.lastName,
        address: doctorData.address,
        gender: doctorData.gender as 'MALE' | 'FEMALE' | 'OTHER',
        bio: doctorData.bio,
        yearsOfExperience: doctorData.yearsOfExperience,
        positionId: doctorData.positionId,
        specialtyId: doctorData.specialtyId,
        hospitalId: doctorData.hospitalId,
        languageIds,
        prices: doctorPrices.map((p) => ({
            serviceTypeId: p.serviceTypeId,
            amount: p.amount,
        })),
    };
};

/**
 * Fetches doctor data and prices, then maps to form data format
 * This function extracts common logic from DoctorProfileSettings and EditDoctor
 */
export const fetchDoctorDataForForm = async (
    doctorId: string,
    getDoctorById: (id: string) => Promise<any>,
    getDoctorPrices: (id: string) => Promise<any>
): Promise<DoctorFormData> => {
    const [doctorRes, pricesRes] = await Promise.all([
        getDoctorById(doctorId),
        getDoctorPrices(doctorId),
    ]);

    return mapDoctorApiResponseToFormData(doctorRes.data, pricesRes.data || []);
};

/**
 * Handles server errors and updates form errors accordingly
 * This function extracts common error handling logic from DoctorProfileSettings and EditDoctor
 */
export const handleDoctorFormError = (
    err: any,
    setErrors: (errors: any) => void,
    defaultMessage: string = 'Có lỗi xảy ra'
): void => {
    const server = err?.response?.data;
    const errorMessages: string[] = server?.errors || [];

    if (Array.isArray(errorMessages) && errorMessages.length) {
        const fieldErrorMap = parseServerErrorMessages(errorMessages);
        if (Object.keys(fieldErrorMap).length) {
            setErrors(fieldErrorMap);
        }

        // Check for email conflict error specifically
        const emailConflictError = errorMessages.find(
            (msg: string) =>
                msg.toLowerCase().includes('email') &&
                (msg.toLowerCase().includes('đã tồn tại') ||
                    msg.toLowerCase().includes('already exists'))
        );
        if (emailConflictError) {
            throw new Error(emailConflictError);
        }

        throw new Error(server?.message || defaultMessage);
    }

    throw new Error(err?.message || defaultMessage);
};
