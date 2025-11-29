/**
 * Shared dashboard statistics calculation utilities
 * Extracted to reduce duplication across admin, doctor, and hospital dashboards
 */

import { AppointmentTime, AppointmentType, AppointmentStatus } from '@/enums/appointment.enums';
import { getAppointmentTimeText } from '@/types/appointment.types';

export interface PeakHour {
    hour: string;
    count: number;
}

export interface AppointmentTypeStats {
    telehealth: number;
    inPerson: number;
}

export interface AdditionalStatistics {
    peakHours: PeakHour[];
    appointmentTypeStats: AppointmentTypeStats;
    returningPatients: number;
    completionRate: number;
}

/**
 * Calculate additional statistics from appointments
 */
export const calculateAdditionalStatistics = (appointments: any[]): AdditionalStatistics => {
    // Peak hours analysis - sử dụng AppointmentTimeId
    const hourCounts: Record<string, number> = {};
    appointments.forEach((apt) => {
        if (apt.appointmentTimeId) {
            try {
                // Lấy text từ AppointmentTimeId (ví dụ: "08:00 - 08:30")
                const timeText = getAppointmentTimeText(apt.appointmentTimeId as AppointmentTime);
                if (timeText && timeText !== 'Chưa xác định') {
                    // Extract giờ từ text (lấy phần đầu, ví dụ "08:00" từ "08:00 - 08:30")
                    const hourMatch = timeText.match(/^(\d{2}):\d{2}/);
                    if (hourMatch) {
                        const hourLabel = `${hourMatch[1]}:00`;
                        hourCounts[hourLabel] = (hourCounts[hourLabel] || 0) + 1;
                    }
                }
            } catch (error) {
                console.warn('Error parsing appointmentTimeId:', apt.appointmentTimeId, error);
            }
        }
    });

    const peakHours = Object.entries(hourCounts)
        .map(([hour, count]) => ({ hour, count }))
        .sort((a, b) => a.hour.localeCompare(b.hour));

    // Appointment type statistics
    let telehealth = 0;
    let inPerson = 0;
    appointments.forEach((apt) => {
        if (
            apt.appointmentType === AppointmentType.TELEHEALTH ||
            apt.appointmentType === 'TELEHEALTH'
        ) {
            telehealth++;
        } else if (
            apt.appointmentType === AppointmentType.IN_PERSON ||
            apt.appointmentType === 'IN_PERSON'
        ) {
            inPerson++;
        }
    });

    // Returning patients (patients with more than 1 appointment)
    const patientAppointmentCounts: Record<string, number> = {};
    appointments.forEach((apt) => {
        if (apt.patientId) {
            patientAppointmentCounts[apt.patientId] =
                (patientAppointmentCounts[apt.patientId] || 0) + 1;
        }
    });

    const returningPatients = Object.values(patientAppointmentCounts).filter(
        (count) => count > 1
    ).length;

    // Completion rate
    const totalCompletedOrConfirmed = appointments.filter(
        (a) => a.status === AppointmentStatus.COMPLETED || a.status === AppointmentStatus.CONFIRMED
    ).length;
    const completionRate =
        appointments.length > 0 ? (totalCompletedOrConfirmed / appointments.length) * 100 : 0;

    return {
        peakHours,
        appointmentTypeStats: { telehealth, inPerson },
        returningPatients,
        completionRate,
    };
};
