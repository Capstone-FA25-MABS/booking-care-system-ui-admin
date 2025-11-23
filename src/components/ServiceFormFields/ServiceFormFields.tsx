import React, { useState, useEffect, useMemo } from 'react';
import Input from '@/components/Input';
import Textarea from '@/components/Textarea';
import { ServiceFormData } from '@/types/service.types';
import { ServiceCategory } from '@/types/serviceCategory.types';

interface ServiceFormFieldsProps {
    formData: ServiceFormData;
    errors: Record<string, string>;
    serviceCategories: ServiceCategory[];
    imagePreview: string;
    onInputChange: (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => void;
    onImageFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onRemoveImage: () => void;
    isEditMode?: boolean;
}

const ServiceFormFields: React.FC<ServiceFormFieldsProps> = ({
    formData,
    errors,
    serviceCategories,
    imagePreview,
    onInputChange,
    onImageFileChange,
    onRemoveImage,
    isEditMode = false,
}) => {
    // Get current parent category ID from selected child (for edit mode)
    const initialParentId = useMemo(() => {
        if (formData.serviceTypeId) {
            const selectedChild = serviceCategories.find(
                (cat) => cat.id === formData.serviceTypeId
            );
            return selectedChild?.parentId || '';
        }
        return '';
    }, [formData.serviceTypeId, serviceCategories]);

    // State to track selected parent category
    const [selectedParentId, setSelectedParentId] = useState<string>(initialParentId);

    // Update selectedParentId when formData.serviceTypeId changes (for edit mode)
    useEffect(() => {
        if (formData.serviceTypeId) {
            const selectedChild = serviceCategories.find(
                (cat) => cat.id === formData.serviceTypeId
            );
            if (selectedChild?.parentId) {
                setSelectedParentId(selectedChild.parentId);
            }
        } else {
            setSelectedParentId('');
        }
    }, [formData.serviceTypeId, serviceCategories]);

    // Separate parent and child categories
    const parentCategories = useMemo(() => {
        return serviceCategories.filter((cat) => !cat.parentId);
    }, [serviceCategories]);

    // Get child categories for selected parent
    const availableChildCategories = useMemo(() => {
        if (!selectedParentId) return [];
        return serviceCategories.filter((cat) => cat.parentId === selectedParentId);
    }, [selectedParentId, serviceCategories]);

    // Handle parent category change
    const handleParentCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const parentId = e.target.value;
        setSelectedParentId(parentId);
        // Reset child category when parent changes
        const syntheticEvent = {
            target: { name: 'serviceTypeId', value: '' },
        } as React.ChangeEvent<HTMLSelectElement>;
        onInputChange(syntheticEvent);
    };

    return (
        <>
            {/* Name */}
            <div className="mb-3">
                <Input
                    label="Tên dịch vụ"
                    name="name"
                    value={formData.name}
                    onChange={onInputChange}
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
                    onChange={onInputChange}
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
                            onChange={onInputChange}
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
                            onChange={onInputChange}
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
                    onChange={onImageFileChange}
                />
                {errors.imageUrl && <div className="invalid-feedback">{errors.imageUrl}</div>}
                <small className="text-muted">
                    Chấp nhận file: JPG, PNG, GIF (tối đa 5MB)
                    {isEditMode && '. Để trống nếu không muốn thay đổi.'}
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
                            onClick={onRemoveImage}
                            title="Xóa hình ảnh"
                        >
                            <i className="ti ti-x" style={{ fontSize: '12px' }}></i>
                        </button>
                    </div>
                </div>
            )}

            {/* Service Category - Parent */}
            <div className="mb-3">
                <label htmlFor="parentCategoryId" className="form-label">
                    Danh mục dịch vụ <span className="text-danger">*</span>
                </label>
                <select
                    id="parentCategoryId"
                    name="parentCategoryId"
                    className={`form-select ${errors.serviceTypeId && !formData.serviceTypeId ? 'is-invalid' : ''}`}
                    value={selectedParentId}
                    onChange={handleParentCategoryChange}
                    required
                >
                    <option value="">Chọn danh mục dịch vụ</option>
                    {parentCategories.map((category) => (
                        <option key={category.id} value={category.id}>
                            {category.name}
                        </option>
                    ))}
                </select>
                {errors.serviceTypeId && !formData.serviceTypeId && (
                    <div className="invalid-feedback">{errors.serviceTypeId}</div>
                )}
            </div>

            {/* Service Category - Child */}
            <div className="mb-3">
                <label htmlFor="serviceTypeId" className="form-label">
                    Dịch vụ <span className="text-danger">*</span>
                </label>
                <select
                    id="serviceTypeId"
                    name="serviceTypeId"
                    className={`form-select ${errors.serviceTypeId ? 'is-invalid' : ''}`}
                    value={formData.serviceTypeId}
                    onChange={onInputChange}
                    required
                    disabled={!selectedParentId && !formData.serviceTypeId}
                >
                    <option value="">
                        {selectedParentId || formData.serviceTypeId
                            ? 'Chọn dịch vụ'
                            : 'Vui lòng chọn danh mục dịch vụ trước'}
                    </option>
                    {availableChildCategories.map((category) => (
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
    );
};

export default ServiceFormFields;
