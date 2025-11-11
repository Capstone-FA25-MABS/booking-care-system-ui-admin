import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';
import Pagination from '@/components/Pagination';
import Button from '@/components/Button';
import ModalDelete from '@/components/ModalDelete';
import StatusBadge from '@/components/StatusBadge';
import TableSkeleton from '@/components/TableSkeleton';
import TableActions from '@/components/TableActions';
import ActionDropdown from '@/components/ActionDropdown';
import { ServiceCategory } from '@/types/serviceCategory.types';
import { getAllServiceCategories, deleteServiceCategory } from '@/services/serviceCategory.service';

const serviceCategoryTableColumns = [
    { label: 'Tên', hasAvatar: true, type: 'text' as const },
    { label: 'Hình ảnh', hasAvatar: false, type: 'text' as const },
    { label: 'Mô tả', hasAvatar: false, type: 'text' as const },
    { label: 'Trạng thái', hasAvatar: false, type: 'text' as const },
    { label: 'Hành động', hasAvatar: false, type: 'text' as const },
];

const ListServiceCategories: React.FC = () => {
    const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<string>('Tên A-Z');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState<ServiceCategory | null>(null);
    const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10; // Number of PARENT groups per page

    // Map sort option to API format
    const mapSortToApi = (
        sortOption: string
    ): { sortBy: string; sortDirection: 'asc' | 'desc' } => {
        switch (sortOption) {
            case 'Tên A-Z':
                return { sortBy: 'Name', sortDirection: 'asc' };
            case 'Tên Z-A':
                return { sortBy: 'Name', sortDirection: 'desc' };
            case 'Mới Thêm Gần Đây':
            default:
                return { sortBy: 'Name', sortDirection: 'asc' };
        }
    };

    // Fetch ALL service categories on component mount and when sort changes
    // Option 2: Fetch all data without pagination
    useEffect(() => {
        const fetchAllServiceCategories = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const sortMapping = mapSortToApi(sortBy);
                const response = await getAllServiceCategories(
                    sortMapping.sortBy,
                    sortMapping.sortDirection
                );
                if (response.success && response.data) {
                    setServiceCategories(response.data);
                    // Reset image errors when new data is loaded
                    setImageErrors(new Set());
                }
            } catch (error: any) {
                console.error('Error fetching service categories:', error);
                setError(error.message || 'Không thể tải danh sách danh mục dịch vụ');
                toast.error(error.message || 'Không thể tải danh sách danh mục dịch vụ');
            } finally {
                setIsLoading(false);
            }
        };

        fetchAllServiceCategories();
    }, [sortBy]); // Refetch when sortBy changes

    // Group service categories by parent and paginate by parent groups
    const groupServiceCategoriesByParent = useMemo(() => {
        const parents: ServiceCategory[] = [];
        const childrenMap = new Map<string, ServiceCategory[]>();

        for (const category of serviceCategories) {
            const parentId = category.parentId;

            if (!parentId || parentId === null) {
                // This is a parent category
                parents.push(category);
            } else {
                // This is a child category
                if (!childrenMap.has(parentId)) {
                    childrenMap.set(parentId, []);
                }
                childrenMap.get(parentId)!.push(category);
            }
        }

        // API already handles sorting, so we just maintain the order

        return { parents, childrenMap };
    }, [serviceCategories]);

    // Paginate by parent groups (not individual items)
    const paginatedParentGroups = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return groupServiceCategoriesByParent.parents.slice(startIndex, endIndex);
    }, [groupServiceCategoriesByParent.parents, currentPage, itemsPerPage]);

    // Calculate total pages based on parent groups
    const effectiveTotalPages = useMemo(() => {
        return Math.ceil(groupServiceCategoriesByParent.parents.length / itemsPerPage);
    }, [groupServiceCategoriesByParent.parents.length, itemsPerPage]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        // Scroll to top when page changes
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDeleteCategory = (category: ServiceCategory) => {
        // Check if category has children before allowing delete
        const children = groupServiceCategoriesByParent.childrenMap.get(category.id) || [];

        if (children.length > 0) {
            // Category has children, show warning
            toast.warning(
                `Không thể xóa danh mục "${category.name}". Vui lòng xóa tất cả danh mục con trước (${children.length} danh mục con).`,
                { autoClose: 5000 }
            );
            return;
        }

        // No children, proceed with delete confirmation
        setCategoryToDelete(category);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        if (categoryToDelete) {
            try {
                setIsLoading(true);

                // Double check: Verify no children before deleting
                const children =
                    groupServiceCategoriesByParent.childrenMap.get(categoryToDelete.id) || [];
                if (children.length > 0) {
                    toast.error(
                        `Không thể xóa danh mục "${categoryToDelete.name}". Vui lòng xóa tất cả danh mục con trước (${children.length} danh mục con).`
                    );
                    setShowDeleteModal(false);
                    setCategoryToDelete(null);
                    return;
                }

                const response = await deleteServiceCategory(categoryToDelete.id);
                if (response.success) {
                    toast.success('Xóa danh mục dịch vụ thành công');
                    setShowDeleteModal(false);
                    setCategoryToDelete(null);

                    // Refresh the list
                    const sortMapping = mapSortToApi(sortBy);
                    const refreshResponse = await getAllServiceCategories(
                        sortMapping.sortBy,
                        sortMapping.sortDirection
                    );
                    if (refreshResponse.success && refreshResponse.data) {
                        setServiceCategories(refreshResponse.data);
                        setCurrentPage(1);
                    }
                }
            } catch (err: any) {
                // Handle API error message (from backend validation)
                const errorMessage = err.message || 'Không thể xóa danh mục dịch vụ';

                // Check if error message contains information about children
                if (errorMessage.includes('danh mục con') || errorMessage.includes('children')) {
                    toast.error(errorMessage, { autoClose: 5000 });
                } else {
                    toast.error(errorMessage);
                }

                setShowDeleteModal(false);
                setCategoryToDelete(null);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleDeleteCancel = () => {
        setShowDeleteModal(false);
        setCategoryToDelete(null);
    };

    // Helper function to get image URL (handle relative paths)
    const getImageUrl = (imageUrl: string | undefined): string | null => {
        if (!imageUrl || imageUrl.trim() === '') {
            return null;
        }
        // If it's already a full URL, return as is
        if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
            return imageUrl;
        }
        // If it's a relative path starting with /, try to use it as public asset
        if (imageUrl.startsWith('/')) {
            return imageUrl;
        }
        // Otherwise return as is
        return imageUrl;
    };

    // Helper function to render service category row with nested support
    const renderServiceCategoryRow = (category: ServiceCategory, isChild: boolean = false) => {
        const children = groupServiceCategoriesByParent.childrenMap.get(category.id) || [];
        const hasChildren = children.length > 0;
        const imageUrl = getImageUrl(category.imageUrl);
        const hasImageError = imageErrors.has(category.id);

        return (
            <React.Fragment key={category.id}>
                <tr>
                    <td>
                        <div
                            className="d-flex align-items-center"
                            style={{ paddingLeft: isChild ? '2rem' : '0' }}
                        >
                            <div className="avatar me-2">
                                {isChild ? (
                                    <i className="ti ti-file fs-18 text-secondary"></i>
                                ) : (
                                    <i className="ti ti-folder fs-18 text-primary"></i>
                                )}
                            </div>
                            <div>
                                <h6 className="mb-1 fs-14 fw-semibold">{category.name}</h6>
                            </div>
                        </div>
                    </td>
                    <td>
                        <div className="d-flex align-items-center">
                            {imageUrl && !hasImageError ? (
                                <img
                                    src={imageUrl}
                                    alt={category.name}
                                    style={{
                                        width: '40px',
                                        height: '40px',
                                        objectFit: 'cover',
                                        borderRadius: '4px',
                                    }}
                                    onError={() => {
                                        setImageErrors((prev) => new Set(prev).add(category.id));
                                    }}
                                    loading="lazy"
                                />
                            ) : (
                                <div
                                    className="avatar-title bg-primary-subtle text-primary rounded d-flex align-items-center justify-content-center"
                                    style={{ width: '40px', height: '40px' }}
                                >
                                    <i className="ti ti-image fs-18"></i>
                                </div>
                            )}
                        </div>
                    </td>
                    <td>
                        <span className="text-muted fs-14">
                            {category.description || 'Không có mô tả'}
                        </span>
                    </td>
                    <td>
                        <StatusBadge status={category.status} />
                    </td>
                    <td className="action-item">
                        <TableActions
                            id={category.id}
                            onEdit={() => {
                                console.log('Edit category:', category.id);
                            }}
                            onDelete={() => handleDeleteCategory(category)}
                            editLink={`/admin/service-categories/edit/${category.id}`}
                            showEdit={true}
                            showDelete={true}
                            showView={false}
                        />
                    </td>
                </tr>
                {/* Render children if this is a parent */}
                {hasChildren &&
                    !isChild &&
                    children.map((child) => renderServiceCategoryRow(child, true))}
            </React.Fragment>
        );
    };

    // Render table body content based on loading, error, and data states
    const renderTableBody = () => {
        if (isLoading) {
            return <TableSkeleton rows={itemsPerPage} columns={serviceCategoryTableColumns} />;
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
                                onClick={() => setError(null)}
                                aria-label="Close"
                            ></button>
                        </div>
                    </td>
                </tr>
            );
        }

        if (paginatedParentGroups.length === 0) {
            return (
                <tr>
                    <td colSpan={5} className="text-center py-4">
                        <p className="text-muted">Không có danh mục dịch vụ nào được tìm thấy.</p>
                    </td>
                </tr>
            );
        }

        // Render nested structure: paginated parent groups with their children
        return paginatedParentGroups.map((parent) => renderServiceCategoryRow(parent, false));
    };

    return (
        <>
            <div className="content">
                <div className="d-flex align-items-sm-center flex-sm-row flex-column gap-2 mb-3 pb-3 border-bottom">
                    <div className="flex-grow-1">
                        <h4 className="fw-bold mb-0">
                            Danh Sách Danh Mục Dịch Vụ{' '}
                            <span className="badge badge-soft-primary fs-13 fw-medium ms-2">
                                Tổng Danh Mục: {serviceCategories.length}
                                {groupServiceCategoriesByParent.parents.length > 0 && (
                                    <span className="ms-1">
                                        ({groupServiceCategoriesByParent.parents.length} danh mục
                                        cha)
                                    </span>
                                )}
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
                            }}
                        />
                        <Button
                            variant="primary"
                            size="md"
                            className="ms-2 fs-13"
                            icon="ti ti-plus"
                            onClick={() =>
                                (globalThis.location.href = '/admin/service-categories/add')
                            }
                        >
                            Thêm Danh Mục Dịch Vụ
                        </Button>
                    </div>
                </div>

                <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-3">
                    <div className="search-set mb-3">
                        <div className="d-flex align-items-center flex-wrap gap-2">
                            <div className="table-search d-flex align-items-center mb-0">
                                <div className="search-input">
                                    <label htmlFor="categorySearch" aria-label="Search categories">
                                        <input
                                            id="categorySearch"
                                            type="search"
                                            className="form-control form-control-sm"
                                            placeholder="Tìm kiếm danh mục..."
                                        />
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="d-flex table-dropdown mb-3 pb-1 align-items-center flex-wrap row-gap-3 ms-auto">
                        <ActionDropdown
                            type="sort"
                            options={[
                                { value: 'Tên A-Z', label: 'Tên A-Z' },
                                { value: 'Tên Z-A', label: 'Tên Z-A' },
                                { value: 'Ngày Tạo (Mới Nhất)', label: 'Ngày Tạo (Mới Nhất)' },
                                { value: 'Ngày Tạo (Cũ Nhất)', label: 'Ngày Tạo (Cũ Nhất)' },
                            ]}
                            selectedValue={sortBy}
                            onSelect={(newSortBy) => {
                                setSortBy(newSortBy);
                                setCurrentPage(1);
                                // Sorting triggers refetch via useEffect
                            }}
                            placeholder="Sắp xếp theo:"
                        />
                    </div>
                </div>

                <div className="table-responsive">
                    <table className="table table-nowrap datatable">
                        <thead className="thead-light">
                            <tr>
                                <th>Tên</th>
                                <th>Hình Ảnh</th>
                                <th>Mô Tả</th>
                                <th>Trạng Thái</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>{renderTableBody()}</tbody>
                    </table>
                </div>

                {effectiveTotalPages > 1 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={effectiveTotalPages}
                        onPageChange={handlePageChange}
                    />
                )}

                <div className="footer text-center bg-white p-2 border-top">
                    <p className="text-dark mb-0">
                        2025 &copy;{' '}
                        <a href="/" className="link-primary">
                            Preclinic
                        </a>
                        {''}, Tất Cả Quyền Được Bảo Lưu
                    </p>
                </div>
            </div>

            {/* Delete Modal */}
            <ModalDelete
                show={showDeleteModal}
                onHide={handleDeleteCancel}
                onConfirm={handleDeleteConfirm}
                title="Xác Nhận Xóa"
                message="Bạn có chắc chắn muốn xóa danh mục dịch vụ này không?"
                itemName={categoryToDelete ? categoryToDelete.name : ''}
            />
        </>
    );
};

export default ListServiceCategories;
