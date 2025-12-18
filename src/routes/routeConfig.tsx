import { Navigate, RouteObject } from 'react-router-dom';
import { PATHS } from './paths';
import AdminDashboard from '@/pages/admins/Dashboard';
import HospitalDashboard from '@/pages/hospitals/Dashboard';
import DoctorDashboard from '@/pages/doctors/Dashboard';
import NotFoundError from '@/pages/errors/NotFoundError';
import ListDoctors from '@/pages/hospitals/Doctors/ListDoctors';
import ListAppointments from '@/pages/hospitals/Appointments/ListAppointments';
import { MyAppointments } from '@/pages/doctors/Appointments/MyAppointments';
import ListRefunds from '@/pages/hospitals/Refunds/ListRefunds';
import MainLayout from '@/layouts/MainLayout';
import AuthLayout from '@/layouts/AuthLayout';
import AddDoctor from '@/pages/hospitals/Doctors/AddDoctor/AddDoctor';
import NewAppointment from '@/pages/hospitals/Appointments/NewAppointment';
import Messages from '@/pages/hospitals/Messages';
import DoctorReviewManagement from '@/pages/doctors/Reviews';
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
import TwoFactorAuthentication from '@/pages/authentication/TwoFactorAuthentication';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Role } from '@/enums/common.enums';
import ListPositions from '@/pages/admins/Positions/ListPositions';
import ListLanguages from '@/pages/admins/Languages/ListLanguages';
import ListSpecialties from '@/pages/admins/Specialties/ListSpecialties';
import ListServiceTypes from '@/pages/admins/ServiceTypes/ListServiceTypes/ListServiceTypes';
import ListServiceCategories from '@/pages/admins/ServiceCategories/ListServiceCategories';
import ListServices from '@/pages/admins/Services/ListServices';
import PaymentMethodsManagement from '@/pages/paymentMethods';
import SubscriptionPlanList from '@/pages/hospitals/SubscriptionPlan/SubscriptionPlanList';
import SubscriptionInfo from '@/pages/hospitals/SubscriptionPlan/SubscriptionInfo';
import ListSubscriptionPlans from '@/pages/admins/SubscriptionPlans/ListSubscriptionPlans';
import ManageHospitalSubscriptions from '@/pages/admins/SubscriptionPlans/ManageHospitalSubscriptions';
import AddSubscriptionPlan from '@/pages/admins/SubscriptionPlans/AddSubscriptionPlan';
import EditSubscriptionPlan from '@/pages/admins/SubscriptionPlans/EditSubscriptionPlan';
import AccountManagement from '@/pages/admins/AccountManagement';
import ListHospitalRegistrations from '@/pages/admins/HospitalRegistrations/ListHospitalRegistrations/ListHospitalRegistrations';
import AdminSignatureManagement from '@/pages/admins/AdminSignature/AdminSignatureManagement';
import { HospitalPayouts } from '@/pages/admins/HospitalPayouts';
import ListServicesStaff from '@/pages/hospitals/Services/ListServices';
import DoctorManagement from '@/pages/hospitals/DoctorManagement/DoctorManagement';
import { AppointmentCalendar } from '@/pages/doctors/Appointments/Calendar';
import { HospitalAppointmentCalendar } from '@/pages/hospitals/Appointments/Calendar';
import HospitalSpecialtiesManagement from '@/pages/hospitals/Specialties';
import HospitalServiceTypesManagement from '@/pages/hospitals/ServiceTypes';
import HospitalServiceMedicalsManagement from '@/pages/hospitals/ServiceMedicals';
import NotificationManagement from '@/pages/notifications/NotificationManagement/NotificationManagement';
import Wallet from '@/pages/hospitals/Wallet';
import HospitalDiscountManagement from '@/pages/hospitals/Discounts';
import HospitalReviewManagement from '@/pages/hospitals/Reviews';

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
            <ProtectedRoute allowedRoles={[Role.ADMIN]}>
                <MainLayout listGroupMenuItem={listGroupMenuItemAdmin} />
            </ProtectedRoute>
        ),
        children: [
            { index: true, element: <Navigate to={PATHS.ADMIN.DASHBOARD} replace /> },
            { path: PATHS.ADMIN.DASHBOARD, element: <AdminDashboard /> },
            {
                path: PATHS.ADMIN.SETTINGS.ROOT,
                children: [
                    {
                        index: true,
                        element: <Navigate to={PATHS.ADMIN.SETTINGS.PROFILE} replace />,
                    },
                    { path: PATHS.ADMIN.SETTINGS.PROFILE, element: <ProfileSettings /> },
                    { path: PATHS.ADMIN.SETTINGS.SECURITY, element: <SecuritySettings /> },
                    { path: PATHS.ADMIN.SETTINGS.TWO_FACTOR, element: <TwoFactorAuthentication /> },
                    {
                        path: PATHS.ADMIN.SETTINGS.NOTIFICATIONS,
                        element: <NotificationsSettings />,
                    },
                    { path: PATHS.ADMIN.SETTINGS.INTEGRATIONS, element: <IntegrationsSettings /> },
                ],
            },
            {
                path: PATHS.ADMIN.POSITIONS.ROOT,
                children: [{ index: true, element: <ListPositions /> }],
            },
            {
                path: PATHS.ADMIN.LANGUAGES.ROOT,
                children: [{ index: true, element: <ListLanguages /> }],
            },
            {
                path: PATHS.ADMIN.SPECIALTIES.ROOT,
                children: [{ index: true, element: <ListSpecialties /> }],
            },
            {
                path: PATHS.ADMIN.PAYMENT_METHODS.ROOT,
                children: [{ index: true, element: <PaymentMethodsManagement /> }],
            },
            {
                path: PATHS.ADMIN.ACCOUNT_MANAGEMENT.ROOT,
                children: [{ index: true, element: <AccountManagement /> }],
            },
            {
                path: PATHS.ADMIN.SERVICE_TYPES.ROOT,
                children: [{ index: true, element: <ListServiceTypes /> }],
            },
            {
                path: PATHS.ADMIN.SERVICE_CATEGORIES.ROOT,
                children: [{ index: true, element: <ListServiceCategories /> }],
            },
            {
                path: PATHS.ADMIN.SERVICES.ROOT,
                children: [{ index: true, element: <ListServices /> }],
            },
            {
                path: PATHS.ADMIN.SUBSCRIPTION_PLANS.ROOT,
                children: [
                    { index: true, element: <ListSubscriptionPlans /> },
                    { path: PATHS.ADMIN.SUBSCRIPTION_PLANS.ADD, element: <AddSubscriptionPlan /> },
                    {
                        path: PATHS.ADMIN.SUBSCRIPTION_PLANS.EDIT,
                        element: <EditSubscriptionPlan />,
                    },
                    {
                        path: PATHS.ADMIN.SUBSCRIPTION_PLANS.MANAGE_HOSPITALS,
                        element: <ManageHospitalSubscriptions />,
                    },
                ],
            },
            {
                path: PATHS.ADMIN.HOSPITAL_REGISTRATIONS.ROOT,
                children: [{ index: true, element: <ListHospitalRegistrations /> }],
            },
            {
                path: PATHS.ADMIN.ADMIN_SIGNATURE.ROOT,
                children: [{ index: true, element: <AdminSignatureManagement /> }],
            },
            {
                path: PATHS.ADMIN.NOTIFICATIONS.ROOT,
                children: [{ index: true, element: <NotificationManagement /> }],
            },
            {
                path: PATHS.ADMIN.HOSPITAL_PAYOUTS.ROOT,
                children: [{ index: true, element: <HospitalPayouts /> }],
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
                children: [
                    { index: true, element: <MyAppointments /> },
                    { path: PATHS.DOCTOR.APPOINTMENTS.CALENDAR, element: <AppointmentCalendar /> },
                ],
            },
            { path: PATHS.DOCTOR.SCHEDULE, element: <h1>Doctor Schedule</h1> },
            { path: PATHS.DOCTOR.PATIENTS, element: <h1>Doctor Patients</h1> },
            { path: PATHS.DOCTOR.MESSAGES, element: <Messages /> },
            {
                path: PATHS.DOCTOR.REVIEWS.ROOT,
                children: [{ index: true, element: <DoctorReviewManagement /> }],
            },
            {
                path: PATHS.DOCTOR.NOTIFICATIONS.ROOT,
                children: [{ index: true, element: <NotificationManagement /> }],
            },
            {
                path: PATHS.DOCTOR.SETTINGS.ROOT,
                children: [
                    {
                        index: true,
                        element: <Navigate to={PATHS.DOCTOR.SETTINGS.PROFILE} replace />,
                    },
                    { path: PATHS.DOCTOR.SETTINGS.PROFILE, element: <ProfileSettings /> },
                    { path: PATHS.DOCTOR.SETTINGS.SECURITY, element: <SecuritySettings /> },
                    {
                        path: PATHS.DOCTOR.SETTINGS.TWO_FACTOR,
                        element: <TwoFactorAuthentication />,
                    },
                ],
            },
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
                path: PATHS.HOSPITAL.DOCTOR_MANAGEMENT.ROOT,
                children: [{ index: true, element: <DoctorManagement /> }],
            },
            {
                path: PATHS.HOSPITAL.APPOINTMENTS.ROOT,
                children: [
                    { index: true, element: <ListAppointments /> },
                    { path: PATHS.HOSPITAL.APPOINTMENTS.NEW, element: <NewAppointment /> },
                    {
                        path: PATHS.HOSPITAL.APPOINTMENTS.CALENDAR,
                        element: <HospitalAppointmentCalendar />,
                    },
                ],
            },
            {
                path: PATHS.HOSPITAL.SERVICES.ROOT,
                children: [{ index: true, element: <ListServicesStaff /> }],
            },
            { path: PATHS.HOSPITAL.SPECIALTIES.ROOT, element: <HospitalSpecialtiesManagement /> },
            {
                path: PATHS.HOSPITAL.SERVICE_TYPES.ROOT,
                element: <HospitalServiceTypesManagement />,
            },
            {
                path: PATHS.HOSPITAL.SERVICE_MEDICALS.ROOT,
                element: <HospitalServiceMedicalsManagement />,
            },
            { path: PATHS.HOSPITAL.REFUNDS.ROOT, element: <ListRefunds /> },
            { path: PATHS.HOSPITAL.WALLET.ROOT, element: <Wallet /> },
            { path: PATHS.HOSPITAL.DISCOUNTS.ROOT, element: <HospitalDiscountManagement /> },
            { path: PATHS.HOSPITAL.REVIEWS.ROOT, element: <HospitalReviewManagement /> },
            { path: PATHS.HOSPITAL.MESSAGES, element: <Messages /> },
            { path: PATHS.HOSPITAL.SUBSCRIPTION_PLAN, element: <SubscriptionPlanList /> },
            { path: PATHS.HOSPITAL.SUBSCRIPTION_INFO, element: <SubscriptionInfo /> },
            {
                path: PATHS.HOSPITAL.NOTIFICATIONS.ROOT,
                children: [{ index: true, element: <NotificationManagement /> }],
            },
            {
                path: PATHS.HOSPITAL.SETTINGS.ROOT,
                children: [
                    {
                        index: true,
                        element: <Navigate to={PATHS.HOSPITAL.SETTINGS.PROFILE} replace />,
                    },
                    { path: PATHS.HOSPITAL.SETTINGS.PROFILE, element: <ProfileSettings /> },
                    { path: PATHS.HOSPITAL.SETTINGS.SECURITY, element: <SecuritySettings /> },
                    {
                        path: PATHS.HOSPITAL.SETTINGS.TWO_FACTOR,
                        element: <TwoFactorAuthentication />,
                    },
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
