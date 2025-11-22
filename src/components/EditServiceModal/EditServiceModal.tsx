import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import BaseModal from '@/components/Modal/BaseModal';
import Button from '@/components/Button';
import ServiceFormFields from '@/components/ServiceFormFields';
import { updateService, updateServiceWithImage, getServiceById } from '@/services/service.service';
import { useServiceForm } from '@/hooks/useServiceForm';
import { getAllServiceCategories } from '@/services/serviceCategory.service';
import { ServiceCategory } from '@/types/serviceCategory.types';

interface EditServiceModalProps {
    isOpen: boolean;
    serviceId: string | null;
    serviceCategories: Array<{ id: string; name: string }>;
    onClose: () => void;
    onSuccess: () => void;
}

const EditServiceModal: React.FC<EditServiceModalProps> = ({
    isOpen,
    serviceId,
    serviceCategories: _serviceCategories,
    onClose,
    onSuccess,
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const [serviceCategoriesWithParent, setServiceCategoriesWithParent] = useState<
        ServiceCategory[]
    >([]);

    // Fetch service categories with parentId when modal opens
    useEffect(() => {
        if (isOpen) {
            fetchServiceCategories();
        }
    }, [isOpen]);

    const fetchServiceCategories = async () => {
        try {
            const response = await getAllServiceCategories();
            if (response.success && response.data) {
                setServiceCategoriesWithParent(response.data);
            }
        } catch (error) {
            console.error('Error fetching service categories:', error);
            toast.error('Không thể tải danh sách loại dịch vụ');
        }
    };

    const {
        formData,
        errors,
        imagePreview,
        imageFile,
        setFormData,
        setImagePreview,
        handleInputChange,
        handleImageFileChange,
        handleRemoveImage,
        resetForm,
        validateForm,
    } = useServiceForm();

    // Fetch service data when modal opens
    useEffect(() => {
        if (isOpen && serviceId) {
            fetchServiceData(serviceId);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, serviceId]);

    const fetchServiceData = async (id: string) => {
        setIsFetching(true);
        try {
            const response = await getServiceById(id);
            if (response.success && response.data) {
                const service = response.data;
                setFormData({
                    name: service.name,
                    description: service.description || '',
                    price: service.price,
                    durationTime: service.duration || service.durationTime || 30,
                    hospitalId: service.hospitalId,
                    serviceTypeId: service.serviceCategoryId || service.serviceTypeId || '',
                    status: service.status,
                    imageUrl: service.imageUrl,
                });
                // Set existing image URL for preview
                if (service.imageUrl) {
                    setImagePreview(service.imageUrl);
                }
            }
        } catch (error: any) {
            toast.error(error.message || 'Không thể tải thông tin dịch vụ');
        } finally {
            setIsFetching(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm() || !serviceId) {
            return;
        }

        setIsLoading(true);
        try {
            let response;
            if (imageFile) {
                // Update with new image
                response = await updateServiceWithImage(serviceId, {
                    ...formData,
                    imageFile: imageFile,
                });
            } else {
                // Update without changing image
                response = await updateService(serviceId, formData);
            }

            if (response.success) {
                toast.success('Cập nhật dịch vụ thành công');
                onSuccess();
                handleClose();
            }
        } catch (error: any) {
            toast.error(error.message || 'Không thể cập nhật dịch vụ');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    return (
        <BaseModal
            isOpen={isOpen}
            title="Chỉnh sửa dịch vụ"
            titleId="edit-service-modal"
            onClose={handleClose}
            size="lg"
        >
            <form onSubmit={handleSubmit}>
                <div className="modal-body">
                    {isFetching ? (
                        <div className="text-center py-4">
                            <div className="spinner-border text-primary" aria-label="Đang tải...">
                                <span className="visually-hidden">Đang tải...</span>
                            </div>
                        </div>
                    ) : (
                        <ServiceFormFields
                            formData={formData}
                            errors={errors}
                            serviceCategories={serviceCategoriesWithParent}
                            imagePreview={imagePreview}
                            onInputChange={handleInputChange}
                            onImageFileChange={handleImageFileChange}
                            onRemoveImage={handleRemoveImage}
                            isEditMode={true}
                        />
                    )}
                </div>

                <div className="modal-footer">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={handleClose}
                        disabled={isLoading || isFetching}
                    >
                        Hủy
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        disabled={isLoading || isFetching}
                        loading={isLoading}
                    >
                        {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </Button>
                </div>
            </form>
        </BaseModal>
    );
};

export default EditServiceModal;
