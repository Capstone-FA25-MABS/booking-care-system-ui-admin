import React from 'react';
import ServiceListView from '@/components/ServiceListView';

const ListServices: React.FC = () => {
    return (
        <ServiceListView
            showHospitalColumn={true}
            showHospitalFilter={true}
            editServicePathTemplate="/admin/services/edit/:id"
            pageTitle="Danh Sách Dịch Vụ"
        />
    );
};

export default ListServices;
