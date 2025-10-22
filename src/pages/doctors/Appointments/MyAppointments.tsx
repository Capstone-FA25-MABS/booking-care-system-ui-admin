import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Skeleton, Stack } from '@mui/material';
import Pagination from '@/components/Pagination';
import ModalDelete from '@/components/ModalDelete';
import ModalFilter from '@/components/ModalFilter';
import StatusBadge from '@/components/StatusBadge';
import {
    AppointmentCardData,
    AppointmentQueryRequest,
    transformToCardData,
    isNewAppointment,
    mapUITabToStatus,
    getAppointmentTypeText,
    formatFullName,
    AppointmentUITab,
} from '@/types/appointment.types';
import { fetchAndTransformAppointments } from '@/utils/appointment-management-utils';
import { AppFooter } from '@/components/AppFooter';
import { AppointmentType } from '@/enums/appointment.enums';
import { Role } from '@/enums/common.enums';
import { RootState } from '@/store';

// Import images
import user01 from '@/assets/img/users/user-01.jpg';

// Table Skeleton Component
const AppointmentTableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
    return (
        <>
            {Array.from({ length: rows }, (_, index) => (
                <tr key={`skeleton-row-${index}`}>
                    {/* Date & Time Column */}
                    <td>
                        <Stack spacing={0.5}>
                            <Skeleton variant="text" width={100} height={16} />
                            <Skeleton variant="text" width={80} height={14} />
                        </Stack>
                    </td>

                    {/* Patient Column */}
                    <td>
                        <Stack direction="row" alignItems="center" spacing={1.5}>
                            <Skeleton
                                variant="circular"
                                width={40}
                                height={40}
                                sx={{ borderRadius: '50%' }}
                            />
                            <Stack spacing={0.5}>
                                <Skeleton variant="text" width={120} height={16} />
                                <Skeleton variant="text" width={100} height={14} />
                            </Stack>
                        </Stack>
                    </td>

                    {/* Type Column */}
                    <td>
                        <Skeleton variant="text" width={80} height={16} />
                    </td>

                    {/* Status Column */}
                    <td>
                        <Skeleton
                            variant="rectangular"
                            width={90}
                            height={24}
                            sx={{ borderRadius: '12px' }}
                        />
                    </td>

                    {/* Actions Column */}
                    <td className="action-item">
                        <Skeleton variant="circular" width={24} height={24} />
                    </td>
                </tr>
            ))}
        </>
    );
};

// Constants
const NO_APPOINTMENTS_MESSAGE = 'Không có lịch hẹn nào';
const PATIENT_DETAILS_PATH = '/doctors-patient-details';

