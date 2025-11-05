import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { toast } from 'react-toastify';
import Pagination from '@/components/Pagination';
import Button from '@/components/Button';
import ModalDelete from '@/components/ModalDelete';
import ModalFilter from '@/components/ModalFilter';
import StatusBadge from '@/components/StatusBadge';
import TableSkeleton from '@/components/TableSkeleton';
import TableActions from '@/components/TableActions';
import AppliedFilters from '@/components/AppliedFilters/AppliedFilters';
import EntityModal from '@/components/Modal/EntityModal';
import { Specialty, SpecialtyFormData } from '@/types/specialty.types';
import useSpecialty from '@/hooks/useSpecialty';
import { getAllSpecialties } from '@/services/specialty.service';
import { getSortParams, SORT_OPTIONS } from '@/utils/sortUtils';
import { useEntityForm } from '@/hooks/useEntityForm';
import ActionDropdown from '@/components/ActionDropdown';
import styles from './ListSpecialties.module.scss';

// Skeleton columns for specialty table
const specialtyTableColumns = [
    { label: 'Chuyên khoa', hasAvatar: true, type: 'text' as const },
    { label: 'Hình ảnh', hasAvatar: false, type: 'text' as const },
    { label: 'Ngày tạo', hasAvatar: false, type: 'text' as const },
    { label: 'Ngày cập nhật', hasAvatar: false, type: 'text' as const },
    { label: 'Trạng thái', hasAvatar: false, type: 'text' as const },
    { label: 'Hành động', hasAvatar: false, type: 'text' as const },
];

