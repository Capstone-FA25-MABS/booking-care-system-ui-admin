/**
 * Represents the available types of appointments in the system.
 */
export enum AppointmentType {
    /**
     * Appointment conducted via telehealth (video call, audio call, or chat).
     */
    TELEHEALTH = 'TELEHEALTH',

    /**
     * Appointment conducted in person at the hospital/clinic.
     */
    IN_PERSON = 'IN_PERSON',
}

/**
 * Represents the possible statuses of an appointment in the booking care system.
 *
 */
export enum AppointmentStatus {
    /**
     * The appointment is pending and awaiting confirmation.
     */
    PENDING = 'PENDING',

    /**
     * The appointment has been confirmed.
     */
    CONFIRMED = 'CONFIRMED',

    /**
     * The appointment has been cancelled.
     */
    CANCELLED = 'CANCELLED',

    /**
     * The appointment has been completed successfully.
     */
    COMPLETED = 'COMPLETED',
}

/**
 * Represents available appointment time slots in 30-minute and 60-minute intervals.
 * Uses string values to match backend JSON serialization (JsonStringEnumConverter)
 */
export enum AppointmentTime {
    /** 08:00 - 08:30 (30-minute interval) */
    AT_08_00_08_30 = 'AT_08_00_08_30',
    /** 08:30 - 09:00 (30-minute interval) */
    AT_08_30_09_00 = 'AT_08_30_09_00',
    /** 09:00 - 09:30 (30-minute interval) */
    AT_09_00_09_30 = 'AT_09_00_09_30',
    /** 09:30 - 10:00 (30-minute interval) */
    AT_09_30_10_00 = 'AT_09_30_10_00',
    /** 10:00 - 10:30 (30-minute interval) */
    AT_10_00_10_30 = 'AT_10_00_10_30',
    /** 10:30 - 11:00 (30-minute interval) */
    AT_10_30_11_00 = 'AT_10_30_11_00',
    /** 11:00 - 11:30 (30-minute interval) */
    AT_11_00_11_30 = 'AT_11_00_11_30',
    /** 11:30 - 12:00 (30-minute interval) */
    AT_11_30_12_00 = 'AT_11_30_12_00',
    /** 13:00 - 13:30 (30-minute interval) */
    AT_13_00_13_30 = 'AT_13_00_13_30',
    /** 13:30 - 14:00 (30-minute interval) */
    AT_13_30_14_00 = 'AT_13_30_14_00',
    /** 14:00 - 14:30 (30-minute interval) */
    AT_14_00_14_30 = 'AT_14_00_14_30',
    /** 14:30 - 15:00 (30-minute interval) */
    AT_14_30_15_00 = 'AT_14_30_15_00',
    /** 15:00 - 15:30 (30-minute interval) */
    AT_15_00_15_30 = 'AT_15_00_15_30',
    /** 15:30 - 16:00 (30-minute interval) */
    AT_15_30_16_00 = 'AT_15_30_16_00',
    /** 16:00 - 16:30 (30-minute interval) */
    AT_16_00_16_30 = 'AT_16_00_16_30',
    /** 16:30 - 17:00 (30-minute interval) */
    AT_16_30_17_00 = 'AT_16_30_17_00',
    /** 17:00 - 17:30 (30-minute interval) */
    AT_17_00_17_30 = 'AT_17_00_17_30',
    /** 17:30 - 18:00 (30-minute interval) */
    AT_17_30_18_00 = 'AT_17_30_18_00',
    /** 18:00 - 18:30 (30-minute interval) */
    AT_18_00_18_30 = 'AT_18_00_18_30',
    /** 18:30 - 19:00 (30-minute interval) */
    AT_18_30_19_00 = 'AT_18_30_19_00',
    /** 19:00 - 19:30 (30-minute interval) */
    AT_19_00_19_30 = 'AT_19_00_19_30',
    /** 19:30 - 20:00 (30-minute interval) */
    AT_19_30_20_00 = 'AT_19_30_20_00',
    /** 20:00 - 20:30 (30-minute interval) */
    AT_20_00_20_30 = 'AT_20_00_20_30',
    /** 20:30 - 21:00 (30-minute interval) */
    AT_20_30_21_00 = 'AT_20_30_21_00',
    /** 21:00 - 21:30 (30-minute interval) */
    AT_21_00_21_30 = 'AT_21_00_21_30',
    /** 21:30 - 22:00 (30-minute interval) */
    AT_21_30_22_00 = 'AT_21_30_22_00',
    /** 22:00 - 22:30 (30-minute interval) */
    AT_22_00_22_30 = 'AT_22_00_22_30',
    /** 22:30 - 23:00 (30-minute interval) */
    AT_22_30_23_00 = 'AT_22_30_23_00',

    /** 08:00 - 09:00 (60-minute interval) */
    AT_08_00_09_00 = 'AT_08_00_09_00',
    /** 09:00 - 10:00 (60-minute interval) */
    AT_09_00_10_00 = 'AT_09_00_10_00',
    /** 10:00 - 11:00 (60-minute interval) */
    AT_10_00_11_00 = 'AT_10_00_11_00',
    /** 11:00 - 12:00 (60-minute interval) */
    AT_11_00_12_00 = 'AT_11_00_12_00',
    /** 13:00 - 14:00 (60-minute interval) */
    AT_13_00_14_00 = 'AT_13_00_14_00',
    /** 14:00 - 15:00 (60-minute interval) */
    AT_14_00_15_00 = 'AT_14_00_15_00',
    /** 15:00 - 16:00 (60-minute interval) */
    AT_15_00_16_00 = 'AT_15_00_16_00',
    /** 16:00 - 17:00 (60-minute interval) */
    AT_16_00_17_00 = 'AT_16_00_17_00',
    /** 17:00 - 18:00 (60-minute interval) */
    AT_17_00_18_00 = 'AT_17_00_18_00',
    /** 18:00 - 19:00 (60-minute interval) */
    AT_18_00_19_00 = 'AT_18_00_19_00',
    /** 19:00 - 20:00 (60-minute interval) */
    AT_19_00_20_00 = 'AT_19_00_20_00',
    /** 20:00 - 21:00 (60-minute interval) */
    AT_20_00_21_00 = 'AT_20_00_21_00',
    /** 21:00 - 22:00 (60-minute interval) */
    AT_21_00_22_00 = 'AT_21_00_22_00',
    /** 22:00 - 23:00 (60-minute interval) */
    AT_22_00_23_00 = 'AT_22_00_23_00',
}
