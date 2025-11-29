import { formatTrendLabel } from '@/utils/dashboard.utils';
import { AppointmentTrendPoint, NewPatientTrendPoint } from '@/utils/appointmentTrends';

export interface ChartPoint {
    label: string;
    value: number;
}

export interface DualValuePoint {
    label: string;
    value1: number;
    value2: number;
}

export const buildAppointmentTrendPoints = (trend: AppointmentTrendPoint[]): ChartPoint[] => {
    if (!Array.isArray(trend)) return [];
    return trend.map((point) => ({
        label: formatTrendLabel(point.periodStart, point.periodEnd),
        value: point.totalAppointments,
    }));
};

export const buildNewPatientTrendPoints = (trend: NewPatientTrendPoint[]): ChartPoint[] => {
    if (!Array.isArray(trend)) return [];
    return trend.map((point) => ({
        label: formatTrendLabel(point.periodStart, point.periodEnd),
        value: point.newPatients,
    }));
};

export const buildRatingChartData = (
    distribution?: Array<{ rating: number; count?: number; percentage?: number }>
): Array<{ label: string; value1: number; value2: number }> => {
    if (!Array.isArray(distribution) || distribution.length === 0) {
        return [];
    }

    return distribution
        .slice()
        .sort((a, b) => b.rating - a.rating)
        .map((dist) => ({
            label: `${dist.rating}⭐`,
            value1: dist.count || 0,
            value2: dist.percentage || 0,
        }));
};

export const buildPeakHoursChartData = (
    peakHours?: Array<{ hour: string; count: number }>
): ChartPoint[] => {
    if (!Array.isArray(peakHours) || peakHours.length === 0) return [];
    return peakHours.map((item) => ({
        label: item.hour,
        value: item.count,
    }));
};

export const buildAppointmentTypeChartData = (appointmentTypeStats?: {
    telehealth: number;
    inPerson: number;
}): ChartPoint[] => {
    if (!appointmentTypeStats) return [];
    return [
        {
            label: 'Tư vấn trực tiếp',
            value: appointmentTypeStats.telehealth,
        },
        {
            label: 'Khám trực tiếp',
            value: appointmentTypeStats.inPerson,
        },
    ];
};
