import React from 'react';
import { approveRegistration } from '@/services/hospital-registration.service';
import BaseContractModal from './BaseContractModal';

interface ApprovalModalProps {
    isOpen: boolean;
    hospitalName: string;
    registrationId: string;
    onClose: () => void;
    onSuccess: () => void;
}

const ApprovalModal: React.FC<ApprovalModalProps> = ({
    isOpen,
    hospitalName,
    registrationId,
    onClose,
    onSuccess,
}) => {
    // Custom submit handler for approval with enhanced success message
    const handleApprovalSubmit = async (registrationId: string, contractFile: File) => {
        const response = await approveRegistration(registrationId, contractFile);

        // Override success message for approval
        if (response.success && !response.message) {
            response.message =
                'Đơn đăng ký đã được phê duyệt thành công. Hệ thống đang tạo tài khoản cho bệnh viện...';
        }

        return response;
    };

    return (
        <BaseContractModal
            isOpen={isOpen}
            hospitalName={hospitalName}
            registrationId={registrationId}
            onClose={onClose}
            onSuccess={onSuccess}
            title="Phê duyệt đơn đăng ký"
            submitButtonText="Phê duyệt"
            submitButtonClass="btn btn-success"
            fileLabel="Hợp đồng hợp tác"
            errorMessage="Vui lòng chọn file hợp đồng"
            onSubmit={handleApprovalSubmit}
            additionalContent={
                <div className="alert alert-info">
                    Sau khi phê duyệt, hệ thống sẽ tự động tạo tài khoản cho bệnh viện và gửi thông
                    tin đăng nhập qua email.
                </div>
            }
        />
    );
};

export default ApprovalModal;
