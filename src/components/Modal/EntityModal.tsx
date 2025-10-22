import React from 'react';
import StatusSelect from '@/components/FormComponents/StatusSelect';
import NameInput from '@/components/FormComponents/NameInput';

interface EntityModalProps {
    show: boolean;
    title: string;
    formData: {
        name: string;
        status: 'ACTIVE' | 'INACTIVE';
    };
    validationErrors: {
        name?: string;
        status?: string;
    };
    isSubmitting: boolean;
    modalMode: 'add' | 'edit';
    onCancel: () => void;
    onSubmit: () => void;
    onNameChange: (value: string) => void;
    onStatusChange: (value: 'ACTIVE' | 'INACTIVE') => void;
    entityName: string; // e.g., 'Học Vị', 'Ngôn Ngữ'
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
    onStatusChange,
    entityName,
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

                                {/* Status Field */}
                                <div className="col-12">
                                    <div className="mb-4">
                                        <label
                                            htmlFor={`${entityName.toLowerCase()}-status`}
                                            className="form-label fw-semibold text-dark mb-2"
                                        >
                                            Trạng Thái <span className="text-danger">*</span>
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
