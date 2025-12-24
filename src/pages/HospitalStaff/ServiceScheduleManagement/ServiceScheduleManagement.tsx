import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { format, eachDayOfInterval, startOfDay, isBefore } from 'date-fns';
import SchedulePatternSelector from '@/components/Schedule/SchedulePatternSelector';
import ModalDelete from '@/components/ModalDelete/ModalDelete';
import Pagination from '@/components/Pagination';
import TableSkeleton from '@/components/TableSkeleton';
import DateRangePicker from '@/components/DateRangePicker/DateRangePicker';
import { ServiceMedicalScheduleWithInfo, SchedulePattern } from '@/types/schedule.types';
import { Service } from '@/types/hospitalServiceMedical.types';
import { ScheduleService } from '@/services/schedule.service';
import { HospitalServiceMedicalService } from '@/services/hospitalServiceMedical.service';
import { RootState } from '@/store';

// Skeleton columns for schedule table
const scheduleTableColumns = [
    { type: 'avatar' as const, width: 150 },
    { type: 'badge' as const, width: 120 },
    { type: 'badge' as const, width: 200 },
    { type: 'text' as const, width: 100 },
    { type: 'actions' as const, items: 2 },
];

// Helper to get pattern display name
const getPatternDisplayName = (pattern: SchedulePattern): string => {
    const patternNames: Record<SchedulePattern, string> = {
        [SchedulePattern.MORNING]: 'Sáng',
        [SchedulePattern.AFTERNOON]: 'Chiều',
        [SchedulePattern.EVENING]: 'Tối',
        [SchedulePattern.NIGHT]: 'Đêm',
    };
    return patternNames[pattern] || pattern;
};

// Helper to get pattern badge color
const getPatternBadgeClass = (pattern: SchedulePattern): string => {
    const patternColors: Record<SchedulePattern, string> = {
        [SchedulePattern.MORNING]: 'bg-warning',
        [SchedulePattern.AFTERNOON]: 'bg-info',
        [SchedulePattern.EVENING]: 'bg-primary',
        [SchedulePattern.NIGHT]: 'bg-secondary',
    };
    return patternColors[pattern] || 'bg-info';
};

interface DateRange {
    start: Date | null;
    end: Date | null;
}

