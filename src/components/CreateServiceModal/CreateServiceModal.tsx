import React, { useState } from 'react';
import { toast } from 'react-toastify';
import BaseModal from '@/components/Modal/BaseModal';
import Button from '@/components/Button';
import ServiceFormFields from '@/components/ServiceFormFields';
import { createService, createServiceWithImage } from '@/services/service.service';
import { useServiceForm } from '@/hooks/useServiceForm';

interface CreateServiceModalProps {
    isOpen: boolean;
    hospitalId: string;
    serviceCategories: Array<{ id: string; name: string }>;
    onClose: () => void;
    onSuccess: () => void;
}

const CreateServiceModal: React.FC<CreateServiceModalProps> = ({
    isOpen,
    hospitalId,
    serviceCategories,
    onClose,
    onSuccess,
}) => {
    const [isLoading, setIsLoading] = useState(false);

    const {
        formData,
        errors,
        imagePreview,
        imageFile,
        handleInputChange,
        handleImageFileChange,
        handleRemoveImage,
        resetForm,
        validateForm,
    } = useServiceForm({
        initialHospitalId: hospitalId,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm(hospitalId)) {
            return;
        }

        setIsLoading(true);
        try {
            let response;
            if (imageFile) {
                // Upload with image
                response = await createServiceWithImage({
                    ...formData,
                    hospitalId: hospitalId,
                    imageFile: imageFile,
                });
            } else {
                // Create without image
                response = await createService({
                    ...formData,
                    hospitalId: hospitalId,
                });
            }

            if (response.success) {
                toast.success('Tạo dịch vụ thành công');
                onSuccess();
                handleClose();
            } else {
                toast.error(response.message || 'Không thể tạo dịch vụ');
            }
        } catch (error: any) {
            console.error('Error creating service:', error);
            const errorMessage =
                error?.response?.data?.message ||
                error?.response?.data?.error ||
                error?.message ||
                'Không thể tạo dịch vụ';
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        resetForm(hospitalId);
        onClose();
    };

    return (
        <BaseModal
            isOpen={isOpen}
            title="Thêm dịch vụ mới"
            titleId="create-service-modal"
            onClose={handleClose}
            size="lg"
        >
            <form onSubmit={handleSubmit}>
                <div className="modal-body">
                    <ServiceFormFields
                        formData={formData}
                        errors={errors}
                        serviceCategories={serviceCategories}
                        imagePreview={imagePreview}
                        onInputChange={handleInputChange}
                        onImageFileChange={handleImageFileChange}
                        onRemoveImage={handleRemoveImage}
                    />
                </div>

                <div className="modal-footer">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={handleClose}
                        disabled={isLoading}
                    >
                        Hủy
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        disabled={isLoading}
                        loading={isLoading}
                    >
                        {isLoading ? 'Đang tạo...' : 'Tạo dịch vụ'}
                    </Button>
                </div>
            </form>
        </BaseModal>
    );
};

export default CreateServiceModal;
