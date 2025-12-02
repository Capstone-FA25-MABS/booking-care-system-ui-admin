import React from 'react';
import { AppointmentUITab } from '@/types/appointment.types';

// ============================================================================
// Types
// ============================================================================

export interface TabConfig {
    key: AppointmentUITab;
    label: string;
}

export interface AppointmentStatusTabsProps {
    /** Available tabs to display */
    tabs: TabConfig[];
    /** Currently active tab */
    activeTab: AppointmentUITab;
    /** Tab counts for badges */
    tabCounts: Record<string, number>;
    /** Callback when tab is clicked */
    onTabChange: (tab: AppointmentUITab) => void;
    /** Optional CSS class for container */
    className?: string;
}

// ============================================================================
// Predefined Tab Configurations
// ============================================================================

/** Tabs for Doctor's MyAppointments page */
export const DOCTOR_APPOINTMENT_TABS: TabConfig[] = [
    { key: 'upcoming', label: 'Sắp khám' },
    { key: 'cancelled', label: 'Đã hủy' },
    { key: 'completed', label: 'Đã khám' },
];

/** Tabs for Hospital Staff's ListAppointments page */
export const HOSPITAL_APPOINTMENT_TABS: TabConfig[] = [
    { key: 'waiting', label: 'Đang chờ xác nhận' },
    { key: 'upcoming', label: 'Sắp khám' },
    { key: 'cancelled', label: 'Đã hủy' },
    { key: 'completed', label: 'Đã khám' },
];

// ============================================================================
// Component
// ============================================================================

const AppointmentStatusTabs: React.FC<AppointmentStatusTabsProps> = ({
    tabs,
    activeTab,
    tabCounts,
    onTabChange,
    className = '',
}) => {
    const getTabClass = (tabKey: AppointmentUITab) => {
        return `btn ${activeTab === tabKey ? 'btn-primary' : 'btn-light'}`;
    };

    const getBadgeClass = (tabKey: AppointmentUITab) => {
        return `badge ${activeTab === tabKey ? 'bg-white text-primary' : 'bg-secondary text-white'} ms-2`;
    };

    return (
        <div
            className={`d-flex align-items-center justify-content-between flex-wrap row-gap-3 mb-3 ${className}`}
        >
            <div className="d-flex gap-2 flex-wrap">
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        type="button"
                        className={getTabClass(tab.key)}
                        onClick={() => onTabChange(tab.key)}
                    >
                        {tab.label}{' '}
                        <span className={getBadgeClass(tab.key)}>{tabCounts[tab.key] ?? 0}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default AppointmentStatusTabs;
