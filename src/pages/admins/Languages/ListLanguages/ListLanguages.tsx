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
import { languageTableColumns } from '@/components/TableSkeleton/skeletonConfigs';
import { Language, LanguageFormData } from '@/types/language.types';
import useLanguage from '@/hooks/useLanguage';
import { getAllLanguagesSimple } from '@/services/language.service';
import { getSortParams, SORT_OPTIONS } from '@/utils/sortUtils';
import { useFormValidation } from '@/hooks/useFormValidation';
import EntityModal from '@/components/Modal/EntityModal';
import AppliedFilters from '@/components/AppliedFilters/AppliedFilters';
import styles from './ListLanguages.module.scss';

const ListLanguages: React.FC = () => {
    // Use Redux state management
    const {
        languages,
        pagination,
        isLoading,
        error,
        fetchLanguages,
        createLanguage,
        updateLanguage,
        deleteLanguage,
        filterLanguages,
        clearError,
    } = useLanguage();

    // Local state for UI
    const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
    const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);

    // Applied filters (after clicking "Lọc" button)
    const [appliedLanguages, setAppliedLanguages] = useState<string[]>([]);
    const [appliedStatuses, setAppliedStatuses] = useState<string[]>([]);
    const [sortBy, setSortBy] = useState<string>('Mới thêm gần đây');
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [languageToDelete, setLanguageToDelete] = useState<Language | null>(null);
    const [languageToEdit, setLanguageToEdit] = useState<Language | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');

    // State for all languages (for filter modal)
    const [allLanguages, setAllLanguages] = useState<Language[]>([]);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

    // Debounce search term
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
            if (searchTerm !== debouncedSearchTerm) {
                setCurrentPage(1); // Reset to page 1 when search changes
            }
        }, 500);

        return () => clearTimeout(timeoutId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchTerm]);

    // Fetch languages when page, sort, or debounced search changes
    useEffect(() => {
        const sortParams = getSortParams(sortBy);
        if (debouncedSearchTerm.trim()) {
            const filterParams = {
                pageNumber: currentPage,
                pageSize: itemsPerPage,
                searchTerm: debouncedSearchTerm.trim(),
                sortBy: sortParams.sortBy,
                sortOrder: sortParams.sortOrder,
            };
            filterLanguages(filterParams);
        } else {
            fetchLanguages(currentPage, itemsPerPage, sortParams.sortBy, sortParams.sortOrder);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, itemsPerPage, sortBy, debouncedSearchTerm]);

    // Language Modal States
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState<LanguageFormData>({
        name: '',
        status: 'ACTIVE',
    });

    // Use shared form validation hook
    const { validationErrors, validateForm, clearValidationError, clearAllValidationErrors } =
        useFormValidation({ entityName: 'ngôn ngữ' });

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
        setLanguageToEdit(null);
        setFormData({
            name: '',
            status: 'ACTIVE',
        });
        clearAllValidationErrors();
    }, [clearAllValidationErrors]);

    const title = modalMode === 'add' ? 'Thêm ngôn ngữ mới' : 'Sửa ngôn ngữ';

    // Form data change handlers
    const handleNameChange = (value: string) => {
        setFormData((prev) => ({ ...prev, name: value }));
        clearValidationError('name');
    };

    const handleStatusChange = (value: 'ACTIVE' | 'INACTIVE') => {
        setFormData((prev) => ({ ...prev, status: value }));
        clearValidationError('status');
    };

    // Note: Error handling is done in individual functions to avoid duplicate messages

    // Handle delete language (not used in current implementation)
    // const handleDeleteClick = (language: Language) => {
    //     setLanguageToDelete(language);
    //     setShowDeleteModal(true);
    // };

    // Handle hide confirmation
    const handleHideConfirm = async () => {
        if (!languageToDelete) return;

        try {
            const result = await deleteLanguage(languageToDelete.id);

            // Check if the operation was successful
            if ((result as any).type.endsWith('/fulfilled')) {
                toast.success(`Đã ngừng hiển thị ngôn ngữ "${languageToDelete.name}" thành công!`);
                setShowDeleteModal(false);
                setLanguageToDelete(null);

                // Refresh the languages list
                const sortParams = getSortParams(sortBy);
                fetchLanguages(currentPage, itemsPerPage, sortParams.sortBy, sortParams.sortOrder);
            } else if ((result as any).type.endsWith('/rejected')) {
                // Error - show error message
                const errorMessage =
                    ((result as any).payload as string) ||
                    'Có lỗi xảy ra khi ngừng hiển thị ngôn ngữ. Vui lòng thử lại.';
                toast.error(errorMessage);
            }
        } catch (error: any) {
            console.error('Error deleting language:', error);
            const errorMessage =
                error.message || 'Có lỗi xảy ra khi ngừng hiển thị ngôn ngữ. Vui lòng thử lại.';
            toast.error(errorMessage);
        }
    };

    // Handle hide cancel
    const handleHideCancel = () => {
        setShowDeleteModal(false);
        setLanguageToDelete(null);
    };

    // Language modal functions
    const handleLanguageSubmit = async () => {
        // Client-side validation
        if (!validateForm(formData)) {
            return; // Stop if validation fails
        }

        setIsSubmitting(true);

        try {
            let result;
            if (modalMode === 'add') {
                // Create new language
                result = await createLanguage(formData);
            } else {
                // Update language
                if (!languageToEdit) {
                    toast.error('Không tìm thấy thông tin ngôn ngữ cần cập nhật');
                    return;
                }

                console.log('Updating language:', {
                    id: languageToEdit.id,
                    formData: formData,
                    languageToEdit: languageToEdit,
                });

                result = await updateLanguage(languageToEdit.id, formData);
            }

            // Check if the operation was successful
            if ((result as any).type.endsWith('/fulfilled')) {
                // Success - show toast and close modal
                if (modalMode === 'add') {
                    toast.success('Tạo ngôn ngữ thành công!');
                } else {
                    toast.success('Cập nhật ngôn ngữ thành công!');
                }

                // Close modal and refresh data
                setShowModal(false);
                setLanguageToEdit(null);
                setFormData({
                    name: '',
                    status: 'ACTIVE',
                });
                clearAllValidationErrors();

                // Refresh the languages list
                const sortParams = getSortParams(sortBy);
                fetchLanguages(currentPage, itemsPerPage, sortParams.sortBy, sortParams.sortOrder);
            } else if ((result as any).type.endsWith('/rejected')) {
                // Error - show error message
                const errorMessage =
                    ((result as any).payload as string) || 'Có lỗi xảy ra. Vui lòng thử lại.';
                toast.error(errorMessage);
            }
        } catch (error: any) {
            console.error('Error saving language:', error);

            // Show specific error message
            const errorMessage = error.message || 'Có lỗi xảy ra. Vui lòng thử lại.';
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditClickWithLanguage = (language: Language) => {
        setLanguageToEdit(language);
        setModalMode('edit');
        setFormData({
            name: language.name,
            status: language.status,
        });
        clearAllValidationErrors();
        setShowModal(true);
    };

    // Stop displaying functions
    const handleHideClick = (language: Language) => {
        setLanguageToDelete(language);
        setShowDeleteModal(true);
    };

    // Filter and search logic
    const filteredLanguages = useMemo(() => {
        if (!languages) return [];

        let filtered = languages;

        // Apply search filter
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(
                (language) =>
                    language.name.toLowerCase().includes(term) ||
                    language.id.toLowerCase().includes(term)
            );
        }

        // Apply status filter
        if (appliedStatuses.length > 0) {
            filtered = filtered.filter((language) => appliedStatuses.includes(language.status));
        }

        // Apply language filter
        if (appliedLanguages.length > 0) {
            filtered = filtered.filter((language) => appliedLanguages.includes(language.id));
        }

        return filtered;
    }, [languages, searchTerm, appliedStatuses, appliedLanguages]);

    // Use pagination from Redux state
    const totalPages = pagination?.totalPages || 0;

    // Paginate filtered languages for client-side filtering
    const paginatedFilteredLanguages = useMemo(() => {
        if (appliedLanguages.length === 0) {
            // No language filter, use server-side pagination
            return filteredLanguages;
        }

        // Client-side pagination for filtered results
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredLanguages.slice(startIndex, endIndex);
    }, [filteredLanguages, currentPage, itemsPerPage, appliedLanguages.length]);

    // Calculate total pages for client-side filtering
    const effectiveTotalPages = useMemo(() => {
        if (appliedLanguages.length === 0) {
            // No language filter, use server-side pagination
            return totalPages;
        }

        // Client-side pagination
        return Math.ceil(filteredLanguages.length / itemsPerPage);
    }, [totalPages, filteredLanguages.length, itemsPerPage, appliedLanguages.length]);

    // Render table body content based on loading, error, and data states
    const renderTableBody = () => {
        if (isLoading) {
            return <TableSkeleton rows={itemsPerPage} columns={languageTableColumns} />;
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

        if (!paginatedFilteredLanguages || paginatedFilteredLanguages.length === 0) {
            return (
                <tr>
                    <td colSpan={5} className="text-center py-4">
                        <p className="text-muted">Không có ngôn ngữ nào được tìm thấy.</p>
                    </td>
                </tr>
            );
        }

        return paginatedFilteredLanguages.map((language) => (
            <tr key={language.id}>
                <td>
                    <div className="d-flex align-items-center">
                        <div className="avatar me-2">
                            <div className="avatar-title bg-primary-subtle text-primary rounded">
                                <i className="ti ti-language"></i>
                            </div>
                        </div>
                        <div>
                            <h6 className="mb-1 fs-14 fw-semibold">{language.name}</h6>
                            <span className="text-muted fs-13">ID: {language.id}</span>
                        </div>
                    </div>
                </td>
                <td>
                    <span className="text-muted fs-14">
                        {language.createdAt
                            ? new Date(language.createdAt).toLocaleDateString('vi-VN')
                            : 'N/A'}
                    </span>
                </td>
                <td>
                    <span className="text-muted fs-14">
                        {language.updatedAt
                            ? new Date(language.updatedAt).toLocaleDateString('vi-VN')
                            : 'N/A'}
                    </span>
                </td>
                <td>
                    <StatusBadge status={language.status} />
                </td>
                <td className="action-item">
                    <TableActions
                        id={language.id}
                        onEdit={() => handleEditClickWithLanguage(language)}
                        onHide={() => handleHideClick(language)}
                        showEdit={true}
                        showDelete={false}
                        showHide={true}
                        showView={false}
                    />
                </td>
            </tr>
        ));
    };

    // Function to fetch all languages for filter modal
    const fetchAllLanguagesForFilter = async () => {
        try {
            const response = await getAllLanguagesSimple();
            setAllLanguages(response.data || []);
        } catch (error) {
            console.error('Error fetching all languages for filter:', error);
            setAllLanguages([]);
        }
    };

    // Filter functions
    const handleFilterSubmit = () => {
        setAppliedLanguages(selectedLanguages);
        setAppliedStatuses(selectedStatuses);
        setShowFilterModal(false);
        setCurrentPage(1);

        // If we have language filters, we need to fetch all languages first
        if (selectedLanguages.length > 0) {
            // Fetch all languages without pagination for client-side filtering
            fetchLanguages(1, 100); // Large page size to get all languages
        } else {
            // Only status filter, can use backend filtering with sorting
            const sortParams = getSortParams(sortBy);
            fetchLanguages(1, itemsPerPage, sortParams.sortBy, sortParams.sortOrder);
        }
    };

    const handleClearFilters = () => {
        setSelectedLanguages([]);
        setSelectedStatuses([]);
        setAppliedLanguages([]);
        setAppliedStatuses([]);
        setShowFilterModal(false);
        setCurrentPage(1);
        const sortParams = getSortParams(sortBy);
        fetchLanguages(1, itemsPerPage, sortParams.sortBy, sortParams.sortOrder); // Reset to normal pagination with current sort
    };

    const handleResetFilter = (filterType: string) => {
        switch (filterType) {
            case 'languages':
                setSelectedLanguages([]);
                break;
            case 'statuses':
                setSelectedStatuses([]);
                break;
            default:
                break;
        }
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);

        // If no language filters, use server-side pagination
        if (appliedLanguages.length === 0) {
            const sortParams = getSortParams(sortBy);
            fetchLanguages(page, itemsPerPage, sortParams.sortBy, sortParams.sortOrder);
        }
        // For language filters, pagination is handled client-side
    };

    return (
        <>
            <div className="content">
                <div className="d-flex align-items-sm-center flex-sm-row flex-column gap-2 mb-3 pb-3 border-bottom">
                    <div className="flex-grow-1">
                        <h4 className="fw-bold mb-0">
                            Danh sách ngôn ngữ{' '}
                            <span className="badge badge-soft-primary fs-13 fw-medium ms-2">
                                Tổng ngôn ngữ:{' '}
                                {appliedLanguages.length > 0
                                    ? filteredLanguages.length
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
                                to="/admins/languages"
                                className="bg-light rounded p-1 d-flex align-items-center justify-content-center"
                            >
                                <i className="ti ti-list fs-14 text-body"></i>
                            </Link>
                            <Link
                                to="/admins/languages"
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
                            Thêm ngôn ngữ
                        </Button>
                    </div>
                </div>

                <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-3">
                    <div className="search-set mb-3">
                        <div className="d-flex align-items-center flex-wrap gap-2">
                            <div className="table-search d-flex align-items-center mb-0">
                                <div className="search-input">
                                    <label htmlFor="languageSearch" aria-label="Search languages">
                                        <input
                                            id="languageSearch"
                                            type="search"
                                            className="form-control form-control-sm"
                                            placeholder="Tìm kiếm theo tên ngôn ngữ"
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
                                setSelectedLanguages([...appliedLanguages]);
                                setSelectedStatuses([...appliedStatuses]);
                                // Fetch all languages for filter modal
                                await fetchAllLanguagesForFilter();
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

                                // Fetch languages with new sort parameters
                                if (appliedLanguages.length === 0) {
                                    const sortParams = getSortParams(newSortBy);
                                    fetchLanguages(
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
                    appliedItems={appliedLanguages}
                    appliedStatuses={appliedStatuses}
                    items={languages || []}
                    onRemoveItem={(languageId) => {
                        const newAppliedLanguages = appliedLanguages.filter(
                            (id) => id !== languageId
                        );
                        setAppliedLanguages(newAppliedLanguages);
                        setSelectedLanguages(newAppliedLanguages);
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
                                <th>Tên ngôn ngữ</th>
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
            </div>

            {/* Language Modal */}
            <EntityModal
                show={showModal}
                title={title}
                formData={formData}
                validationErrors={validationErrors}
                isSubmitting={isSubmitting}
                modalMode={modalMode}
                onCancel={handleCancel}
                onSubmit={handleLanguageSubmit}
                onNameChange={handleNameChange}
                onStatusChange={handleStatusChange}
                entityName="Ngôn ngữ"
                hasImageUpload={false}
                styles={{
                    modal: styles.modal,
                    'modal-content': styles['modal-content'],
                    invalidFeedback: styles.invalidFeedback,
                    reactSelectInvalid: styles.reactSelectInvalid,
                }}
            />

            {/* Filter Modal */}
            <ModalFilter
                show={showFilterModal}
                onHide={() => setShowFilterModal(false)}
                onApply={handleFilterSubmit}
                onReset={handleClearFilters}
                title="Bộ lọc ngôn ngữ"
                fields={[
                    {
                        name: 'languages',
                        label: 'Ngôn ngữ',
                        type: 'multiselect',
                        options: (allLanguages || []).map((language) => ({
                            value: language.id,
                            label: language.name,
                        })),
                        value: selectedLanguages,
                        onChange: setSelectedLanguages,
                        resetValue: () => handleResetFilter('languages'),
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
                        resetValue: () => handleResetFilter('statuses'),
                    },
                ]}
            />

            {/* Stop Displaying Confirmation Modal */}
            <ModalDelete
                show={showDeleteModal}
                onHide={handleHideCancel}
                onConfirm={handleHideConfirm}
                title="Ngừng hiển thị ngôn ngữ"
                message={`Bạn có chắc chắn muốn ngừng hiển thị ngôn ngữ "${languageToDelete?.name}"? Ngôn ngữ này sẽ không hiển thị trong danh sách.`}
                confirmText="Có, Ngừng hiển thị"
            />
        </>
    );
};

export default ListLanguages;
