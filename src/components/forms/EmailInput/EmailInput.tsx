import React from 'react';

export interface EmailInputProps {
    id?: string;
    name?: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    error?: string;
    disabled?: boolean;
    className?: string;
}

const EmailInput: React.FC<EmailInputProps> = ({
    id = 'email',
    name = 'email',
    value,
    onChange,
    placeholder = 'Nhập địa chỉ Email',
    error,
    disabled = false,
    className = '',
}) => {
    return (
        <div className={`mb-3 ${className}`}>
            <label htmlFor={id} className="form-label">
                Địa chỉ Email
            </label>
            <div className="input-group">
                <span className="input-group-text border-end-0 bg-white">
                    <i className="ti ti-mail fs-14 text-dark" />
                </span>
                <input
                    id={id}
                    type="email"
                    name={name}
                    value={value}
                    onChange={onChange}
                    className={`form-control border-start-0 ps-0 ${error ? 'is-invalid' : ''}`}
                    placeholder={placeholder}
                    disabled={disabled}
                    aria-describedby={error ? `${id}-error` : undefined}
                />
            </div>
            {error && (
                <div id={`${id}-error`} className="invalid-feedback d-block">
                    {error}
                </div>
            )}
        </div>
    );
};

export default EmailInput;
