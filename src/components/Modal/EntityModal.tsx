import React from 'react';
import StatusSelect from '@/components/FormComponents/StatusSelect';
import NameInput from '@/components/FormComponents/NameInput';

interface EntityModalProps {
    show: boolean;
    title: string;
    formData: {
        name: string;
        description?: string; // Optional description field
        imageUrl?: string; // Optional for entities that don't need image
        status: 'ACTIVE' | 'INACTIVE';
    };
    validationErrors: {
        name?: string;
        description?: string;
        imageUrl?: string;
        status?: string;
    };
    isSubmitting: boolean;
    modalMode: 'add' | 'edit';
    onCancel: () => void;
    onSubmit: () => void;
    onNameChange: (value: string) => void;
    onDescriptionChange?: (value: string) => void; // Optional description change handler
    onImageFileChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onStatusChange: (value: 'ACTIVE' | 'INACTIVE') => void;
    onRemoveImage?: () => void;
    imagePreview?: string;
    entityName: string; // e.g., 'Học vị', 'Ngôn ngữ', 'Chuyên khoa'
    hasImageUpload?: boolean; // Flag to show/hide image upload section
    hasDescription?: boolean; // Flag to show/hide description field
    styles: {
        modal: string;
        'modal-content': string;
        invalidFeedback: string;
        reactSelectInvalid: string;
    };
}

