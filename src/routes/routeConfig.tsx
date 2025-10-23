import { Navigate, RouteObject } from 'react-router-dom';
import { PATHS } from './paths';
import AdminDashboard from '@/pages/admins/Dashboard';
import HospitalDashboard from '@/pages/hospitals/Dashboard';
import DoctorDashboard from '@/pages/doctors/Dashboard';
import NotFoundError from '@/pages/errors/NotFoundError';
import ListDoctors from '@/pages/hospitals/Doctors/ListDoctors';
import ListAppointments from '@/pages/hospitals/Appointments/ListAppointments';
import MyAppointments from '@/pages/doctors/Appointments';
import ListRefunds from '@/pages/hospitals/Refunds/ListRefunds';
import MainLayout from '@/layouts/MainLayout';
import AuthLayout from '@/layouts/AuthLayout';
import AddDoctor from '@/pages/hospitals/Doctors/AddDoctor/AddDoctor';
import NewAppointment from '@/pages/hospitals/Appointments/NewAppointment';
import Messages from '@/pages/hospitals/Messages';
import Login from '@/pages/authentication/Login';
import ForgotPassword from '@/pages/authentication/ForgotPassword';
import ResetPassword from '@/pages/authentication/ResetPassword';
import {
    listGroupMenuItemAdmin,
    listGroupMenuItemHospital,
    listGroupMenuItemDoctor,
} from './sidenav.routes';
import EditDoctor from '@/pages/hospitals/Doctors/EditDoctor';
import ProfileSettings from '@/pages/settings/ProfileSettings';
import SecuritySettings from '@/pages/settings/SecuritySettings';
import NotificationsSettings from '@/pages/settings/NotificationsSettings';
import IntegrationsSettings from '@/pages/settings/IntegrationsSettings';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Role } from '@/enums/common.enums';
import ListPositions from '@/pages/admins/Positions/ListPositions';
import ListLanguages from '@/pages/admins/Languages/ListLanguages';
import PaymentMethodsManagement from '@/pages/paymentMethods';
import SubscriptionPlan from '@/pages/hospitals/SubscriptionPlan';

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
    // Admin routes - Only accessible by ADMIN role
    {
        path: PATHS.ADMIN.ROOT,
        element: (
            // <ProtectedRoute allowedRoles={[Role.ADMIN]}>
            <MainLayout listGroupMenuItem={listGroupMenuItemAdmin} />
            // </ProtectedRoute>
        ),
        children: [
            { index: true, element: <Navigate to={PATHS.ADMIN.DASHBOARD} replace /> },
            { path: PATHS.ADMIN.DASHBOARD, element: <AdminDashboard /> },
            { path: PATHS.ADMIN.SETTINGS, element: <h1>Setting</h1> },
            {
                path: PATHS.ADMIN.POSITIONS.ROOT,
                children: [{ index: true, element: <ListPositions /> }],
            },
            {
                path: PATHS.ADMIN.LANGUAGES.ROOT,
                children: [{ index: true, element: <ListLanguages /> }],
            },
            {
                path: PATHS.ADMIN.PAYMENT_METHODS.ROOT,
                children: [{ index: true, element: <PaymentMethodsManagement /> }],
            },
        ],
    },
    // Doctor routes - Only accessible by DOCTOR role
    {
        path: PATHS.DOCTOR.ROOT,
        element: (
            <ProtectedRoute allowedRoles={[Role.DOCTOR]}>
                <MainLayout listGroupMenuItem={listGroupMenuItemDoctor} />
            </ProtectedRoute>
        ),
        children: [
            { index: true, element: <Navigate to={PATHS.DOCTOR.DASHBOARD} replace /> },
            { path: PATHS.DOCTOR.DASHBOARD, element: <DoctorDashboard /> },
            {
                path: PATHS.DOCTOR.APPOINTMENTS.ROOT,
                element: <MyAppointments />,
            },
            { path: PATHS.DOCTOR.SCHEDULE, element: <h1>Doctor Schedule</h1> },
            { path: PATHS.DOCTOR.PATIENTS, element: <h1>Doctor Patients</h1> },
            { path: PATHS.DOCTOR.MESSAGES, element: <Messages /> },
        ],
    },
    // Hospital/Staff routes - Only accessible by STAFF role
    {
        path: PATHS.HOSPITAL.ROOT,
        element: (
            <ProtectedRoute allowedRoles={[Role.STAFF]}>
                <MainLayout listGroupMenuItem={listGroupMenuItemHospital} />
            </ProtectedRoute>
        ),
        children: [
            { index: true, element: <Navigate to={PATHS.HOSPITAL.DASHBOARD} replace /> },
            { path: PATHS.HOSPITAL.DASHBOARD, element: <HospitalDashboard /> },
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
            { path: PATHS.HOSPITAL.REFUNDS.ROOT, element: <ListRefunds /> },
            { path: PATHS.HOSPITAL.MESSAGES, element: <Messages /> },
            { path: PATHS.HOSPITAL.SUBSCRIPTION_PLAN, element: <SubscriptionPlan /> },
        ],
    },
    // Shared Account Settings - Accessible by all authenticated users
    {
        path: PATHS.COMMON.ACCOUNT_SETTINGS.ROOT,
        element: (
            // <ProtectedRoute allowedRoles={[Role.ADMIN, Role.DOCTOR, Role.STAFF]}>
            <MainLayout listGroupMenuItem={listGroupMenuItemAdmin} />
            // </ProtectedRoute>
        ),
        children: [
            {
                index: true,
                element: <Navigate to={PATHS.COMMON.ACCOUNT_SETTINGS.PROFILE} replace />,
            },
            { path: 'profile', element: <ProfileSettings /> },
            { path: 'security', element: <SecuritySettings /> },
            { path: 'notifications', element: <NotificationsSettings /> },
            { path: 'integrations', element: <IntegrationsSettings /> },
        ],
    },
    {
        path: PATHS.NOT_FOUND,
        element: <NotFoundError />,
    },
];

export default routes;
