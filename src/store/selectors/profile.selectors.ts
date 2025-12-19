import { RootState } from '@/store';

export const selectCurrentProfile = (state: RootState) => {
    const doctorProfile = (state as any)?.user?.doctorProfile;
    const hospitalProfile = (state as any)?.user?.hospitalProfile;
    const adminProfile = (state as any)?.user?.adminProfile;

    if (doctorProfile) {
        return {
            doctorId: doctorProfile.id,
            doctorAccountId: doctorProfile.accountId,
            hospitalId: doctorProfile.hospitalId,
        };
    }

    if (hospitalProfile) {
        return {
            hospitalId: hospitalProfile.id,
            hospitalAccountId: hospitalProfile.accountId,
        };
    }

    if (adminProfile) {
        return {
            adminId: adminProfile.id,
            adminAccountId: adminProfile.accountId,
        };
    }

    return {
        doctorId: undefined,
        hospitalId: undefined,
    };
};
