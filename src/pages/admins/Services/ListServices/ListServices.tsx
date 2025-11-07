import React from 'react';
import ServiceListView from '@/components/ServiceListView';

const ListServices: React.FC = () => {
    return (
        <ServiceListView
            showHospitalColumn={true}
            showHospitalFilter={true}
            addServicePath="/admin/services/add"
            editServicePathTemplate="/admin/services/edit/:id"
            pageTitle="Danh Sách Dịch Vụ"
        />
    );
};

export default ListServices;
