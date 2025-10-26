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
import { ServiceType, ServiceTypeFormData } from '@/types/serviceType.types';
import { useServiceType } from '@/hooks/useServiceType';
import {
    getAllServiceTypesSimple,
    updateServiceTypeWithImage,
    updateServiceTypeWithoutImage,
    updateServiceTypeRemoveImage,
    createServiceTypeWithImage,
} from '@/services/serviceType.service';
import { getSortParams, SORT_OPTIONS } from '@/utils/sortUtils';
import { useEntityForm } from '@/hooks/useEntityForm';
import ActionDropdown from '@/components/ActionDropdown';
import styles from './ListServiceTypes.module.scss';

// Skeleton columns for service type table
const serviceTypeTableColumns = [
    { label: 'Loại Dịch Vụ', hasAvatar: true, type: 'text' as const },
    { label: 'Hình ảnh', hasAvatar: false, type: 'text' as const },
    { label: 'Mô tả', hasAvatar: false, type: 'text' as const },
    { label: 'Ngày tạo', hasAvatar: false, type: 'text' as const },
    { label: 'Ngày cập nhật', hasAvatar: false, type: 'text' as const },
    { label: 'Trạng thái', hasAvatar: false, type: 'text' as const },
    { label: 'Hành động', hasAvatar: false, type: 'text' as const },
];

