import React from 'react';
import {
    AppointmentCardData,
    getAppointmentTypeText,
    formatFullName,
} from '@/types/appointment.types';
import user01 from '@/assets/img/profiles/avatar-01.jpg';

interface AppointmentDetailsOffcanvasProps {
    show: boolean;
    onClose: () => void;
    appointment: AppointmentCardData | null;
}

export const AppointmentDetailsOffcanvas: React.FC<AppointmentDetailsOffcanvasProps> = ({
    show,
    onClose,
    appointment,
}) => {
    return (
        <div
            className={`offcanvas offcanvas-offset offcanvas-end ${show ? 'show' : ''}`}
            tabIndex={-1}
            id="view_details"
            style={{ display: show ? 'block' : 'none' }}
        >
            <div className="offcanvas-header d-block pb-0 px-0">
                <div className="border-bottom d-flex align-items-center justify-content-between pb-3 px-3">
                    <h5 className="offcanvas-title fs-18 fw-bold">
                        Chi Tiết Lịch Hẹn{' '}
                        <span className="badge badge-soft-primary border pt-1 px-2 border-primary fw-medium ms-2">
                            #{appointment?.appointmentId?.substring(0, 8) || 'AP544658'}
                        </span>
                    </h5>
                    <button
                        type="button"
                        className="btn-close opacity-100"
                        onClick={onClose}
                        aria-label="Close"
                    ></button>
                </div>
            </div>
            <div className="offcanvas-body pt-0 px-0">
                <h6 className="bg-light py-2 px-3 text-dark fw-bold"> Khi Nào & Ở Đâu </h6>
                <div className="px-3 my-4">
                    <p className="text-dark mb-3 fw-semibold d-flex align-items-center justify-content-between">
                        Ngày Khám{' '}
                        <span className="text-body fw-normal">
                            {' '}
                            {appointment
                                ? new Date(appointment.appointmentDate).toLocaleDateString('vi-VN')
                                : ''}{' '}
                        </span>
                    </p>
                    <p className="text-dark mb-3 fw-semibold d-flex align-items-center justify-content-between">
                        Giờ{' '}
                        <span className="text-body fw-normal">
                            {' '}
                            {appointment?.appointmentTime}{' '}
                        </span>
                    </p>
                    <p className="text-dark mb-3 fw-semibold d-flex align-items-center justify-content-between">
                        Loại Khám{' '}
                        <span className="text-body fw-normal">
                            {' '}
                            {appointment
                                ? getAppointmentTypeText(appointment.appointmentType)
                                : ''}{' '}
                        </span>
                    </p>
                    <div className="text-dark mb-3 fw-semibold d-flex align-items-center justify-content-between">
                        Thông Tin Bệnh Nhân
                        <div className="text-body fw-normal d-flex align-items-center">
                            <span className="avatar avatar-sm">
                                <img
                                    src={appointment?.patientInfo?.avatarUrl || user01}
                                    alt=""
                                    className="rounded-circle me-1"
                                />
                            </span>
                            <span>
                                {formatFullName(
                                    appointment?.patientInfo?.firstName,
                                    appointment?.patientInfo?.lastName
                                )}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
