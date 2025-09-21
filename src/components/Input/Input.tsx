import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    icon?: string;
    showPasswordToggle?: boolean;
    showPassword?: boolean;
    onTogglePassword?: () => void;
    error?: string;
    disabled?: boolean;
    required?: boolean;
}

const Input: React.FC<InputProps> = ({
    label,
    type = 'text',
    name,
    value,
    onChange,
    placeholder,
    icon,
    showPasswordToggle = false,
    showPassword = false,
    onTogglePassword,
    error,
    disabled = false,
    className = '',
    required = false,
    ...props
}) => {
    const handleTogglePassword = () => {
        if (onTogglePassword) {
            onTogglePassword();
        }
    };

    return (
        <div className="mb-3">
            {label && (
                <label className="form-label">
                    {label}
                    {required && <span className="text-danger ms-1">*</span>}
                </label>
            )}

            <div className="position-relative">
                <div
                    className={`input-group ${type === 'password' && showPasswordToggle ? 'border rounded' : ''} ${error ? 'border-danger' : ''}`}
                >
                    {icon && (
                        <span className="input-group-text border-end-0 bg-white">
                            <i className={`ti ti-${icon} fs-14 text-dark`} />
                        </span>
                    )}

                    <input
                        type={(() => {
                            if (showPasswordToggle) {
                                return showPassword ? 'text' : 'password';
                            }
                            return type;
                        })()}
                        name={name}
                        value={value}
                        onChange={onChange}
                        placeholder={placeholder}
                        disabled={disabled}
                        className={`form-control ${icon ? 'border-start-0 ps-0' : ''} ${showPasswordToggle ? 'border-0' : ''} ${error ? 'is-invalid' : ''} ${className}`}
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