const ListServiceTypes: React.FC = () => {
    // Use Redux state management
    const {
        serviceTypes,
        pagination,
        isLoading,
        error,
        fetchServiceTypes,
        createServiceType,
        deleteServiceType,
        filterServiceTypes,
        clearError,
    } = useServiceType();

    // Local state for UI
    const [selectedServiceTypes, setSelectedServiceTypes] = useState<string[]>([]);
    const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);

    // Applied filters (after clicking "Lọc" button)
    const [appliedServiceTypes, setAppliedServiceTypes] = useState<string[]>([]);
    const [appliedStatuses, setAppliedStatuses] = useState<string[]>([]);
    const [sortBy, setSortBy] = useState<string>('Mới Thêm Gần Đây');
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [serviceTypeToDelete, setServiceTypeToDelete] = useState<ServiceType | null>(null);
    const [serviceTypeToEdit, setServiceTypeToEdit] = useState<ServiceType | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');

    // State for all service types (for filter modal)
    const [allServiceTypes, setAllServiceTypes] = useState<ServiceType[]>([]);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Image upload states are now handled by useImageUpload hook

    // Fetch service types on component mount
    useEffect(() => {
        const sortParams = getSortParams(sortBy);
        fetchServiceTypes({
            pageNumber: currentPage,
            pageSize: itemsPerPage,
            sortBy: sortParams.sortBy,
            sortOrder: sortParams.sortOrder,
        });
    }, [fetchServiceTypes, currentPage, itemsPerPage, sortBy]);

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
        filterServiceTypes(filterParams);
    };

    // Helper function to handle search clear
    const handleSearchClear = () => {
        setCurrentPage(1);
        const sortParams = getSortParams(sortBy);
        fetchServiceTypes({
            pageNumber: 1,
            pageSize: itemsPerPage,
            sortBy: sortParams.sortBy,
            sortOrder: sortParams.sortOrder,
        });
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
    }, [searchTerm, itemsPerPage, filterServiceTypes, fetchServiceTypes, sortBy]);

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
        handleDescriptionChange,
        handleStatusChange,
        resetForm,
    } = useEntityForm<ServiceTypeFormData>({
        entityName: 'loại dịch vụ',
        initialFormData: {
            name: '',
            description: '',
            imageUrl: '',
            status: 'ACTIVE',
        },
    });

    // Override handleCancel to include serviceTypeToEdit reset
    const handleCancelWithServiceType = useCallback(() => {
        handleCancel();
        setServiceTypeToEdit(null);
    }, [handleCancel]);

    const title = modalMode === 'add' ? 'Thêm Loại Dịch Vụ Mới' : 'Sửa Loại Dịch Vụ';

    // Use pagination from Redux state
    const totalPages = pagination?.totalPages || 0;

    // Client-side filtering for service types (sorting is handled by backend)
    const filteredServiceTypes = useMemo(() => {
        let filtered = serviceTypes || [];

        // Filter by applied service types (not selected service types)
        if (appliedServiceTypes.length > 0) {
            filtered = filtered.filter((serviceType: ServiceType) =>
                appliedServiceTypes.includes(serviceType.id)
            );
        }

        // Filter by applied statuses
        if (appliedStatuses.length > 0) {
            filtered = filtered.filter((serviceType: ServiceType) =>
                appliedStatuses.includes(serviceType.status)
            );
        }

        return filtered;
    }, [serviceTypes, appliedServiceTypes, appliedStatuses]);

    // Paginate filtered service types for client-side filtering
    const paginatedFilteredServiceTypes = useMemo(() => {
        if (appliedServiceTypes.length === 0 && appliedStatuses.length === 0) {
            // No filters applied, use server-side pagination
            return filteredServiceTypes;
        }

        // Client-side pagination for filtered results
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredServiceTypes.slice(startIndex, endIndex);
    }, [
        filteredServiceTypes,
        currentPage,
        itemsPerPage,
        appliedServiceTypes.length,
        appliedStatuses.length,
    ]);

    // Calculate total pages for client-side filtering
    const effectiveTotalPages = useMemo(() => {
        if (appliedServiceTypes.length === 0 && appliedStatuses.length === 0) {
            // No filters applied, use server-side pagination
            return totalPages;
        }

        // Client-side pagination
        return Math.ceil(filteredServiceTypes.length / itemsPerPage);
    }, [
        totalPages,
        filteredServiceTypes.length,
        itemsPerPage,
        appliedServiceTypes.length,
        appliedStatuses.length,
    ]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);

        // Only fetch from server if no filters applied
        if (appliedServiceTypes.length === 0 && appliedStatuses.length === 0) {
            const sortParams = getSortParams(sortBy);
            fetchServiceTypes({
                pageNumber: page,
                pageSize: itemsPerPage,
                sortBy: sortParams.sortBy,
                sortOrder: sortParams.sortOrder,
            });
        }
        // For filters, pagination is handled client-side
    };

    // Helper function to apply service type filters
    const applyServiceTypeFilters = () => {
        setAppliedServiceTypes([...selectedServiceTypes]);
        setAppliedStatuses([...selectedStatuses]);
        setCurrentPage(1);
        setShowFilterModal(false);

        // Fetch all service types without pagination for client-side filtering
        fetchServiceTypes({ pageNumber: 1, pageSize: 100 }); // Large page size to get all service types
    };

    const handleFilterSubmit = () => {
        // If we have any filters, we need to fetch all service types first
        if (selectedServiceTypes.length > 0 || selectedStatuses.length > 0) {
            applyServiceTypeFilters();
        } else {
            // No filters, reset to normal pagination
            handleClearFilters();
        }
    };

    const handleClearFilters = () => {
        setSelectedServiceTypes([]);
        setSelectedStatuses([]);
        setAppliedServiceTypes([]);
        setAppliedStatuses([]);
        setCurrentPage(1);
        const sortParams = getSortParams(sortBy);
        fetchServiceTypes({
            pageNumber: 1,
            pageSize: itemsPerPage,
            sortBy: sortParams.sortBy,
            sortOrder: sortParams.sortOrder,
        }); // Reset to normal pagination with current sort
    };

    const handleResetFilter = () => {
        handleClearFilters();
    };

    // Stop displaying functions
    const handleHideClick = (serviceType: ServiceType) => {
        setServiceTypeToDelete(serviceType);
        setShowDeleteModal(true);
    };

    // Helper function to handle successful delete operation
    const handleSuccessfulDelete = (serviceTypeName: string) => {
        setShowDeleteModal(false);
        setServiceTypeToDelete(null);
        toast.success(`Đã ngừng hiển thị loại dịch vụ "${serviceTypeName}" thành công!`);

        // Refresh the service types list
        const sortParams = getSortParams(sortBy);
        fetchServiceTypes({
            pageNumber: currentPage,
            pageSize: itemsPerPage,
            sortBy: sortParams.sortBy,
            sortOrder: sortParams.sortOrder,
        });
    };

    // Helper function to handle delete error
    const handleDeleteError = (error: any) => {
        console.error('Error hiding service type:', error);
        const errorMessage =
            error.message || 'Có lỗi xảy ra khi ngừng hiển thị loại dịch vụ. Vui lòng thử lại.';
        toast.error(errorMessage);
    };

    const handleHideConfirm = async () => {
        if (!serviceTypeToDelete) return;

        try {
            const result = await deleteServiceType(serviceTypeToDelete.id);

            // Check if the operation was successful
            if ((result as any).type.endsWith('/fulfilled')) {
                handleSuccessfulDelete(serviceTypeToDelete.name);
            } else if ((result as any).type.endsWith('/rejected')) {
                // Error - show error message
                const errorMessage =
                    ((result as any).payload as string) ||
                    'Có lỗi xảy ra khi ngừng hiển thị loại dịch vụ. Vui lòng thử lại.';
                toast.error(errorMessage);
            }
        } catch (error: any) {
            handleDeleteError(error);
        }
    };

    const handleHideCancel = () => {
        setShowDeleteModal(false);
        setServiceTypeToDelete(null);
    };

    // Helper function to create service type
    const createServiceTypeData = async () => {
        if (imageFile) {
            return await createServiceTypeWithImage(formData, imageFile);
        } else {
            return await createServiceType(formData);
        }
    };

    // Helper function to update service type
    const updateServiceTypeData = async () => {
        if (!serviceTypeToEdit) {
            toast.error('Không tìm thấy thông tin loại dịch vụ cần cập nhật');
            return null;
        }

        console.log('Updating service type:', {
            id: serviceTypeToEdit.id,
            formData: formData,
            serviceTypeToEdit: serviceTypeToEdit,
            imageUrl: formData.imageUrl,
            imageFile: imageFile,
        });

        // Determine update strategy based on image handling
        if (imageFile) {
            // User selected a new image file
            return await updateServiceTypeWithImage(serviceTypeToEdit.id, formData, imageFile);
        } else if (formData.imageUrl === '') {
            // User wants to remove the image (empty imageUrl)
            return await updateServiceTypeRemoveImage(serviceTypeToEdit.id, formData);
        } else {
            // User doesn't want to change the image (preserve existing)
            return await updateServiceTypeWithoutImage(serviceTypeToEdit.id, formData);
        }
    };

    // Helper function to handle successful operation
    const handleSuccessfulOperation = () => {
        if (modalMode === 'add') {
            toast.success('Tạo loại dịch vụ thành công!');
        } else {
            toast.success('Cập nhật loại dịch vụ thành công!');
        }

        // Close modal and refresh data
        setShowModal(false);
        setServiceTypeToEdit(null);
        resetForm();

        // Refresh the service types list
        const sortParams = getSortParams(sortBy);
        fetchServiceTypes({
            pageNumber: currentPage,
            pageSize: itemsPerPage,
            sortBy: sortParams.sortBy,
            sortOrder: sortParams.sortOrder,
        });
    };

    // Helper function to handle error
    const handleOperationError = (error: any, defaultMessage: string) => {
        console.error('Error saving service type:', error);
        const errorMessage = error.message || defaultMessage;
        toast.error(errorMessage);
    };

    // Service type modal functions
    const handleServiceTypeSubmit = async () => {
        // Client-side validation
        if (!validateForm(formData)) {
            return; // Stop if validation fails
        }

        setIsSubmitting(true);

        try {
            let result;
            if (modalMode === 'add') {
                result = await createServiceTypeData();
            } else {
                result = await updateServiceTypeData();
                if (!result) return; // Early return if validation failed
            }

            // Check if the operation was successful
            if (result?.success) {
                handleSuccessfulOperation();
            } else {
                // Error - show error message
                const errorMessage = result?.message || 'Có lỗi xảy ra. Vui lòng thử lại.';
                toast.error(errorMessage);
            }
        } catch (error: any) {
            handleOperationError(error, 'Có lỗi xảy ra. Vui lòng thử lại.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditClickWithServiceType = (serviceType: ServiceType) => {
        setServiceTypeToEdit(serviceType);
        setModalMode('edit');
        setFormData({
            name: serviceType.name,
            description: serviceType.description || '',
            imageUrl: serviceType.imageUrl, // Keep existing imageUrl for reference
            status: serviceType.status,
        });
        setImagePreview(serviceType.imageUrl);
        setImageFile(null); // No new file selected yet
        clearAllValidationErrors();
        setShowModal(true);
    };

    // Function to fetch all service types for filter modal
    const fetchAllServiceTypesForFilter = async () => {
        try {
            // Use getAllServiceTypesSimple for better performance (no pagination)
            const response = await getAllServiceTypesSimple();
            setAllServiceTypes(response.data);
        } catch (error) {
            console.error('Error fetching all service types for filter:', error);
            setAllServiceTypes([]);
        }
    };

    // Helper function to render error state
    const renderErrorState = () => (
        <tr>
            <td colSpan={7} className="text-center py-4">
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
            <td colSpan={7} className="text-center py-4">
                <p className="text-muted">Không có loại dịch vụ nào được tìm thấy.</p>
            </td>
        </tr>
    );

    // Helper function to render service type row
    const renderServiceTypeRow = (serviceType: ServiceType) => (
        <tr key={serviceType.id}>
            <td>
                <div className="d-flex align-items-center">
                    <div className="avatar me-2">
                        <div className="avatar-title bg-primary-subtle text-primary rounded">
                            <i className="ti ti-medical-cross"></i>
                        </div>
                    </div>
                    <div>
                        <h6 className="mb-1 fs-14 fw-semibold">{serviceType.name}</h6>
                        <span className="text-muted fs-13">ID: {serviceType.id}</span>
                    </div>
                </div>
            </td>
            <td>
                <div className={styles.imagePreviewSmall}>
                    <img
                        src={serviceType.imageUrl}
                        alt={serviceType.name}
                        onError={(e) => {
                            (e.target as HTMLImageElement).src =
                                'https://via.placeholder.com/80x80?text=No+Image';
                        }}
                    />
                </div>
            </td>
            <td>
                <span className="text-muted fs-14">
                    {serviceType.description || 'Không có mô tả'}
                </span>
            </td>
            <td>
                <span className="text-muted fs-14">
                    {serviceType.createdAt
                        ? new Date(serviceType.createdAt).toLocaleDateString('vi-VN')
                        : 'N/A'}
                </span>
            </td>
            <td>
                <span className="text-muted fs-14">
                    {serviceType.updatedAt
                        ? new Date(serviceType.updatedAt).toLocaleDateString('vi-VN')
                        : 'N/A'}
                </span>
            </td>
            <td>
                <StatusBadge status={serviceType.status} />
            </td>
            <td className="action-item">
                <TableActions
                    id={serviceType.id}
                    onEdit={() => handleEditClickWithServiceType(serviceType)}
                    onHide={() => handleHideClick(serviceType)}
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
            return <TableSkeleton rows={itemsPerPage} columns={serviceTypeTableColumns} />;
        }

        if (error) {
            return renderErrorState();
        }

        if (!paginatedFilteredServiceTypes || paginatedFilteredServiceTypes.length === 0) {
            return renderEmptyState();
        }

        return paginatedFilteredServiceTypes.map(renderServiceTypeRow);
    };

    return (
        <div className="content">
            <div className="d-flex align-items-sm-center flex-sm-row flex-column gap-2 mb-3 pb-3 border-bottom">
                <div className="flex-grow-1">
                    <h4 className="fw-bold mb-0">
                        Danh Sách Loại Dịch Vụ{' '}
                        <span className="badge badge-soft-primary fs-13 fw-medium ms-2">
                            Tổng Loại Dịch Vụ:{' '}
                            {appliedServiceTypes.length > 0 || appliedStatuses.length > 0
                                ? filteredServiceTypes.length
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
                        Thêm Loại Dịch Vụ
                    </Button>
                </div>
            </div>

            <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-3">
                <div className="search-set mb-3">
                    <div className="d-flex align-items-center flex-wrap gap-2">
                        <div className="table-search d-flex align-items-center mb-0">
                            <div className="search-input">
                                <label
                                    htmlFor="serviceTypeSearch"
                                    aria-label="Search service types"
                                >
                                    <input
                                        id="serviceTypeSearch"
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
                            setSelectedServiceTypes([...appliedServiceTypes]);
                            setSelectedStatuses([...appliedStatuses]);
                            // Fetch all service types for filter modal
                            await fetchAllServiceTypesForFilter();
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

                            // Fetch service types with new sort parameters
                            if (appliedServiceTypes.length === 0 && appliedStatuses.length === 0) {
                                const sortParams = getSortParams(newSortBy);
                                fetchServiceTypes({
                                    pageNumber: 1,
                                    pageSize: itemsPerPage,
                                    sortBy: sortParams.sortBy,
                                    sortOrder: sortParams.sortOrder,
                                });
                            }
                        }}
                        placeholder="Sắp xếp theo:"
                    />
                </div>
            </div>

            {/* Applied Filters */}
            <AppliedFilters
                appliedItems={appliedServiceTypes}
                appliedStatuses={appliedStatuses}
                items={serviceTypes || []}
                onRemoveItem={(serviceTypeId: string) => {
                    const newAppliedServiceTypes = appliedServiceTypes.filter(
                        (id) => id !== serviceTypeId
                    );
                    setAppliedServiceTypes(newAppliedServiceTypes);
                    setSelectedServiceTypes(newAppliedServiceTypes);
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
                            <th>Tên Loại Dịch Vụ</th>
                            <th>Hình Ảnh</th>
                            <th>Mô Tả</th>
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

            {/* Service Type Modal */}
            <EntityModal
                show={showModal}
                title={title}
                formData={formData}
                validationErrors={validationErrors}
                isSubmitting={isSubmitting}
                modalMode={modalMode}
                onCancel={handleCancelWithServiceType}
                onSubmit={handleServiceTypeSubmit}
                onNameChange={handleNameChange}
                onDescriptionChange={handleDescriptionChange}
                onImageFileChange={handleImageFileChange}
                onRemoveImage={handleRemoveImage}
                onStatusChange={handleStatusChange}
                imagePreview={imagePreview}
                entityName="Loại Dịch Vụ"
                hasImageUpload={true}
                hasDescription={true}
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
                title="Ngừng hiển thị loại dịch vụ"
                message={`Bạn có chắc chắn muốn ngừng hiển thị loại dịch vụ "${serviceTypeToDelete?.name}"? Loại dịch vụ này sẽ không hiển thị trong danh sách.`}
                confirmText="Có, Ngừng hiển thị"
            />

            {/* Filter Modal */}
            <ModalFilter
                show={showFilterModal}
                onHide={() => setShowFilterModal(false)}
                onApply={handleFilterSubmit}
                onReset={handleResetFilter}
                title="Bộ lọc loại dịch vụ"
                fields={[
                    {
                        name: 'serviceTypes',
                        label: 'Loại Dịch Vụ',
                        type: 'multiselect',
                        options: (allServiceTypes || []).map((serviceType) => ({
                            value: serviceType.id,
                            label: serviceType.name,
                        })),
                        value: selectedServiceTypes,
                        onChange: setSelectedServiceTypes,
                        resetValue: () => setSelectedServiceTypes([]),
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
                        resetValue: () => setSelectedStatuses([]),
                    },
                ]}
            />
        </div>
    );
};

export default ListServiceTypes;
