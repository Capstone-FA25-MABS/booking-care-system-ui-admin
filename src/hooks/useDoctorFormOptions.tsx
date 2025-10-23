import { useState, useEffect } from 'react';
import {
    getPositions,
    getSpecialties,
    getLanguages,
    getServiceTypes,
} from '@/services/doctor.service';
import { mapDoctorFormOptions } from '@/utils/doctor.utils';

interface DoctorFormOptions {
    positions: Array<{ id: string; name: string }>;
    specialties: Array<{ id: string; name: string }>;
    languages: Array<{ id: string; name: string }>;
    serviceTypes: Array<{ id: string; name: string }>;
    isLoading: boolean;
}

/**
 * Custom hook to fetch and manage doctor form dropdown options
 * Reduces code duplication between AddDoctor and EditDoctor components
 */
export const useDoctorFormOptions = (): DoctorFormOptions => {
    const [positions, setPositions] = useState<Array<{ id: string; name: string }>>([]);
    const [specialties, setSpecialties] = useState<Array<{ id: string; name: string }>>([]);
    const [languages, setLanguages] = useState<Array<{ id: string; name: string }>>([]);
    const [serviceTypes, setServiceTypes] = useState<Array<{ id: string; name: string }>>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                setIsLoading(true);
                const [positionsRes, specialtiesRes, languagesRes, servicesRes] = await Promise.all(
                    [getPositions(), getSpecialties(), getLanguages(), getServiceTypes()]
                );

                const mappedOptions = mapDoctorFormOptions({
                    positions: positionsRes,
                    specialties: specialtiesRes,
                    languages: languagesRes,
                    serviceTypes: servicesRes,
                });

                setPositions(mappedOptions.positions);
                setSpecialties(mappedOptions.specialties);
                setLanguages(mappedOptions.languages);
                setServiceTypes(mappedOptions.serviceTypes);
            } catch (error) {
                // Silently handle errors - could show toast notification
                console.error('Failed to fetch doctor form options:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchOptions();
    }, []);

    return {
        positions,
        specialties,
        languages,
        serviceTypes,
        isLoading,
    };
};