const MyAppointments: React.FC = () => {
    // Get auth and doctor profile from Redux
    const { roles } = useSelector((state: RootState) => state.auth);
    const { doctorProfile } = useSelector((state: RootState) => state.user);

    // API data states
    const [appointments, setAppointments] = useState<AppointmentCardData[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);
    const [showViewDetails, setShowViewDetails] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState<AppointmentCardData | null>(
        null
    );

    // Filter states
    const [selectedTypes, setSelectedTypes] = useState<AppointmentType[]>([]);
    const [selectedDateRange, setSelectedDateRange] = useState<{
        start: Date | null;
        end: Date | null;
    }>({ start: null, end: null });

    // Status tab state
    const [activeStatusTab, setActiveStatusTab] = useState<AppointmentUITab>('waiting');

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Tab counts
    const [tabCounts, setTabCounts] = useState({
        waiting: 0,
        upcoming: 0,
        cancelled: 0,
        completed: 0,
    });

    // Validate doctor profile before fetching appointments
    useEffect(() => {
        const primaryRole = roles[0]?.toUpperCase();

        // Check if doctor profile is loaded
        if (primaryRole === Role.DOCTOR && !doctorProfile) {
            console.warn('Doctor profile not loaded yet');
        }
    }, [roles, doctorProfile]);

    // Helper function to validate doctor profile
    const validateDoctorProfile = () => {
        const primaryRole = roles[0]?.toUpperCase();
        if (primaryRole === Role.DOCTOR && !doctorProfile) {
            console.warn('Doctor profile not available, skipping appointment fetch');
            return false;
        }
        if (!doctorProfile?.id) {
            console.warn('Doctor ID not available');
            toast.warning('Không tìm thấy thông tin bác sĩ');
            return false;
        }
        return true;
    };

    // Helper function to build query request
    const buildQueryRequest = (): AppointmentQueryRequest => {
        const query: AppointmentQueryRequest = {
            doctorId: doctorProfile!.id,
            status: mapUITabToStatus(activeStatusTab),
            fromDate: selectedDateRange.start?.toISOString().split('T')[0] || undefined,
            toDate: selectedDateRange.end?.toISOString().split('T')[0] || undefined,
            pageNumber: currentPage,
            pageSize: itemsPerPage,
            sortBy: 'CreatedAt',
            sortDescending: true,
            includeStatusCounts: true,
        };

        if (selectedTypes.length > 0) {
            query.appointmentType = selectedTypes[0];
        }

        return query;
    };

    // Fetch appointments from API
    useEffect(() => {
        const fetchAppointments = async () => {
            if (!validateDoctorProfile()) return;

            setIsLoading(true);
            setApiError(null);

            const query = buildQueryRequest();

            // Call API for management
            await fetchAndTransformAppointments(query, transformToCardData, isNewAppointment, {
                setAppointments,
                setTotalCount,
                setTabCounts,
                setApiError,
                setIsLoading,
            });
        };

        fetchAppointments();
    }, [
        activeStatusTab,
        selectedDateRange.start,
        selectedDateRange.end,
        selectedTypes,
        currentPage,
        itemsPerPage,
        roles,
        doctorProfile?.id,
    ]);

    const handleDeleteConfirm = () => {
        if (selectedAppointment) {
            setAppointments(
                appointments.filter(
                    (apt) => apt.appointmentId !== selectedAppointment.appointmentId
                )
            );
            toast.success('Xóa lịch hẹn thành công');
        }
        setShowDeleteModal(false);
        setSelectedAppointment(null);
    };

    const handleViewClick = (appointment: AppointmentCardData) => {
        setSelectedAppointment(appointment);
        setShowViewDetails(true);
    };

    const handleDeleteClick = (appointment: AppointmentCardData) => {
        setSelectedAppointment(appointment);
        setShowDeleteModal(true);
    };

    const handleFilterSubmit = () => {
        // Filters are now applied via API, so just close modal and reset to page 1
        setCurrentPage(1);
        setShowFilterModal(false);
    };

    const handleClearFilters = () => {
        setSelectedTypes([]);
        setSelectedDateRange({ start: null, end: null });
        setCurrentPage(1);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    // Calculate total pages based on API response
    const totalPages = Math.ceil(totalCount / itemsPerPage);

    // Get appointment counts for tabs - using tabCounts state
    const appointmentCounts = tabCounts;

    return (
        <>
            <div className="content">
                {/* Start Page Header */}
                <div className="d-flex align-items-sm-center flex-sm-row flex-column gap-2 pb-3 mb-3 border-1 border-bottom">
                    <div className="flex-grow-1">
                        <h4 className="fw-semibold mb-0">Lịch Hẹn Của Tôi</h4>
                        {doctorProfile && (
                            <p className="text-muted mb-0">
                                BS. {doctorProfile.firstName} {doctorProfile.lastName}
                            </p>
                        )}
                    </div>
                    <div className="text-end d-flex">
                        <button
                            type="button"
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => setShowFilterModal(true)}
                        >
                            <i className="ti ti-filter me-1" aria-hidden="true"></i> Lọc
                        </button>
                    </div>
                </div>
                {/* End Page Header */}

                {/* Start Filter */}
                <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-3 mb-3">
                    {/* Status Tabs */}
                    <div className="d-flex gap-2">
                        <button
                            type="button"
                            className={`btn ${activeStatusTab === 'waiting' ? 'btn-primary' : 'btn-light'}`}
                            onClick={() => {
                                setActiveStatusTab('waiting');
                                setCurrentPage(1);
                            }}
                        >
                            Chờ xử lý{' '}
                            <span
                                className={`badge ${activeStatusTab === 'waiting' ? 'bg-white text-primary' : 'bg-secondary text-white'} ms-2`}
                            >
                                {appointmentCounts.waiting}
                            </span>
                        </button>
                        <button
                            type="button"
                            className={`btn ${activeStatusTab === 'upcoming' ? 'btn-primary' : 'btn-light'}`}
                            onClick={() => {
                                setActiveStatusTab('upcoming');
                                setCurrentPage(1);
                            }}
                        >
                            Sắp Tới{' '}
                            <span
                                className={`badge ${activeStatusTab === 'upcoming' ? 'bg-white text-primary' : 'bg-secondary text-white'} ms-2`}
                            >
                                {appointmentCounts.upcoming}
                            </span>
                        </button>
                        <button
                            type="button"
                            className={`btn ${activeStatusTab === 'cancelled' ? 'btn-primary' : 'btn-light'}`}
                            onClick={() => {
                                setActiveStatusTab('cancelled');
                                setCurrentPage(1);
                            }}
                        >
                            Đã Hủy{' '}
                            <span
                                className={`badge ${activeStatusTab === 'cancelled' ? 'bg-white text-primary' : 'bg-secondary text-white'} ms-2`}
                            >
                                {appointmentCounts.cancelled}
                            </span>
                        </button>
                        <button
                            type="button"
                            className={`btn ${activeStatusTab === 'completed' ? 'btn-primary' : 'btn-light'}`}
                            onClick={() => {
                                setActiveStatusTab('completed');
                                setCurrentPage(1);
                            }}
                        >
                            Hoàn Thành{' '}
                            <span
                                className={`badge ${activeStatusTab === 'completed' ? 'bg-white text-primary' : 'bg-secondary text-white'} ms-2`}
                            >
                                {appointmentCounts.completed}
                            </span>
                        </button>
                    </div>
                </div>
                {/* End Filter */}

                {/* Start Table */}
                <div className="table-responsive">
                    <table className="table datatable table-nowrap">
                        <thead>
                            <tr>
                                <th className="no-sort">Ngày & Giờ</th>
                                <th>Bệnh Nhân</th>
                                <th>Hình Thức</th>
                                <th>Trạng Thái</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <AppointmentTableSkeleton rows={itemsPerPage} />
                            ) : apiError ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-5">
                                        <div className="text-danger">
                                            <i
                                                className="ti ti-alert-circle fs-1"
                                                aria-hidden="true"
                                            ></i>
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
                            ) : appointments.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-5">
                                        <i
                                            className="ti ti-calendar-off fs-1 text-muted"
                                            aria-hidden="true"
                                        ></i>
                                        <p className="mt-2 text-muted">{NO_APPOINTMENTS_MESSAGE}</p>
                                    </td>
                                </tr>
                            ) : (
                                appointments.map((appointment) => (
                                    <tr key={appointment.appointmentId}>
                                        <td>
                                            {new Date(
                                                appointment.appointmentDate
                                            ).toLocaleDateString('vi-VN')}{' '}
                                            | {appointment.appointmentTime}
                                        </td>
                                        <td>
                                            <div className="d-flex align-items-center">
                                                <Link
                                                    to={PATIENT_DETAILS_PATH}
                                                    className="avatar avatar-md me-2"
                                                >
                                                    <img
                                                        src={
                                                            appointment.patientInfo?.avatarUrl ||
                                                            user01
                                                        }
                                                        alt="patient"
                                                        className="rounded-circle"
                                                    />
                                                </Link>
                                                <Link
                                                    to={PATIENT_DETAILS_PATH}
                                                    className="fw-semibold"
                                                >
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
                                        <td>
                                            {getAppointmentTypeText(appointment.appointmentType)}
                                        </td>
                                        <td>
                                            <StatusBadge status={appointment.status} />
                                        </td>
                                        <td className="action-item">
                                            <button
                                                type="button"
                                                className="btn btn-link p-0"
                                                data-bs-toggle="dropdown"
                                            >
                                                <i
                                                    className="ti ti-dots-vertical"
                                                    aria-hidden="true"
                                                ></i>
                                            </button>
                                            <ul className="dropdown-menu p-2">
                                                <li>
                                                    <button
                                                        type="button"
                                                        className="dropdown-item d-flex align-items-center w-100 text-start border-0 bg-transparent"
                                                        onClick={() => handleViewClick(appointment)}
                                                    >
                                                        Xem Chi Tiết
                                                    </button>
                                                </li>
                                                <li>
                                                    <button
                                                        type="button"
                                                        className="dropdown-item d-flex align-items-center w-100 text-start border-0 bg-transparent"
                                                        onClick={() =>
                                                            handleDeleteClick(appointment)
                                                        }
                                                    >
                                                        Hủy Lịch
                                                    </button>
                                                </li>
                                            </ul>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {/* End Table */}
            </div>
            {/* End Content */}

            {/* Pagination */}
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
            />

            {/* Footer Start */}
            <AppFooter />
            {/* Footer End */}

            {/* Filter Modal */}
            <ModalFilter
                show={showFilterModal}
                onHide={() => setShowFilterModal(false)}
                onApply={handleFilterSubmit}
                onReset={handleClearFilters}
                title="Lọc Lịch Hẹn"
                fields={[
                    {
                        name: 'types',
                        label: 'Loại Khám',
                        type: 'multiselect',
                        value: selectedTypes.map((t) => t.toString()),
                        onChange: (value) => {
                            const types = (value as string[]).map((v) =>
                                v === 'TELEHEALTH'
                                    ? AppointmentType.TELEHEALTH
                                    : AppointmentType.IN_PERSON
                            );
                            setSelectedTypes(types);
                        },
                        options: [
                            { value: AppointmentType.TELEHEALTH.toString(), label: 'Trực tuyến' },
                            { value: AppointmentType.IN_PERSON.toString(), label: 'Trực tiếp' },
                        ],
                        placeholder: 'Chọn loại khám...',
                        resetValue: [],
                    },
                    {
                        name: 'dateRange',
                        label: 'Khoảng thời gian',
                        type: 'daterange',
                        value: selectedDateRange,
                        onChange: (value) => setSelectedDateRange(value),
                        resetValue: { start: null, end: null },
                    },
                ]}
            />

            {/* Start View Details */}
            <div
                className={`offcanvas offcanvas-offset offcanvas-end ${showViewDetails ? 'show' : ''}`}
                tabIndex={-1}
                id="view_details"
                style={{ display: showViewDetails ? 'block' : 'none' }}
            >
                <div className="offcanvas-header d-block pb-0 px-0">
                    <div className="border-bottom d-flex align-items-center justify-content-between pb-3 px-3">
                        <h5 className="offcanvas-title fs-18 fw-bold">
                            Chi Tiết Lịch Hẹn{' '}
                            <span className="badge badge-soft-primary border pt-1 px-2 border-primary fw-medium ms-2">
                                #{selectedAppointment?.appointmentId?.substring(0, 8) || 'AP544658'}
                            </span>
                        </h5>
                        <button
                            type="button"
                            className="btn-close opacity-100"
                            onClick={() => setShowViewDetails(false)}
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
                                {selectedAppointment
                                    ? new Date(
                                          selectedAppointment.appointmentDate
                                      ).toLocaleDateString('vi-VN')
                                    : ''}{' '}
                            </span>
                        </p>
                        <p className="text-dark mb-3 fw-semibold d-flex align-items-center justify-content-between">
                            Giờ{' '}
                            <span className="text-body fw-normal">
                                {' '}
                                {selectedAppointment?.appointmentTime}{' '}
                            </span>
                        </p>
                        <p className="text-dark mb-3 fw-semibold d-flex align-items-center justify-content-between">
                            Địa Điểm{' '}
                            <span className="text-body fw-normal">
                                {selectedAppointment?.hospitalInfo?.address ||
                                    'Hà Nội, Việt Nam'}{' '}
                            </span>
                        </p>
                        <p className="text-dark mb-3 fw-semibold d-flex align-items-center justify-content-between">
                            Loại Khám{' '}
                            <span className="text-body fw-normal">
                                {' '}
                                {selectedAppointment
                                    ? getAppointmentTypeText(selectedAppointment.appointmentType)
                                    : ''}{' '}
                            </span>
                        </p>
                        <div className="text-dark mb-3 fw-semibold d-flex align-items-center justify-content-between">
                            Thông Tin Bệnh Nhân
                            <div className="text-body fw-normal d-flex align-items-center">
                                <span className="avatar avatar-sm">
                                    <img
                                        src={selectedAppointment?.patientInfo?.avatarUrl || user01}
                                        alt=""
                                        className="rounded-circle me-1"
                                    />
                                </span>
                                {formatFullName(
                                    selectedAppointment?.patientInfo?.firstName,
                                    selectedAppointment?.patientInfo?.lastName
                                )}
                            </div>
                        </div>
                    </div>
                    <h6 className="bg-light py-2 px-3 text-dark fw-bold"> Lý Do Khám </h6>
                    <div className="px-3 my-4">
                        <p className="text-body">
                            {selectedAppointment?.reason || 'Không có lý do cụ thể'}
                        </p>
                    </div>
                </div>
            </div>
            {/* End View Details */}

            {/* Delete Modal */}
            <ModalDelete
                show={showDeleteModal}
                onHide={() => setShowDeleteModal(false)}
                onConfirm={handleDeleteConfirm}
                title="Xác Nhận Hủy Lịch Hẹn"
                message="Bạn có chắc chắn muốn hủy lịch hẹn này không?"
                itemName={selectedAppointment?.appointmentId?.substring(0, 8)}
            />
        </>
    );
};

export default MyAppointments;
