import { buildPath, PATHS } from './paths';
import type { MenuConfig } from '@/types/menu.types';
import {
    createAccountSettingsMenuItem,
    createAppointmentsMenuItem,
    createDoctorsMenuItem,
    createMessagesMenuItem,
    createSimpleMenuItem,
} from './menu.items';

/**
 * Clinic menu configuration
 */
export const listGroupMenuItemClinic: MenuConfig = [
    {
        title: 'Clinic',
        items: [
            createDoctorsMenuItem(),
            createAppointmentsMenuItem('clinic'),
            createSimpleMenuItem('Locations', 'ti ti-map-pin', '/clinic/locations'),
            createSimpleMenuItem('Services', 'ti ti-user-cog', '/clinic/services'),
            createSimpleMenuItem('Specializations', 'ti ti-user-shield', '/clinic/specializations'),
            createSimpleMenuItem('Assets', 'ti ti-asset', '/clinic/assets'),
            createSimpleMenuItem('Activities', 'ti ti-activity', '/clinic/activities'),
            createMessagesMenuItem('clinic'),
        ],
    },
    {
        title: 'Settings',
        items: [createAccountSettingsMenuItem()],
    },
];

/**
 * Doctor menu configuration
 */
export const listGroupMenuItemDoctor: MenuConfig = [
    {
        title: 'Main Menu',
        items: [
            createSimpleMenuItem(
                'Dashboard',
                'ti ti-layout-dashboard',
                buildPath(PATHS.DOCTOR.ROOT, PATHS.DOCTOR.DASHBOARD)
            ),
            createAppointmentsMenuItem('doctor'),
            createSimpleMenuItem(
                'Schedule',
                'ti ti-calendar-time',
                buildPath(PATHS.DOCTOR.ROOT, PATHS.DOCTOR.SCHEDULE)
            ),
            createSimpleMenuItem(
                'Patients',
                'ti ti-user-heart',
                buildPath(PATHS.DOCTOR.ROOT, PATHS.DOCTOR.PATIENTS)
            ),
            createMessagesMenuItem('doctor'),
        ],
    },
    {
        title: 'Settings',
        items: [createAccountSettingsMenuItem()],
    },
];

/**
 * Admin menu configuration
 */
export const listGroupMenuItemAdmin: MenuConfig = [
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
        title: 'Settings',
        items: [createAccountSettingsMenuItem()],
    },
];
