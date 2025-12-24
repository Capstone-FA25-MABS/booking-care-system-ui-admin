import React from 'react';
import Select from 'react-select';
import { Gender } from '@/enums/common.enums';
import { selectCustomStyles } from '@/constants/select.styles';

interface GenderSelectProps {
    value: Gender;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    error?: string;
    required?: boolean;
}

const GenderSelect: React.FC<GenderSelectProps> = ({ value, onChange, error, required = true }) => {
    return (
        <div className="col-md-6 mb-3">
            <label htmlFor="gender" className="form-label">
                <i className="feather-users me-1"></i> Giới tính{' '}
                {required && <span className="text-danger">*</span>}
            </label>
            <Select
                inputId="gender"
                options={[
                    { value: Gender.MALE, label: 'Nam' },
                    { value: Gender.FEMALE, label: 'Nữ' },
                ]}
                value={
                    value !== null && value !== undefined
                        ? {
                              value: value,
                              label: value === Gender.MALE ? 'Nam' : 'Nữ',
                          }
                        : null
                }
                onChange={(selectedOption) => {
                    onChange({
                        target: {
                            name: 'gender',
                            value: selectedOption?.value ?? Gender.MALE,
                        },
                    } as any);
                }}
                placeholder="Chọn giới tính"
                className={error ? 'is-invalid' : ''}
                classNamePrefix="select2"
                styles={selectCustomStyles}
                menuPortalTarget={document.body}
            />
            {error && <div className="text-danger mt-1">{error}</div>}
        </div>
    );
};

export default GenderSelect;
