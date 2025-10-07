import React from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    placeholder?: string;
    icon?: string;
    iconPrefix?: 'ti' | 'feather';
    error?: string;
    disabled?: boolean;
    required?: boolean;
    wrapperClassName?: string;
}

const Textarea: React.FC<TextareaProps> = ({
    label,
    name,
    value,
    onChange,
    placeholder,
    icon,
    iconPrefix = 'ti',
    error,
    disabled = false,
    className = '',
    required = false,
    wrapperClassName = '',
    ...props
}) => {
    const textareaId = props.id || name;

    const getIconClass = () => {
        if (!icon) return '';
        if (iconPrefix === 'feather') {
            return icon.startsWith('feather-') ? icon : `feather-${icon}`;
        }
        return icon.startsWith('ti-') ? `ti ${icon}` : `ti ti-${icon}`;
    };

    return (
        <div className={wrapperClassName || 'mb-3'}>
            {label && (
                <label htmlFor={textareaId} className="form-label">
                    {icon && (
                        <>
                            <i className={`${getIconClass()} me-1`}></i>{' '}
                        </>
                    )}
                    {label}
                    {required && <span className="text-danger ms-1">*</span>}
                </label>
            )}

            <textarea
                id={textareaId}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                disabled={disabled}
                className={`form-control ${error ? 'is-invalid' : ''} ${className}`}
                {...props}
            />

            {error && <div className="invalid-feedback d-block">{error}</div>}
        </div>
    );
};

export default Textarea;
