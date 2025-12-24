import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    icon?: string;
    iconPrefix?: 'ti' | 'feather';
    showPasswordToggle?: boolean;
    showPassword?: boolean;
    onTogglePassword?: () => void;
    error?: string;
    disabled?: boolean;
    required?: boolean;
    wrapperClassName?: string;
}

const Input: React.FC<InputProps> = ({
    label,
    type = 'text',
    name,
    value,
    onChange,
    placeholder,
    icon,
    iconPrefix = 'ti',
    showPasswordToggle = false,
    showPassword = false,
    onTogglePassword,
    error,
    disabled = false,
    className = '',
    required = false,
    wrapperClassName = '',
    ...props
}) => {
    const handleTogglePassword = () => {
        if (onTogglePassword) {
            onTogglePassword();
        }
    };

    const inputId = props.id || name;

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
                <label htmlFor={inputId} className="form-label">
                    {icon && iconPrefix === 'feather' && (
                        <>
                            <i className={`${getIconClass()} me-1`}></i>{' '}
                        </>
                    )}
                    {label}
                    {required && <span className="text-danger ms-1">*</span>}
                </label>
            )}

            <div className="position-relative">
                <div
                    className={`input-group ${type === 'password' && showPasswordToggle ? 'border rounded' : ''} ${error ? 'border-danger' : ''}`}
                >
                    {icon && iconPrefix === 'ti' && (
                        <span className="input-group-text border-end-0 bg-white">
                            <i className={`${getIconClass()} fs-14 text-dark`} />
                        </span>
                    )}

                    <input
                        type={(() => {
                            if (showPasswordToggle) {
                                return showPassword ? 'text' : 'password';
                            }
                            return type;
                        })()}
                        id={inputId}
                        name={name}
                        value={value}
                        onChange={onChange}
                        placeholder={placeholder}
                        disabled={disabled}
                        className={`form-control ${icon && iconPrefix === 'ti' ? 'border-start-0 ps-0' : ''} ${showPasswordToggle ? 'border-0' : ''} ${error ? 'is-invalid' : ''} ${className}`}
                        {...props}
                    />

                    {showPasswordToggle && (
                        <button
                            type="button"
                            className="input-group-text bg-white border-0"
                            onClick={handleTogglePassword}
                            style={{ cursor: 'pointer' }}
                            aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                        >
                            <i
                                className={`ti ${showPassword ? 'ti-eye' : 'ti-eye-off'} text-dark fs-14`}
                            />
                        </button>
                    )}
                </div>
            </div>

            {error && <div className="invalid-feedback d-block">{error}</div>}
        </div>
    );
};

export default Input;
