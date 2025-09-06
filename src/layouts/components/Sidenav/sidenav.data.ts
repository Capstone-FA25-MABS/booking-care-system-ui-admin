export const listGroupMenuItem: Array<{
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
    {
        title: 'Clinic',
        items: [
            {
                label: 'Doctors',
                icon: 'ti ti-user-plus',
                subItems: [
                    { label: 'Doctors', link: '/doctors' },
                    { label: 'Doctor Details', link: '/doctor-details' },
                    { label: 'Add Doctor', link: '/add-doctor' },
                    { label: 'Doctor Schedule', link: '/doctor-schedule' },
                ],
            },
            {
                label: 'Appointments',
                icon: 'ti ti-calendar-check',
                subItems: [
                    { label: 'Appointments', link: '/appointments' },
                    { label: 'New Appointment', link: '/new-appointment' },
                    { label: 'Calendar', link: '/appointment-calendar' },
                ],
            },
            {
                label: 'Locations',
                icon: 'ti ti-map-pin',
                link: '/locations',
            },
            {
                label: 'Services',
                icon: 'ti ti-user-cog',
                link: '/services',
            },
            {
                label: 'Specializations',
                icon: 'ti ti-user-shield',
                link: '/specializations',
            },
            {
                label: 'Assets',
                icon: 'ti ti-asset',
                link: '/assets',
            },
            {
                label: 'Activities',
                icon: 'ti ti-activity',
                link: '/activities',
            },
            {
                label: 'Messages',
                icon: 'ti ti-messages',
                link: '/messages',
            },
        ],
    },
];
