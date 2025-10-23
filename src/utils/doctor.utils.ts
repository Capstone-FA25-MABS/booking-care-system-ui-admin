/**
 * Utility functions for doctor-related operations
 */

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
 * Prepares doctor update payload
 */
export const prepareDoctorUpdatePayload = (params: {
    id: string;
    email: string;
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
    const { id, email, doctorData, languageIds, doctorPrices } = params;

    return {
        id,
        email,
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
