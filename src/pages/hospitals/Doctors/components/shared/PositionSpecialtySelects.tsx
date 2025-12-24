import React from 'react';
import Select from 'react-select';
import { selectCustomStyles } from '@/constants/select.styles';

interface Position {
    id: string;
    name: string;
}

interface Specialty {
    id: string;
    name: string;
}

interface PositionSpecialtySelectsProps {
    positionId: string;
    specialtyId: string;
    positions: Position[];
    specialties: Specialty[];
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    positionError?: string;
    specialtyError?: string;
}

const PositionSpecialtySelects: React.FC<PositionSpecialtySelectsProps> = ({
    positionId,
    specialtyId,
    positions,
    specialties,
    onChange,
    positionError,
    specialtyError,
}) => {
    return (
        <>
            <div className="col-md-6 mb-3">
                <label htmlFor="positionId" className="form-label">
                    <i className="feather-briefcase me-1"></i> Chức vụ{' '}
                    <span className="text-danger">*</span>
                </label>
                <Select
                    inputId="positionId"
                    options={positions.map((position) => ({
                        value: position.id,
                        label: position.name,
                    }))}
                    value={
                        positionId
                            ? {
                                  value: positionId,
                                  label: positions.find((p) => p.id === positionId)?.name,
                              }
                            : null
                    }
                    onChange={(selectedOption) => {
                        onChange({
                            target: {
                                name: 'positionId',
                                value: selectedOption?.value || '',
                            },
                        } as React.ChangeEvent<HTMLInputElement>);
                    }}
                    placeholder="Chọn chức vụ"
                    className={positionError ? 'is-invalid' : ''}
                    classNamePrefix="select2"
                    styles={selectCustomStyles}
                    menuPortalTarget={document.body}
                />
                {positionError && <div className="text-danger mt-1">{positionError}</div>}
            </div>
            <div className="col-md-6 mb-3">
                <label htmlFor="specialtyId" className="form-label">
                    <i className="feather-heart me-1"></i> Chuyên khoa{' '}
                    <span className="text-danger">*</span>
                </label>
                <Select
                    inputId="specialtyId"
                    options={specialties.map((specialty) => ({
                        value: specialty.id,
                        label: specialty.name,
                    }))}
                    value={
                        specialtyId
                            ? {
                                  value: specialtyId,
                                  label: specialties.find((s) => s.id === specialtyId)?.name,
                              }
                            : null
                    }
                    onChange={(selectedOption) => {
                        onChange({
                            target: {
                                name: 'specialtyId',
                                value: selectedOption?.value || '',
                            },
                        } as React.ChangeEvent<HTMLInputElement>);
                    }}
                    placeholder="Chọn chuyên khoa"
                    className={specialtyError ? 'is-invalid' : ''}
                    classNamePrefix="select2"
                    styles={selectCustomStyles}
                    menuPortalTarget={document.body}
                />
                {specialtyError && <div className="text-danger mt-1">{specialtyError}</div>}
            </div>
        </>
    );
};

export default PositionSpecialtySelects;
