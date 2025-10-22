import React from 'react';
import { Link } from 'react-router-dom';
import {
    AppointmentCardData,
    formatFullName,
    getAppointmentTypeText,
} from '@/types/appointment.types';
import StatusBadge from '@/components/StatusBadge';
import user01 from '@/assets/img/users/user-01.jpg';

interface AppointmentTableBodyProps {
    isLoading: boolean;
    apiError: string | null;
    appointments: AppointmentCardData[];
    noAppointmentsMessage: string;
    patientDetailsPath: string;
    onViewClick: (appointment: AppointmentCardData) => void;
    onDeleteClick: (appointment: AppointmentCardData) => void;
    skeletonComponent: React.ReactNode;
}

export const AppointmentTableBody: React.FC<AppointmentTableBodyProps> = ({
    isLoading,
    apiError,
    appointments,
    noAppointmentsMessage,
    patientDetailsPath,
    onViewClick,
    onDeleteClick,
    skeletonComponent,
}) => {
    if (isLoading) {
        return <>{skeletonComponent}</>;
    }

    if (apiError) {
        return (
            <tr>
                <td colSpan={5} className="text-center py-5">
                    <div className="text-danger">
                        <i className="ti ti-alert-circle fs-1" aria-hidden="true"></i>
                        <p className="mt-2">{apiError}</p>
                        <button
                            type="button"
                            className="btn btn-sm btn-primary"
                            onClick={() => globalThis.location.reload()}
                        >
                            Thử lại
                        </button>
                    </div>
                </td>
            </tr>
        );
    }

    if (appointments.length === 0) {
        return (
            <tr>
                <td colSpan={5} className="text-center py-5">
                    <i className="ti ti-calendar-off fs-1 text-muted" aria-hidden="true"></i>
                    <p className="mt-2 text-muted">{noAppointmentsMessage}</p>
                </td>
            </tr>
        );
    }

    return (
        <>
            {appointments.map((appointment) => (
                <tr key={appointment.appointmentId}>
                    <td>
                        {new Date(appointment.appointmentDate).toLocaleDateString('vi-VN')} |{' '}
                        {appointment.appointmentTime}
                    </td>
                    <td>
                        <div className="d-flex align-items-center">
                            <Link to={patientDetailsPath} className="avatar avatar-md me-2">
                                <img
                                    src={appointment.patientInfo?.avatarUrl || user01}
                                    alt="patient"
                                    className="rounded-circle"
                                />
                            </Link>
                            <Link to={patientDetailsPath} className="fw-semibold">
                                {formatFullName(
                                    appointment.patientInfo?.firstName,
                                    appointment.patientInfo?.lastName
                                )}
                                <span className="text-body fs-13 fw-normal d-block">
                                    {appointment.patientInfo?.phone ||
                                        appointment.patientInfo?.email}
                                </span>
                            </Link>
                        </div>
                    </td>
                    <td>{getAppointmentTypeText(appointment.appointmentType)}</td>
                    <td>
                        <StatusBadge status={appointment.status} />
                    </td>
                    <td className="action-item">
                        <button
                            type="button"
                            className="btn btn-link p-0"
                            data-bs-toggle="dropdown"
                        >
                            <i className="ti ti-dots-vertical" aria-hidden="true"></i>
                        </button>
                        <ul className="dropdown-menu p-2">
                            <li>
                                <button
                                    type="button"
                                    className="dropdown-item d-flex align-items-center w-100 text-start border-0 bg-transparent"
                                    onClick={() => onViewClick(appointment)}
                                >
                                    Xem Chi Tiết
                                </button>
                            </li>
                            <li>
                                <button
                                    type="button"
                                    className="dropdown-item d-flex align-items-center w-100 text-start border-0 bg-transparent"
                                    onClick={() => onDeleteClick(appointment)}
                                >
                                    Hủy Lịch
                                </button>
                            </li>
                        </ul>
                    </td>
                </tr>
            ))}
        </>
    );
};
