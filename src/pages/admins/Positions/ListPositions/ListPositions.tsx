import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import Pagination from '@/components/Pagination';
import Button from '@/components/Button';
import ModalDelete from '@/components/ModalDelete';
import ModalFilter from '@/components/ModalFilter';
import ActionDropdown from '@/components/ActionDropdown';
import StatusBadge from '@/components/StatusBadge';
import TableSkeleton from '@/components/TableSkeleton';
import TableActions from '@/components/TableActions';
import { positionTableColumns } from '@/components/TableSkeleton/skeletonConfigs';
import { Position, PositionFormData } from '@/types/position.types';
import usePosition from '@/hooks/usePosition';
import { PositionService } from '@/services/position.service';
import { getSortParams, SORT_OPTIONS } from '@/utils/sortUtils';
import { useFormValidation } from '@/hooks/useFormValidation';
import EntityModal from '@/components/Modal/EntityModal';
import AppliedFilters from '@/components/AppliedFilters/AppliedFilters';
import styles from './ListPositions.module.scss';

const ListPositions: React.FC = () => {
    // Use Redux state management
    const {
        positions,
        pagination,
        isLoading,
        error,
        fetchPositions,
        createPosition,
        updatePosition,
        deletePosition,
        filterPositions,
        clearError,
    } = usePosition();

    // Local state for UI
    const [selectedPositions, setSelectedPositions] = useState<string[]>([]);
    const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);

    // Applied filters (after clicking "Lọc" button)
    const [appliedPositions, setAppliedPositions] = useState<string[]>([]);
    const [appliedStatuses, setAppliedStatuses] = useState<string[]>([]);
    const [sortBy, setSortBy] = useState<string>('Mới Thêm Gần Đây');
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [positionToDelete, setPositionToDelete] = useState<Position | null>(null);
    const [positionToEdit, setPositionToEdit] = useState<Position | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');

    // State for all positions (for filter modal)
    const [allPositions, setAllPositions] = useState<Position[]>([]);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Fetch positions on component mount
    useEffect(() => {
        const sortParams = getSortParams(sortBy);
        fetchPositions(currentPage, itemsPerPage, sortParams.sortBy, sortParams.sortOrder);
    }, [fetchPositions, currentPage, itemsPerPage, sortBy]);

    // Handle search term changes with debounce
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (searchTerm.trim()) {
                const sortParams = getSortParams(sortBy);
                const filterParams = {
                    pageNumber: 1,
                    pageSize: itemsPerPage,
                    searchTerm: searchTerm.trim(),
                    sortBy: sortParams.sortBy,
                    sortOrder: sortParams.sortOrder,
                };
                setCurrentPage(1);
                filterPositions(filterParams);
            } else {
                // If search is cleared, fetch all positions with current sort
                setCurrentPage(1);
                const sortParams = getSortParams(sortBy);
                fetchPositions(1, itemsPerPage, sortParams.sortBy, sortParams.sortOrder);
            }
        }, 500); // 500ms debounce

        return () => clearTimeout(timeoutId);
    }, [searchTerm, itemsPerPage, filterPositions, fetchPositions]);

    // Position Modal States
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState<PositionFormData>({
        name: '',
        status: 'ACTIVE',
    });

    // Use shared form validation hook
    const { validationErrors, validateForm, clearValidationError, clearAllValidationErrors } =
        useFormValidation({ entityName: 'học vị' });

    const handleAddClick = useCallback(() => {
        setModalMode('add');
        setFormData({
            name: '',
            status: 'ACTIVE',
        });
        clearAllValidationErrors();
        setShowModal(true);
    }, [clearAllValidationErrors]);

    const handleCancel = useCallback(() => {
        setShowModal(false);
        setPositionToEdit(null);
        setFormData({
            name: '',
            status: 'ACTIVE',
        });
        clearAllValidationErrors();
    }, [clearAllValidationErrors]);

    const title = modalMode === 'add' ? 'Thêm Học Vị Mới' : 'Sửa Học Vị';

    // Form data change handlers
    const handleNameChange = (value: string) => {
        setFormData((prev) => ({ ...prev, name: value }));
        clearValidationError('name');
    };

    const handleStatusChange = (value: 'ACTIVE' | 'INACTIVE') => {
        setFormData((prev) => ({ ...prev, status: value }));
        clearValidationError('status');
    };

    // Use pagination from Redux state
    const totalPages = pagination?.totalPages || 0;

    // Client-side filtering for positions (sorting is handled by backend)
    const filteredPositions = useMemo(() => {
        let filtered = positions || [];

        // Filter by applied positions (not selected positions)
        if (appliedPositions.length > 0) {
            filtered = filtered.filter((position) => appliedPositions.includes(position.id));
        }

        return filtered;
    }, [positions, appliedPositions]);

    // Paginate filtered positions for client-side filtering
    const paginatedFilteredPositions = useMemo(() => {
        if (appliedPositions.length === 0) {
            // No position filter, use server-side pagination
            return filteredPositions;
        }

        // Client-side pagination for filtered results
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredPositions.slice(startIndex, endIndex);
    }, [filteredPositions, currentPage, itemsPerPage, appliedPositions.length]);

    // Calculate total pages for client-side filtering
    const effectiveTotalPages = useMemo(() => {
        if (appliedPositions.length === 0) {
            // No position filter, use server-side pagination
            return totalPages;
        }

        // Client-side pagination
        return Math.ceil(filteredPositions.length / itemsPerPage);
    }, [totalPages, filteredPositions.length, itemsPerPage, appliedPositions.length]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);

        // Only fetch from server if no position filter
        if (appliedPositions.length === 0) {
            const sortParams = getSortParams(sortBy);
            fetchPositions(page, itemsPerPage, sortParams.sortBy, sortParams.sortOrder);
        }
        // For position filters, pagination is handled client-side
    };

    const handleFilterSubmit = () => {
        // Apply the selected filters
        setAppliedPositions([...selectedPositions]);
        setAppliedStatuses([...selectedStatuses]);

        // If we have position filters, we need to fetch all positions first
        if (selectedPositions.length > 0) {
            // Fetch all positions without pagination for client-side filtering
            fetchPositions(1, 100); // Large page size to get all positions
        } else {
            // Only status filter, can use backend filtering with sorting
            const sortParams = getSortParams(sortBy);
            const filterParams = {
                pageNumber: 1,
                pageSize: itemsPerPage,
                status:
                    selectedStatuses.length === 1
                        ? (selectedStatuses[0] as 'ACTIVE' | 'INACTIVE')
                        : undefined,
                sortBy: sortParams.sortBy,
                sortOrder: sortParams.sortOrder,
            };
            filterPositions(filterParams);
        }

        setCurrentPage(1);
        setShowFilterModal(false);
    };

    const handleClearFilters = () => {
        setSelectedPositions([]);
        setSelectedStatuses([]);
        setAppliedPositions([]);
        setAppliedStatuses([]);
        setCurrentPage(1);
        const sortParams = getSortParams(sortBy);
        fetchPositions(1, itemsPerPage, sortParams.sortBy, sortParams.sortOrder); // Reset to normal pagination with current sort
    };

    const handleResetFilter = (type: string) => {
        switch (type) {
            case 'positions':
                setSelectedPositions([]);
                break;
            case 'statuses':
                setSelectedStatuses([]);
                break;
            default:
                break;
        }
    };

    // Stop displaying functions
    const handleHideClick = (position: Position) => {
        setPositionToDelete(position);
        setShowDeleteModal(true);
    };

    const handleHideConfirm = async () => {
        if (positionToDelete) {
            try {
                const result = await deletePosition(positionToDelete.id);

                // Check if the operation was successful
                if ((result as any).type.endsWith('/fulfilled')) {
                    // Success - show toast and close modal
                    setShowDeleteModal(false);
                    setPositionToDelete(null);
                    toast.success(
                        `Đã ngừng hiển thị học vị "${positionToDelete.name}" thành công!`
                    );

                    // Refresh the positions list
                    const sortParams = getSortParams(sortBy);
                    fetchPositions(
                        currentPage,
                        itemsPerPage,
                        sortParams.sortBy,
                        sortParams.sortOrder
                    );
                } else if ((result as any).type.endsWith('/rejected')) {
                    // Error - show error message
                    const errorMessage =
                        ((result as any).payload as string) ||
                        'Có lỗi xảy ra khi ngừng hiển thị học vị. Vui lòng thử lại.';
                    toast.error(errorMessage);
                }
            } catch (error: any) {
                console.error('Error hiding position:', error);

                // Show specific error message
                const errorMessage =
                    error.message || 'Có lỗi xảy ra khi ngừng hiển thị học vị. Vui lòng thử lại.';
                toast.error(errorMessage);
            }
        }
    };

    const handleHideCancel = () => {
        setShowDeleteModal(false);
        setPositionToDelete(null);
    };

    // Position modal functions
    const handlePositionSubmit = async () => {
        // Client-side validation
        if (!validateForm(formData)) {
            return; // Stop if validation fails
        }

        setIsSubmitting(true);

        try {
            let result;
            if (modalMode === 'add') {
                // Create new position
                result = await createPosition(formData);
            } else {
                // Update position
                if (!positionToEdit) {
                    toast.error('Không tìm thấy thông tin học vị cần cập nhật');
                    return;
                }

                console.log('Updating position:', {
                    id: positionToEdit.id,
                    formData: formData,
                    positionToEdit: positionToEdit,
                });

                result = await updatePosition(positionToEdit.id, formData);
            }

            // Check if the operation was successful
            if ((result as any).type.endsWith('/fulfilled')) {
                // Success - show toast and close modal
                if (modalMode === 'add') {
                    toast.success('Tạo học vị thành công!');
                } else {
                    toast.success('Cập nhật học vị thành công!');
                }

                // Close modal and refresh data
                setShowModal(false);
                setPositionToEdit(null);
                setFormData({
                    name: '',
                    status: 'ACTIVE',
                });
                clearAllValidationErrors();

                // Refresh the positions list
                const sortParams = getSortParams(sortBy);
                fetchPositions(currentPage, itemsPerPage, sortParams.sortBy, sortParams.sortOrder);
            } else if ((result as any).type.endsWith('/rejected')) {
                // Error - show error message
                const errorMessage =
                    ((result as any).payload as string) || 'Có lỗi xảy ra. Vui lòng thử lại.';
                toast.error(errorMessage);
            }
        } catch (error: any) {
            console.error('Error saving position:', error);

            // Show specific error message
            const errorMessage = error.message || 'Có lỗi xảy ra. Vui lòng thử lại.';
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditClickWithPosition = (position: Position) => {
        setPositionToEdit(position);
        setModalMode('edit');
        setFormData({
            name: position.name,
            status: position.status,
        });
        clearAllValidationErrors();
        setShowModal(true);
    };

    // Function to fetch all positions for filter modal
    const fetchAllPositionsForFilter = async () => {
        try {
            const response = await PositionService.getAllPositions(1, 100); // Large page size to get all
            setAllPositions(response.data.positions);
        } catch (error) {
            console.error('Error fetching all positions for filter:', error);
            setAllPositions([]);
        }
    };

    // Render table body content based on loading, error, and data states
    const renderTableBody = () => {
        if (isLoading) {
            return <TableSkeleton rows={itemsPerPage} columns={positionTableColumns} />;
        }

        if (error) {
            return (
                <tr>
                    <td colSpan={5} className="text-center py-4">
                        <div className="alert alert-danger" role="alert">
                            <strong>Lỗi:</strong> {error}
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

        if (!paginatedFilteredPositions || paginatedFilteredPositions.length === 0) {
            return (
                <tr>
                    <td colSpan={5} className="text-center py-4">
                        <p className="text-muted">Không có học vị nào được tìm thấy.</p>
                    </td>
                </tr>
            );
        }

        return paginatedFilteredPositions.map((position) => (
            <tr key={position.id}>
                <td>
                    <div className="d-flex align-items-center">
                        <div className="avatar me-2">
                            <div className="avatar-title bg-primary-subtle text-primary rounded">
                                <i className="ti ti-briefcase"></i>
                            </div>
                        </div>
                        <div>
                            <h6 className="mb-1 fs-14 fw-semibold">{position.name}</h6>
                            <span className="text-muted fs-13">ID: {position.id}</span>
                        </div>
                    </div>
                </td>
                <td>
                    <span className="text-muted fs-14">
                        {position.createdAt
                            ? new Date(position.createdAt).toLocaleDateString('vi-VN')
                            : 'N/A'}
                    </span>
                </td>
                <td>
                    <span className="text-muted fs-14">
                        {position.updatedAt
                            ? new Date(position.updatedAt).toLocaleDateString('vi-VN')
                            : 'N/A'}
                    </span>
                </td>
                <td>
                    <StatusBadge status={position.status} />
                </td>
                <td className="action-item">
                    <TableActions
                        id={position.id}
                        onEdit={() => handleEditClickWithPosition(position)}
                        onHide={() => handleHideClick(position)}
                        showEdit={true}
                        showDelete={false}
                        showHide={true}
                        showView={false}
                    />
                </td>
            </tr>
        ));
    };

    return (
        <>
            <div className="content">
                <div className="d-flex align-items-sm-center flex-sm-row flex-column gap-2 mb-3 pb-3 border-bottom">
                    <div className="flex-grow-1">
                        <h4 className="fw-bold mb-0">
                            Danh Sách Học Vị{' '}
                            <span className="badge badge-soft-primary fs-13 fw-medium ms-2">
                                Tổng Học Vị:{' '}
                                {appliedPositions.length > 0
                                    ? filteredPositions.length
                                    : pagination?.totalCount || 0}
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
                                to="/admins/positions"
                                className="bg-light rounded p-1 d-flex align-items-center justify-content-center"
                            >
                                <i className="ti ti-list fs-14 text-body"></i>
                            </Link>
                            <Link
                                to="/admins/positions"
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
                            onClick={handleAddClick}
                        >
                            Thêm Học Vị
                        </Button>
                    </div>
                </div>

                <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-3">
                    <div className="search-set mb-3">
                        <div className="d-flex align-items-center flex-wrap gap-2">
                            <div className="table-search d-flex align-items-center mb-0">
                                <div className="search-input">
                                    <label htmlFor="positionSearch" aria-label="Search positions">
                                        <input
                                            id="positionSearch"
                                            type="search"
                                            className="form-control form-control-sm"
                                            placeholder="Tìm kiếm"
                                            aria-controls="DataTables_Table_0"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        ></input>
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
                            onClick={async () => {
                                // Sync selected filters with applied filters when opening modal
                                setSelectedPositions([...appliedPositions]);
                                setSelectedStatuses([...appliedStatuses]);
                                // Fetch all positions for filter modal
                                await fetchAllPositionsForFilter();
                                setShowFilterModal(true);
                            }}
                        >
                            Lọc
                        </Button>
                        <ActionDropdown
                            type="sort"
                            options={SORT_OPTIONS}
                            selectedValue={sortBy}
                            onSelect={(newSortBy) => {
                                setSortBy(newSortBy);
                                setCurrentPage(1);

                                // Fetch positions with new sort parameters
                                if (appliedPositions.length === 0) {
                                    const sortParams = getSortParams(newSortBy);
                                    fetchPositions(
                                        1,
                                        itemsPerPage,
                                        sortParams.sortBy,
                                        sortParams.sortOrder
                                    );
                                }
                            }}
                            placeholder="Sắp xếp theo:"
                        />
                    </div>
                </div>

                {/* Applied Filters */}
                <AppliedFilters
                    appliedItems={appliedPositions}
                    appliedStatuses={appliedStatuses}
                    items={positions || []}
                    onRemoveItem={(positionId) => {
                        const newAppliedPositions = appliedPositions.filter(
                            (id) => id !== positionId
                        );
                        setAppliedPositions(newAppliedPositions);
                        setSelectedPositions(newAppliedPositions);
                    }}
                    onRemoveStatus={(status) => {
                        const newAppliedStatuses = appliedStatuses.filter((s) => s !== status);
                        setAppliedStatuses(newAppliedStatuses);
                        setSelectedStatuses(newAppliedStatuses);
                    }}
                    onClearAll={handleClearFilters}
                    styles={{
                        appliedFiltersContainer: styles.appliedFiltersContainer,
                        appliedFiltersLabel: styles.appliedFiltersLabel,
                        filterBadgeClose: styles.filterBadgeClose,
                        clearAllButton: styles.clearAllButton,
                    }}
                />

                <div className="table-responsive">
                    <table className="table table-nowrap datatable">
                        <thead className="thead-light">
                            <tr>
                                <th>Tên Học Vị</th>
                                <th>Ngày Tạo</th>
                                <th>Ngày Cập Nhật</th>
                                <th>Trạng Thái</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>{renderTableBody()}</tbody>
                    </table>
                </div>

                {/* Pagination */}
                {effectiveTotalPages > 1 && (
                    <div className="d-flex justify-content-center mt-3">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={effectiveTotalPages}
                            onPageChange={handlePageChange}
                        />
                    </div>
                )}
            </div>

            {/* Position Modal */}
            <EntityModal
                show={showModal}
                title={title}
                formData={formData}
                validationErrors={validationErrors}
                isSubmitting={isSubmitting}
                modalMode={modalMode}
                onCancel={handleCancel}
                onSubmit={handlePositionSubmit}
                onNameChange={handleNameChange}
                onStatusChange={handleStatusChange}
                entityName="Học Vị"
                styles={{
                    modal: styles.modal,
                    'modal-content': styles['modal-content'],
                    invalidFeedback: styles.invalidFeedback,
                    reactSelectInvalid: styles.reactSelectInvalid,
                }}
            />

            {/* Stop Displaying Confirmation Modal */}
            <ModalDelete
                show={showDeleteModal}
                onHide={handleHideCancel}
                onConfirm={handleHideConfirm}
                title="Ngừng hiển thị học vị"
                message={`Bạn có chắc chắn muốn ngừng hiển thị học vị "${positionToDelete?.name}"? Học vị này sẽ không hiển thị trong danh sách.`}
                confirmText="Có, Ngừng hiển thị"
            />

            {/* Filter Modal */}
            <ModalFilter
                show={showFilterModal}
                onHide={() => setShowFilterModal(false)}
                onApply={handleFilterSubmit}
                onReset={handleClearFilters}
                title="Bộ lọc học vị"
                fields={[
                    {
                        name: 'positions',
                        label: 'Học Vị',
                        type: 'multiselect',
                        options: (allPositions || []).map((position) => ({
                            value: position.id,
                            label: position.name,
                        })),
                        value: selectedPositions,
                        onChange: setSelectedPositions,
                        resetValue: () => handleResetFilter('positions'),
                    },
                    {
                        name: 'statuses',
                        label: 'Trạng Thái',
                        type: 'multiselect',
                        options: [
                            { value: 'ACTIVE', label: 'Hoạt động' },
                            { value: 'INACTIVE', label: 'Không hoạt động' },
                        ],
                        value: selectedStatuses,
                        onChange: setSelectedStatuses,
                        resetValue: () => handleResetFilter('statuses'),
                    },
                ]}
            />
        </>
    );
};

export default ListPositions;
