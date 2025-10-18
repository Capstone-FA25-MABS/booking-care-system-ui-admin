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
import { LanguageService } from '@/services/language.service';
import Select from 'react-select';
import { selectCustomStyles } from '@/constants/select.styles';
import styles from './ListLanguages.module.scss';
import Input from '@/components/Input';

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
    const [sortBy, setSortBy] = useState<string>('Mới Thêm Gần Đây');
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

    // Fetch languages on component mount
    useEffect(() => {
        const sortParams = getSortParams(sortBy);
        fetchLanguages(currentPage, itemsPerPage, sortParams.sortBy, sortParams.sortOrder);
    }, [fetchLanguages, currentPage, itemsPerPage, sortBy]);

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
                filterLanguages(filterParams);
            } else {
                // If search is cleared, fetch all languages with current sort
                setCurrentPage(1);
                const sortParams = getSortParams(sortBy);
                fetchLanguages(1, itemsPerPage, sortParams.sortBy, sortParams.sortOrder);
            }
        }, 500); // 500ms debounce

        return () => clearTimeout(timeoutId);
    }, [searchTerm, itemsPerPage, filterLanguages, fetchLanguages]);

    // Language Modal States
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState<LanguageFormData>({
        name: '',
        status: 'ACTIVE',
    });
    const [validationErrors, setValidationErrors] = useState<{
        name?: string;
        status?: string;
    }>({});

    // Status options for react-select
    const statusOptions = [
        { value: 'ACTIVE', label: 'Hoạt động' },
        { value: 'INACTIVE', label: 'Không hoạt động' },
    ];

    // Custom React Select Component - refactored to reduce nesting
    const handleSelectChange = useCallback(
        (selectedOption: any, onChange: (value: any) => void) => {
            onChange(selectedOption?.value);
            // Clear validation error when user selects an option
            if (validationErrors.status) {
                setValidationErrors((prev) => ({ ...prev, status: undefined }));
            }
        },
        [validationErrors.status]
    );

    const ReactSelectComponent = useMemo(() => {
        return ({ value, onChange }: { value: any; onChange: (value: any) => void }) => {
            return (
                <div className={validationErrors.status ? styles.reactSelectInvalid : ''}>
                    <Select
                        options={statusOptions}
                        value={statusOptions.find((option) => option.value === value)}
                        onChange={(selectedOption) => handleSelectChange(selectedOption, onChange)}
                        placeholder="Chọn trạng thái"
                        isSearchable={false}
                        styles={selectCustomStyles}
                    />
                    {validationErrors.status && (
                        <div className={styles.invalidFeedback}>{validationErrors.status}</div>
                    )}
                </div>
            );
        };
    }, [validationErrors.status, handleSelectChange]);

    // Custom Input Component - refactored to reduce nesting
    const handleInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>, onChange: (value: string) => void) => {
            onChange(e.target.value);
            // Clear validation error when user starts typing
            if (validationErrors.name) {
                setValidationErrors((prev) => ({ ...prev, name: undefined }));
            }
        },
        [validationErrors.name]
    );

    const CustomInputComponent = useMemo(() => {
        return ({
            value,
            onChange,
            placeholder,
            required,
        }: {
            value: string;
            onChange: (value: string) => void;
            placeholder?: string;
            required?: boolean;
        }) => {
            return (
                <div>
                    <Input
                        name="name"
                        value={value}
                        onChange={(e) => handleInputChange(e, onChange)}
                        placeholder={placeholder}
                        required={required}
                        maxLength={255}
                        className={validationErrors.name ? 'is-invalid' : ''}
                    />
                    {validationErrors.name && (
                        <div className={styles.invalidFeedback}>{validationErrors.name}</div>
                    )}
                </div>
            );
        };
    }, [validationErrors.name, handleInputChange]);

    const handleAddClick = useCallback(() => {
        setModalMode('add');
        setFormData({
            name: '',
            status: 'ACTIVE',
        });
        setValidationErrors({});
        setShowModal(true);
    }, []);

    const handleCancel = useCallback(() => {
        setShowModal(false);
        setLanguageToEdit(null);
        setFormData({
            name: '',
            status: 'ACTIVE',
        });
        setValidationErrors({});
    }, []);

    const title = modalMode === 'add' ? 'Thêm Ngôn Ngữ Mới' : 'Sửa Ngôn Ngữ';

    // Form data change handlers
    const handleNameChange = (value: string) => {
        setFormData((prev) => ({ ...prev, name: value }));
    };

    const handleStatusChange = (value: 'ACTIVE' | 'INACTIVE') => {
        setFormData((prev) => ({ ...prev, status: value }));
    };

    // Helper function to get sort parameters
    const getSortParams = (sortValue: string) => {
        switch (sortValue) {
            case 'Mới Thêm Gần Đây':
                return { sortBy: 'createdAt', sortOrder: 'desc' as const };
            case 'Tên A-Z':
                return { sortBy: 'name', sortOrder: 'asc' as const };
            case 'Tên Z-A':
                return { sortBy: 'name', sortOrder: 'desc' as const };
            case 'Ngày Tạo (Mới Nhất)':
                return { sortBy: 'createdAt', sortOrder: 'desc' as const };
            case 'Ngày Tạo (Cũ Nhất)':
                return { sortBy: 'createdAt', sortOrder: 'asc' as const };
            case 'Ngày Sửa (Mới Nhất)':
                return { sortBy: 'updatedAt', sortOrder: 'desc' as const };
            case 'Ngày Sửa (Cũ Nhất)':
                return { sortBy: 'updatedAt', sortOrder: 'asc' as const };
            default:
                return { sortBy: 'createdAt', sortOrder: 'desc' as const };
        }
    };

    // Note: Error handling is done in individual functions to avoid duplicate messages

    // Validation function
    const validateForm = (): boolean => {
        const errors: { name?: string; status?: string } = {};

        // Validate name
        if (!formData.name.trim()) {
            errors.name = 'Tên ngôn ngữ không được để trống';
        } else {
            const trimmedName = formData.name.trim();
            if (trimmedName.length < 2) {
                errors.name = 'Tên ngôn ngữ phải có ít nhất 2 ký tự';
            } else if (trimmedName.length > 255) {
                errors.name = 'Tên ngôn ngữ không được vượt quá 255 ký tự';
            }
        }

        // Validate status
        if (!formData.status) {
            errors.status = 'Vui lòng chọn trạng thái';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Handle delete language (not used in current implementation)
    // const handleDeleteClick = (language: Language) => {
    //     setLanguageToDelete(language);
    //     setShowDeleteModal(true);
    // };

    // Handle delete confirmation
    const handleDeleteConfirm = async () => {
        if (!languageToDelete) return;

        try {
            const result = await deleteLanguage(languageToDelete.id);

            // Check if the operation was successful
            if ((result as any).type.endsWith('/fulfilled')) {
                toast.success(`Đã ẩn ngôn ngữ "${languageToDelete.name}" thành công!`);
                setShowDeleteModal(false);
                setLanguageToDelete(null);

                // Refresh the languages list
                const sortParams = getSortParams(sortBy);
                fetchLanguages(currentPage, itemsPerPage, sortParams.sortBy, sortParams.sortOrder);
            } else if ((result as any).type.endsWith('/rejected')) {
                // Error - show error message
                const errorMessage =
                    ((result as any).payload as string) ||
                    'Có lỗi xảy ra khi ẩn ngôn ngữ. Vui lòng thử lại.';
                toast.error(errorMessage);
            }
        } catch (error: any) {
            console.error('Error deleting language:', error);
            const errorMessage =
                error.message || 'Có lỗi xảy ra khi ẩn ngôn ngữ. Vui lòng thử lại.';
            toast.error(errorMessage);
        }
    };

    // Handle delete cancel
    const handleDeleteCancel = () => {
        setShowDeleteModal(false);
        setLanguageToDelete(null);
    };

    // Language modal functions
    const handleLanguageSubmit = async () => {
        // Client-side validation
        if (!validateForm()) {
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
                setValidationErrors({});

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
        setValidationErrors({});
        setShowModal(true);
    };

    // Hide functions
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
            const response = await LanguageService.getAllLanguages(1, 1000); // Large page size to get all
            setAllLanguages(response.data.languages);
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
                            Danh Sách Ngôn Ngữ{' '}
                            <span className="badge badge-soft-primary fs-13 fw-medium ms-2">
                                Tổng Ngôn Ngữ:{' '}
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
                            Thêm Ngôn Ngữ
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
                            options={[
                                { value: 'Mới Thêm Gần Đây', label: 'Mới Thêm Gần Đây' },
                                { value: 'Tên A-Z', label: 'Tên A-Z' },
                                { value: 'Tên Z-A', label: 'Tên Z-A' },
                                { value: 'Ngày Tạo (Mới Nhất)', label: 'Ngày Tạo (Mới Nhất)' },
                                { value: 'Ngày Tạo (Cũ Nhất)', label: 'Ngày Tạo (Cũ Nhất)' },
                                { value: 'Ngày Sửa (Mới Nhất)', label: 'Ngày Sửa (Mới Nhất)' },
                                { value: 'Ngày Sửa (Cũ Nhất)', label: 'Ngày Sửa (Cũ Nhất)' },
                            ]}
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
                {(appliedLanguages.length > 0 || appliedStatuses.length > 0) && (
                    <div className={styles.appliedFiltersContainer}>
                        <span className={styles.appliedFiltersLabel}>Bộ lọc đang áp dụng:</span>
                        {appliedLanguages.map((languageId) => {
                            const language = languages?.find((l) => l.id === languageId);
                            return language ? (
                                <span key={languageId} className="badge badge-soft-primary fs-12">
                                    {language.name}
                                    <button
                                        type="button"
                                        className={`btn-close ms-1 ${styles.filterBadgeClose}`}
                                        onClick={() => {
                                            const newAppliedLanguages = appliedLanguages.filter(
                                                (id) => id !== languageId
                                            );
                                            setAppliedLanguages(newAppliedLanguages);
                                            setSelectedLanguages(newAppliedLanguages);
                                        }}
                                        aria-label="Remove filter"
                                    ></button>
                                </span>
                            ) : null;
                        })}
                        {appliedStatuses.map((status) => (
                            <span key={status} className="badge badge-soft-info fs-12">
                                {status === 'ACTIVE' ? 'Hoạt động' : 'Không hoạt động'}
                                <button
                                    type="button"
                                    className={`btn-close ms-1 ${styles.filterBadgeClose}`}
                                    onClick={() => {
                                        const newAppliedStatuses = appliedStatuses.filter(
                                            (s) => s !== status
                                        );
                                        setAppliedStatuses(newAppliedStatuses);
                                        setSelectedStatuses(newAppliedStatuses);
                                    }}
                                    aria-label="Remove filter"
                                ></button>
                            </span>
                        ))}
                        <button
                            type="button"
                            className={`btn btn-sm btn-outline-secondary fs-12 ${styles.clearAllButton}`}
                            onClick={handleClearFilters}
                        >
                            Xóa tất cả
                        </button>
                    </div>
                )}

                <div className="table-responsive">
                    <table className="table table-nowrap datatable">
                        <thead className="thead-light">
                            <tr>
                                <th>Tên Ngôn Ngữ</th>
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

            {/* Language Modal */}
            {showModal && (
                <div
                    className={`modal fade show d-block ${styles.modal}`}
                    style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
                >
                    <div className="modal-dialog modal-lg modal-dialog-centered">
                        <div className={`modal-content ${styles['modal-content']}`}>
                            <div className="modal-header border-0 pb-0">
                                <h5 className="modal-title fw-bold text-dark fs-18">{title}</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={handleCancel}
                                    aria-label="Close"
                                ></button>
                            </div>
                            <div className="modal-body pt-0">
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        handleLanguageSubmit();
                                    }}
                                >
                                    <div className="row">
                                        {/* Name Field */}
                                        <div className="col-12">
                                            <div className="mb-4">
                                                <label
                                                    htmlFor="language-name"
                                                    className="form-label fw-semibold text-dark mb-2"
                                                >
                                                    Tên Ngôn Ngữ{' '}
                                                    <span className="text-danger">*</span>
                                                </label>
                                                <CustomInputComponent
                                                    value={formData.name}
                                                    onChange={handleNameChange}
                                                    placeholder="Nhập tên ngôn ngữ (2-255 ký tự)"
                                                    required={true}
                                                />
                                            </div>
                                        </div>

                                        {/* Status Field */}
                                        <div className="col-12">
                                            <div className="mb-4">
                                                <label
                                                    htmlFor="language-status"
                                                    className="form-label fw-semibold text-dark mb-2"
                                                >
                                                    Trạng Thái{' '}
                                                    <span className="text-danger">*</span>
                                                </label>
                                                <ReactSelectComponent
                                                    value={formData.status}
                                                    onChange={handleStatusChange}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>
                            <div className="modal-footer border-0 pt-0">
                                <button
                                    type="button"
                                    className="btn btn-light btn-lg px-4 rounded-3"
                                    onClick={handleCancel}
                                    disabled={isSubmitting}
                                >
                                    Hủy
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary btn-lg px-4 rounded-3"
                                    onClick={handleLanguageSubmit}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <span
                                                className="spinner-border spinner-border-sm me-2"
                                                aria-hidden="true"
                                            ></span>
                                            <output>
                                                {modalMode === 'add'
                                                    ? 'Đang tạo...'
                                                    : 'Đang cập nhật...'}
                                            </output>
                                        </>
                                    ) : (
                                        <>
                                            <i
                                                className={`${modalMode === 'add' ? 'ti ti-plus' : 'ti ti-edit'} me-2`}
                                            ></i>
                                            {modalMode === 'add'
                                                ? 'Tạo Ngôn Ngữ'
                                                : 'Cập Nhật Ngôn Ngữ'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

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
                        label: 'Ngôn Ngữ',
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

            {/* Hide Confirmation Modal */}
            <ModalDelete
                show={showDeleteModal}
                onHide={handleDeleteCancel}
                onConfirm={handleDeleteConfirm}
                title="Ẩn ngôn ngữ"
                message={`Bạn có chắc chắn muốn ẩn ngôn ngữ "${languageToDelete?.name}"? Ngôn ngữ này sẽ không hiển thị trong danh sách.`}
            />
        </>
    );
};

export default ListLanguages;
