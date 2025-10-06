import { buildPath, PATHS } from './paths';

export const listGroupMenuItemHospital: Array<{
    title: string;
    items: Array<{
        label: string;
        link?: string;
        icon: string;
        subItems?: Array<{ label: string; link: string }>;
    }>;
}> = [
    {
        title: 'Hospital',
        items: [
            {
                label: 'Bác sĩ',
                icon: 'ti ti-user-plus',
                subItems: [
                    {
                        label: 'Danh sách bác sĩ',
                        link: buildPath(PATHS.HOSPITAL.ROOT, PATHS.HOSPITAL.DOCTORS.ROOT),
                    },
                    // { label: 'Doctor Details', link: buildPath(PATHS.CLINIC.ROOT, PATHS.CLINIC.DOCTORS.DETAILS) },
                    {
                        label: 'Thêm bác sĩ',
                        link: buildPath(
                            PATHS.HOSPITAL.ROOT,
                            PATHS.HOSPITAL.DOCTORS.ROOT,
                            PATHS.HOSPITAL.DOCTORS.ADD
                        ),
                    },
                    // { label: 'Doctor Schedule', link: buildPath(PATHS.CLINIC.ROOT, PATHS.CLINIC.DOCTORS.SCHEDULE) },
                ],
            },
            {
                label: 'Lịch hẹn',
                icon: 'ti ti-calendar-check',
                subItems: [
                    {
                        label: 'Danh sách lịch hẹn',
                        link: buildPath(PATHS.HOSPITAL.ROOT, PATHS.HOSPITAL.APPOINTMENTS.ROOT),
                    },
                    {
                        label: 'Thêm lịch hẹn',
                        link: buildPath(
                            PATHS.HOSPITAL.ROOT,
                            PATHS.HOSPITAL.APPOINTMENTS.ROOT,
                            PATHS.HOSPITAL.APPOINTMENTS.NEW
                        ),
                    },
                    {
                        label: 'Calendar',
                        link: buildPath(
                            PATHS.HOSPITAL.ROOT,
                            PATHS.HOSPITAL.APPOINTMENTS.ROOT,
                            PATHS.HOSPITAL.APPOINTMENTS.CALENDAR
                        ),
                    },
                ],
            },
            {
                label: 'Locations',
                icon: 'ti ti-map-pin',
                link: '/clinic/locations',
            },
            {
                label: 'Services',
                icon: 'ti ti-user-cog',
                link: '/clinic/services',
            },
            {
                label: 'Specializations',
                icon: 'ti ti-user-shield',
                link: '/clinic/specializations',
            },
            {
                label: 'Assets',
                icon: 'ti ti-asset',
                link: '/clinic/assets',
            },
            {
                label: 'Activities',
                icon: 'ti ti-activity',
                link: '/clinic/activities',
            },
            {
                label: 'Messages',
                icon: 'ti ti-messages',
                link: buildPath(PATHS.HOSPITAL.ROOT, PATHS.HOSPITAL.MESSAGES),
            },
        ],
    },
];

export const listGroupMenuItemAdmin: Array<{
    title: string;
    items: Array<{
        label: string;
        link?: string;
        icon: string;
        subItems?: Array<{ label: string; link: string }>;
    }>;
}> = [
    {
        title: 'Main Menu',
        items: [
            {
                label: 'Dashboard',
                icon: 'ti ti-layout-dashboard',
                subItems: [
                    { label: 'Admin Dashboard', link: '/admin/dashboard' },
                    { label: 'Doctor Dashboard', link: '/doctor/dashboard' },
                    { label: 'Patient Dashboard', link: '/patient/dashboard' },
                ],
            },
            {
                label: 'Applications',
                icon: 'ti ti-apps',
                subItems: [
                    { label: 'Chat', link: '/apps/chat' },
                    { label: 'Email', link: '/apps/email' },
                    { label: 'Calendar', link: '/apps/calendar' },
                    { label: 'Contacts', link: '/apps/contacts' },
                    { label: 'Invoices', link: '/apps/invoices' },
                ],
            },
        ],
    },
];
