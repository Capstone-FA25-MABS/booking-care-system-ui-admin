import React from 'react';
import PreviewLimitInput from '../PreviewLimitInput';
import { CustomPlansConfig } from '@/hooks/useSubscriptionPlanFormValidation';

type BillingCycle = 'QUARTERLY' | 'YEARLY';

interface PlanPreviewLimits {
    billingCycle: BillingCycle;
    maxDoctors?: string | number | null;
    maxSpecialties?: string | number | null;
    maxAppointments?: string | number | null;
    maxServices?: string | number | null;
    unlimitedDoctors?: boolean;
    unlimitedSpecialties?: boolean;
    unlimitedAppointments?: boolean;
    unlimitedServices?: boolean;
    status?: 'ACTIVE' | 'INACTIVE';
    currentStatus?: string;
}

interface LimitPlaceholders {
    maxDoctors?: string;
    maxSpecialties?: string;
    maxAppointments?: string;
    maxServices?: string;
}

interface CustomPlanLimitsSectionProps {
    title: React.ReactNode;
    preview: PlanPreviewLimits;
    configKey: 'quarterly' | 'yearly';
    placeholders: LimitPlaceholders;
    selectId: string;
    setCustomPlansConfig: React.Dispatch<React.SetStateAction<CustomPlansConfig>>;
    statusExtra?: React.ReactNode;
}

const formatValue = (value?: string | number | null): string => {
    if (value === null || value === undefined) {
        return '';
    }
    return typeof value === 'number' ? value.toString() : value;
};

const CustomPlanLimitsSection: React.FC<CustomPlanLimitsSectionProps> = ({
    title,
    preview,
    configKey,
    placeholders,
    selectId,
    setCustomPlansConfig,
    statusExtra,
}) => {
    const handleStatusChange = (newStatus: 'ACTIVE' | 'INACTIVE') => {
        setCustomPlansConfig((prev) => {
            const currentConfig = prev[configKey] || {};
            return {
                ...prev,
                [configKey]: {
                    ...currentConfig,
                    status: newStatus,
                } as any,
            };
        });
    };

    return (
        <div>
            <h6 className="fw-bold mb-2">{title}</h6>
            <div className="small">
                <PreviewLimitInput
                    label="Bác sĩ"
                    type="doctors"
                    billingCycle={preview.billingCycle}
                    value={formatValue(preview.maxDoctors)}
                    unlimited={Boolean(preview.unlimitedDoctors)}
                    placeholder={placeholders.maxDoctors || '10'}
                    setCustomPlansConfig={setCustomPlansConfig}
                />

                <PreviewLimitInput
                    label="Chuyên khoa"
                    type="specialties"
                    billingCycle={preview.billingCycle}
                    value={formatValue(preview.maxSpecialties)}
                    unlimited={Boolean(preview.unlimitedSpecialties)}
                    placeholder={placeholders.maxSpecialties || '5'}
                    setCustomPlansConfig={setCustomPlansConfig}
                />

                <PreviewLimitInput
                    label="Lịch hẹn"
                    type="appointments"
                    billingCycle={preview.billingCycle}
                    value={formatValue(preview.maxAppointments)}
                    unlimited={Boolean(preview.unlimitedAppointments)}
                    placeholder={placeholders.maxAppointments || '100'}
                    setCustomPlansConfig={setCustomPlansConfig}
                />

                <PreviewLimitInput
                    label="Dịch vụ"
                    type="services"
                    billingCycle={preview.billingCycle}
                    value={formatValue(preview.maxServices)}
                    unlimited={Boolean(preview.unlimitedServices)}
                    placeholder={placeholders.maxServices || '50'}
                    setCustomPlansConfig={setCustomPlansConfig}
                />

                <small className="text-muted">
                    <i className="ti ti-check me-1"></i> = Không giới hạn
                </small>

                <div className="mt-3">
                    <label htmlFor={selectId} className="form-label small mb-1">
                        Trạng thái:
                    </label>
                    <select
                        id={selectId}
                        className="form-select form-select-sm"
                        value={preview.status || 'ACTIVE'}
                        onChange={(e) =>
                            handleStatusChange(e.target.value as 'ACTIVE' | 'INACTIVE')
                        }
                    >
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                    </select>
                    {statusExtra}
                </div>
            </div>
        </div>
    );
};

export default CustomPlanLimitsSection;
