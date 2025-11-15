/**
 * Types of notifications in the system (string-based to match backend)
 */
export enum NotificationType {
    General = 'General',
    BookingConfirmation = 'BookingConfirmation',
    PaymentReminder = 'PaymentReminder',
    Refund = 'Refund',
    AccountUpdate = 'AccountUpdate',
    SystemAlert = 'SystemAlert',
    PaymentSuccess = 'PaymentSuccess',
    PaymentFailed = 'PaymentFailed',
    RefundProcessed = 'RefundProcessed',
    SystemAnnouncement = 'SystemAnnouncement',
    HospitalRegistration = 'HospitalRegistration',
    DoctorRegistration = 'DoctorRegistration',
    AdminAlert = 'AdminAlert',
}

/**
 * Vietnamese labels for notification types
 */
export const NotificationTypeLabels: Record<NotificationType, string> = {
    [NotificationType.General]: 'Tin tức',
    [NotificationType.BookingConfirmation]: 'Phiếu khám',
    [NotificationType.PaymentReminder]: 'Thông báo',
    [NotificationType.Refund]: 'Thông báo',
    [NotificationType.AccountUpdate]: 'Thông báo',
    [NotificationType.SystemAlert]: 'Tin tức',
    [NotificationType.PaymentSuccess]: 'Thanh toán',
    [NotificationType.PaymentFailed]: 'Thanh toán',
    [NotificationType.RefundProcessed]: 'Hoàn tiền',
    [NotificationType.SystemAnnouncement]: 'Tin tức',
    [NotificationType.HospitalRegistration]: 'Đăng ký bệnh viện',
    [NotificationType.DoctorRegistration]: 'Đăng ký bác sĩ',
    [NotificationType.AdminAlert]: 'Cảnh báo hệ thống',
};

/**
 * Grouped notification categories for tabs
 */
export enum NotificationCategory {
    Registration = 'registration', // Đăng ký
    Appointment = 'appointment', // Phiếu khám
    Payment = 'payment', // Thanh toán
    System = 'system', // Hệ thống
}

/**
 * Vietnamese labels for notification categories
 */
export const NotificationCategoryLabels: Record<NotificationCategory, string> = {
    [NotificationCategory.Registration]: 'Đăng ký',
    [NotificationCategory.Appointment]: 'Phiếu khám',
    [NotificationCategory.Payment]: 'Thanh toán',
    [NotificationCategory.System]: 'Hệ thống',
};

/**
 * Map notification types to categories
 */
export const getNotificationCategory = (type: NotificationType): NotificationCategory => {
    switch (type) {
        case NotificationType.HospitalRegistration:
        case NotificationType.DoctorRegistration:
            return NotificationCategory.Registration;
        case NotificationType.BookingConfirmation:
            return NotificationCategory.Appointment;
        case NotificationType.PaymentReminder:
        case NotificationType.PaymentSuccess:
        case NotificationType.PaymentFailed:
        case NotificationType.RefundProcessed:
        case NotificationType.Refund:
            return NotificationCategory.Payment;
        case NotificationType.General:
        case NotificationType.AccountUpdate:
        case NotificationType.SystemAlert:
        case NotificationType.SystemAnnouncement:
        case NotificationType.AdminAlert:
            return NotificationCategory.System;
        default:
            return NotificationCategory.System;
    }
};

/**
 * Get notification types by category
 */
export const getTypesByCategory = (category: NotificationCategory): NotificationType[] => {
    switch (category) {
        case NotificationCategory.Registration:
            return [NotificationType.HospitalRegistration, NotificationType.DoctorRegistration];
        case NotificationCategory.Appointment:
            return [NotificationType.BookingConfirmation];
        case NotificationCategory.Payment:
            return [
                NotificationType.PaymentReminder,
                NotificationType.PaymentSuccess,
                NotificationType.PaymentFailed,
                NotificationType.RefundProcessed,
                NotificationType.Refund,
            ];
        case NotificationCategory.System:
            return [
                NotificationType.General,
                NotificationType.AccountUpdate,
                NotificationType.SystemAlert,
                NotificationType.SystemAnnouncement,
                NotificationType.AdminAlert,
            ];
        default:
            return [];
    }
};
