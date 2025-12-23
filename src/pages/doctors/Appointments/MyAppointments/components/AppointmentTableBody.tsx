import React from 'react';
import { Link } from 'react-router-dom';
import {
    AppointmentCardData,
    AppointmentUITab,
    getAppointmentTypeText,
    isRelativeAppointment,
    getActualPatientName,
    getRepresentativeName,
} from '@/types/appointment.types';
import StatusBadge from '@/components/StatusBadge';
import user01 from '@/assets/img/users/user-01.jpg';

interface AppointmentTableBodyProps {
    isLoading: boolean;
    apiError: string | null;
    appointments: AppointmentCardData[];
    noAppointmentsMessage: string;
    patientDetailsPath: string;
    activeStatusTab: AppointmentUITab;
    onCompleteAppointment: (appointment: AppointmentCardData) => void;
    onPreviewFile: (fileUrl: string, fileName: string) => void;
    onChatWithPatient: (appointment: AppointmentCardData) => void;
    skeletonComponent: React.ReactNode;
}

// Helper function to parse attachment URLs
const parseAttachmentUrls = (attachmentUrls: string[] | string | undefined): string[] => {
    if (!attachmentUrls) {
        return [];
    }

    if (Array.isArray(attachmentUrls)) {
        return attachmentUrls;
    }

    if (typeof attachmentUrls === 'string') {
        try {
            // Try to parse as JSON if it's a string
            const parsed = JSON.parse(attachmentUrls);

            return Array.isArray(parsed) ? parsed : [];
        } catch {
            // If not JSON, treat as comma-separated string
            return attachmentUrls
                .split(',')
                .map((url: string) => url.trim())
                .filter((url: string) => url.length > 0);
        }
    }

    return [];
};

// Helper function to check if result is a file URL
const isFileUrl = (result: string): boolean => {
    return (
        /\.(pdf|doc|docx|jpg|jpeg|png|gif|webp)(\?|$)/i.test(result) ||
        result.startsWith('http://') ||
        result.startsWith('https://')
    );
};

// Component to render attachment buttons
const AttachmentButtons: React.FC<{
    attachments: string[];
    onPreviewFile: (fileUrl: string, fileName: string) => void;
}> = ({ attachments, onPreviewFile }) => {
    if (attachments.length === 0) {
        return <span className="text-muted">Không có file</span>;
    }

    return (
        <div className="d-flex gap-2 flex-wrap">
            {attachments.map((url, index) => {
                const fileName = `File ${index + 1}`;
                const fileKey = `${url}-${index}`;
                return (
                    <button
                        key={fileKey}
                        type="button"
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => onPreviewFile(url, fileName)}
                        title={`Xem ${fileName}`}
                    >
                        <i className="ti ti-file me-1"></i> {fileName}
                    </button>
                );
            })}
        </div>
    );
};

// Component to render result (text or file preview button)
const ResultDisplay: React.FC<{
    result?: string;
    onPreviewFile: (fileUrl: string, fileName: string) => void;
}> = ({ result, onPreviewFile }) => {
    if (!result) {
        return <span className="text-muted">Chưa cập nhật</span>;
    }

    if (isFileUrl(result)) {
        return (
            <button
                type="button"
                className="btn btn-sm btn-outline-primary"
                onClick={() => onPreviewFile(result, 'Kết quả khám')}
                title="Xem kết quả khám"
            >
                <i className="ti ti-file-text me-1"></i> Xem kết quả
            </button>
        );
    }

    return (
        <div className="text-truncate" style={{ maxWidth: '250px' }}>
            {result}
        </div>
    );
};

