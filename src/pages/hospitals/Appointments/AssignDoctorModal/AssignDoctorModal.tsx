import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { Star, Award, Briefcase, CheckCircle, XCircle, User } from 'lucide-react';
import { AppointmentService } from '@/services/appointment.service';
import {
    AppointmentCardData,
    getActualPatientName,
    DoctorForAssignment,
    DoctorsForAssignmentResponse,
} from '@/types/appointment.types';
import { AppointmentTime } from '@/enums/appointment.enums';

interface AvailableSlot {
    id: string;
    startTime: string;
    endTime: string;
}

// Helper function to convert AvailableSlot to AppointmentTime enum
const convertSlotToAppointmentTime = (slot: AvailableSlot): AppointmentTime | null => {
    const { startTime, endTime } = slot;
    const formatTime = (time: string) => time.replace(':', '_');
    const appointmentTimeId = `AT_${formatTime(startTime)}_${formatTime(endTime)}`;
    if (Object.values(AppointmentTime).includes(appointmentTimeId as AppointmentTime)) {
        return appointmentTimeId as AppointmentTime;
    }
    return null;
};

// Helper function to format currency
const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(amount);
};

// Helper function to check if a slot is valid for today (must be at least 2 hours from now)
const isSlotValidForToday = (slot: AvailableSlot, selectedDate: string): boolean => {
    const today = new Date().toISOString().split('T')[0];

    // If not today, all slots are valid
    if (selectedDate !== today) {
        return true;
    }

    // Parse slot start time (format: "08:00")
    const [hours, minutes] = slot.startTime.split(':').map(Number);
    const slotTime = new Date();
    slotTime.setHours(hours, minutes, 0, 0);

    // Current time + 2 hours
    const minValidTime = new Date();
    minValidTime.setHours(minValidTime.getHours() + 2);

    return slotTime >= minValidTime;
};

// Helper function to filter slots based on date validation
const filterValidSlots = (slots: AvailableSlot[], selectedDate: string): AvailableSlot[] => {
    return slots.filter((slot) => isSlotValidForToday(slot, selectedDate));
};

interface AssignDoctorModalProps {
    show: boolean;
    onHide: () => void;
    appointment: AppointmentCardData | null;
    staffId: string;
    onSuccess?: () => void;
}

