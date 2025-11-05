import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import SettingsSidebar from '@/pages/settings/components/SettingsSidebar';
import { useCurrentUserProfile } from '@/hooks/useCurrentUserProfile';
import { Role } from '@/enums/common.enums';
import DoctorProfileSettings from './DoctorProfileSettings';
import HospitalProfileSettings from './HospitalProfileSettings';
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

    // For DOCTOR and STAFF roles, hide the sidebar and show full-width form
    const shouldShowSidebar = role !== Role.DOCTOR && role !== Role.STAFF;

    return (
        <div className="content" id="profilePage">
            {/* Page Header */}
            <div className="mb-3 border-bottom pb-3">
                <h4 className="fw-bold mb-0">Settings</h4>
            </div>

            <div className="card">
                <div className="card-body p-0">
                    <div className={shouldShowSidebar ? 'settings-wrapper d-flex' : ''}>
                        {/* Settings Sidebar - Only show for non-DOCTOR and non-STAFF roles */}
                        {shouldShowSidebar && <SettingsSidebar activeMenu="profile" />}

                        {/* Main Content */}
                        <div
                            className={`card ${shouldShowSidebar ? 'flex-fill' : 'w-100'} mb-0 border-0 bg-light-500 shadow-none`}
                        >
                            {role === Role.DOCTOR && <DoctorProfileSettings />}
                            {role === Role.STAFF && <HospitalProfileSettings />}
                            {shouldShowSidebar && (
                                <div className="card-header border-bottom px-0 mx-3">
                                    <h5 className="fw-bold">Basic Information</h5>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileSettings;
