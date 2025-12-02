import React from 'react';
import ModalFilter from '@/components/ModalFilter';
import { createAppointmentTypeFilterField } from '@/utils/filter-field-configs';
import { AppointmentType } from '@/enums/appointment.enums';

// ============================================================================
// Types
// ============================================================================

export interface DateRange {
    start: Date | null;
    end: Date | null;
}

export interface AppointmentFilterModalProps {
    /** Whether the modal is visible */
    show: boolean;
    /** Callback when modal is closed */
    onHide: () => void;
    /** Callback when filters are applied */
    onApply: () => void;
    /** Callback when filters are reset */
    onReset: () => void;
    /** Currently selected appointment types */
    selectedTypes: AppointmentType[];
    /** Callback to update selected types */
    setSelectedTypes: React.Dispatch<React.SetStateAction<AppointmentType[]>>;
    /** Currently selected date range */
    selectedDateRange: DateRange;
    /** Callback to update date range */
    setSelectedDateRange: React.Dispatch<React.SetStateAction<DateRange>>;
    /** Modal title */
    title?: string;
}

// ============================================================================
// Component
// ============================================================================

const AppointmentFilterModal: React.FC<AppointmentFilterModalProps> = ({
    show,
    onHide,
    onApply,
    onReset,
    selectedTypes,
    setSelectedTypes,
    selectedDateRange,
    setSelectedDateRange,
    title = 'Lọc lịch hẹn',
}) => {
    return (
        <ModalFilter
            show={show}
            onHide={onHide}
            onApply={onApply}
            onReset={onReset}
            title={title}
            fields={[
                createAppointmentTypeFilterField(selectedTypes, setSelectedTypes),
                {
                    name: 'dateRange',
                    label: 'Khoảng thời gian',
                    type: 'daterange',
                    value: selectedDateRange,
                    onChange: (value) => setSelectedDateRange(value),
                    resetValue: () => setSelectedDateRange({ start: null, end: null }),
                },
            ]}
        />
    );
};

export default AppointmentFilterModal;