export const AppointmentTableBody: React.FC<AppointmentTableBodyProps> = ({
    isLoading,
    apiError,
    appointments,
    noAppointmentsMessage,
    patientDetailsPath,
    activeStatusTab,
    onCompleteAppointment,
    onPreviewFile,
    onChatWithPatient,
    skeletonComponent,
}) => {
    if (isLoading) {
        return <>{skeletonComponent}</>;
    }

    const getColSpan = () => {
        if (activeStatusTab === 'upcoming') return 8; // Date, Patient, Representative, Type, Symptoms, Attachments, Status, Actions
        if (activeStatusTab === 'cancelled') return 7; // Date, Patient, Representative, Type, Reason, Status, Actions
        if (activeStatusTab === 'completed') return 7; // Date, Patient, Representative, Type, Result, Status, Actions
        return 6;
    };

    if (apiError) {
        return (
            <tr>
                <td colSpan={getColSpan()} className="text-center py-5">
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
                <td colSpan={getColSpan()} className="text-center py-5">
                    <i className="ti ti-calendar-off fs-1 text-muted" aria-hidden="true"></i>
                    <p className="mt-2 text-muted">{noAppointmentsMessage}</p>
                </td>
            </tr>
        );
    }

    return (
        <>
            {appointments.map((appointment) => {
                const hasRelative = isRelativeAppointment(appointment);
                const patientName = getActualPatientName(appointment);
                const representativeName = getRepresentativeName(appointment);

                return (
                    <tr key={appointment.appointmentId}>
                        <td>
                            {new Date(appointment.appointmentDate).toLocaleDateString('vi-VN')} |{' '}
                            {appointment.appointmentTime}
                        </td>
                        {/* Bệnh nhân - người thực sự khám */}
                        <td>
                            <div className="d-flex align-items-center">
                                <Link to={patientDetailsPath} className="avatar avatar-md me-2">
                                    <img
                                        src={appointment.patientInfo?.avatarUrl || user01}
                                        alt="patient"
                                        className="rounded-circle"
                                    />
                                </Link>
                                <div>
                                    <Link to={patientDetailsPath} className="fw-semibold">
                                        {patientName}
                                    </Link>
                                    {hasRelative &&
                                        appointment.relativeInfo?.relationshipDisplay && (
                                            <span className="badge bg-info-light text-info ms-1 fs-11">
                                                {appointment.relativeInfo.relationshipDisplay}
                                            </span>
                                        )}
                                    <span className="text-body fs-13 fw-normal d-block">
                                        {hasRelative
                                            ? appointment.relativeInfo?.phone || ''
                                            : appointment.patientInfo?.phone ||
                                              appointment.patientInfo?.email}
                                    </span>
                                </div>
                            </div>
                        </td>
                        {/* Người đại diện - người đặt lịch */}
                        <td>
                            {hasRelative ? (
                                <div>
                                    <span className="fw-medium">{representativeName}</span>
                                    <span className="text-body fs-13 fw-normal d-block">
                                        {appointment.patientInfo?.phone ||
                                            appointment.patientInfo?.email}
                                    </span>
                                </div>
                            ) : (
                                <span className="text-muted">Trống</span>
                            )}
                        </td>
                        <td>
                            <div className="d-flex align-items-center gap-2">
                                <span>{getAppointmentTypeText(appointment.appointmentType)}</span>
                                {appointment.appointmentType === 'TELEHEALTH' && (
                                    <button
                                        type="button"
                                        className="btn btn-soft-info btn-sm p-1"
                                        onClick={() => onChatWithPatient(appointment)}
                                        title="Chat với bệnh nhân"
                                        style={{ width: '28px', height: '28px' }}
                                    >
                                        <i
                                            className="ti ti-message-circle"
                                            style={{ fontSize: '16px' }}
                                        ></i>
                                    </button>
                                )}
                            </div>
                        </td>

                        {/* Conditional columns based on status */}
                        {activeStatusTab === 'upcoming' && (
                            <>
                                <td>
                                    <div className="text-truncate" style={{ maxWidth: '200px' }}>
                                        {appointment.symptoms || (
                                            <span className="text-muted">Chưa cập nhật</span>
                                        )}
                                    </div>
                                </td>
                                <td>
                                    <AttachmentButtons
                                        attachments={parseAttachmentUrls(
                                            appointment.attachmentUrls
                                        )}
                                        onPreviewFile={onPreviewFile}
                                    />
                                </td>
                            </>
                        )}

                        {activeStatusTab === 'cancelled' && (
                            <td>
                                <div className="text-truncate" style={{ maxWidth: '250px' }}>
                                    {appointment.reason || (
                                        <span className="text-muted">Không có lý do</span>
                                    )}
                                </div>
                            </td>
                        )}

                        {activeStatusTab === 'completed' && (
                            <td>
                                <ResultDisplay
                                    result={appointment.result}
                                    onPreviewFile={onPreviewFile}
                                />
                            </td>
                        )}

                        <td>
                            <StatusBadge status={appointment.status} />
                        </td>
                        {activeStatusTab === 'upcoming' && (
                            <td className="action-item">
                                <button
                                    type="button"
                                    className="btn btn-soft-success"
                                    onClick={() => onCompleteAppointment(appointment)}
                                    title="Đánh dấu đã khám"
                                >
                                    <i className="ti ti-check me-1"></i> Đã khám
                                </button>
                            </td>
                        )}
                        {activeStatusTab !== 'upcoming' && <td></td>}
                    </tr>
                );
            })}
        </>
    );
};
