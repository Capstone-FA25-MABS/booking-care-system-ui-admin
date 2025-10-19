import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { AppointmentService } from '@/services/appointment.service';
import { AppointmentCardData } from '@/types/appointment.types';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

interface Doctor {
    id: string;
    fullName: string;
    avatarUrl?: string;
    specialtyName?: string;
    positionName?: string;
    yearsOfExperience: number;
}

interface AvailableSlot {
    id: string;
    startTime: string;
    endTime: string;
}

interface AssignDoctorModalProps {
    show: boolean;
    onHide: () => void;
    appointment: AppointmentCardData | null;
    staffId: string;
    onSuccess?: () => void; // Callback to refresh appointment list after successful assignment
}

export const AssignDoctorModal: React.FC<AssignDoctorModalProps> = ({
    show,
    onHide,
    appointment,
    staffId,
    onSuccess,
}) => {
    const { hospitalProfile } = useSelector((state: RootState) => state.user);
    const [availableDoctors, setAvailableDoctors] = useState<Doctor[]>([]);
    const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
    const [newAppointmentDate, setNewAppointmentDate] = useState<string>('');
    const [newAppointmentTimeId, setNewAppointmentTimeId] = useState<string>('');
    const [cancellationReason, setCancellationReason] = useState<string>('');
    const [staffNote, setStaffNote] = useState<string>('');
    const [isAssigning, setIsAssigning] = useState(false);
    const [isFetchingDoctors, setIsFetchingDoctors] = useState(false);
    const [confirmationUrl, setConfirmationUrl] = useState<string>('');
    const [showSuccess, setShowSuccess] = useState(false);

    // New states for available slots
    const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
    const [isFetchingSlots, setIsFetchingSlots] = useState(false);

    // Time option: 'keep' = giữ nguyên khung giờ cũ, 'change' = chọn khung giờ khác
    const [timeOption, setTimeOption] = useState<'keep' | 'change'>('keep');

    // Handle time option change
    const handleTimeOptionChange = (option: 'keep' | 'change') => {
        setTimeOption(option);
        // Reset date/time when switching options
        setNewAppointmentDate('');
        setNewAppointmentTimeId('');
        setAvailableSlots([]);
        setSelectedDoctorId(''); // Also reset doctor selection to force re-selection
    };

    // Function to fetch available slots for selected doctor and date
    const fetchAvailableSlots = async (doctorId: string, date: string) => {
        if (!doctorId || !date) return;

        setIsFetchingSlots(true);
        try {
            const response = await AppointmentService.getAvailableSlots(doctorId, date);
            if (response.success && response.data) {
                // API returns array directly
                setAvailableSlots(response.data);
            } else {
                throw new Error(response.message || 'Không thể tải giờ khả dụng');
            }
        } catch (error: any) {
            console.error('Error fetching available slots:', error);
            toast.error(error.message || 'Không thể tải giờ khả dụng');
            setAvailableSlots([]);
        } finally {
            setIsFetchingSlots(false);
        }
    };

    // Fetch doctors based on time option
    const fetchDoctors = async (useOriginalTime: boolean) => {
        if (!appointment) return;

        // Check required fields
        if (!hospitalProfile?.id || !appointment.specialtyId) {
            toast.error('Thiếu thông tin bệnh viện hoặc chuyên khoa');
            return;
        }

        setIsFetchingDoctors(true);
        try {
            if (useOriginalTime) {
                // Option 1: Giữ khung giờ cũ - lấy bác sĩ available ở khung giờ cũ
                const response = await AppointmentService.getAvailableDoctors(
                    hospitalProfile?.id,
                    appointment.specialtyId,
                    appointment.appointmentDate,
                    appointment.appointmentTimeId,
                    true // checkAvailability = true
                );

                if (response.success && response.data) {
                    setAvailableDoctors(response.data.doctors);
                } else {
                    throw new Error(response.message || 'Không thể tải danh sách bác sĩ');
                }
            } else {
                // Option 2: Chọn khung giờ khác - lấy TẤT CẢ bác sĩ cùng chuyên khoa/bệnh viện
                const response = await AppointmentService.getAvailableDoctors(
                    hospitalProfile?.id,
                    appointment.specialtyId,
                    undefined, // No need to pass date
                    undefined, // No need to pass time
                    false // checkAvailability = false (get all doctors)
                );

                if (response.success && response.data) {
                    setAvailableDoctors(response.data.doctors);
                } else {
                    throw new Error(response.message || 'Không thể tải danh sách bác sĩ');
                }
            }
        } catch (error: any) {
            console.error('Error fetching doctors:', error);
            toast.error(error.message || 'Không thể tải danh sách bác sĩ');
            setAvailableDoctors([]);
        } finally {
            setIsFetchingDoctors(false);
        }
    };

    // Fetch available doctors when modal opens or time option changes
    useEffect(() => {
        if (show && appointment) {
            fetchDoctors(timeOption === 'keep');
        }
    }, [show, appointment, timeOption]);

    // Reset form when modal opens
    useEffect(() => {
        if (show) {
            setSelectedDoctorId('');
            setNewAppointmentDate('');
            setNewAppointmentTimeId('');
            setStaffNote('');
            setConfirmationUrl('');
            setShowSuccess(false);
            setAvailableDoctors([]);
            setAvailableSlots([]);
            setTimeOption('keep'); // Reset to default
        }
    }, [show]);

    // Fetch available slots when doctor and date are selected (only for 'change' option)
    useEffect(() => {
        if (timeOption === 'change' && selectedDoctorId && newAppointmentDate) {
            fetchAvailableSlots(selectedDoctorId, newAppointmentDate);
        } else {
            setAvailableSlots([]);
            if (timeOption === 'change') {
                setNewAppointmentTimeId(''); // Reset time selection only for change option
            }
        }
    }, [selectedDoctorId, newAppointmentDate, timeOption]);

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

        // Validate cancellation reason (required if appointment is not yet cancelled)
        if (appointment.status !== 'CANCELLED' && !cancellationReason.trim()) {
            toast.error('Vui lòng nhập lý do hủy lịch hẹn');
            return;
        }

        if (cancellationReason.trim() && cancellationReason.length < 10) {
            toast.error('Lý do hủy phải có ít nhất 10 ký tự');
            return;
        }

        setIsAssigning(true);

        try {
            const response = await AppointmentService.assignNewDoctor(
                appointment.appointmentId,
                selectedDoctorId,
                staffId,
                newAppointmentDate || undefined,
                newAppointmentTimeId || undefined,
                cancellationReason.trim() || undefined,
                staffNote || undefined
            );

            if (response.success && response.data) {
                setConfirmationUrl(response.data.confirmationUrl);
                setShowSuccess(true);
                toast.success('Đã gán bác sĩ mới và hủy lịch hẹn cũ thành công!');

                // Call success callback to refresh appointment list
                onSuccess?.();
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

    const handleCopyUrl = () => {
        if (confirmationUrl) {
            navigator.clipboard.writeText(confirmationUrl);
            toast.success('Đã sao chép link xác nhận!');
        }
    };

    const handleClose = () => {
        if (!isAssigning) {
            onHide();
        }
    };

    if (!show) return null;

    return (
        <>
            <div className="modal fade show d-block" tabIndex={-1}>
                <div className="modal-dialog modal-dialog-centered modal-lg">
                    <div className="modal-content">
                        <div className="modal-header border-bottom">
                            <h5 className="modal-title fw-bold">Gán Bác Sĩ Mới</h5>
                            <button
                                type="button"
                                className="btn-close"
                                onClick={handleClose}
                                disabled={isAssigning}
                                aria-label="Close"
                            ></button>
                        </div>

                        {showSuccess ? (
                            <>
                                <div className="modal-body">
                                    <div className="alert alert-success d-flex align-items-center">
                                        <i className="ti ti-circle-check fs-3 me-2"></i>
                                        <div>
                                            <strong>Thành công!</strong> Đã gán bác sĩ mới cho lịch
                                            hẹn.
                                            <br />
                                            <small>Bệnh nhân sẽ nhận được email thông báo.</small>
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">
                                            Link xác nhận cho bệnh nhân:
                                        </label>
                                        <div className="input-group">
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={confirmationUrl}
                                                readOnly
                                            />
                                            <button
                                                type="button"
                                                className="btn btn-primary"
                                                onClick={handleCopyUrl}
                                            >
                                                <i className="ti ti-copy me-1"></i>
                                                Sao chép
                                            </button>
                                        </div>
                                        <small className="text-muted">
                                            Link có hiệu lực trong 48 giờ
                                        </small>
                                    </div>

                                    <div className="alert alert-info">
                                        <i className="ti ti-info-circle me-2"></i>
                                        <strong>Lưu ý:</strong> Lịch hẹn của bác sĩ đã được khóa tạm
                                        thời (soft lock) trong 48 giờ. Nếu bệnh nhân không xác nhận,
                                        slot sẽ tự động được giải phóng.
                                    </div>
                                </div>

                                <div className="modal-footer border-top">
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        onClick={onHide}
                                    >
                                        Đóng
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="modal-body">
                                    {appointment && (
                                        <div className="alert alert-light border mb-3">
                                            <div className="d-flex justify-content-between">
                                                <span className="text-dark fw-semibold">
                                                    Lịch hẹn:
                                                </span>
                                                <span className="badge bg-primary">
                                                    #{appointment.appointmentId.substring(0, 8)}
                                                </span>
                                            </div>
                                            <div className="d-flex justify-content-between mt-2">
                                                <span className="text-muted">Bệnh nhân:</span>
                                                <span className="fw-medium">
                                                    {appointment.patientInfo?.firstName}{' '}
                                                    {appointment.patientInfo?.lastName}
                                                </span>
                                            </div>
                                            <div className="d-flex justify-content-between mt-1">
                                                <span className="text-muted">Chuyên khoa:</span>
                                                <span className="fw-medium">
                                                    {appointment.doctorInfo?.specialtyName ||
                                                        'Chưa rõ'}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    <form onSubmit={handleSubmit}>
                                        {/* Time Option Selection */}
                                        <div className="mb-4 p-3 border rounded bg-light">
                                            <h6 className="fw-bold mb-3">
                                                <i className="ti ti-clock me-2"></i>
                                                Lựa chọn khung giờ
                                            </h6>
                                            <div className="form-check mb-2">
                                                <input
                                                    className="form-check-input"
                                                    type="radio"
                                                    name="timeOption"
                                                    id="timeOption-keep"
                                                    checked={timeOption === 'keep'}
                                                    onChange={() => handleTimeOptionChange('keep')}
                                                    disabled={isAssigning}
                                                />
                                                <label
                                                    className="form-check-label"
                                                    htmlFor="timeOption-keep"
                                                >
                                                    <strong>Giữ nguyên khung giờ cũ</strong>
                                                    <br />
                                                    <small className="text-muted">
                                                        Chỉ hiển thị bác sĩ khả dụng ở khung giờ:{' '}
                                                        {appointment?.appointmentTime}
                                                    </small>
                                                </label>
                                            </div>
                                            <div className="form-check">
                                                <input
                                                    className="form-check-input"
                                                    type="radio"
                                                    name="timeOption"
                                                    id="timeOption-change"
                                                    checked={timeOption === 'change'}
                                                    onChange={() =>
                                                        handleTimeOptionChange('change')
                                                    }
                                                    disabled={isAssigning}
                                                />
                                                <label
                                                    className="form-check-label"
                                                    htmlFor="timeOption-change"
                                                >
                                                    <strong>Chọn khung giờ khác</strong>
                                                    <br />
                                                    <small className="text-muted">
                                                        Hiển thị tất cả bác sĩ cùng chuyên khoa/bệnh
                                                        viện
                                                    </small>
                                                </label>
                                            </div>
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label fw-semibold">
                                                Chọn bác sĩ mới{' '}
                                                <span className="text-danger">*</span>
                                            </label>
                                            <select
                                                className="form-select"
                                                value={selectedDoctorId}
                                                onChange={(e) =>
                                                    setSelectedDoctorId(e.target.value)
                                                }
                                                required
                                                disabled={isAssigning || isFetchingDoctors}
                                            >
                                                <option value="">
                                                    {isFetchingDoctors
                                                        ? '-- Đang tải...'
                                                        : availableDoctors.length === 0
                                                          ? '-- Không có bác sĩ khả dụng --'
                                                          : '-- Chọn bác sĩ --'}
                                                </option>
                                                {availableDoctors.map((doctor) => (
                                                    <option key={doctor.id} value={doctor.id}>
                                                        {doctor.fullName}
                                                        {doctor.positionName &&
                                                            ` - ${doctor.positionName}`}
                                                        {doctor.yearsOfExperience > 0 &&
                                                            ` (${doctor.yearsOfExperience} năm KN)`}
                                                    </option>
                                                ))}
                                            </select>
                                            <small className="text-muted">
                                                {isFetchingDoctors
                                                    ? 'Đang tải danh sách bác sĩ...'
                                                    : timeOption === 'keep'
                                                      ? `Chỉ hiển thị ${availableDoctors.length} bác sĩ khả dụng ở khung giờ cũ`
                                                      : `Hiển thị ${availableDoctors.length} bác sĩ cùng chuyên khoa/bệnh viện`}
                                            </small>
                                        </div>

                                        {/* Date/Time inputs - Only show when changing time */}
                                        {timeOption === 'change' && (
                                            <div className="row">
                                                <div className="col-md-6 mb-3">
                                                    <label className="form-label fw-semibold">
                                                        Ngày khám mới{' '}
                                                        <span className="text-danger">*</span>
                                                    </label>
                                                    <input
                                                        type="date"
                                                        className="form-control"
                                                        value={newAppointmentDate}
                                                        onChange={(e) =>
                                                            setNewAppointmentDate(e.target.value)
                                                        }
                                                        disabled={isAssigning || !selectedDoctorId}
                                                        min={new Date().toISOString().split('T')[0]} // Only future dates
                                                        required
                                                    />
                                                    <small className="text-muted">
                                                        {!selectedDoctorId
                                                            ? 'Vui lòng chọn bác sĩ trước'
                                                            : 'Chỉ có thể chọn ngày trong tương lai'}
                                                    </small>
                                                </div>

                                                <div className="col-md-6 mb-3">
                                                    <label className="form-label fw-semibold">
                                                        Giờ khám mới{' '}
                                                        <span className="text-danger">*</span>
                                                    </label>
                                                    <select
                                                        className="form-select"
                                                        value={newAppointmentTimeId}
                                                        onChange={(e) =>
                                                            setNewAppointmentTimeId(e.target.value)
                                                        }
                                                        disabled={
                                                            isAssigning ||
                                                            !selectedDoctorId ||
                                                            !newAppointmentDate
                                                        }
                                                        required
                                                    >
                                                        <option value="">
                                                            -- Chọn giờ khám --
                                                        </option>
                                                        {availableSlots?.map((slot) => (
                                                            <option key={slot.id} value={slot.id}>
                                                                {slot.startTime} - {slot.endTime}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <small className="text-muted">
                                                        {!selectedDoctorId
                                                            ? 'Vui lòng chọn bác sĩ trước'
                                                            : !newAppointmentDate
                                                              ? 'Vui lòng chọn ngày trước'
                                                              : isFetchingSlots
                                                                ? 'Đang tải giờ khả dụng...'
                                                                : !availableSlots ||
                                                                    availableSlots.length === 0
                                                                  ? 'Không có giờ khả dụng cho ngày này'
                                                                  : `Có ${availableSlots?.length || 0} giờ khả dụng`}
                                                    </small>
                                                </div>
                                            </div>
                                        )}

                                        {/* Cancellation Reason - Required if appointment not yet cancelled */}
                                        {appointment?.status !== 'CANCELLED' && (
                                            <div className="mb-3">
                                                <label className="form-label fw-semibold">
                                                    Lý do hủy lịch hẹn cũ{' '}
                                                    <span className="text-danger">*</span>
                                                </label>
                                                <textarea
                                                    className="form-control"
                                                    rows={3}
                                                    value={cancellationReason}
                                                    onChange={(e) =>
                                                        setCancellationReason(e.target.value)
                                                    }
                                                    placeholder="Vui lòng nhập lý do hủy lịch hẹn cũ (tối thiểu 10 ký tự)..."
                                                    disabled={isAssigning}
                                                    required
                                                    minLength={10}
                                                    maxLength={500}
                                                />
                                                <small className="text-muted">
                                                    Tối thiểu 10 ký tự, tối đa 500 ký tự
                                                </small>
                                            </div>
                                        )}

                                        <div className="mb-3">
                                            <label className="form-label fw-semibold">
                                                Ghi chú cho bệnh nhân (tuỳ chọn)
                                            </label>
                                            <textarea
                                                className="form-control"
                                                rows={3}
                                                value={staffNote}
                                                onChange={(e) => setStaffNote(e.target.value)}
                                                placeholder="Ví dụ: Bác sĩ mới có cùng chuyên môn và kinh nghiệm..."
                                                disabled={isAssigning}
                                                maxLength={500}
                                            />
                                            <small className="text-muted">Tối đa 500 ký tự</small>
                                        </div>
                                    </form>
                                </div>

                                <div className="modal-footer border-top">
                                    <button
                                        type="button"
                                        className="btn btn-light"
                                        onClick={handleClose}
                                        disabled={isAssigning}
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        onClick={handleSubmit}
                                        disabled={isAssigning || !selectedDoctorId}
                                    >
                                        {isAssigning ? (
                                            <>
                                                <span
                                                    className="spinner-border spinner-border-sm me-2"
                                                    role="status"
                                                ></span>
                                                Đang xử lý...
                                            </>
                                        ) : (
                                            <>
                                                <i className="ti ti-user-check me-1"></i>
                                                Xác nhận gán
                                            </>
                                        )}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
            {show && <div className="modal-backdrop fade show"></div>}
        </>
    );
};

export default AssignDoctorModal;
