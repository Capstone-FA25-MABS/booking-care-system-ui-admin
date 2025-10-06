import { Navigate, RouteObject } from 'react-router-dom';
import { PATHS } from './paths';
import AdminDashboard from '@/pages/admins/Dashboard';
import HOSPITALDashboard from '@/pages/hospitals/Dashboard';
import NotFoundError from '@/pages/errors/NotFoundError';
import ListDoctors from '@/pages/hospitals/Doctors/ListDoctors';
import ListAppointments from '@/pages/hospitals/Appointments/ListAppointments';
import MainLayout from '@/layouts/MainLayout';
import AuthLayout from '@/layouts/AuthLayout';
import AddDoctor from '@/pages/hospitals/Doctors/AddDoctor/AddDoctor';
import NewAppointment from '@/pages/hospitals/Appointments/NewAppointment';
import Messages from '@/pages/hospitals/Messages';
import Login from '@/pages/authentication/Login';
import ForgotPassword from '@/pages/authentication/ForgotPassword';
import ResetPassword from '@/pages/authentication/ResetPassword';
import { listGroupMenuItemAdmin, listGroupMenuItemHospital } from './sidenav.routes';
import EditDoctor from '@/pages/hospitals/Doctors/EditDoctor';

const routes: RouteObject[] = [
    {
        path: PATHS.HOME,
        element: <Navigate to={PATHS.LOGIN} replace />,
    },
    // Authentication routes
    {
        path: '/',
        element: <AuthLayout />,
        children: [
            { path: PATHS.LOGIN, element: <Login /> },
            { path: PATHS.FORGOT_PASSWORD, element: <ForgotPassword /> },
            { path: PATHS.RESET_PASSWORD, element: <ResetPassword /> },
        ],
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
        path: PATHS.HOSPITAL.ROOT,
        element: <MainLayout listGroupMenuItem={listGroupMenuItemHospital} />,
        children: [
            { index: true, element: <Navigate to={PATHS.HOSPITAL.DASHBOARD} replace /> },
            { path: PATHS.HOSPITAL.DASHBOARD, element: <HOSPITALDashboard /> },
            {
                path: PATHS.HOSPITAL.DOCTORS.ROOT,
                children: [
                    { index: true, element: <ListDoctors /> },
                    { path: PATHS.HOSPITAL.DOCTORS.ADD, element: <AddDoctor /> },
                    { path: PATHS.HOSPITAL.DOCTORS.EDIT, element: <EditDoctor /> },
                ],
            },
            {
                path: PATHS.HOSPITAL.APPOINTMENTS.ROOT,
                children: [
                    { index: true, element: <ListAppointments /> },
                    { path: PATHS.HOSPITAL.APPOINTMENTS.NEW, element: <NewAppointment /> },
                ],
            },
            { path: PATHS.HOSPITAL.MESSAGES, element: <Messages /> },
        ],
    },
    {
        path: PATHS.NOT_FOUND,
        element: <NotFoundError />,
    },
];

export default routes;
