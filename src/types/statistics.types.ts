export enum StatisticsPeriod {
    Daily = 'Daily',
    Weekly = 'Weekly',
    Monthly = 'Monthly',
    Quarterly = 'Quarterly',
    Yearly = 'Yearly',
}

export interface StaffHospitalStatisticsRequest {
    hospitalId: string;
    fromDate?: string;
    toDate?: string;
    period?: StatisticsPeriod;
}

export interface HospitalAppointmentOverview {
    totalAppointments: number;
    completedAppointments: number;
    confirmedAppointments: number;
    pendingAppointments: number;
    cancelledAppointments: number;
    rescheduledAppointments: number;
    newPatients: number;
    noShowRate: number;
    rescheduleRate: number;
}

export interface AppointmentTrendPoint {
    label: string;
    periodStart: string;
    periodEnd: string;
    totalAppointments: number;
    completedAppointments: number;
    cancelledAppointments: number;
    rescheduledAppointments: number;
}

export interface NewPatientTrendPoint {
    label: string;
    periodStart: string;
    periodEnd: string;
    newPatients: number;
}

export interface StaffHospitalStatisticsResponse {
    hospitalId: string;
    fromDate: string;
    toDate: string;
    period: StatisticsPeriod;
    overview: HospitalAppointmentOverview;
    appointmentTrend: AppointmentTrendPoint[];
    newPatientTrend: NewPatientTrendPoint[];
}
