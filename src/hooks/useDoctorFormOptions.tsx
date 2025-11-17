import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import {
    getPositions,
    getSpecialties,
    getLanguages,
    getServiceTypes,
} from '@/services/doctor.service';
import HospitalService from '@/services/hospital.service';
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
 * For hospital staff: Only shows specialties and service types that the hospital has
 * For admin: Shows all available options
 */
export const useDoctorFormOptions = (): DoctorFormOptions => {
    const { roles } = useSelector((state: RootState) => state.auth);
    const { hospitalProfile, doctorProfile } = useSelector((state: RootState) => state.user);

    const [positions, setPositions] = useState<Array<{ id: string; name: string }>>([]);
    const [specialties, setSpecialties] = useState<Array<{ id: string; name: string }>>([]);
    const [languages, setLanguages] = useState<Array<{ id: string; name: string }>>([]);
    const [serviceTypes, setServiceTypes] = useState<Array<{ id: string; name: string }>>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Check user role
    const isHospitalStaff = roles.some((role) => role.toUpperCase() === 'STAFF');
    const isDoctor = roles.some((role) => role.toUpperCase() === 'DOCTOR');

    // Determine hospitalId to use for filtering
    let hospitalIdToFilter: string | null = null;
    if (isHospitalStaff) {
        hospitalIdToFilter = hospitalProfile?.id || null;
    } else if (isDoctor && doctorProfile?.hospital?.id) {
        hospitalIdToFilter = doctorProfile.hospital.id;
    }

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
                setLanguages(mappedOptions.languages);

                // Filter specialties and service types for hospital staff or doctor
                if (hospitalIdToFilter) {
                    // Fetch hospital's configured specialties and service types directly from API
                    const [specialtyIdsRes, serviceTypeIdsRes] = await Promise.all([
                        HospitalService.getHospitalSpecialtyIds(hospitalIdToFilter),
                        HospitalService.getHospitalServiceTypeIds(hospitalIdToFilter),
                    ]);

                    // Extract IDs from response
                    const specialtyIdsData = specialtyIdsRes.data as any;
                    const specialtyIds: string[] = Array.isArray(specialtyIdsData)
                        ? specialtyIdsData
                              .map((x: any) =>
                                  typeof x === 'string' ? x : x?.specialtyId || x?.id
                              )
                              .filter(Boolean)
                        : [];

                    const serviceTypeIdsData = serviceTypeIdsRes.data as any;
                    const serviceTypeIds: string[] = Array.isArray(serviceTypeIdsData)
                        ? serviceTypeIdsData
                              .map((x: any) =>
                                  typeof x === 'string' ? x : x?.serviceTypeId || x?.id
                              )
                              .filter(Boolean)
                        : [];

                    let userRoleLabel = 'OTHER';
                    if (isHospitalStaff) {
                        userRoleLabel = 'STAFF';
                    } else if (isDoctor) {
                        userRoleLabel = 'DOCTOR';
                    }

                    console.log('🏥 Hospital Configuration:', {
                        userRole: userRoleLabel,
                        hospitalId: hospitalIdToFilter,
                        specialtyIds,
                        serviceTypeIds,
                    });

                    // STRICT: Only show specialties that the hospital has configured
                    const hospitalSpecialtyIds = new Set(specialtyIds);
                    const filteredSpecialties = mappedOptions.specialties.filter((specialty) =>
                        hospitalSpecialtyIds.has(specialty.id)
                    );

                    // STRICT: Only show service types that the hospital has configured
                    const hospitalServiceTypeIds = new Set(serviceTypeIds);
                    const filteredServiceTypes = mappedOptions.serviceTypes.filter((serviceType) =>
                        hospitalServiceTypeIds.has(serviceType.id)
                    );

                    // No fallback - if hospital hasn't configured, dropdown will be empty
                    // This forces hospital to configure specialties/service types first
                    setSpecialties(filteredSpecialties);
                    setServiceTypes(filteredServiceTypes);
                } else {
                    // Admin or no hospital/doctor profile: show all options
                    setSpecialties(mappedOptions.specialties);
                    setServiceTypes(mappedOptions.serviceTypes);
                }
            } catch (error) {
                // Silently handle errors - could show toast notification
                console.error('Failed to fetch doctor form options:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchOptions();
    }, [isHospitalStaff, isDoctor, hospitalIdToFilter]);

    return {
        positions,
        specialties,
        languages,
        serviceTypes,
        isLoading,
    };
};