const EntityModal: React.FC<EntityModalProps> = ({
    show,
    title,
    formData,
    validationErrors,
    isSubmitting,
    modalMode,
    onCancel,
    onSubmit,
    onNameChange,
    onDescriptionChange,
    onImageFileChange,
    onStatusChange,
    onRemoveImage,
    imagePreview,
    entityName,
    hasImageUpload = false,
    hasDescription = false,
    styles,
}) => {
    if (!show) return null;

    return (
        <div
            className={`modal fade show d-block ${styles.modal}`}
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
            <div className="modal-dialog modal-lg modal-dialog-centered">
                <div className={`modal-content ${styles['modal-content']}`}>
                    <div className="modal-header border-0 pb-0">
                        <h5 className="modal-title fw-bold text-dark fs-18">{title}</h5>
                        <button
                            type="button"
                            className="btn-close"
                            onClick={onCancel}
                            aria-label="Close"
                        ></button>
                    </div>
                    <div className="modal-body pt-0">
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                onSubmit();
                            }}
                        >
                            <div className="row">
                                {/* Name Field */}
                                <div className="col-12">
                                    <div className="mb-4">
                                        <label
                                            htmlFor={`${entityName.toLowerCase()}-name`}
                                            className="form-label fw-semibold text-dark mb-2"
                                        >
                                            Tên {entityName} <span className="text-danger">*</span>
                                        </label>
                                        <NameInput
                                            value={formData.name}
                                            onChange={onNameChange}
                                            placeholder={`Nhập tên ${entityName.toLowerCase()} (2-255 ký tự)`}
                                            required={true}
                                            validationError={validationErrors.name}
                                            styles={styles}
                                        />
                                    </div>
                                </div>

                                {/* Description Field - Only show if hasDescription is true */}
                                {hasDescription && (
                                    <div className="col-12">
                                        <div className="mb-4">
                                            <label
                                                htmlFor={`${entityName.toLowerCase()}-description`}
                                                className="form-label fw-semibold text-dark mb-2"
                                            >
                                                Mô tả
                                            </label>
                                            <textarea
                                                id={`${entityName.toLowerCase()}-description`}
                                                className={`form-control ${validationErrors.description ? 'is-invalid' : ''}`}
                                                rows={4}
                                                placeholder={`Nhập mô tả cho ${entityName.toLowerCase()}`}
                                                value={formData.description || ''}
                                                onChange={(e) =>
                                                    onDescriptionChange?.(e.target.value)
                                                }
                                            />
                                            {validationErrors.description && (
                                                <div className={`${styles.invalidFeedback}`}>
                                                    {validationErrors.description}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Image File Upload - Only show if hasImageUpload is true */}
                                {hasImageUpload && (
                                    <>
                                        <div className="col-12">
                                            <div className="mb-4">
                                                <label
                                                    htmlFor={`${entityName.toLowerCase()}-image-file`}
                                                    className="form-label fw-semibold text-dark mb-2"
                                                >
                                                    Hình ảnh {entityName.toLowerCase()}{' '}
                                                    <span className="text-danger">*</span>
                                                </label>
                                                <input
                                                    type="file"
                                                    id={`${entityName.toLowerCase()}-image-file`}
                                                    className={`form-control ${
                                                        validationErrors.imageUrl
                                                            ? 'is-invalid'
                                                            : ''
                                                    }`}
                                                    accept="image/*"
                                                    onChange={onImageFileChange}
                                                    required
                                                />
                                                {validationErrors.imageUrl && (
                                                    <div className={styles.invalidFeedback}>
                                                        {validationErrors.imageUrl}
                                                    </div>
                                                )}
                                                <small className="text-muted">
                                                    Chấp nhận file: JPG, PNG, GIF (tối đa 5MB)
                                                </small>
                                            </div>
                                        </div>

                                        {/* Image Preview */}
                                        {imagePreview && (
                                            <div className="col-12">
                                                <div className="mb-4">
                                                    <div className="fw-semibold text-dark mb-2">
                                                        Xem trước hình ảnh
                                                    </div>
                                                    <div
                                                        className="position-relative border rounded p-2"
                                                        style={{ width: '100px', height: '100px' }}
                                                    >
                                                        <img
                                                            src={imagePreview}
                                                            alt="Preview"
                                                            style={{
                                                                width: '100%',
                                                                height: '100%',
                                                                borderRadius: '8px',
                                                                objectFit: 'cover',
                                                            }}
                                                            onError={(e) => {
                                                                (e.target as HTMLImageElement).src =
                                                                    'https://via.placeholder.com/100x100?text=Invalid+Image';
                                                            }}
                                                        />
                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-danger position-absolute"
                                                            style={{
                                                                top: '5px',
                                                                right: '5px',
                                                                borderRadius: '50%',
                                                                width: '20px',
                                                                height: '20px',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                padding: '0',
                                                            }}
                                                            onClick={onRemoveImage}
                                                            title="Xóa hình ảnh"
                                                        >
                                                            <i
                                                                className="ti ti-x"
                                                                style={{ fontSize: '10px' }}
                                                            ></i>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}

                                {/* Status Field */}
                                <div className="col-12">
                                    <div className="mb-4">
                                        <label
                                            htmlFor={`${entityName.toLowerCase()}-status`}
                                            className="form-label fw-semibold text-dark mb-2"
                                        >
                                            Trạng thái <span className="text-danger">*</span>
                                        </label>
                                        <StatusSelect
                                            value={formData.status}
                                            onChange={onStatusChange}
                                            validationError={validationErrors.status}
                                            styles={styles}
                                        />
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div className="modal-footer border-0 pt-0">
                        <button
                            type="button"
                            className="btn btn-light btn-lg px-4 rounded-3"
                            onClick={onCancel}
                            disabled={isSubmitting}
                        >
                            Hủy
                        </button>
                        <button
                            type="button"
                            className="btn btn-primary btn-lg px-4 rounded-3"
                            onClick={onSubmit}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <span
                                        className="spinner-border spinner-border-sm me-2"
                                        aria-hidden="true"
                                    ></span>
                                    <output>
                                        {modalMode === 'add' ? 'Đang tạo...' : 'Đang cập nhật...'}
                                    </output>
                                </>
                            ) : (
                                <>
                                    <i
                                        className={`${modalMode === 'add' ? 'ti ti-plus' : 'ti ti-edit'} me-2`}
                                    ></i>
                                    {modalMode === 'add'
                                        ? `Tạo ${entityName}`
                                        : `Cập Nhật ${entityName}`}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EntityModal;
