import React from 'react';
import Input from '@/components/Input';

interface NameInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    required?: boolean;
    validationError?: string;
    className?: string;
    name?: string;
    styles?: {
        invalidFeedback: string;
    };
}

const NameInput: React.FC<NameInputProps> = ({
    value,
    onChange,
    placeholder,
    required = false,
    validationError,
    className = '',
    name = 'name',
    styles,
}) => {
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value);
    };

    return (
        <div className={className}>
            <Input
                name={name}
                value={value}
                onChange={handleInputChange}
                placeholder={placeholder}
                required={required}
                maxLength={255}
                className={validationError ? 'is-invalid' : ''}
            />
            {validationError && (
                <div className={styles?.invalidFeedback || 'invalid-feedback'}>
                    {validationError}
                </div>
            )}
        </div>
    );
};

export default NameInput;
