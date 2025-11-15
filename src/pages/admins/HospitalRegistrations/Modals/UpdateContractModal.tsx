import React from 'react';
import { updateContractFile } from '@/services/hospital-registration.service';
import BaseContractModal from './BaseContractModal';

interface UpdateContractModalProps {
    isOpen: boolean;
    hospitalName: string;
    registrationId: string;
    onClose: () => void;
    onSuccess: () => void;
}

const UpdateContractModal: React.FC<UpdateContractModalProps> = ({
    isOpen,
    hospitalName,
    registrationId,
    onClose,
    onSuccess,
}) => {
    return (
        <BaseContractModal
            isOpen={isOpen}
            hospitalName={hospitalName}
            registrationId={registrationId}
            onClose={onClose}
            onSuccess={onSuccess}
            title="Cập nhật file hợp đồng"
            submitButtonText="Cập nhật"
            submitButtonClass="btn btn-primary"
            fileLabel="File hợp đồng mới"
            errorMessage="Vui lòng chọn file hợp đồng mới"
            onSubmit={updateContractFile}
        />
    );
};

export default UpdateContractModal;
