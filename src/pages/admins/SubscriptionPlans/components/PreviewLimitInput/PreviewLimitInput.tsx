import React from 'react';
import { CustomPlansConfig } from '@/hooks/useSubscriptionPlanFormValidation';

interface PreviewLimitInputProps {
    label: string;
    type: 'doctors' | 'specialties' | 'appointments';
    billingCycle: 'QUARTERLY' | 'YEARLY';
    value: string;
    unlimited: boolean;
    placeholder: string;
    setCustomPlansConfig: React.Dispatch<React.SetStateAction<CustomPlansConfig>>;
}

const PreviewLimitInput: React.FC<PreviewLimitInputProps> = ({
    label,
    type,
    billingCycle,
    value,
    unlimited,
    placeholder,
    setCustomPlansConfig,
}) => {
    const key = billingCycle === 'QUARTERLY' ? 'quarterly' : 'yearly';
    const maxFieldName =
        type === 'doctors'
            ? 'maxDoctors'
            : type === 'specialties'
              ? 'maxSpecialties'
              : 'maxAppointments';
    const unlimitedFieldName =
        type === 'doctors'
            ? 'unlimitedDoctors'
            : type === 'specialties'
              ? 'unlimitedSpecialties'
              : 'unlimitedAppointments';

    return (
        <div className={type === 'appointments' ? 'mb-1' : 'mb-2'}>
            <label className="form-label small mb-1">{label}:</label>
            <div className="d-flex gap-1">
                <input
                    type="number"
                    className="form-control form-control-sm"
                    placeholder={placeholder}
                    value={unlimited ? '' : value}
                    disabled={unlimited}
                    onChange={(e) => {
                        setCustomPlansConfig((prev) => {
                            const currentConfig = prev[key as keyof CustomPlansConfig] || {};
                            return {
                                ...prev,
                                [key]: {
                                    ...currentConfig,
                                    [maxFieldName]: e.target.value,
                                    [unlimitedFieldName]: false,
                                } as any,
                            };
                        });
                    }}
                />
                <div className="form-check">
                    <input
                        type="checkbox"
                        className="form-check-input"
                        checked={unlimited}
                        onChange={(e) => {
                            setCustomPlansConfig((prev) => {
                                const currentConfig = prev[key as keyof CustomPlansConfig] || {};
                                return {
                                    ...prev,
                                    [key]: {
                                        ...currentConfig,
                                        [unlimitedFieldName]: e.target.checked,
                                        [maxFieldName]: '',
                                    } as any,
                                };
                            });
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default PreviewLimitInput;