const ListSpecialties: React.FC = () => {
    // Use Redux state management
    const {
        specialties,
        pagination,
        isLoading,
        error,
        fetchSpecialties,
        createSpecialty,
        createSpecialtyWithImage,
        updateSpecialty,
        updateSpecialtyWithImage,
        deleteSpecialty,
        filterSpecialties,
        clearError,
    } = useSpecialty();

    // Local state for UI
    const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
    const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);

    // Applied filters (after clicking "Lọc" button)
    const [appliedSpecialties, setAppliedSpecialties] = useState<string[]>([]);
    const [appliedStatuses, setAppliedStatuses] = useState<string[]>([]);
    const [sortBy, setSortBy] = useState<string>('Mới thêm gần đây');
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [specialtyToDelete, setSpecialtyToDelete] = useState<Specialty | null>(null);
    const [specialtyToEdit, setSpecialtyToEdit] = useState<Specialty | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');

    // State for all specialties (for filter modal)
    const [allSpecialties, setAllSpecialties] = useState<Specialty[]>([]);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Image upload states are now handled by useImageUpload hook

    // Fetch specialties on component mount
    useEffect(() => {
        const sortParams = getSortParams(sortBy);
        fetchSpecialties(currentPage, itemsPerPage, sortParams.sortBy, sortParams.sortOrder);
    }, [fetchSpecialties, currentPage, itemsPerPage, sortBy]);

    // Helper function to handle search with filters
    const handleSearchWithFilters = () => {
        const sortParams = getSortParams(sortBy);
        const filterParams = {
            pageNumber: 1,
            pageSize: itemsPerPage,
            searchTerm: searchTerm.trim(),
            sortBy: sortParams.sortBy,
            sortOrder: sortParams.sortOrder,
        };
        setCurrentPage(1);
        filterSpecialties(filterParams);
    };

    // Helper function to handle search clear
    const handleSearchClear = () => {
        setCurrentPage(1);
        const sortParams = getSortParams(sortBy);
        fetchSpecialties(1, itemsPerPage, sortParams.sortBy, sortParams.sortOrder);
    };

    // Handle search term changes with debounce
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (searchTerm.trim()) {
                handleSearchWithFilters();
            } else {
                handleSearchClear();
            }
        }, 500); // 500ms debounce

        return () => clearTimeout(timeoutId);
    }, [searchTerm, itemsPerPage, filterSpecialties, fetchSpecialties, sortBy]);

    // Use entity form hook
    const {
        showModal,
        setShowModal,
        modalMode,
        setModalMode,
        isSubmitting,
        setIsSubmitting,
        formData,
        setFormData,
        validationErrors,
        validateForm,
        clearAllValidationErrors,
        imagePreview,
        imageFile,
        setImagePreview,
        setImageFile,
        handleImageFileChange,
        handleRemoveImage,
        handleAddClick,
        handleCancel,
        handleNameChange,
        handleStatusChange,
        resetForm,
    } = useEntityForm<SpecialtyFormData>({
        entityName: 'chuyên khoa',
        initialFormData: {
            name: '',
            imageUrl: '',
            status: 'ACTIVE',
        },
    });

    // Override handleCancel to include specialtyToEdit reset
    const handleCancelWithSpecialty = useCallback(() => {
        handleCancel();
        setSpecialtyToEdit(null);
    }, [handleCancel]);

    const title = modalMode === 'add' ? 'Thêm chuyên khoa mới' : 'Sửa chuyên khoa';

    // Use pagination from Redux state
    const totalPages = pagination?.totalPages || 0;

    // Client-side filtering for specialties (sorting is handled by backend)
    const filteredSpecialties = useMemo(() => {
        let filtered = specialties || [];

        // Filter by applied specialties (not selected specialties)
        if (appliedSpecialties.length > 0) {
            filtered = filtered.filter((specialty) => appliedSpecialties.includes(specialty.id));
        }

        return filtered;
    }, [specialties, appliedSpecialties]);

    // Paginate filtered specialties for client-side filtering
    const paginatedFilteredSpecialties = useMemo(() => {
        if (appliedSpecialties.length === 0) {
            // No specialty filter, use server-side pagination
            return filteredSpecialties;
        }

        // Client-side pagination for filtered results
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredSpecialties.slice(startIndex, endIndex);
    }, [filteredSpecialties, currentPage, itemsPerPage, appliedSpecialties.length]);

    // Calculate total pages for client-side filtering
    const effectiveTotalPages = useMemo(() => {
        if (appliedSpecialties.length === 0) {
            // No specialty filter, use server-side pagination
            return totalPages;
        }

        // Client-side pagination
        return Math.ceil(filteredSpecialties.length / itemsPerPage);
    }, [totalPages, filteredSpecialties.length, itemsPerPage, appliedSpecialties.length]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);

        // Only fetch from server if no specialty filter
        if (appliedSpecialties.length === 0) {
            const sortParams = getSortParams(sortBy);
            fetchSpecialties(page, itemsPerPage, sortParams.sortBy, sortParams.sortOrder);
        }
        // For specialty filters, pagination is handled client-side
    };

    // Helper function to apply specialty filters
    const applySpecialtyFilters = () => {
        setAppliedSpecialties([...selectedSpecialties]);
        setAppliedStatuses([...selectedStatuses]);
        setCurrentPage(1);
        setShowFilterModal(false);

        // Fetch all specialties without pagination for client-side filtering
        fetchSpecialties(1, 100); // Large page size to get all specialties
    };

    // Helper function to apply status filters only
    const applyStatusFilters = () => {
        setAppliedSpecialties([...selectedSpecialties]);
        setAppliedStatuses([...selectedStatuses]);
        setCurrentPage(1);
        setShowFilterModal(false);

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
        filterSpecialties(filterParams);
    };

    const handleFilterSubmit = () => {
        // If we have specialty filters, we need to fetch all specialties first
        if (selectedSpecialties.length > 0) {
            applySpecialtyFilters();
        } else {
            applyStatusFilters();
        }
    };

    const handleClearFilters = () => {
        setSelectedSpecialties([]);
        setSelectedStatuses([]);
        setAppliedSpecialties([]);
        setAppliedStatuses([]);
        setCurrentPage(1);
        const sortParams = getSortParams(sortBy);
        fetchSpecialties(1, itemsPerPage, sortParams.sortBy, sortParams.sortOrder); // Reset to normal pagination with current sort
    };

    const handleResetFilter = () => {
        handleClearFilters();
    };

    // Stop displaying functions
    const handleHideClick = (specialty: Specialty) => {
        setSpecialtyToDelete(specialty);
        setShowDeleteModal(true);
    };

    // Helper function to handle successful delete operation
    const handleSuccessfulDelete = (specialtyName: string) => {
        setShowDeleteModal(false);
        setSpecialtyToDelete(null);
        toast.success(`Đã ngừng hiển thị chuyên khoa "${specialtyName}" thành công!`);

        // Refresh the specialties list
        const sortParams = getSortParams(sortBy);
        fetchSpecialties(currentPage, itemsPerPage, sortParams.sortBy, sortParams.sortOrder);
    };

    // Helper function to handle delete error
    const handleDeleteError = (error: any) => {
        console.error('Error hiding specialty:', error);
        const errorMessage =
            error.message || 'Có lỗi xảy ra khi ngừng hiển thị chuyên khoa. Vui lòng thử lại.';
        toast.error(errorMessage);
    };

    const handleHideConfirm = async () => {
        if (!specialtyToDelete) return;

        try {
            const result = await deleteSpecialty(specialtyToDelete.id);

            // Check if the operation was successful

            if (result.type?.endsWith('/fulfilled')) {
                handleSuccessfulDelete(specialtyToDelete.name);
            } else if (result.type?.endsWith('/rejected')) {
                // Error - show error message

                const errorMessage =
                    result.payload ||
                    'Có lỗi xảy ra khi ngừng hiển thị chuyên khoa. Vui lòng thử lại.';
                toast.error(errorMessage);
            }
        } catch (error: any) {
            handleDeleteError(error);
        }
    };

    const handleHideCancel = () => {
        setShowDeleteModal(false);
        setSpecialtyToDelete(null);
    };

    // Helper function to create specialty
    const createSpecialtyData = async () => {
        if (imageFile) {
            return await createSpecialtyWithImage({ ...formData, imageFile });
        } else {
            return await createSpecialty(formData);
        }
    };

    // Helper function to update specialty
    const updateSpecialtyData = async () => {
        if (!specialtyToEdit) {
            toast.error('Không tìm thấy thông tin chuyên khoa cần cập nhật');
            return null;
        }

        console.log('Updating specialty:', {
            id: specialtyToEdit.id,
            formData: formData,
            specialtyToEdit: specialtyToEdit,
            imageUrl: formData.imageUrl,
        });

        if (imageFile) {
            return await updateSpecialtyWithImage(specialtyToEdit.id, {
                ...formData,
                imageFile,
            });
        } else {
            return await updateSpecialty(specialtyToEdit.id, formData);
        }
    };

    // Helper function to handle successful operation
    const handleSuccessfulOperation = () => {
        if (modalMode === 'add') {
            toast.success('Tạo chuyên khoa thành công!');
        } else {
            toast.success('Cập nhật chuyên khoa thành công!');
        }

        // Close modal and refresh data
        setShowModal(false);
        setSpecialtyToEdit(null);
        resetForm();

        // Refresh the specialties list
        const sortParams = getSortParams(sortBy);
        fetchSpecialties(currentPage, itemsPerPage, sortParams.sortBy, sortParams.sortOrder);
    };

    // Helper function to handle error
    const handleOperationError = (error: any, defaultMessage: string) => {
        console.error('Error saving specialty:', error);
        const errorMessage = error.message || defaultMessage;
        toast.error(errorMessage);
    };

    // Specialty modal functions
    const handleSpecialtySubmit = async () => {
        // Client-side validation
        if (!validateForm(formData)) {
            return; // Stop if validation fails
        }

        setIsSubmitting(true);

        try {
            let result;
            if (modalMode === 'add') {
                result = await createSpecialtyData();
            } else {
                result = await updateSpecialtyData();
                if (!result) return; // Early return if validation failed
            }

            // Check if the operation was successful

            if (result.type?.endsWith('/fulfilled')) {
                handleSuccessfulOperation();
            } else if (result.type?.endsWith('/rejected')) {
                // Error - show error message

                const errorMessage = result.payload || 'Có lỗi xảy ra. Vui lòng thử lại.';
                toast.error(errorMessage);
            }
        } catch (error: any) {
            handleOperationError(error, 'Có lỗi xảy ra. Vui lòng thử lại.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditClickWithSpecialty = (specialty: Specialty) => {
        setSpecialtyToEdit(specialty);
        setModalMode('edit');
        setFormData({
            name: specialty.name,
            imageUrl: specialty.imageUrl,
            status: specialty.status,
        });
        setImagePreview(specialty.imageUrl);
        setImageFile(null);
        clearAllValidationErrors();
        setShowModal(true);
    };

    // Function to fetch all specialties for filter modal
    const fetchAllSpecialtiesForFilter = async () => {
        try {
            const response = await getAllSpecialties(1, 100); // Large page size to get all
            setAllSpecialties(response.data.items);
        } catch (error) {
            console.error('Error fetching all specialties for filter:', error);
            setAllSpecialties([]);
        }
    };

    // Helper function to render error state
    const renderErrorState = () => (
        <tr>
            <td colSpan={6} className="text-center py-4">
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

    // Helper function to render empty state
    const renderEmptyState = () => (
        <tr>
            <td colSpan={6} className="text-center py-4">
                <p className="text-muted">Không có chuyên khoa nào được tìm thấy.</p>
            </td>
        </tr>
    );

    // Helper function to render specialty row
    const renderSpecialtyRow = (specialty: Specialty) => (
        <tr key={specialty.id}>
            <td>
                <div className="d-flex align-items-center">
                    <div className="avatar me-2">
                        <div className="avatar-title bg-primary-subtle text-primary rounded">
                            <i className="ti ti-stethoscope"></i>
                        </div>
                    </div>
                    <div>
                        <h6 className="mb-1 fs-14 fw-semibold">{specialty.name}</h6>
                        <span className="text-muted fs-13">ID: {specialty.id}</span>
                    </div>
                </div>
            </td>
            <td>
                <div className={styles.imagePreviewSmall}>
                    <img
                        src={specialty.imageUrl}
                        alt={specialty.name}
                        onError={(e) => {
                            (e.target as HTMLImageElement).src =
                                'https://via.placeholder.com/80x80?text=No+Image';
                        }}
                    />
                </div>
            </td>
            <td>
                <span className="text-muted fs-14">
                    {specialty.createdAt
                        ? new Date(specialty.createdAt).toLocaleDateString('vi-VN')
                        : 'N/A'}
                </span>
            </td>
            <td>
                <span className="text-muted fs-14">
                    {specialty.updatedAt
                        ? new Date(specialty.updatedAt).toLocaleDateString('vi-VN')
                        : 'N/A'}
                </span>
            </td>
            <td>
                <StatusBadge status={specialty.status} />
            </td>
            <td className="action-item">
                <TableActions
                    id={specialty.id}
                    onEdit={() => handleEditClickWithSpecialty(specialty)}
                    onHide={() => handleHideClick(specialty)}
                    showEdit={true}
                    showDelete={false}
                    showHide={true}
                    showView={false}
                />
            </td>
        </tr>
    );

    // Render table body content based on loading, error, and data states
    const renderTableBody = () => {
        if (isLoading) {
            return <TableSkeleton rows={itemsPerPage} columns={specialtyTableColumns} />;
        }

        if (error) {
            return renderErrorState();
        }

        if (!paginatedFilteredSpecialties || paginatedFilteredSpecialties.length === 0) {
            return renderEmptyState();
        }

        return paginatedFilteredSpecialties.map(renderSpecialtyRow);
    };

    return (
        <div className="content">
            <div className="d-flex align-items-sm-center flex-sm-row flex-column gap-2 mb-3 pb-3 border-bottom">
                <div className="flex-grow-1">
                    <h4 className="fw-bold mb-0">
                        Danh sách chuyên khoa{' '}
                        <span className="badge badge-soft-primary fs-13 fw-medium ms-2">
                            Tổng chuyên khoa:{' '}
                            {appliedSpecialties.length > 0
                                ? filteredSpecialties.length
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
                    <Button
                        variant="primary"
                        size="md"
                        className="ms-2 fs-13"
                        icon="ti ti-plus"
                        onClick={handleAddClick}
                    >
                        Thêm chuyên khoa
                    </Button>
                </div>
            </div>

            <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-3">
                <div className="search-set mb-3">
                    <div className="d-flex align-items-center flex-wrap gap-2">
                        <div className="table-search d-flex align-items-center mb-0">
                            <div className="search-input">
                                <label htmlFor="specialtySearch" aria-label="Search specialties">
                                    <input
                                        id="specialtySearch"
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
                            setSelectedSpecialties([...appliedSpecialties]);
                            setSelectedStatuses([...appliedStatuses]);
                            // Fetch all specialties for filter modal
                            await fetchAllSpecialtiesForFilter();
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

                            // Fetch specialties with new sort parameters
                            if (appliedSpecialties.length === 0) {
                                const sortParams = getSortParams(newSortBy);
                                fetchSpecialties(
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
                appliedItems={appliedSpecialties}
                appliedStatuses={appliedStatuses}
                items={specialties || []}
                onRemoveItem={(specialtyId: string) => {
                    const newAppliedSpecialties = appliedSpecialties.filter(
                        (id) => id !== specialtyId
                    );
                    setAppliedSpecialties(newAppliedSpecialties);
                    setSelectedSpecialties(newAppliedSpecialties);
                }}
                onRemoveStatus={(status: string) => {
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
                            <th>Tên chuyên khoa</th>
                            <th>Hình ảnh</th>
                            <th>Ngày tạo</th>
                            <th>Ngày cập nhật</th>
                            <th>Trạng thái</th>
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

            {/* Specialty Modal */}
            <EntityModal
                show={showModal}
                title={title}
                formData={formData}
                validationErrors={validationErrors}
                isSubmitting={isSubmitting}
                modalMode={modalMode}
                onCancel={handleCancelWithSpecialty}
                onSubmit={handleSpecialtySubmit}
                onNameChange={handleNameChange}
                onImageFileChange={handleImageFileChange}
                onRemoveImage={handleRemoveImage}
                onStatusChange={handleStatusChange}
                imagePreview={imagePreview}
                entityName="Chuyên khoa"
                hasImageUpload={true}
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
                title="Ngừng hiển thị chuyên khoa"
                message={`Bạn có chắc chắn muốn ngừng hiển thị chuyên khoa "${specialtyToDelete?.name}"? Chuyên khoa này sẽ không hiển thị trong danh sách.`}
                confirmText="Có, Ngừng hiển thị"
            />

            {/* Filter Modal */}
            <ModalFilter
                show={showFilterModal}
                onHide={() => setShowFilterModal(false)}
                onApply={handleFilterSubmit}
                onReset={handleResetFilter}
                title="Bộ lọc chuyên khoa"
                fields={[
                    {
                        name: 'specialties',
                        label: 'Chuyên khoa',
                        type: 'multiselect',
                        options: (allSpecialties || []).map((specialty) => ({
                            value: specialty.id,
                            label: specialty.name,
                        })),
                        value: selectedSpecialties,
                        onChange: setSelectedSpecialties,
                        resetValue: () => setSelectedSpecialties([]),
                    },
                    {
                        name: 'statuses',
                        label: 'Trạng thái',
                        type: 'multiselect',
                        options: [
                            { value: 'ACTIVE', label: 'Hoạt động' },
                            { value: 'INACTIVE', label: 'Không hoạt động' },
                        ],
                        value: selectedStatuses,
                        onChange: setSelectedStatuses,
                        resetValue: () => setSelectedStatuses([]),
                    },
                ]}
            />
        </div>
    );
};

export default ListSpecialties;