const ServiceScheduleManagement: React.FC = () => {
    const [schedules, setSchedules] = useState<ServiceMedicalScheduleWithInfo[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingServices, setLoadingServices] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showDateRangePicker, setShowDateRangePicker] = useState(false);
    const [selectedSchedule, setSelectedSchedule] = useState<ServiceMedicalScheduleWithInfo | null>(
        null
    );
    const [totalCount, setTotalCount] = useState(0);
    const [pageNumber, setPageNumber] = useState(1);
    const pageSize = 10;

    // Get hospitalId from user profile (Staff role)
    const hospitalProfile = useSelector((state: RootState) => state.user.hospitalProfile);
    const hospitalId = hospitalProfile?.id;

    // Filter states
    const [filterServiceName, setFilterServiceName] = useState('');
    const [filterStartDate, setFilterStartDate] = useState(() => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    });
    const [filterEndDate, setFilterEndDate] = useState(() => {
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        return nextMonth.toISOString().split('T')[0];
    });

    // Form states for creating schedule
    const [selectedServiceId, setSelectedServiceId] = useState('');
    const [scheduleDateRange, setScheduleDateRange] = useState<DateRange>({
        start: null,
        end: null,
    });
    const [schedulePatterns, setSchedulePatterns] = useState<SchedulePattern[]>([
        SchedulePattern.MORNING,
    ]);

    // Form states for editing schedule
    const [editPatterns, setEditPatterns] = useState<SchedulePattern[]>([]);

    // Load services for the hospital
    const loadServices = useCallback(async () => {
        if (!hospitalId) return;

        try {
            setLoadingServices(true);
            const response = await HospitalServiceMedicalService.getServicesByHospital(hospitalId);
            setServices(response.data || []);
        } catch (error: any) {
            toast.error(error.message || 'Không thể tải danh sách dịch vụ');
        } finally {
            setLoadingServices(false);
        }
    }, [hospitalId]);

    useEffect(() => {
        if (hospitalId) {
            loadServices();
        }
    }, [hospitalId, loadServices]);

    const loadSchedules = useCallback(async () => {
        if (!hospitalId) {
            toast.warning('Không tìm thấy thông tin bệnh viện');
            return;
        }

        try {
            setLoading(true);
            const response = await ScheduleService.listServiceMedicalSchedules({
                hospitalId,
                startDate: filterStartDate || undefined,
                endDate: filterEndDate || undefined,
                pageNumber,
                pageSize,
            });

            const data = response.data;
            setSchedules(data?.items || []);
            setTotalCount(data?.totalCount || 0);
        } catch (error: any) {
            toast.error(error.message || 'Không thể tải danh sách lịch dịch vụ');
        } finally {
            setLoading(false);
        }
    }, [hospitalId, filterStartDate, filterEndDate, pageNumber, pageSize]);

    useEffect(() => {
        if (hospitalId) {
            loadSchedules();
        }
    }, [loadSchedules, hospitalId]);

    // Filter schedules by service name (client-side)
    const filteredSchedules = schedules.filter((schedule) => {
        if (!filterServiceName) return true;
        return schedule.serviceMedicalName.toLowerCase().includes(filterServiceName.toLowerCase());
    });

    // Get minimum date for date range picker (today)
    const getMinDateForSchedule = (): Date => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return today;
    };

    // Handle date range change from DateRangePicker
    const handleDateRangeChange = (range: DateRange) => {
        const today = startOfDay(new Date());

        if (range.start && isBefore(startOfDay(range.start), today)) {
            toast.warning('Ngày bắt đầu phải từ hôm nay trở đi');
            return;
        }

        setScheduleDateRange(range);
    };

    const handleCreateSchedule = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedServiceId) {
            toast.warning('Vui lòng chọn dịch vụ');
            return;
        }

        if (!scheduleDateRange.start || !scheduleDateRange.end) {
            toast.warning('Vui lòng chọn khoảng thời gian');
            return;
        }

        if (schedulePatterns.length === 0) {
            toast.warning('Vui lòng chọn ít nhất một ca làm việc');
            return;
        }

        const today = startOfDay(new Date());
        if (isBefore(startOfDay(scheduleDateRange.start), today)) {
            toast.warning('Ngày bắt đầu phải từ hôm nay trở đi');
            return;
        }

        try {
            setLoading(true);

            const dates = eachDayOfInterval({
                start: scheduleDateRange.start,
                end: scheduleDateRange.end,
            });

            let successCount = 0;
            let errorCount = 0;

            for (const date of dates) {
                try {
                    await ScheduleService.createOrUpdateServiceMedicalSchedule({
                        serviceMedicalId: selectedServiceId,
                        scheduleDate: format(date, 'yyyy-MM-dd'),
                        schedulePatterns,
                    });
                    successCount++;
                } catch {
                    errorCount++;
                }
            }

            if (successCount > 0) {
                toast.success(`Đã tạo lịch dịch vụ cho ${successCount} ngày`);
            }
            if (errorCount > 0) {
                toast.warning(`${errorCount} ngày không thể tạo lịch (có thể đã tồn tại)`);
            }

            setShowCreateModal(false);
            resetForm();
            loadSchedules();
        } catch (error: any) {
            toast.error(error.message || 'Không thể tạo lịch dịch vụ');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateSchedule = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedSchedule) return;

        if (editPatterns.length === 0) {
            toast.warning('Vui lòng chọn ít nhất một ca làm việc');
            return;
        }

        try {
            setLoading(true);
            await ScheduleService.createOrUpdateServiceMedicalSchedule({
                serviceMedicalId: selectedSchedule.serviceMedicalId,
                scheduleDate: selectedSchedule.scheduleDate,
                schedulePatterns: editPatterns,
            });
            toast.success('Cập nhật lịch dịch vụ thành công');
            setShowEditModal(false);
            setSelectedSchedule(null);
            loadSchedules();
        } catch (error: any) {
            toast.error(error.message || 'Không thể cập nhật lịch dịch vụ');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteSchedule = async () => {
        if (!selectedSchedule) return;

        try {
            setLoading(true);
            await ScheduleService.deleteServiceMedicalSchedule(
                selectedSchedule.serviceMedicalId,
                selectedSchedule.scheduleDate
            );
            toast.success('Xóa lịch dịch vụ thành công');
            setShowDeleteModal(false);
            setSelectedSchedule(null);
            loadSchedules();
        } catch (error: any) {
            toast.error(error.message || 'Không thể xóa lịch dịch vụ');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenEditModal = (schedule: ServiceMedicalScheduleWithInfo) => {
        setSelectedSchedule(schedule);
        setEditPatterns(schedule.schedulePatterns);
        setShowEditModal(true);
    };

    const handleOpenDeleteModal = (schedule: ServiceMedicalScheduleWithInfo) => {
        setSelectedSchedule(schedule);
        setShowDeleteModal(true);
    };

    const resetForm = () => {
        setSelectedServiceId('');
        setScheduleDateRange({ start: null, end: null });
        setSchedulePatterns([SchedulePattern.MORNING]);
    };

    const handleResetFilters = () => {
        setFilterServiceName('');
        const today = new Date();
        setFilterStartDate(today.toISOString().split('T')[0]);
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        setFilterEndDate(nextMonth.toISOString().split('T')[0]);
        setPageNumber(1);
    };

    const totalPages = Math.ceil(totalCount / pageSize);

    // Get selected service info for display
    const selectedService = services.find((s) => s.id === selectedServiceId);

    // Get date range display text
    const getDateRangeText = () => {
        if (scheduleDateRange.start && scheduleDateRange.end) {
            return `${format(scheduleDateRange.start, 'dd/MM/yyyy')} - ${format(scheduleDateRange.end, 'dd/MM/yyyy')}`;
        }
        if (scheduleDateRange.start) {
            return `${format(scheduleDateRange.start, 'dd/MM/yyyy')} - Chọn ngày kết thúc`;
        }
        return 'Chọn khoảng thời gian...';
    };

    // Render table body
    const renderTableBody = () => {
        if (loading) {
            return <TableSkeleton rows={pageSize} columns={scheduleTableColumns} />;
        }

        if (filteredSchedules.length === 0) {
            return (
                <tr>
                    <td colSpan={5} className="text-center py-5">
                        <i className="ti ti-calendar-off fs-1 text-muted"></i>
                        <p className="mt-2 text-muted">Không có dữ liệu lịch dịch vụ</p>
                    </td>
                </tr>
            );
        }

        return filteredSchedules.map((schedule) => (
            <tr key={schedule.id}>
                <td>
                    <div className="d-flex align-items-center">
                        {schedule.serviceMedicalImageUrl ? (
                            <span className="avatar avatar-md me-2">
                                <img
                                    src={schedule.serviceMedicalImageUrl}
                                    alt={schedule.serviceMedicalName}
                                    className="rounded"
                                />
                            </span>
                        ) : (
                            <span className="avatar avatar-md me-2 bg-info text-white d-flex align-items-center justify-content-center">
                                <i className="ti ti-stethoscope"></i>
                            </span>
                        )}
                        <div>
                            <span className="fw-semibold">{schedule.serviceMedicalName}</span>
                            {schedule.serviceCategoryName && (
                                <span className="text-body fs-13 fw-normal d-block">
                                    {schedule.serviceCategoryName}
                                </span>
                            )}
                        </div>
                    </div>
                </td>
                <td className="text-center">
                    <span className="badge bg-light text-dark">
                        {new Date(schedule.scheduleDate).toLocaleDateString('vi-VN', {
                            weekday: 'short',
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                        })}
                    </span>
                </td>
                <td>
                    {schedule.schedulePatterns.map((pattern, idx) => (
                        <span key={idx} className={`badge ${getPatternBadgeClass(pattern)} me-1`}>
                            {getPatternDisplayName(pattern)}
                        </span>
                    ))}
                </td>
                <td className="text-center">
                    <small className="text-muted">
                        {new Date(schedule.updatedAt).toLocaleDateString('vi-VN')}
                    </small>
                </td>
                <td className="action-item">
                    <button
                        type="button"
                        className="btn btn-link p-0"
                        data-bs-toggle="dropdown"
                        aria-label="Thao tác"
                    >
                        <i className="ti ti-dots-vertical"></i>
                    </button>
                    <ul className="dropdown-menu p-2">
                        <li>
                            <button
                                type="button"
                                className="dropdown-item d-flex align-items-center w-100 text-start border-0 bg-transparent"
                                onClick={() => handleOpenEditModal(schedule)}
                                disabled={loading}
                            >
                                <i className="ti ti-edit me-2" aria-hidden="true"></i>
                                Chỉnh sửa
                            </button>
                        </li>
                        <li>
                            <button
                                type="button"
                                className="dropdown-item d-flex align-items-center w-100 text-start border-0 bg-transparent text-danger"
                                onClick={() => handleOpenDeleteModal(schedule)}
                                disabled={loading}
                            >
                                <i className="ti ti-trash me-2" aria-hidden="true"></i>
                                Xóa
                            </button>
                        </li>
                    </ul>
                </td>
            </tr>
        ));
    };

    // Show loading if hospital profile not loaded yet
    if (!hospitalId) {
        return (
            <div className="content">
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3 text-muted">Đang tải thông tin bệnh viện...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="content">
                {/* Page Header */}
                <div className="d-flex align-items-sm-center flex-sm-row flex-column gap-2 pb-3 mb-3 border-1 border-bottom">
                    <div className="flex-grow-1">
                        <h4 className="fw-semibold mb-0">
                            <i className="ti ti-calendar-event me-2"></i>
                            Quản lý lịch dịch vụ y tế
                        </h4>
                    </div>
                    <div className="text-end d-flex gap-2">
                        <button
                            className="btn btn-primary"
                            onClick={() => setShowCreateModal(true)}
                            disabled={loading}
                        >
                            <i className="ti ti-plus me-1"></i>
                            Tạo lịch dịch vụ
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="card mb-3">
                    <div className="card-body">
                        <div className="row align-items-end">
                            <div className="col-md-4 mb-3 mb-md-0">
                                <label className="form-label">Tìm theo tên dịch vụ</label>
                                <div className="input-icon-start position-relative">
                                    <span className="input-icon-addon">
                                        <i className="ti ti-search"></i>
                                    </span>
                                    <input
                                        type="text"
                                        className="form-control ps-5"
                                        placeholder="Nhập tên dịch vụ..."
                                        value={filterServiceName}
                                        onChange={(e) => setFilterServiceName(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="col-md-3 mb-3 mb-md-0">
                                <label className="form-label">Từ ngày</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={filterStartDate}
                                    onChange={(e) => {
                                        setFilterStartDate(e.target.value);
                                        setPageNumber(1);
                                    }}
                                />
                            </div>
                            <div className="col-md-3 mb-3 mb-md-0">
                                <label className="form-label">Đến ngày</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={filterEndDate}
                                    onChange={(e) => {
                                        setFilterEndDate(e.target.value);
                                        setPageNumber(1);
                                    }}
                                />
                            </div>
                            <div className="col-md-2">
                                <button
                                    className="btn btn-outline-secondary w-100"
                                    onClick={handleResetFilters}
                                >
                                    <i className="ti ti-refresh me-1"></i>
                                    Đặt lại
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="table-responsive">
                    <table className="table datatable table-nowrap">
                        <thead>
                            <tr>
                                <th style={{ width: '280px' }}>Dịch vụ</th>
                                <th style={{ width: '160px' }} className="text-center">
                                    Ngày hoạt động
                                </th>
                                <th>Ca hoạt động</th>
                                <th style={{ width: '120px' }} className="text-center">
                                    Cập nhật
                                </th>
                                <th style={{ width: '80px' }}></th>
                            </tr>
                        </thead>
                        <tbody>{renderTableBody()}</tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            <Pagination
                currentPage={pageNumber}
                totalPages={totalPages}
                onPageChange={setPageNumber}
            />

            {/* Create Modal */}
            {showCreateModal && (
                <>
                    <div className="modal fade show d-block">
                        <div className="modal-dialog modal-lg modal-dialog-centered">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">
                                        <i className="ti ti-calendar-plus me-2"></i>
                                        Tạo lịch dịch vụ mới
                                    </h5>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={() => {
                                            setShowCreateModal(false);
                                            resetForm();
                                        }}
                                        disabled={loading}
                                        aria-label="Đóng"
                                    ></button>
                                </div>

                                <form onSubmit={handleCreateSchedule}>
                                    <div className="modal-body">
                                        <div className="row">
                                            {/* Service Select */}
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">
                                                    Chọn dịch vụ{' '}
                                                    <span className="text-danger">*</span>
                                                </label>
                                                <select
                                                    className="form-select"
                                                    value={selectedServiceId}
                                                    onChange={(e) =>
                                                        setSelectedServiceId(e.target.value)
                                                    }
                                                    required
                                                    disabled={loadingServices}
                                                >
                                                    <option value="">
                                                        {loadingServices
                                                            ? 'Đang tải...'
                                                            : '-- Chọn dịch vụ --'}
                                                    </option>
                                                    {services.map((service) => (
                                                        <option key={service.id} value={service.id}>
                                                            {service.name}
                                                            {service.serviceCategory?.name &&
                                                                ` - ${service.serviceCategory.name}`}
                                                        </option>
                                                    ))}
                                                </select>
                                                {selectedService && (
                                                    <div className="mt-2 p-2 bg-light rounded d-flex align-items-center">
                                                        {selectedService.imageUrl ? (
                                                            <img
                                                                src={selectedService.imageUrl}
                                                                alt={selectedService.name}
                                                                className="rounded me-2"
                                                                style={{
                                                                    width: 40,
                                                                    height: 40,
                                                                    objectFit: 'cover',
                                                                }}
                                                            />
                                                        ) : (
                                                            <span className="avatar avatar-sm me-2 bg-info text-white d-flex align-items-center justify-content-center">
                                                                <i className="ti ti-stethoscope"></i>
                                                            </span>
                                                        )}
                                                        <div>
                                                            <div className="fw-medium">
                                                                {selectedService.name}
                                                            </div>
                                                            {selectedService.serviceCategory
                                                                ?.name && (
                                                                <small className="text-muted">
                                                                    {
                                                                        selectedService
                                                                            .serviceCategory.name
                                                                    }
                                                                </small>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Date Range Picker */}
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">
                                                    Khoảng thời gian{' '}
                                                    <span className="text-danger">*</span>
                                                </label>
                                                <button
                                                    type="button"
                                                    className="form-control text-start d-flex align-items-center justify-content-between"
                                                    onClick={() => setShowDateRangePicker(true)}
                                                >
                                                    <span
                                                        className={
                                                            scheduleDateRange.start
                                                                ? ''
                                                                : 'text-muted'
                                                        }
                                                    >
                                                        {getDateRangeText()}
                                                    </span>
                                                    <i className="ti ti-calendar"></i>
                                                </button>
                                                <small className="text-muted">
                                                    <i className="ti ti-info-circle me-1"></i>
                                                    Lịch sẽ được tạo cho tất cả các ngày trong
                                                    khoảng thời gian (chỉ chọn ngày từ hôm nay trở
                                                    đi)
                                                </small>
                                            </div>

                                            {/* Schedule Patterns */}
                                            <div className="col-12 mb-3">
                                                <SchedulePatternSelector
                                                    selectedPatterns={schedulePatterns}
                                                    onChange={setSchedulePatterns}
                                                    singleSelect={false}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="modal-footer">
                                        <button
                                            type="button"
                                            className="btn btn-secondary"
                                            onClick={() => {
                                                setShowCreateModal(false);
                                                resetForm();
                                            }}
                                            disabled={loading}
                                        >
                                            Hủy
                                        </button>
                                        <button
                                            type="submit"
                                            className="btn btn-primary"
                                            disabled={
                                                loading ||
                                                !selectedServiceId ||
                                                !scheduleDateRange.start ||
                                                !scheduleDateRange.end
                                            }
                                        >
                                            {loading ? (
                                                <>
                                                    <span
                                                        className="spinner-border spinner-border-sm me-2"
                                                        role="status"
                                                    ></span>
                                                    Đang tạo...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="ti ti-check me-1"></i>
                                                    Tạo lịch dịch vụ
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                    <div className="modal-backdrop fade show"></div>
                </>
            )}

            {/* Edit Modal */}
            {showEditModal && selectedSchedule && (
                <>
                    <div className="modal fade show d-block">
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">
                                        <i className="ti ti-edit me-2"></i>
                                        Chỉnh sửa lịch dịch vụ
                                    </h5>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={() => {
                                            setShowEditModal(false);
                                            setSelectedSchedule(null);
                                        }}
                                        disabled={loading}
                                        aria-label="Đóng"
                                    ></button>
                                </div>

                                <form onSubmit={handleUpdateSchedule}>
                                    <div className="modal-body">
                                        {/* Service Info (Read-only) */}
                                        <div className="mb-3">
                                            <label className="form-label">Dịch vụ</label>
                                            <div className="p-2 bg-light rounded d-flex align-items-center">
                                                {selectedSchedule.serviceMedicalImageUrl ? (
                                                    <img
                                                        src={
                                                            selectedSchedule.serviceMedicalImageUrl
                                                        }
                                                        alt={selectedSchedule.serviceMedicalName}
                                                        className="rounded me-2"
                                                        style={{
                                                            width: 40,
                                                            height: 40,
                                                            objectFit: 'cover',
                                                        }}
                                                    />
                                                ) : (
                                                    <span className="avatar avatar-sm me-2 bg-info text-white d-flex align-items-center justify-content-center">
                                                        <i className="ti ti-stethoscope"></i>
                                                    </span>
                                                )}
                                                <div>
                                                    <div className="fw-medium">
                                                        {selectedSchedule.serviceMedicalName}
                                                    </div>
                                                    {selectedSchedule.serviceCategoryName && (
                                                        <small className="text-muted">
                                                            {selectedSchedule.serviceCategoryName}
                                                        </small>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Date (Read-only) */}
                                        <div className="mb-3">
                                            <label className="form-label">Ngày hoạt động</label>
                                            <div className="form-control bg-light">
                                                {new Date(
                                                    selectedSchedule.scheduleDate
                                                ).toLocaleDateString('vi-VN', {
                                                    weekday: 'long',
                                                    day: '2-digit',
                                                    month: '2-digit',
                                                    year: 'numeric',
                                                })}
                                            </div>
                                        </div>

                                        {/* Schedule Patterns */}
                                        <SchedulePatternSelector
                                            selectedPatterns={editPatterns}
                                            onChange={setEditPatterns}
                                            singleSelect={false}
                                        />
                                    </div>

                                    <div className="modal-footer">
                                        <button
                                            type="button"
                                            className="btn btn-secondary"
                                            onClick={() => {
                                                setShowEditModal(false);
                                                setSelectedSchedule(null);
                                            }}
                                            disabled={loading}
                                        >
                                            Hủy
                                        </button>
                                        <button
                                            type="submit"
                                            className="btn btn-primary"
                                            disabled={loading || editPatterns.length === 0}
                                        >
                                            {loading ? (
                                                <>
                                                    <span
                                                        className="spinner-border spinner-border-sm me-2"
                                                        role="status"
                                                    ></span>
                                                    Đang cập nhật...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="ti ti-check me-1"></i>
                                                    Cập nhật
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                    <div className="modal-backdrop fade show"></div>
                </>
            )}

            {/* Delete Modal */}
            <ModalDelete
                show={showDeleteModal}
                onHide={() => {
                    setShowDeleteModal(false);
                    setSelectedSchedule(null);
                }}
                onConfirm={handleDeleteSchedule}
                title="Xóa lịch dịch vụ"
                message={
                    selectedSchedule
                        ? `Bạn có chắc chắn muốn xóa lịch dịch vụ "${selectedSchedule.serviceMedicalName}" vào ngày ${new Date(selectedSchedule.scheduleDate).toLocaleDateString('vi-VN')}`
                        : ''
                }
                loading={loading}
            />

            {/* Date Range Picker Modal */}
            <DateRangePicker
                value={scheduleDateRange}
                onChange={handleDateRangeChange}
                open={showDateRangePicker}
                onClose={() => setShowDateRangePicker(false)}
                placeholder="Chọn khoảng thời gian..."
                minDate={getMinDateForSchedule()}
                maxDate={undefined}
            />
        </>
    );
};

export default ServiceScheduleManagement;
