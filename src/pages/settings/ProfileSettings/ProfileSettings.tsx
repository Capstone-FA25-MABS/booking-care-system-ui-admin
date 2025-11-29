import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useCurrentUserProfile } from '@/hooks/useCurrentUserProfile';
import { Role } from '@/enums/common.enums';
import DoctorProfileSettings from './components/DoctorProfileSettings';
import HospitalProfileSettings from './components/HospitalProfileSettings';
import AdminProfileSettings from './components/AdminProfileSettings';
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
                <div
                    className="d-flex justify-content-center align-items-center"
                    style={{
                        minHeight: 'calc(100vh - 300px)',
                        width: '100%',
                    }}
                >
                    <div className="text-center">
                        <Spinner size="medium" variant="primary" />
                        <p className="mt-3 text-muted">Đang tải dữ liệu...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="content" id="profilePage">
            <div className="card">
                <div className="card-body p-0">
                    <div className="card w-100 mb-0 border-0 bg-light-500 shadow-none">
                        {role === Role.DOCTOR && <DoctorProfileSettings />}
                        {role === Role.STAFF && <HospitalProfileSettings />}
                        {role === Role.ADMIN && <AdminProfileSettings />}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileSettings;
