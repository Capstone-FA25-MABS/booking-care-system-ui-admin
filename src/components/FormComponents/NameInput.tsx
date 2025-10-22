import React, { useMemo, useCallback } from 'react';
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
    // Custom Input Component - refactored to reduce nesting
    const handleInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            onChange(e.target.value);
        },
        [onChange]
    );

    const CustomInputComponent = useMemo(() => {
        return () => {
            return (
                <div>
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
    }, [validationError, handleInputChange, value, placeholder, required, name]);

    return (
        <div className={className}>
            <CustomInputComponent />
        </div>
    );
};

export default NameInput;
