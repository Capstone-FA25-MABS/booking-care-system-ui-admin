import React, { useMemo } from 'react';
import ServiceListView from '@/components/ServiceListView';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

const ListServicesStaff: React.FC = () => {
    // Get hospital ID from the logged-in staff user's hospital profile
    const hospitalProfile = useSelector((state: RootState) => state.user.hospitalProfile);

    // Hardcoded hospital ID for testing (remove after login is implemented)
    const TEST_HOSPITAL_ID = '3A3502FD-2B92-4370-9BA7-0B309A2B02A7';

    // Memoize hospitalId to prevent unnecessary re-renders
    const hospitalId = useMemo(() => {
        return hospitalProfile?.id || TEST_HOSPITAL_ID;
    }, [hospitalProfile?.id]);

    return (
        <ServiceListView
            hospitalId={hospitalId}
            showHospitalColumn={false} // Staff doesn't need to see hospital column
            showHospitalFilter={false} // Staff doesn't need hospital filter
            editServicePathTemplate="/hospital/services/edit/:id"
            pageTitle="Dịch Vụ Của Bệnh Viện"
            useEditModal={true} // Use modal for editing instead of navigation
            useCreateModal={true} // Use modal for creating instead of navigation
        />
    );
};

export default ListServicesStaff;
