import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import BaseModal from '@/components/Modal/BaseModal';
import Input from '@/components/Input';
import Textarea from '@/components/Textarea';
import Button from '@/components/Button';
import { ServiceFormData } from '@/types/service.types';
import { updateService, updateServiceWithImage, getServiceById } from '@/services/service.service';
import { useImageUpload } from '@/hooks/useImageUpload';

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
    serviceCategories,
    onClose,
    onSuccess,
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const [formData, setFormData] = useState<ServiceFormData>({
        name: '',
        description: '',
        price: 0,
        durationTime: 30,
        hospitalId: '',
        serviceTypeId: '',
        status: 'ACTIVE',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Image upload hook
    const {
        imagePreview,
        imageFile,
        setImagePreview,
        handleImageFileChange,
        handleRemoveImage,
        resetImage,
    } = useImageUpload({
        maxSize: 5 * 1024 * 1024, // 5MB
        onValidationError: (field) => {
            if (field === 'imageUrl') {
                // Clear error when validation passes
                setErrors((prev) => {
                    const newErrors = { ...prev };
                    delete newErrors.imageUrl;
                    return newErrors;
                });
            }
        },
    });

    // Fetch service data when modal opens
    useEffect(() => {
        if (isOpen && serviceId) {
            fetchServiceData(serviceId);
        }
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

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === 'price' || name === 'durationTime' ? Number(value) : value,
        }));
        // Clear error when user types
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Tên dịch vụ không được để trống';
        }

        if (formData.price <= 0) {
            newErrors.price = 'Giá dịch vụ phải lớn hơn 0';
        }

        if (formData.durationTime <= 0) {
            newErrors.durationTime = 'Thời gian dịch vụ phải lớn hơn 0';
        }

        if (!formData.serviceTypeId) {
            newErrors.serviceTypeId = 'Vui lòng chọn loại dịch vụ';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
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
        setFormData({
            name: '',
            description: '',
            price: 0,
            durationTime: 30,
            hospitalId: '',
            serviceTypeId: '',
            status: 'ACTIVE',
        });
        setErrors({});
        resetImage();
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
                        <>
                            {/* Name */}
                            <div className="mb-3">
                                <Input
                                    label="Tên dịch vụ"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    error={errors.name}
                                    placeholder="Nhập tên dịch vụ"
                                    required
                                />
                            </div>

                            {/* Description */}
                            <div className="mb-3">
                                <Textarea
                                    label="Mô tả"
                                    name="description"
                                    value={formData.description || ''}
                                    onChange={handleInputChange}
                                    placeholder="Nhập mô tả dịch vụ (tùy chọn)"
                                    rows={3}
                                />
                            </div>

                            {/* Price and Duration */}
                            <div className="row">
                                <div className="col-md-6">
                                    <div className="mb-3">
                                        <Input
                                            label="Giá dịch vụ (VNĐ)"
                                            type="number"
                                            name="price"
                                            value={formData.price.toString()}
                                            onChange={handleInputChange}
                                            error={errors.price}
                                            placeholder="0"
                                            min="0"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="mb-3">
                                        <Input
                                            label="Thời gian (phút)"
                                            type="number"
                                            name="durationTime"
                                            value={formData.durationTime.toString()}
                                            onChange={handleInputChange}
                                            error={errors.durationTime}
                                            placeholder="30"
                                            min="1"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Image Upload */}
                            <div className="mb-3">
                                <label htmlFor="serviceImage" className="form-label">
                                    Hình ảnh dịch vụ
                                </label>
                                <input
                                    type="file"
                                    id="serviceImage"
                                    className={`form-control ${errors.imageUrl ? 'is-invalid' : ''}`}
                                    accept="image/*"
                                    onChange={handleImageFileChange}
                                />
                                {errors.imageUrl && (
                                    <div className="invalid-feedback">{errors.imageUrl}</div>
                                )}
                                <small className="text-muted">
                                    Chấp nhận file: JPG, PNG, GIF (tối đa 5MB). Để trống nếu không
                                    muốn thay đổi.
                                </small>
                            </div>

                            {/* Image Preview */}
                            {imagePreview && (
                                <div className="mb-3">
                                    <label htmlFor="imagePreview" className="form-label">
                                        Xem trước hình ảnh
                                    </label>
                                    <div className="position-relative border rounded p-2 d-inline-block">
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            style={{
                                                width: '200px',
                                                height: '150px',
                                                objectFit: 'cover',
                                                borderRadius: '8px',
                                            }}
                                        />
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-danger position-absolute"
                                            style={{
                                                top: '5px',
                                                right: '5px',
                                                borderRadius: '50%',
                                                width: '24px',
                                                height: '24px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                padding: '0',
                                            }}
                                            onClick={handleRemoveImage}
                                            title="Xóa hình ảnh"
                                        >
                                            <i className="ti ti-x" style={{ fontSize: '12px' }}></i>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Service Category */}
                            <div className="mb-3">
                                <label htmlFor="serviceTypeId" className="form-label">
                                    Loại dịch vụ <span className="text-danger">*</span>
                                </label>
                                <select
                                    id="serviceTypeId"
                                    name="serviceTypeId"
                                    className={`form-select ${errors.serviceTypeId ? 'is-invalid' : ''}`}
                                    value={formData.serviceTypeId}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Chọn loại dịch vụ</option>
                                    {serviceCategories.map((category) => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.serviceTypeId && (
                                    <div className="invalid-feedback">{errors.serviceTypeId}</div>
                                )}
                            </div>
                        </>
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
