import React from 'react';
import styles from './GenericModal.module.scss';

export interface FormField {
    type: 'input' | 'select' | 'textarea' | 'custom';
    name: string;
    label: string;
    placeholder?: string;
    required?: boolean;
    value: any;
    onChange: (value: any) => void;
    options?: Array<{ value: any; label: string }>; // For select fields
    rows?: number; // For textarea
    component?: React.ComponentType<any>; // For custom components
    componentProps?: Record<string, any>; // Props for custom components
    wrapperClassName?: string;
}

interface GenericModalProps {
    show: boolean;
    mode: 'add' | 'edit';
    title: string;
    fields: FormField[];
    onSubmit: () => void;
    onCancel: () => void;
    isSubmitting?: boolean;
    submitButtonText?: string;
    cancelButtonText?: string;
    submitButtonIcon?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

const GenericModal: React.FC<GenericModalProps> = ({
    show,
    mode,
    title,
    fields,
    onSubmit,
    onCancel,
    isSubmitting = false,
    submitButtonText,
    cancelButtonText = 'Hủy',
    submitButtonIcon,
    size = 'lg',
}) => {
    const defaultSubmitText = mode === 'add' ? 'Tạo' : 'Cập Nhật';
    const defaultSubmitIcon = mode === 'add' ? 'ti ti-plus' : 'ti ti-edit';

    const finalSubmitText = submitButtonText || defaultSubmitText;
    const finalSubmitIcon = submitButtonIcon || defaultSubmitIcon;

    const sizeClass = {
        sm: 'modal-sm',
        md: 'modal-md',
        lg: 'modal-lg',
        xl: 'modal-xl',
    }[size];

    if (!show) return null;

    const renderField = (field: FormField) => {
        const {
            type,
            name,
            label,
            placeholder,
            required,
            value,
            onChange,
            options,
            rows,
            component: CustomComponent,
            componentProps,
            wrapperClassName,
        } = field;

        const fieldId = `field-${name}`;
        const labelElement = (
            <label htmlFor={fieldId} className="form-label fw-semibold text-dark mb-2">
                {label} {required && <span className="text-danger">*</span>}
            </label>
        );

        let inputElement;

        switch (type) {
            case 'input':
                inputElement = (
                    <input
                        id={fieldId}
                        type="text"
                        className="form-control"
                        placeholder={placeholder}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        required={required}
                    />
                );
                break;

            case 'select':
                inputElement = (
                    <select
                        id={fieldId}
                        className="form-select"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        required={required}
                    >
                        <option value="">{placeholder || 'Chọn...'}</option>
                        {options?.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                );
                break;

            case 'textarea':
                inputElement = (
                    <textarea
                        id={fieldId}
                        className="form-control"
                        placeholder={placeholder}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        rows={rows || 4}
                        required={required}
                    />
                );
                break;

            case 'custom':
                if (CustomComponent) {
                    inputElement = (
                        <CustomComponent {...componentProps} value={value} onChange={onChange} />
                    );
                }
                break;

            default:
                inputElement = null;
        }

        return (
            <div key={name} className={wrapperClassName || 'col-12'}>
                <div className="mb-4">
                    {labelElement}
                    {inputElement}
                </div>
            </div>
        );
    };

    return (
        <div
            className={`modal fade show d-block ${styles.modal}`}
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
            <div className={`modal-dialog ${sizeClass} modal-dialog-centered`}>
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
                            <div className="row">{fields.map(renderField)}</div>
                        </form>
                    </div>
                    <div className="modal-footer border-0 pt-0">
                        <button
                            type="button"
                            className="btn btn-light btn-lg px-4 rounded-3"
                            onClick={onCancel}
                            disabled={isSubmitting}
                        >
                            {cancelButtonText}
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
                                        role="status"
                                        aria-hidden="true"
                                    ></span>
                                    {mode === 'add' ? 'Đang tạo...' : 'Đang cập nhật...'}
                                </>
                            ) : (
                                <>
                                    <i className={`${finalSubmitIcon} me-2`}></i>
                                    {finalSubmitText}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GenericModal;
