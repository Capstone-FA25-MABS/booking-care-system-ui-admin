import { AppointmentStatus } from '@/enums/appointment.enums';
import { StatisticsPeriod } from '@/types/statistics.types';
import { getPeriodKey } from '@/utils/dashboard.utils';

export interface AppointmentTrendPoint {
    label: string;
    periodStart: string;
    periodEnd: string;
    totalAppointments: number;
    completedAppointments: number;
    cancelledAppointments: number;
}

export interface NewPatientTrendPoint {
    label: string;
    periodStart: string;
    periodEnd: string;
    newPatients: number;
}

export const calculateAppointmentTrends = (
    appointments: any[],
    period: StatisticsPeriod
): {
    appointmentTrendPoints: AppointmentTrendPoint[];
    newPatientTrendPoints: NewPatientTrendPoint[];
} => {
    const appointmentTrendPoints: AppointmentTrendPoint[] = [];
    const newPatientTrendPoints: NewPatientTrendPoint[] = [];

    const grouped: Record<string, any[]> = {};
    const patientGroups: Record<string, Set<string>> = {};

    appointments.forEach((apt) => {
        if (!apt.appointmentDate) return;

        const date = new Date(apt.appointmentDate);
        if (Number.isNaN(date.getTime())) {
            console.warn('Invalid appointmentDate:', apt.appointmentDate);
            return;
        }

        const key = getPeriodKey(date, period);

        if (!grouped[key]) {
            grouped[key] = [];
            patientGroups[key] = new Set();
        }

        grouped[key].push(apt);
        if (apt.patientId) {
            patientGroups[key].add(apt.patientId);
        }
    });

    Object.entries(grouped)
        .sort(([a], [b]) => a.localeCompare(b))
        .forEach(([key, apts]) => {
            let periodStart: Date;

            if (key.includes('Q')) {
                const [year, quarter] = key.split('-Q');
                const quarterNum = Number.parseInt(quarter, 10);
                const month = (quarterNum - 1) * 3;
                periodStart = new Date(Number.parseInt(year, 10), month, 1);
            } else if (key.match(/^\d{4}-\d{2}$/)) {
                periodStart = new Date(`${key}-01`);
            } else if (key.match(/^\d{4}$/)) {
                periodStart = new Date(`${key}-01-01`);
            } else if (key.match(/^\d{4}-\d{2}-\d{2}$/)) {
                periodStart = new Date(key);
            } else {
                periodStart = new Date(key);
            }

            if (Number.isNaN(periodStart.getTime())) {
                console.warn(`Invalid date key: ${key}`);
                return;
            }

            const periodEnd = new Date(periodStart);

            switch (period) {
                case StatisticsPeriod.Daily:
                    break;
                case StatisticsPeriod.Weekly:
                    periodEnd.setDate(periodEnd.getDate() + 6);
                    break;
                case StatisticsPeriod.Monthly:
                    periodEnd.setMonth(periodEnd.getMonth() + 1);
                    periodEnd.setDate(0);
                    break;
                case StatisticsPeriod.Quarterly:
                    periodEnd.setMonth(periodEnd.getMonth() + 3);
                    periodEnd.setDate(0);
                    break;
                case StatisticsPeriod.Yearly:
                    periodEnd.setFullYear(periodEnd.getFullYear() + 1);
                    periodEnd.setMonth(0);
                    periodEnd.setDate(0);
                    break;
            }

            const completed = apts.filter((a) => a.status === AppointmentStatus.COMPLETED).length;
            const cancelled = apts.filter((a) => a.status === AppointmentStatus.CANCELLED).length;

            if (!Number.isNaN(periodEnd.getTime())) {
                appointmentTrendPoints.push({
                    label: key,
                    periodStart: periodStart.toISOString(),
                    periodEnd: periodEnd.toISOString(),
                    totalAppointments: apts.length,
                    completedAppointments: completed,
                    cancelledAppointments: cancelled,
                });

                newPatientTrendPoints.push({
                    label: key,
                    periodStart: periodStart.toISOString(),
                    periodEnd: periodEnd.toISOString(),
                    newPatients: patientGroups[key]?.size || 0,
                });
            }
        });

    return { appointmentTrendPoints, newPatientTrendPoints };
};
