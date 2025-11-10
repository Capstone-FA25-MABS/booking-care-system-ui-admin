import React from 'react';
import Input from '@/components/Input';
import Textarea from '@/components/Textarea';
import { ServiceFormData } from '@/types/service.types';

interface ServiceFormFieldsProps {
    formData: ServiceFormData;
    errors: Record<string, string>;
    serviceCategories: Array<{ id: string; name: string }>;
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
                    onChange={onInputChange}
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
    );
};

export default ServiceFormFields;
