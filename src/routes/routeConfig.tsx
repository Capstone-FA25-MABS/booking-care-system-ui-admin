import { Navigate, RouteObject } from 'react-router-dom';
import { PATHS } from './paths';
import AdminDashboard from '@/pages/admins/Dashboard';
import ClinicDashboard from '@/pages/clinics/Dashboard';
import NotFoundError from '@/pages/errors/NotFoundError';
import ListDoctors from '@/pages/clinics/Doctors/ListDoctors';
import ListAppointments from '@/pages/clinics/Appointments/ListAppointments';
import MainLayout from '@/layouts/MainLayout';
import AddDoctor from '@/pages/clinics/Doctors/AddDoctor/AddDoctor';
import NewAppointment from '@/pages/clinics/Appointments/NewAppointment';
import { listGroupMenuItemAdmin, listGroupMenuItemClinic } from './sidenav.routes';

const routes: RouteObject[] = [
    {
        path: PATHS.HOME,
        element: <h1>Home</h1>,
    },
    {
        path: PATHS.ADMIN.ROOT,
        element: <MainLayout listGroupMenuItem={listGroupMenuItemAdmin} />,
        children: [
            { index: true, element: <Navigate to={PATHS.ADMIN.DASHBOARD} replace /> },
            { path: PATHS.ADMIN.DASHBOARD, element: <AdminDashboard /> },
            { path: PATHS.ADMIN.SETTINGS, element: <h1>Setting</h1> },
        ],
    },
    {
        path: PATHS.CLINIC.ROOT,
        element: <MainLayout listGroupMenuItem={listGroupMenuItemClinic} />,
        children: [
            { index: true, element: <Navigate to={PATHS.CLINIC.DASHBOARD} replace /> },
            { path: PATHS.CLINIC.DASHBOARD, element: <ClinicDashboard /> },
            {
                path: PATHS.CLINIC.DOCTORS.ROOT,
                children: [
                    { index: true, element: <ListDoctors /> },
                    { path: PATHS.CLINIC.DOCTORS.ADD, element: <AddDoctor /> },
                ],
            },
            {
                path: PATHS.CLINIC.APPOINTMENTS.ROOT,
                children: [
                    { index: true, element: <ListAppointments /> },
                    { path: PATHS.CLINIC.APPOINTMENTS.NEW, element: <NewAppointment /> },
                ],
            },
        ],
    },
    {
        path: PATHS.NOT_FOUND,
        element: <NotFoundError />,
    },
];

export default routes;
