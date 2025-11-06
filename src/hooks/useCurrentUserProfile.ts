import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { AdminProfile, DoctorProfile, HospitalProfile } from '@/types/user.types';
import { Role } from '@/enums/common.enums';

/**
 * Custom hook to get current user's profile based on their role
 * @returns Current user profile and role information
 */
export const useCurrentUserProfile = () => {
    const { roles } = useSelector((state: RootState) => state.auth);
    const { adminProfile, doctorProfile, hospitalProfile, isLoading, error } = useSelector(
        (state: RootState) => state.user
    );

    // Determine current user's primary role
    const getCurrentRole = (): Role | null => {
        if (roles.includes('ADMIN')) return Role.ADMIN;
        if (roles.includes('DOCTOR')) return Role.DOCTOR;
        if (roles.includes('STAFF')) return Role.STAFF;
        return null;
    };

    // Get current profile based on role
    const getCurrentProfile = (): AdminProfile | DoctorProfile | HospitalProfile | null => {
        const currentRole = getCurrentRole();
        if (currentRole === Role.ADMIN) return adminProfile;
        if (currentRole === Role.DOCTOR) return doctorProfile;
        if (currentRole === Role.STAFF) return hospitalProfile;
        return null;
    };

    const currentRole = getCurrentRole();
    const currentProfile = getCurrentProfile();

    // Get display name based on role
    const getDisplayName = (): string => {
        if (currentRole === Role.ADMIN && adminProfile) {
            return `${adminProfile.firstName} ${adminProfile.lastName}`;
        }
        if (currentRole === Role.DOCTOR && doctorProfile) {
            return `${doctorProfile.firstName} ${doctorProfile.lastName}`;
        }
        if (currentRole === Role.STAFF && hospitalProfile) {
            return hospitalProfile.name;
        }
        return 'User';
    };

    // Get role display text
    const getRoleDisplay = (): string => {
        if (currentRole === Role.ADMIN) return 'Administrator';
        if (currentRole === Role.DOCTOR) return 'Doctor';
        if (currentRole === Role.STAFF) return 'Staff';
        return 'User';
    };

    // Get avatar URL based on role
    const getAvatarUrl = (): string | null => {
        if (currentRole === Role.ADMIN && adminProfile?.avatarUrl) {
            return adminProfile.avatarUrl;
        }
        if (currentRole === Role.DOCTOR && doctorProfile?.avatarUrl) {
            return doctorProfile.avatarUrl;
        }
        if (currentRole === Role.STAFF && hospitalProfile?.avatarUrl) {
            return hospitalProfile.avatarUrl;
        }
        return null;
    };

    return {
        // Current user data
        profile: currentProfile,
        role: currentRole,
        // All profiles (in case needed)
        adminProfile,
        doctorProfile,
        hospitalProfile,
        // Loading and error states
        isLoading,
        error,
        // Helper flags
        isAdmin: currentRole === Role.ADMIN,
        isDoctor: currentRole === Role.DOCTOR,
        isHospital: currentRole === Role.STAFF,
        // Display helpers
        displayName: getDisplayName(),
        roleDisplay: getRoleDisplay(),
        avatarUrl: getAvatarUrl(),
    };
};

export default useCurrentUserProfile;
