import { numberFormatter, formatPercent } from '@/utils/dashboard.utils';

export type AppointmentMetricKey = 'total' | 'completed' | 'pending' | 'cancelled' | 'newPatients';

export interface AppointmentOverviewStats {
    totalAppointments: number;
    completedAppointments: number;
    confirmedAppointments: number;
    pendingAppointments: number;
    cancelledAppointments: number;
    newPatients: number;
    rescheduledAppointments?: number;
    noShowRate?: number;
    rescheduleRate?: number;
}

export interface AppointmentMetricOverride {
    label?: string;
    sub?: string;
    getSub?: (stats: AppointmentOverviewStats) => string;
}

const metricOrder: AppointmentMetricKey[] = [
    'total',
    'completed',
    'pending',
    'cancelled',
    'newPatients',
];

const defaultConfig: Record<
    AppointmentMetricKey,
    {
        label: string;
        getValue: (stats: AppointmentOverviewStats) => number;
        getSub: (stats: AppointmentOverviewStats) => string;
    }
> = {
    total: {
        label: 'Tổng lịch hẹn',
        getValue: (stats) => stats.totalAppointments,
        getSub: (stats) => `${formatPercent(stats.noShowRate ?? 0)} vắng/huỷ`,
    },
    completed: {
        label: 'Hoàn thành',
        getValue: (stats) => stats.completedAppointments,
        getSub: (stats) =>
            `${numberFormatter.format(stats.confirmedAppointments ?? 0)} đã xác nhận`,
    },
    pending: {
        label: 'Đang chờ',
        getValue: (stats) => stats.pendingAppointments,
        getSub: (stats) =>
            `${numberFormatter.format(stats.rescheduledAppointments ?? 0)} đã đổi lịch`,
    },
    cancelled: {
        label: 'Huỷ / Vắng',
        getValue: (stats) => stats.cancelledAppointments,
        getSub: (stats) => `Tỷ lệ vắng: ${formatPercent(stats.noShowRate ?? 0)}`,
    },
    newPatients: {
        label: 'Bệnh nhân mới',
        getValue: (stats) => stats.newPatients,
        getSub: (stats) => `Tỷ lệ đổi lịch: ${formatPercent(stats.rescheduleRate ?? 0)}`,
    },
};

export const buildAppointmentOverviewMetrics = (
    stats: AppointmentOverviewStats,
    overrides?: Partial<Record<AppointmentMetricKey, AppointmentMetricOverride>>
) => {
    return metricOrder.map((key) => {
        const config = defaultConfig[key];
        const override = overrides?.[key];
        const label = override?.label ?? config.label;
        const sub = override?.getSub?.(stats) ?? override?.sub ?? config.getSub(stats);

        return {
            key,
            label,
            value: config.getValue(stats),
            sub,
        };
    });
};
