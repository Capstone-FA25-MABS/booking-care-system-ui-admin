import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { Star, Calendar, User, Award, Briefcase, CheckCircle, XCircle } from 'lucide-react';
import {
    AppointmentCardData,
    DoctorForAssignment,
    DoctorsForAssignmentResponse,
    isRelativeAppointment,
    getActualPatientName,
    getRepresentativeName,
} from '@/types/appointment.types';
// AppointmentTime enum not needed - always keep original time
import { AppointmentService } from '@/services/appointment.service';
import styles from './AssignDoctorToAppointmentModal.module.scss';

// Helper function to format currency
const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(amount);
};

// Helper function to format date
const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

interface AssignDoctorToAppointmentModalProps {
    show: boolean;
    onHide: () => void;
    appointment: AppointmentCardData | null;
    staffId: string;
    onSuccess?: () => void;
}

export const AssignDoctorToAppointmentModal: React.FC<AssignDoctorToAppointmentModalProps> = ({
    show,
    onHide,
    appointment,
    staffId,
    onSuccess,
}) => {
    // State
    const [isLoading, setIsLoading] = useState(false);
    const [isAssigning, setIsAssigning] = useState(false);
    const [doctorsData, setDoctorsData] = useState<DoctorsForAssignmentResponse | null>(null);
    const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
    const [staffNote, setStaffNote] = useState<string>('');
    const [showSuccess, setShowSuccess] = useState(false);

    // Fetch doctors for assignment (always check availability at original time)
    const fetchDoctors = useCallback(async () => {
        if (!appointment?.appointmentId) return;

        setIsLoading(true);
        try {
            const response = await AppointmentService.getDoctorsForAssignment(
                appointment.appointmentId,
                true // Always check availability at original time
            );

            if (response.success && response.data) {
                setDoctorsData(response.data);
            } else {
                throw new Error(response.message || 'Không thể tải danh sách bác sĩ');
            }
        } catch (error: any) {
            console.error('Error fetching doctors:', error);
            toast.error(error.message || 'Không thể tải danh sách bác sĩ');
            setDoctorsData(null);
        } finally {
            setIsLoading(false);
        }
    }, [appointment?.appointmentId]);

    // Effects
    useEffect(() => {
        if (show && appointment) {
            fetchDoctors();
        }
    }, [show, appointment, fetchDoctors]);

    useEffect(() => {
        if (show) {
            // Reset form when modal opens
            setSelectedDoctorId('');
            setStaffNote('');
            setShowSuccess(false);
            setDoctorsData(null);
        }
    }, [show]);

    // Handlers
    const handleDoctorSelect = (doctorId: string) => {
        setSelectedDoctorId(doctorId);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedDoctorId) {
            toast.error('Vui lòng chọn bác sĩ');
            return;
        }

        if (!appointment?.appointmentId) {
            toast.error('Không tìm thấy thông tin lịch hẹn');
            return;
        }

        if (!staffId) {
            toast.error('Không tìm thấy thông tin nhân viên');
            return;
        }

        setIsAssigning(true);
        try {
            // Always keep original time - no date/time change in this flow
            const response = await AppointmentService.assignDoctorToAppointment(
                appointment.appointmentId,
                selectedDoctorId,
                staffId,
                undefined, // Keep original date
                undefined, // Keep original time
                staffNote || undefined
            );

            if (response.success) {
                setShowSuccess(true);
                toast.success('Đã gán bác sĩ thành công!');

                // Wait a bit before closing
                setTimeout(() => {
                    onSuccess?.();
                    onHide();
                }, 1500);
            } else {
                throw new Error(response.message || 'Không thể gán bác sĩ');
            }
        } catch (error: any) {
            console.error('Error assigning doctor:', error);
            toast.error(error.message || 'Không thể gán bác sĩ');
        } finally {
            setIsAssigning(false);
        }
    };

    // Get selected doctor info
    const selectedDoctor = doctorsData
        ? [...doctorsData.recommendedDoctors, ...doctorsData.previousDoctors].find(
              (d) => d.id === selectedDoctorId
          )
        : null;

    // Render doctor card
    const renderDoctorCard = (doctor: DoctorForAssignment, isPrevious: boolean = false) => {
        const isSelected = selectedDoctorId === doctor.id;
        const isAvailable = doctor.isAvailableAtOriginalTime;

        return (
            <div
                key={doctor.id}
                className={`${styles.doctorCard} ${isSelected ? styles.selected : ''} ${
                    isAvailable ? '' : styles.unavailable
                }`}
                onClick={() => {
                    if (!isAvailable) {
                        toast.warning('Bác sĩ này không khả dụng ở khung giờ hiện tại');
                        return;
                    }
                    handleDoctorSelect(doctor.id);
                }}
            >
                <div className={styles.doctorAvatar}>
                    {doctor.avatarUrl ? (
                        <img src={doctor.avatarUrl} alt={doctor.fullName} />
                    ) : (
                        <User size={32} />
                    )}
                    {isPrevious && (
                        <span className={styles.previousBadge} title="Bác sĩ đã khám trước đây">
                            <CheckCircle size={14} />
                        </span>
                    )}
                </div>

                <div className={styles.doctorInfo}>
                    <h4 className={styles.doctorName}>{doctor.fullName}</h4>
                    <p className={styles.doctorPosition}>
                        {doctor.positionName} - {doctor.specialtyName}
                    </p>

                    <div className={styles.doctorStats}>
                        <span className={styles.stat}>
                            <Briefcase size={14} />
                            {doctor.yearsOfExperience} năm
                        </span>
                        <span className={styles.stat}>
                            <Star size={14} />
                            {doctor.rating.toFixed(1)} ({doctor.reviewCount})
                        </span>
                        <span className={styles.stat}>
                            <Award size={14} />
                            {doctor.bookingCount} lượt khám
                        </span>
                    </div>

                    <div className={styles.doctorFee}>{formatCurrency(doctor.consultationFee)}</div>
                </div>

                <div className={styles.doctorStatus}>
                    {isAvailable ? (
                        <span className={styles.available}>
                            <CheckCircle size={16} /> Khả dụng
                        </span>
                    ) : (
                        <span className={styles.unavailableStatus}>
                            <XCircle size={16} /> Không khả dụng
                        </span>
                    )}
                </div>

                {isSelected && (
                    <div className={styles.selectedIndicator}>
                        <CheckCircle size={20} />
                    </div>
                )}
            </div>
        );
    };

    if (!show) return null;

    return (
        <div
            className={styles.modalOverlay}
            onClick={onHide}
            onKeyDown={(e) => e.key === 'Escape' && onHide()}
            role="dialog"
            aria-modal="true"
            tabIndex={-1}
        >
            <div
                className={styles.modalContent}
                onClick={(e) => e.stopPropagation()}
                role="document"
            >
                {/* Header */}
                <div className={styles.modalHeader}>
                    <h2>Gán bác sĩ cho lịch hẹn</h2>
                    <button className={styles.closeButton} onClick={onHide}>
                        ×
                    </button>
                </div>

                {/* Appointment Info */}
                {appointment && (
                    <div className={styles.appointmentInfo}>
                        <div className={styles.infoRow}>
                            <Calendar size={16} />
                            <span>
                                {formatDate(appointment.appointmentDate)} -{' '}
                                {String(appointment.appointmentTimeId)
                                    .replace(/AT_/g, '')
                                    .replace(/_/g, ':')}
                            </span>
                        </div>
                        <div className={styles.infoRow}>
                            <User size={16} />
                            <span>
                                Bệnh nhân: {getActualPatientName(appointment)}
                                {isRelativeAppointment(appointment) && (
                                    <span className={styles.representativeNote}>
                                        {' '}
                                        (Người đại diện: {getRepresentativeName(appointment)})
                                    </span>
                                )}
                            </span>
                        </div>
                    </div>
                )}

                {/* Success State */}
                {showSuccess ? (
                    <div className={styles.successState}>
                        <CheckCircle size={64} className={styles.successIcon} />
                        <h3>Gán bác sĩ thành công!</h3>
                        <p>Bệnh nhân sẽ được thông báo về bác sĩ được gán.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        {/* Doctor Selection */}
                        <div className={styles.doctorSection}>
                            {isLoading ? (
                                <div className={styles.loading}>
                                    <div className={styles.spinner}></div>
                                    <span>Đang tải danh sách bác sĩ...</span>
                                </div>
                            ) : (
                                <>
                                    {/* Recommended Doctors */}
                                    {doctorsData && doctorsData.recommendedDoctors.length > 0 && (
                                        <div className={styles.doctorGroup}>
                                            <h3>Bác sĩ đề xuất ({doctorsData.totalRecommended})</h3>
                                            <p className={styles.groupDescription}>
                                                Sắp xếp theo kinh nghiệm, đánh giá và số lượt khám
                                            </p>
                                            <div className={styles.doctorList}>
                                                {doctorsData.recommendedDoctors.map((doctor) =>
                                                    renderDoctorCard(doctor, false)
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Previous Doctors */}
                                    {doctorsData && doctorsData.previousDoctors.length > 0 && (
                                        <div className={styles.doctorGroup}>
                                            <h3>
                                                Bác sĩ đã khám trước đây (
                                                {doctorsData.totalPrevious})
                                            </h3>
                                            <p className={styles.groupDescription}>
                                                Bác sĩ đã từng khám cho bệnh nhân này
                                            </p>
                                            <div className={styles.doctorList}>
                                                {doctorsData.previousDoctors.map((doctor) =>
                                                    renderDoctorCard(doctor, true)
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* No Doctors */}
                                    {doctorsData?.recommendedDoctors.length === 0 &&
                                        doctorsData?.previousDoctors.length === 0 && (
                                            <div className={styles.noDoctors}>
                                                <User size={48} />
                                                <p>Không tìm thấy bác sĩ phù hợp</p>
                                            </div>
                                        )}
                                </>
                            )}
                        </div>

                        {/* Staff Note */}
                        <div className={styles.noteSection}>
                            <label htmlFor="staffNoteInput">Ghi chú (tùy chọn)</label>
                            <textarea
                                id="staffNoteInput"
                                value={staffNote}
                                onChange={(e) => setStaffNote(e.target.value)}
                                placeholder="Nhập ghi chú cho bệnh nhân..."
                                rows={3}
                            />
                        </div>

                        {/* Selected Doctor Summary */}
                        {selectedDoctor && (
                            <div className={styles.selectedSummary}>
                                <h4>Bác sĩ được chọn</h4>
                                <div className={styles.summaryContent}>
                                    <div className={styles.summaryAvatar}>
                                        {selectedDoctor.avatarUrl ? (
                                            <img
                                                src={selectedDoctor.avatarUrl}
                                                alt={selectedDoctor.fullName}
                                            />
                                        ) : (
                                            <User size={24} />
                                        )}
                                    </div>
                                    <div className={styles.summaryInfo}>
                                        <strong>{selectedDoctor.fullName}</strong>
                                        <span>
                                            {selectedDoctor.positionName} -{' '}
                                            {selectedDoctor.specialtyName}
                                        </span>
                                        <span className={styles.summaryFee}>
                                            {formatCurrency(selectedDoctor.consultationFee)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="modal-footer border-top">
                            <button
                                type="button"
                                className="btn btn-light me-2"
                                onClick={onHide}
                                disabled={isAssigning}
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                className="btn btn-info"
                                disabled={isAssigning || !selectedDoctorId}
                            >
                                {isAssigning ? 'Đang xử lý...' : 'Gán bác sĩ'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default AssignDoctorToAppointmentModal;