export const AssignDoctorModal: React.FC<AssignDoctorModalProps> = ({
    show,
    onHide,
    appointment,
    staffId,
    onSuccess,
}) => {
    // State for doctors data (new API response format)
    const [doctorsData, setDoctorsData] = useState<DoctorsForAssignmentResponse | null>(null);
    const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
    const [newAppointmentDate, setNewAppointmentDate] = useState<string>('');
    const [newAppointmentTimeId, setNewAppointmentTimeId] = useState<AppointmentTime | ''>('');
    const [cancellationReason, setCancellationReason] = useState<string>('');
    const [staffNote, setStaffNote] = useState<string>('');
    const [isAssigning, setIsAssigning] = useState(false);
    const [isFetchingDoctors, setIsFetchingDoctors] = useState(false);
    const [confirmationUrl, setConfirmationUrl] = useState<string>('');
    const [showSuccess, setShowSuccess] = useState(false);

    // States for available slots (timeOption = change)
    const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
    const [isFetchingSlots, setIsFetchingSlots] = useState(false);

    // Time option: 'keep' = giữ nguyên khung giờ cũ, 'change' = chọn khung giờ khác
    const [timeOption, setTimeOption] = useState<'keep' | 'change'>('keep');

    // Handle time option change
    const handleTimeOptionChange = (option: 'keep' | 'change') => {
        setTimeOption(option);
        setNewAppointmentDate('');
        setNewAppointmentTimeId('');
        setAvailableSlots([]);
        setSelectedDoctorId('');
        setDoctorsData(null);
    };

    // Fetch doctors using new API getDoctorsForAssignment
    const fetchDoctors = useCallback(
        async (checkAvailability: boolean) => {
            if (!appointment?.appointmentId) return;

            setIsFetchingDoctors(true);
            try {
                const response = await AppointmentService.getDoctorsForAssignment(
                    appointment.appointmentId,
                    checkAvailability
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
                setIsFetchingDoctors(false);
            }
        },
        [appointment?.appointmentId]
    );

    // Fetch available slots for selected doctor and date
    const fetchAvailableSlots = async (doctorId: string, date: string) => {
        if (!doctorId || !date) return;

        setIsFetchingSlots(true);
        try {
            const response = await AppointmentService.getAvailableSlots(doctorId, date);
            if (response.success && response.data) {
                const validSlots = response.data
                    .map((slot: any) => ({
                        id: slot.id,
                        startTime: slot.startTime,
                        endTime: slot.endTime,
                    }))
                    .filter((slot: AvailableSlot) => convertSlotToAppointmentTime(slot) !== null);

                // Filter slots for today: must be at least 2 hours from now
                const filteredSlots = filterValidSlots(validSlots, date);
                setAvailableSlots(filteredSlots);
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

    // Fetch doctors when modal opens or time option changes
    useEffect(() => {
        if (show && appointment) {
            // timeOption = 'keep' -> checkAvailability = true
            // timeOption = 'change' -> checkAvailability = false (show all doctors)
            fetchDoctors(timeOption === 'keep');
        }
    }, [show, appointment, timeOption, fetchDoctors]);

    // Reset form when modal opens
    useEffect(() => {
        if (show) {
            setSelectedDoctorId('');
            setNewAppointmentDate('');
            setNewAppointmentTimeId('');
            setStaffNote('');
            setCancellationReason('');
            setConfirmationUrl('');
            setShowSuccess(false);
            setDoctorsData(null);
            setAvailableSlots([]);
            setTimeOption('keep');
        }
    }, [show]);

    // Fetch available slots when doctor and date are selected (only for 'change' option)
    useEffect(() => {
        if (timeOption === 'change' && selectedDoctorId && newAppointmentDate) {
            fetchAvailableSlots(selectedDoctorId, newAppointmentDate);
        } else {
            setAvailableSlots([]);
            if (timeOption === 'change') {
                setNewAppointmentTimeId('');
            }
        }
    }, [selectedDoctorId, newAppointmentDate, timeOption]);

    // Get all doctors from both recommended and previous lists
    const getAllDoctors = (): DoctorForAssignment[] => {
        if (!doctorsData) return [];
        return [...doctorsData.recommendedDoctors, ...doctorsData.previousDoctors];
    };

    // Check if doctor can be selected based on timeOption
    const canSelectDoctor = (doctor: DoctorForAssignment): boolean => {
        if (timeOption === 'keep') {
            // Only allow selecting available doctors at original time
            return doctor.isAvailableAtOriginalTime;
        }
        // For 'change' option, all doctors can be selected
        return true;
    };

    // Helper function to get slot helper text - extracted to avoid nested ternary
    const getSlotHelperText = (): string => {
        if (!selectedDoctorId) return 'Vui lòng chọn bác sĩ trước';
        if (!newAppointmentDate) return 'Vui lòng chọn ngày trước';
        if (isFetchingSlots) return 'Đang tải giờ khả dụng...';
        return `Có ${availableSlots.length} giờ khả dụng`;
    };

    // Handle doctor selection
    const handleDoctorSelect = (doctorId: string) => {
        const doctor = getAllDoctors().find((d) => d.id === doctorId);
        if (doctor && !canSelectDoctor(doctor)) {
            toast.warning('Bác sĩ này không khả dụng ở khung giờ hiện tại');
            return;
        }
        setSelectedDoctorId(doctorId);
        // Reset date/time when changing doctor in 'change' mode
        if (timeOption === 'change') {
            setNewAppointmentDate('');
            setNewAppointmentTimeId('');
            setAvailableSlots([]);
        }
    };

    // Validate form data
    const validateFormData = (): string | null => {
        if (!selectedDoctorId) {
            return 'Vui lòng chọn bác sĩ';
        }
        if (!appointment?.appointmentId) {
            return 'Không tìm thấy thông tin lịch hẹn';
        }
        if (appointment.status !== 'CANCELLED' && !cancellationReason.trim()) {
            return 'Vui lòng nhập lý do hủy lịch hẹn';
        }
        if (cancellationReason.trim() && cancellationReason.length < 10) {
            return 'Lý do hủy phải có ít nhất 10 ký tự';
        }
        if (timeOption === 'change') {
            if (!newAppointmentDate) {
                return 'Vui lòng chọn ngày khám mới';
            }
            if (!newAppointmentTimeId) {
                return 'Vui lòng chọn giờ khám mới';
            }
        }
        return null;
    };

    // Handle form submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const validationError = validateFormData();
        if (validationError) {
            toast.error(validationError);
            return;
        }

        setIsAssigning(true);
        try {
            const response = await AppointmentService.assignNewDoctor(
                appointment!.appointmentId,
                selectedDoctorId,
                staffId,
                timeOption === 'change' ? newAppointmentDate : undefined,
                timeOption === 'change' ? String(newAppointmentTimeId) : undefined,
                cancellationReason.trim() || undefined,
                staffNote || undefined
            );

            if (response.success && response.data) {
                setConfirmationUrl(response.data.confirmationUrl);
                setShowSuccess(true);
                toast.success('Đã gán bác sĩ mới và hủy lịch hẹn cũ thành công!');
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

    // Render doctor card (new UI similar to AssignDoctorToAppointmentModal)
    const renderDoctorCard = (doctor: DoctorForAssignment, isPrevious: boolean = false) => {
        const isSelected = selectedDoctorId === doctor.id;
        const isAvailable = timeOption === 'keep' ? doctor.isAvailableAtOriginalTime : true;

        return (
            <button
                type="button"
                key={doctor.id}
                aria-pressed={isSelected}
                disabled={!isAvailable}
                className={`card mb-2 w-100 text-start ${isSelected ? 'border-primary bg-light' : ''} ${
                    isAvailable ? '' : 'opacity-50'
                }`}
                style={{ cursor: isAvailable ? 'pointer' : 'not-allowed' }}
                onClick={() => handleDoctorSelect(doctor.id)}
            >
                <div className="card-body p-3">
                    <div className="d-flex align-items-start">
                        <div className="me-3">
                            {doctor.avatarUrl ? (
                                <img
                                    src={doctor.avatarUrl}
                                    alt={doctor.fullName}
                                    className="rounded-circle"
                                    style={{ width: 48, height: 48, objectFit: 'cover' }}
                                />
                            ) : (
                                <div
                                    className="rounded-circle bg-secondary d-flex align-items-center justify-content-center"
                                    style={{ width: 48, height: 48 }}
                                >
                                    <User size={24} className="text-white" />
                                </div>
                            )}
                        </div>
                        <div className="flex-grow-1">
                            <div className="d-flex justify-content-between align-items-start">
                                <div>
                                    <h6 className="mb-1 fw-bold">
                                        {doctor.fullName}
                                        {isPrevious && (
                                            <span
                                                className="badge bg-info ms-2"
                                                title="Bác sĩ đã khám trước đây"
                                            >
                                                <CheckCircle size={12} className="me-1" />
                                                Đã khám
                                            </span>
                                        )}
                                    </h6>
                                    <p className="mb-1 text-muted small">
                                        {doctor.positionName} - {doctor.specialtyName}
                                    </p>
                                </div>
                                {isSelected && <CheckCircle size={20} className="text-success" />}
                            </div>
                            <div className="d-flex flex-wrap gap-2 mt-2">
                                <span className="badge bg-light text-dark">
                                    <Briefcase size={12} className="me-1" />
                                    {doctor.yearsOfExperience} năm KN
                                </span>
                                <span className="badge bg-light text-dark">
                                    <Star size={12} className="me-1" />
                                    {doctor.rating.toFixed(1)} ({doctor.reviewCount})
                                </span>
                                <span className="badge bg-light text-dark">
                                    <Award size={12} className="me-1" />
                                    {doctor.bookingCount} lượt khám
                                </span>
                            </div>
                            <div className="mt-2 d-flex justify-content-between align-items-center">
                                <span className="fw-semibold text-primary">
                                    {formatCurrency(doctor.consultationFee)}
                                </span>
                                {timeOption === 'keep' && (
                                    <span
                                        className={`badge ${isAvailable ? 'bg-success' : 'bg-danger'}`}
                                    >
                                        {isAvailable ? (
                                            <>
                                                <CheckCircle size={12} className="me-1" />
                                                Khả dụng
                                            </>
                                        ) : (
                                            <>
                                                <XCircle size={12} className="me-1" />
                                                Không khả dụng
                                            </>
                                        )}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </button>
        );
    };

    if (!show) return null;

    return (
        <>
            <div className="modal fade show d-block" tabIndex={-1}>
                <div className="modal-dialog modal-dialog-centered modal-lg">
                    <div className="modal-content">
                        <div className="modal-header border-bottom">
                            <h5 className="modal-title fw-bold">Gán bác sĩ mới</h5>
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
                                        <i
                                            className="ti ti-circle-check fs-3 me-2"
                                            aria-hidden="true"
                                        ></i>
                                        <div>
                                            <strong>Thành công!</strong> Đã gán bác sĩ mới cho lịch
                                            hẹn.
                                            <br />
                                            <small>Bệnh nhân sẽ nhận được email thông báo.</small>
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <label
                                            htmlFor="confirmation-url"
                                            className="form-label fw-semibold"
                                        >
                                            Link xác nhận cho bệnh nhân:
                                        </label>
                                        <div className="input-group">
                                            <input
                                                id="confirmation-url"
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
                                                <i
                                                    className="ti ti-copy me-1"
                                                    aria-hidden="true"
                                                ></i>{' '}
                                                Sao chép
                                            </button>
                                        </div>
                                        <small className="text-muted">
                                            Link có hiệu lực trong 48 giờ
                                        </small>
                                    </div>

                                    <div className="alert alert-info">
                                        <i
                                            className="ti ti-info-circle me-2"
                                            aria-hidden="true"
                                        ></i>
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
                                                    {getActualPatientName(appointment)}
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
                                                <i
                                                    className="ti ti-clock me-2"
                                                    aria-hidden="true"
                                                ></i>{' '}
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

                                        {/* Doctor Selection - New Card UI */}
                                        <div className="mb-3">
                                            <label className="form-label fw-semibold">
                                                Chọn bác sĩ mới{' '}
                                                <span className="text-danger">*</span>
                                            </label>

                                            {isFetchingDoctors ? (
                                                <div className="text-center py-4">
                                                    <output
                                                        className="spinner-border text-primary"
                                                        aria-hidden="true"
                                                    >
                                                        <span className="visually-hidden">
                                                            Đang tải...
                                                        </span>
                                                    </output>
                                                    <p className="mt-2 text-muted">
                                                        Đang tải danh sách bác sĩ...
                                                    </p>
                                                </div>
                                            ) : (
                                                <div
                                                    style={{
                                                        maxHeight: '300px',
                                                        overflowY: 'auto',
                                                    }}
                                                >
                                                    {/* Recommended Doctors */}
                                                    {doctorsData &&
                                                        doctorsData.recommendedDoctors.length >
                                                            0 && (
                                                            <div className="mb-3">
                                                                <h6 className="text-muted mb-2">
                                                                    Bác sĩ đề xuất (
                                                                    {doctorsData.totalRecommended})
                                                                </h6>
                                                                {doctorsData.recommendedDoctors.map(
                                                                    (doctor) =>
                                                                        renderDoctorCard(
                                                                            doctor,
                                                                            false
                                                                        )
                                                                )}
                                                            </div>
                                                        )}

                                                    {/* Previous Doctors */}
                                                    {doctorsData &&
                                                        doctorsData.previousDoctors.length > 0 && (
                                                            <div className="mb-3">
                                                                <h6 className="text-muted mb-2">
                                                                    Bác sĩ đã khám trước đây (
                                                                    {doctorsData.totalPrevious})
                                                                </h6>
                                                                {doctorsData.previousDoctors.map(
                                                                    (doctor) =>
                                                                        renderDoctorCard(
                                                                            doctor,
                                                                            true
                                                                        )
                                                                )}
                                                            </div>
                                                        )}

                                                    {/* No Doctors */}
                                                    {(!doctorsData ||
                                                        (doctorsData.recommendedDoctors.length ===
                                                            0 &&
                                                            doctorsData.previousDoctors.length ===
                                                                0)) && (
                                                        <div className="text-center py-4 text-muted">
                                                            <User size={48} className="mb-2" />
                                                            <p>Không tìm thấy bác sĩ phù hợp</p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
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
                                                        min={new Date().toISOString().split('T')[0]}
                                                        required
                                                    />
                                                    <small className="text-muted">
                                                        {selectedDoctorId
                                                            ? 'Chỉ có thể chọn ngày trong tương lai'
                                                            : 'Vui lòng chọn bác sĩ trước'}
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
                                                        onChange={(e) => {
                                                            const value = e.target.value;
                                                            const appointmentTime = Object.values(
                                                                AppointmentTime
                                                            ).includes(value as AppointmentTime)
                                                                ? (value as AppointmentTime)
                                                                : '';
                                                            setNewAppointmentTimeId(
                                                                appointmentTime
                                                            );
                                                        }}
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
                                                        {availableSlots?.map((slot) => {
                                                            const appointmentTime =
                                                                convertSlotToAppointmentTime(slot);
                                                            return (
                                                                <option
                                                                    key={slot.id}
                                                                    value={
                                                                        appointmentTime || slot.id
                                                                    }
                                                                >
                                                                    {slot.startTime} -{' '}
                                                                    {slot.endTime}
                                                                </option>
                                                            );
                                                        })}
                                                    </select>
                                                    <small className="text-muted">
                                                        {getSlotHelperText()}
                                                    </small>
                                                </div>
                                            </div>
                                        )}

                                        {/* Cancellation Reason - Required if appointment not yet cancelled */}
                                        {appointment?.status !== 'CANCELLED' && (
                                            <div className="mb-3">
                                                <label
                                                    htmlFor="cancellation-reason"
                                                    className="form-label fw-semibold"
                                                >
                                                    Lý do hủy lịch hẹn cũ{' '}
                                                    <span className="text-danger">*</span>
                                                </label>
                                                <textarea
                                                    id="cancellation-reason"
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
                                            <label
                                                htmlFor="staff-note"
                                                className="form-label fw-semibold"
                                            >
                                                Ghi chú cho bệnh nhân (tuỳ chọn)
                                            </label>
                                            <textarea
                                                id="staff-note"
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
                                                <output
                                                    className="spinner-border spinner-border-sm me-2"
                                                    aria-label="Đang xử lý"
                                                ></output>
                                                Đang xử lý...
                                            </>
                                        ) : (
                                            <>
                                                <i
                                                    className="ti ti-user-check me-1"
                                                    aria-hidden="true"
                                                ></i>{' '}
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
