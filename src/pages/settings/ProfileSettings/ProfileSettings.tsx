import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useCurrentUserProfile } from '@/hooks/useCurrentUserProfile';
import { Role } from '@/enums/common.enums';
import DoctorProfileSettings from './components/DoctorProfileSettings';
import HospitalProfileSettings from './components/HospitalProfileSettings';
import Spinner from '@/components/Spinner';
import { AppDispatch } from '@/store';
import { fetchProfileByRole } from '@/store/slices/userSlice';

const ProfileSettings = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { role, isLoading, profile } = useCurrentUserProfile();

    // Auto-fetch profile if not loaded
    useEffect(() => {
        if (role && !profile && role !== Role.PATIENT) {
            dispatch(fetchProfileByRole({ role }));
        }
    }, [role, profile, dispatch]);

    if (isLoading) {
        return (
            <div className="content" id="profilePage">
                <div className="mb-3 border-bottom pb-3">
                    <h4 className="fw-bold mb-0">Settings</h4>
                </div>
                <div
                    className="d-flex justify-content-center align-items-center"
                    style={{ minHeight: '400px' }}
                >
                    <Spinner size="large" variant="primary" />
                </div>
            </div>
        );
    }

    return (
        <div className="content" id="profilePage">
            {/* Page Header */}
            <div className="mb-3 border-bottom pb-3">
                <h4 className="fw-bold mb-0">Settings</h4>
            </div>

            <div className="card">
                <div className="card-body p-0">
                    <div className="card w-100 mb-0 border-0 bg-light-500 shadow-none">
                        {role === Role.DOCTOR && <DoctorProfileSettings />}
                        {role === Role.STAFF && <HospitalProfileSettings />}
                        {role === Role.ADMIN && (
                            <div className="card-header border-bottom px-0 mx-3">
                                <h5 className="fw-bold">Basic Information</h5>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileSettings;
