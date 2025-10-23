import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Pagination from '@/components/Pagination';
import Button from '@/components/Button';
import ModalDelete from '@/components/ModalDelete';
import ModalFilter from '@/components/ModalFilter';
import ActionDropdown from '@/components/ActionDropdown';
import StatusBadge from '@/components/StatusBadge';
import TableActions from '@/components/TableActions';
import { useDoctor } from '@/hooks/useDoctor';
import { useDoctorFilterOptions } from '@/hooks/useDoctorFilterOptions';
import { useCurrentUserProfile } from '@/hooks/useCurrentUserProfile';
import { DoctorOptimizedResponse, DoctorSearchParams } from '@/types/doctor.types';
import TableSkeleton from '@/components/TableSkeleton';
import { doctorTableColumns } from '@/components/TableSkeleton/skeletonConfigs';

const ListDoctors: React.FC = () => {
    const {
        doctors,
        isLoading,
        error,
        pagination,
        fetchDoctorsByHospital,
        filterDoctors,
        clearError,
    } = useDoctor();

    // Get hospital profile (this page is only for hospital staff)
    const { hospitalProfile, isLoading: profileLoading } = useCurrentUserProfile();

    const {
        specialties: filterSpecialties,
        positions: filterPositions,
        serviceTypes: filterServiceTypes,
        languages: filterLanguages,
    } = useDoctorFilterOptions();

    // Get hospital ID from hospital profile
    const hospitalId = hospitalProfile?.id || null;
    const [originalDoctors, setOriginalDoctors] = useState<DoctorOptimizedResponse[]>([]);
    // Filter states (for modal)
    const [tempSelectedDoctors, setTempSelectedDoctors] = useState<string[]>([]);
    const [tempSelectedPositions, setTempSelectedPositions] = useState<string[]>([]);
    const [tempSelectedSpecialties, setTempSelectedSpecialties] = useState<string[]>([]);
    const [tempSelectedServiceTypes, setTempSelectedServiceTypes] = useState<string[]>([]);
    const [tempSelectedPrices, setTempSelectedPrices] = useState<string[]>([]);
    const [tempSelectedLanguages, setTempSelectedLanguages] = useState<string[]>([]);
    const [tempSelectedStatuses, setTempSelectedStatuses] = useState<string[]>([]);

    // Applied filter states (for actual filtering)
    const [appliedSelectedDoctors, setAppliedSelectedDoctors] = useState<string[]>([]);
    const [appliedSelectedPositions, setAppliedSelectedPositions] = useState<string[]>([]);
    const [appliedSelectedSpecialties, setAppliedSelectedSpecialties] = useState<string[]>([]);
    const [appliedSelectedServiceTypes, setAppliedSelectedServiceTypes] = useState<string[]>([]);
    const [appliedSelectedPrices, setAppliedSelectedPrices] = useState<string[]>([]);
    const [appliedSelectedLanguages, setAppliedSelectedLanguages] = useState<string[]>([]);
    const [appliedSelectedStatuses, setAppliedSelectedStatuses] = useState<string[]>([]);

    const [searchTerm, setSearchTerm] = useState<string>('');
    const [sortBy, setSortBy] = useState<string>('Tên A-Z');
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [doctorToDelete, setDoctorToDelete] = useState<DoctorOptimizedResponse | null>(null);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Fetch doctors on component mount and when hospitalId changes
    useEffect(() => {
        if (hospitalId && !profileLoading) {
            fetchDoctorsByHospital(hospitalId, 1, itemsPerPage);
        }
    }, [hospitalId, profileLoading, fetchDoctorsByHospital, itemsPerPage]);

    // Handle search term changes with debounce
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (hospitalId && searchTerm.trim()) {
                const filterParams: DoctorSearchParams = {
                    hospitalId: hospitalId,
                    pageNumber: 1,
                    pageSize: itemsPerPage,
                    searchTerm: searchTerm.trim(),
                };
                setCurrentPage(1);
                filterDoctors(filterParams);
            } else if (hospitalId && !searchTerm.trim()) {
                // If search is cleared, fetch all doctors
                setCurrentPage(1);
                fetchDoctorsByHospital(hospitalId, 1, itemsPerPage);
            }
        }, 500); // 500ms debounce

        return () => clearTimeout(timeoutId);
    }, [searchTerm, hospitalId, itemsPerPage, filterDoctors, fetchDoctorsByHospital]);

    // Update original doctors when doctors data changes
    useEffect(() => {
        setOriginalDoctors(doctors);
    }, [doctors]);

    const totalPages = pagination.totalPages;

    // Helper function to check if any filters are applied
    const hasActiveFilters = () => {
        return (
            appliedSelectedSpecialties.length > 0 ||
            appliedSelectedPositions.length > 0 ||
            appliedSelectedServiceTypes.length > 0 ||
            appliedSelectedPrices.length > 0 ||
            appliedSelectedLanguages.length > 0 ||
            appliedSelectedStatuses.length > 0 ||
            searchTerm.trim()
        );
    };

    // Helper function to get specialty ID from name
    const getSpecialtyId = (specialtyName: string): string | undefined => {
        const specialty = filterSpecialties.find((s) => s.name === specialtyName);
        return specialty?.id;
    };

    // Helper function to get position ID from name
    const getPositionId = (positionName: string): string | undefined => {
        const position = filterPositions.find((p) => p.name === positionName);
        return position?.id;
    };

    // Helper function to build filter parameters
    const buildFilterParams = (page: number): DoctorSearchParams => {
        const filterParams: DoctorSearchParams = {
            hospitalId: hospitalId || undefined,
            pageNumber: page,
            pageSize: itemsPerPage,
        };

        // Add search term if exists
        if (searchTerm.trim()) {
            filterParams.searchTerm = searchTerm.trim();
        }

        // Add specialty filter
        if (appliedSelectedSpecialties.length > 0) {
            const specialtyIds = appliedSelectedSpecialties
                .map(getSpecialtyId)
                .filter(Boolean) as string[];

            if (specialtyIds.length > 0) {
                filterParams.specialtyIds = specialtyIds;
            }
        }

        // Add position filter
        if (appliedSelectedPositions.length > 0) {
            const positionIds = appliedSelectedPositions
                .map(getPositionId)
                .filter(Boolean) as string[];

            if (positionIds.length > 0) {
                filterParams.positionIds = positionIds;
            }
        }

        // Add status filter
        if (appliedSelectedStatuses.length > 0) {
            filterParams.statuses = appliedSelectedStatuses as ('ACTIVE' | 'INACTIVE')[];
        }

        // Add service types filter
        if (appliedSelectedServiceTypes.length > 0) {
            filterParams.serviceTypes = appliedSelectedServiceTypes;
        }

        // Add languages filter
        if (appliedSelectedLanguages.length > 0) {
            filterParams.languages = appliedSelectedLanguages;
        }

        return filterParams;
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);

        if (hasActiveFilters()) {
            const filterParams = buildFilterParams(page);
            filterDoctors(filterParams);
        } else if (hospitalId) {
            fetchDoctorsByHospital(hospitalId, page, itemsPerPage);
        }
    };

    // Use doctors from Redux store instead of client-side filtering
    const filteredDoctors = doctors;

    // Sort logic
    const sortedDoctors = useMemo(() => {
        const sorted = [...filteredDoctors];

        switch (sortBy) {
            case 'Tên A-Z':
                return sorted.sort((a, b) =>
                    `${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`)
                );
            case 'Tên Z-A':
                return sorted.sort((a, b) =>
                    `${b.lastName} ${b.firstName}`.localeCompare(`${a.lastName} ${a.firstName}`)
                );
            case 'Kinh nghiệm (Cao-Thấp)':
                return sorted.sort((a, b) => b.yearsOfExperience - a.yearsOfExperience);
            case 'Kinh nghiệm (Thấp-Cao)':
                return sorted.sort((a, b) => a.yearsOfExperience - b.yearsOfExperience);
            default:
                return sorted;
        }
    }, [filteredDoctors, sortBy]);

    // Logic to hide pagination - use Redux pagination data
    const shouldHidePagination = useMemo(() => {
        // Hide pagination when:
        // 1. No doctors found (empty result)
        // 2. Total pages <= 1
        if (sortedDoctors.length === 0) return true;
        return pagination.totalPages <= 1;
    }, [sortedDoctors.length, pagination.totalPages]);

    const handleDeleteDoctor = (doctor: DoctorOptimizedResponse) => {
        setDoctorToDelete(doctor);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = () => {
        if (doctorToDelete) {
            // TODO: Implement delete API call
            console.log('Delete doctor:', doctorToDelete.id);
            setShowDeleteModal(false);
            setDoctorToDelete(null);
        }
    };

    const handleDeleteCancel = () => {
        setShowDeleteModal(false);
        setDoctorToDelete(null);
    };

    // Render table body content based on loading, error, and data states
    const renderTableBody = () => {
        if (isLoading) {
            return <TableSkeleton rows={itemsPerPage} columns={doctorTableColumns} />;
        }

        if (error) {
            return (
                <tr>
                    <td colSpan={7} className="text-center py-4">
                        <div className="alert alert-danger" role="alert">
                            <strong>Lỗi:</strong> Không thể kết nối đến máy chủ!{' '}
                            <button
                                type="button"
                                className="btn-close ms-2"
                                onClick={clearError}
                                aria-label="Close"
                            ></button>
                        </div>
                    </td>
                </tr>
            );
        }

        if (sortedDoctors.length === 0) {
            return (
                <tr>
                    <td colSpan={7} className="text-center py-4">
                        <p className="text-muted">Không có bác sĩ nào được tìm thấy.</p>
                    </td>
                </tr>
            );
        }

        return sortedDoctors.map((doctor) => (
            <tr key={doctor.id}>
                <td>
                    <div className="d-flex align-items-center">
                        <Link to={`/clinic/doctor-details/${doctor.id}`} className="avatar me-2">
                            <img src={doctor.avatarUrl} alt="Bác sĩ" className="rounded-circle" />
                        </Link>
                        <div>
                            <h6 className="mb-1 fs-14 fw-semibold">
                                <Link to={`/clinic/doctor-details/${doctor.id}`}>
                                    {doctor.lastName} {doctor.firstName}
                                </Link>
                            </h6>
                            <span className="fs-13 d-block">{doctor.position?.name || 'N/A'}</span>
                        </div>
                    </div>
                </td>
                <td>
                    <StatusBadge
                        status="ACTIVE"
                        variant="primary"
                        customText={doctor.specialty?.name || 'N/A'}
                    />
                </td>
                <td>
                    <StatusBadge
                        status="ACTIVE"
                        variant="warning"
                        customText={`${doctor.yearsOfExperience} năm`}
                    />
                </td>
                <td>
                    <div className="d-flex flex-column gap-1 align-items-start">
                        {doctor.prices.map((price) => (
                            <StatusBadge
                                key={`${doctor.id}-price-${price.serviceTypeName}-${price.amount}`}
                                status="ACTIVE"
                                variant="info"
                                customText={`${price.serviceTypeName} - ${price.amount.toLocaleString('vi-VN')} VNĐ`}
                            />
                        ))}
                    </div>
                </td>
                <td>
                    <div className="d-flex flex-column gap-1 align-items-start">
                        {doctor.languages.map((language) => (
                            <StatusBadge
                                key={`${doctor.id}-language-${language.name}`}
                                status="ACTIVE"
                                variant="secondary"
                                customText={language.name}
                            />
                        ))}
                    </div>
                </td>
                <td>
                    <StatusBadge status={doctor.status || 'ACTIVE'} />
                </td>
                <td>
                    <div className="d-flex align-items-center">
                        <div className="action-item me-2">
                            <Link to="/clinic/appointment-calendar">
                                <i className="ti ti-calendar-cog"></i>
                            </Link>
                        </div>
                        <div className="action-item">
                            <TableActions
                                id={doctor.id}
                                onEdit={() => {}}
                                onDelete={() => handleDeleteDoctor(doctor)}
                                editLink={`/hospitals/doctors/edit/${doctor.id}`}
                                showEdit={true}
                                showDelete={true}
                                showView={false}
                            />
                        </div>
                    </div>
                </td>
            </tr>
        ));
    };

    const handleFilterSubmit = () => {
        // Apply temp filters to actual filters
        setAppliedSelectedDoctors(tempSelectedDoctors);
        setAppliedSelectedPositions(tempSelectedPositions);
        setAppliedSelectedSpecialties(tempSelectedSpecialties);
        setAppliedSelectedServiceTypes(tempSelectedServiceTypes);
        setAppliedSelectedPrices(tempSelectedPrices);
        setAppliedSelectedLanguages(tempSelectedLanguages);
        setAppliedSelectedStatuses(tempSelectedStatuses);
        setShowFilterModal(false);

        // Call API with filter parameters
        const filterParams: DoctorSearchParams = {
            hospitalId: hospitalId || undefined,
            pageNumber: 1, // Reset to first page when filtering
            pageSize: itemsPerPage,
        };

        // Add search term if exists
        if (searchTerm.trim()) {
            filterParams.searchTerm = searchTerm.trim();
        }

        // Add specialty filter
        if (tempSelectedSpecialties.length > 0) {
            // Convert specialty names to IDs
            const specialtyIds = tempSelectedSpecialties
                .map((specialtyName) => {
                    const specialty = filterSpecialties.find((s) => s.name === specialtyName);
                    return specialty?.id;
                })
                .filter(Boolean) as string[];

            if (specialtyIds.length > 0) {
                filterParams.specialtyIds = specialtyIds;
            }
        }

        // Add position filter
        if (tempSelectedPositions.length > 0) {
            // Convert position names to IDs
            const positionIds = tempSelectedPositions
                .map((positionName) => {
                    const position = filterPositions.find((p) => p.name === positionName);
                    return position?.id;
                })
                .filter(Boolean) as string[];

            if (positionIds.length > 0) {
                filterParams.positionIds = positionIds;
            }
        }

        // Add status filter
        if (tempSelectedStatuses.length > 0) {
            filterParams.statuses = tempSelectedStatuses as ('ACTIVE' | 'INACTIVE')[];
        }

        // Add service types filter
        if (tempSelectedServiceTypes.length > 0) {
            filterParams.serviceTypes = tempSelectedServiceTypes;
        }

        // Add languages filter
        if (tempSelectedLanguages.length > 0) {
            filterParams.languages = tempSelectedLanguages;
        }

        // Reset to first page
        setCurrentPage(1);

        // Call Redux filterDoctors action
        filterDoctors(filterParams);
    };

    const handleClearFilters = () => {
        // Clear both temp and applied filters
        setTempSelectedDoctors([]);
        setTempSelectedPositions([]);
        setTempSelectedSpecialties([]);
        setTempSelectedServiceTypes([]);
        setTempSelectedPrices([]);
        setTempSelectedLanguages([]);
        setTempSelectedStatuses([]);
        setAppliedSelectedDoctors([]);
        setAppliedSelectedPositions([]);
        setAppliedSelectedSpecialties([]);
        setAppliedSelectedServiceTypes([]);
        setAppliedSelectedPrices([]);
        setAppliedSelectedLanguages([]);
        setAppliedSelectedStatuses([]);

        // Reset to first page
        setCurrentPage(1);

        // Fetch all doctors without filters
        if (hospitalId) {
            fetchDoctorsByHospital(hospitalId, 1, itemsPerPage);
        }
    };

    // Show loading state while profile is loading
    if (profileLoading) {
        return (
            <div className="content">
                <div
                    className="d-flex justify-content-center align-items-center"
                    style={{ minHeight: '400px' }}
                >
                    <div className="spinner-border text-primary">
                        <span className="visually-hidden">Đang tải...</span>
                    </div>
                    <output className="ms-2" aria-live="polite">
                        Đang tải thông tin bệnh viện...
                    </output>
                </div>
            </div>
        );
    }

    // Show error if no hospital ID found
    if (!hospitalId) {
        return (
            <div className="content">
                <div className="d-flex align-items-sm-center flex-sm-row flex-column gap-2 mb-3 pb-3 border-bottom">
                    <div className="flex-grow-1">
                        <h4 className="fw-bold mb-0">Danh Sách Bác Sĩ</h4>
                    </div>
                </div>

                <div className="table-responsive">
                    <div
                        className="bg-white rounded-3 shadow-sm border p-5 text-center"
                        style={{
                            minHeight: '400px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <div>
                            <div className="mb-4">
                                <div className="bg-warning bg-opacity-10 text-warning d-inline-flex align-items-center justify-content-center rounded-circle p-4 mb-3">
                                    <i className="ti ti-alert-triangle fs-1"></i>
                                </div>
                            </div>

                            <h5 className="fw-semibold text-dark mb-3">
                                Không thể xác định bệnh viện
                            </h5>

                            <p className="text-muted mb-4">
                                Vui lòng đảm bảo bạn đã đăng nhập với tài khoản hợp lệ và có quyền
                                truy cập vào bệnh viện.
                            </p>

                            <div className="d-flex gap-2 justify-content-center">
                                <Link to="/" className="btn btn-primary fs-13">
                                    <i className="ti ti-home me-1"></i> Về trang chủ
                                </Link>
                                <button
                                    className="btn btn-outline-secondary fs-13"
                                    onClick={() => window.location.reload()}
                                >
                                    <i className="ti ti-refresh me-1"></i> Tải lại
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="content">
                <div className="d-flex align-items-sm-center flex-sm-row flex-column gap-2 mb-3 pb-3 border-bottom">
                    <div className="flex-grow-1">
                        <h4 className="fw-bold mb-0">
                            Danh Sách Bác Sĩ{' '}
                            <span className="badge badge-soft-primary fs-13 fw-medium ms-2">
                                Tổng Bác Sĩ: {pagination.totalCount}
                            </span>
                        </h4>
                    </div>
                    <div className="text-end d-flex">
                        <ActionDropdown
                            type="export"
                            options={[
                                { value: 'pdf', label: 'Tải xuống dạng PDF', format: 'pdf' },
                                {
                                    value: 'excel',
                                    label: 'Tải xuống dạng Excel',
                                    format: 'excel',
                                },
                            ]}
                            onExport={(format: string) => {
                                console.log('Exporting:', format);
                                // Handle export logic here
                            }}
                        />
                        <div className="bg-white border shadow-sm rounded px-1 pb-0 text-center d-flex align-items-center justify-content-center">
                            <Link
                                to="/hospitals/doctors"
                                className="bg-light rounded p-1 d-flex align-items-center justify-content-center"
                            >
                                <i className="ti ti-list fs-14 text-body"></i>
                            </Link>
                            <Link
                                to="/hospitals/doctors"
                                className="bg-white rounded p-1 d-flex align-items-center justify-content-center"
                            >
                                <i className="ti ti-layout-grid fs-14 text-body"></i>
                            </Link>
                        </div>
                        <Button
                            variant="primary"
                            size="md"
                            className="ms-2 fs-13"
                            icon="ti ti-plus"
                            onClick={() => (globalThis.location.href = '/hospitals/doctors/add')}
                        >
                            Thêm Bác Sĩ
                        </Button>
                    </div>
                </div>

                <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-3">
                    <div className="search-set mb-3">
                        <div className="d-flex align-items-center flex-wrap gap-2">
                            <div className="table-search d-flex align-items-center mb-0">
                                <div className="search-input">
                                    <label htmlFor="doctorSearch" aria-label="Search doctors">
                                        <input
                                            id="doctorSearch"
                                            type="search"
                                            className="form-control form-control-sm"
                                            placeholder="Tìm kiếm bác sĩ..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            aria-controls="DataTables_Table_0"
                                        />
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="d-flex table-dropdown mb-3 pb-1 align-items-center flex-wrap row-gap-3 ms-auto">
                        <Button
                            variant="white"
                            size="md"
                            className="me-2 fs-14 py-1 border d-inline-flex text-dark align-items-center"
                            icon="ti ti-filter text-gray-5"
                            onClick={() => {
                                // Sync applied filters to temp filters when opening modal
                                setTempSelectedDoctors(appliedSelectedDoctors);
                                setTempSelectedPositions(appliedSelectedPositions);
                                setTempSelectedSpecialties(appliedSelectedSpecialties);
                                setTempSelectedServiceTypes(appliedSelectedServiceTypes);
                                setTempSelectedPrices(appliedSelectedPrices);
                                setTempSelectedLanguages(appliedSelectedLanguages);
                                setTempSelectedStatuses(appliedSelectedStatuses);
                                setShowFilterModal(true);
                            }}
                        >
                            Lọc
                        </Button>
                        <ActionDropdown
                            type="sort"
                            options={[
                                { value: 'Tên A-Z', label: 'Tên A-Z' },
                                { value: 'Tên Z-A', label: 'Tên Z-A' },
                                {
                                    value: 'Kinh nghiệm (Cao-Thấp)',
                                    label: 'Kinh nghiệm (Cao-Thấp)',
                                },
                                {
                                    value: 'Kinh nghiệm (Thấp-Cao)',
                                    label: 'Kinh nghiệm (Thấp-Cao)',
                                },
                            ]}
                            selectedValue={sortBy}
                            onSelect={setSortBy}
                            placeholder="Sắp xếp theo:"
                        />
                    </div>
                </div>

                <div className="table-responsive">
                    <table className="table table-nowrap datatable">
                        <thead className="thead-light">
                            <tr>
                                <th>Tên & Học vị</th>
                                <th>Chuyên khoa</th>
                                <th>Kinh nghiệm</th>
                                <th>Dịch vụ & Giá</th>
                                <th>Ngôn ngữ</th>
                                <th>Trạng thái</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>{renderTableBody()}</tbody>
                    </table>
                </div>

                {/* Pagination - Only show when needed */}
                {!shouldHidePagination && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                )}

                <div className="footer text-center bg-white p-2 border-top">
                    <p className="text-dark mb-0">
                        2025 &copy;{' '}
                        <Link to="/" className="link-primary">
                            Preclinic
                        </Link>
                        , Tất Cả Quyền Được Bảo Lưu
                    </p>
                </div>
            </div>

            {/* Filter Modal */}
            <ModalFilter
                show={showFilterModal}
                onHide={() => setShowFilterModal(false)}
                onApply={handleFilterSubmit}
                onReset={handleClearFilters}
                title="Lọc Bác Sĩ"
                fields={[
                    {
                        name: 'doctors',
                        label: 'Bác Sĩ',
                        type: 'multiselect',
                        options: originalDoctors.map((doctor) => ({
                            value: doctor.id,
                            label: `${doctor.lastName} ${doctor.firstName}`,
                            key: doctor.id,
                        })),
                        value: tempSelectedDoctors,
                        onChange: setTempSelectedDoctors,
                        resetValue: [],
                    },
                    {
                        name: 'positions',
                        label: 'Học vị',
                        type: 'multiselect',
                        options: filterPositions.map((position, index) => ({
                            value: position.name,
                            label: position.name,
                            key: `position-${index}`,
                        })),
                        value: tempSelectedPositions,
                        onChange: setTempSelectedPositions,
                        resetValue: [],
                    },
                    {
                        name: 'specialties',
                        label: 'Chuyên Khoa',
                        type: 'multiselect',
                        options: filterSpecialties.map((specialty, index) => ({
                            value: specialty.name,
                            label: specialty.name,
                            key: `specialty-${index}`,
                        })),
                        value: tempSelectedSpecialties,
                        onChange: setTempSelectedSpecialties,
                        resetValue: [],
                    },
                    {
                        name: 'serviceTypes',
                        label: 'Loại Dịch Vụ',
                        type: 'multiselect',
                        options: filterServiceTypes.map((serviceType, index) => ({
                            value: serviceType.name,
                            label: serviceType.name,
                            key: `service-type-${index}`,
                        })),
                        value: tempSelectedServiceTypes,
                        onChange: setTempSelectedServiceTypes,
                        resetValue: [],
                    },
                    {
                        name: 'prices',
                        label: 'Giá',
                        type: 'multiselect',
                        options: [
                            { value: 'p-1', label: 'Dưới 200,000 VNĐ', key: 'price-p-1' },
                            { value: 'p-2', label: '200,000 - 400,000 VNĐ', key: 'price-p-2' },
                            { value: 'p-3', label: '400,000 - 600,000 VNĐ', key: 'price-p-3' },
                            { value: 'p-4', label: '600,000 - 800,000 VNĐ', key: 'price-p-4' },
                            { value: 'p-5', label: '800,000 - 1,000,000 VNĐ', key: 'price-p-5' },
                            { value: 'p-6', label: '1,000,000 - 1,500,000 VNĐ', key: 'price-p-6' },
                            { value: 'p-7', label: 'Trên 1,500,000 VNĐ', key: 'price-p-7' },
                        ],
                        value: tempSelectedPrices,
                        onChange: setTempSelectedPrices,
                        resetValue: [],
                    },
                    {
                        name: 'languages',
                        label: 'Ngôn Ngữ',
                        type: 'multiselect',
                        options: filterLanguages.map((language, index) => ({
                            value: language.name,
                            label: language.name,
                            key: `language-${index}`,
                        })),
                        value: tempSelectedLanguages,
                        onChange: setTempSelectedLanguages,
                        resetValue: [],
                    },
                    {
                        name: 'statuses',
                        label: 'Trạng Thái',
                        type: 'multiselect',
                        options: [
                            { value: 'ACTIVE', label: 'Hoạt động', key: 'status-active' },
                            {
                                value: 'INACTIVE',
                                label: 'Không hoạt động',
                                key: 'status-inactive',
                            },
                        ],
                        value: tempSelectedStatuses,
                        onChange: setTempSelectedStatuses,
                        resetValue: [],
                    },
                ]}
            />

            {/* Delete Modal */}
            <ModalDelete
                show={showDeleteModal}
                onHide={handleDeleteCancel}
                onConfirm={handleDeleteConfirm}
                title="Xác Nhận Xóa"
                message="Bạn có chắc chắn muốn xóa bác sĩ này không?"
                itemName={
                    doctorToDelete ? `${doctorToDelete.lastName} ${doctorToDelete.firstName}` : ''
                }
            />
        </>
    );
};

export default ListDoctors;
