import React, { useMemo, useCallback } from 'react';
import Select from 'react-select';
import { selectCustomStyles } from '@/constants/select.styles';

interface StatusSelectProps {
    value: 'ACTIVE' | 'INACTIVE';
    onChange: (value: 'ACTIVE' | 'INACTIVE') => void;
    validationError?: string;
    className?: string;
    styles?: {
        reactSelectInvalid: string;
        invalidFeedback: string;
    };
}

const StatusSelect: React.FC<StatusSelectProps> = ({
    value,
    onChange,
    validationError,
    className = '',
    styles,
}) => {
    // Status options for react-select
    const statusOptions = [
        { value: 'ACTIVE', label: 'Hoạt động' },
        { value: 'INACTIVE', label: 'Không hoạt động' },
    ];

    // Custom React Select Component - refactored to reduce nesting
    const handleSelectChange = useCallback(
        (selectedOption: any) => {
            onChange(selectedOption?.value);
        },
        [onChange]
    );

    const ReactSelectComponent = useMemo(() => {
        return () => {
            return (
                <div
                    className={
                        validationError ? styles?.reactSelectInvalid || 'react-select-invalid' : ''
                    }
                >
                    <Select
                        options={statusOptions}
                        value={statusOptions.find((option) => option.value === value)}
                        onChange={handleSelectChange}
                        placeholder="Chọn trạng thái"
                        isSearchable={false}
                        classNamePrefix="select2"
                        styles={selectCustomStyles}
                        menuPortalTarget={document.body}
                    />
                    {validationError && (
                        <div className={styles?.invalidFeedback || 'invalid-feedback'}>
                            {validationError}
                        </div>
                    )}
                </div>
            );
        };
    }, [validationError, handleSelectChange, value]);

    return (
        <div className={className}>
            <ReactSelectComponent />
        </div>
    );
};

export default StatusSelect;
