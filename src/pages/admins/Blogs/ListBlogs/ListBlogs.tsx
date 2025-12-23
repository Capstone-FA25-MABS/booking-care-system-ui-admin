import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import Pagination from '@/components/Pagination';
import Button from '@/components/Button';
import ModalDelete from '@/components/ModalDelete';
import ModalFilter from '@/components/ModalFilter';
import StatusBadge from '@/components/StatusBadge';
import type { StatusBadgeProps } from '@/components/StatusBadge/StatusBadge';
import TableSkeleton from '@/components/TableSkeleton';
import TableActions from '@/components/TableActions';
import AppliedFilters from '@/components/AppliedFilters/AppliedFilters';
import ActionDropdown from '@/components/ActionDropdown';
import {
    BlogSummaryDto,
    BlogStatus,
    BlogFilterParameters,
    BlogCategoryDto,
} from '@/types/blog.types';
import { BlogService } from '@/services/blog.service';
import { BlogCategoryService } from '@/services/blogCategory.service';
import { SORT_OPTIONS } from '@/utils/sortUtils';
import { PATHS, buildPath } from '@/routes/paths';
import { useCurrentUserProfile } from '@/hooks/useCurrentUserProfile';

// Skeleton columns for blog table
const blogTableColumns = [
    { label: 'Tiêu đề', hasAvatar: true, type: 'text' as const },
    { label: 'Hình ảnh', hasAvatar: false, type: 'text' as const },
    { label: 'Danh mục', hasAvatar: false, type: 'text' as const },
    { label: 'Trạng thái', hasAvatar: false, type: 'text' as const },
    { label: 'Nổi bật', hasAvatar: false, type: 'text' as const },
    { label: 'Ngày đăng', hasAvatar: false, type: 'text' as const },
    { label: 'Hành động', hasAvatar: false, type: 'text' as const },
];

const ListBlogs: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { role, doctorProfile, hospitalProfile } = useCurrentUserProfile();
    // Local state
    const [blogs, setBlogs] = useState<BlogSummaryDto[]>([]);
    const [pagination, setPagination] = useState({
        totalItems: 0,
        page: 1,
        pageSize: 10,
        totalPages: 0,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Filter states
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
    const [selectedFeatured, setSelectedFeatured] = useState<string[]>([]);
    const [appliedCategories, setAppliedCategories] = useState<string[]>([]);
    const [appliedStatuses, setAppliedStatuses] = useState<string[]>([]);
    const [appliedFeatured, setAppliedFeatured] = useState<string[]>([]);
    const [sortBy, setSortBy] = useState<string>('Mới thêm gần đây');
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [blogToDelete, setBlogToDelete] = useState<BlogSummaryDto | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');

    // Categories for filter
    const [allCategories, setAllCategories] = useState<BlogCategoryDto[]>([]);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const blogBasePath = useMemo(() => {
        if (location.pathname.startsWith(PATHS.HOSPITAL.ROOT)) {
            return PATHS.HOSPITAL.ROOT;
        }
        if (location.pathname.startsWith(PATHS.DOCTOR.ROOT)) {
            return PATHS.DOCTOR.ROOT;
        }
        return PATHS.ADMIN.ROOT;
    }, [location.pathname]);

    const buildBlogPath = useCallback(
        (suffix: string) => buildPath(blogBasePath, PATHS.ADMIN.BLOGS.ROOT, suffix),
        [blogBasePath]
    );

    // Fetch blogs
    const fetchBlogs = useCallback(
        async (page: number = 1, filters?: BlogFilterParameters) => {
            setIsLoading(true);
            setError(null);

            try {
                const isHospitalArea = location.pathname.startsWith(PATHS.HOSPITAL.ROOT);
                const isDoctorArea = location.pathname.startsWith(PATHS.DOCTOR.ROOT);

                const filterParams: BlogFilterParameters = {
                    page: page,
                    pageSize: itemsPerPage,
                    keyword: searchTerm.trim() || undefined,
                    ...filters,
                };

                // If we're in hospital/doctor area, enforce filtering by the current account id (createdBy)
                const currentAccountId = doctorProfile?.accountId ?? hospitalProfile?.accountId;
                if ((isDoctorArea || isHospitalArea) && currentAccountId) {
                    filterParams.createdByAccountId = currentAccountId;
                }

                // Apply category filter
                if (appliedCategories.length > 0) {
                    filterParams.categoryId = appliedCategories[0]; // Backend might support only one category
                }

                // Apply status filter
                if (appliedStatuses.length === 1) {
                    filterParams.status = appliedStatuses[0] as BlogStatus;
                }

                // Apply featured filter
                if (appliedFeatured.length === 1) {
                    filterParams.featured = appliedFeatured[0] === 'true';
                }

                // Apply role-based filter as a fallback when not in specific area
                if (!filterParams.createdByAccountId) {
                    const fallbackAccountId =
                        doctorProfile?.accountId ?? hospitalProfile?.accountId;
                    if (fallbackAccountId) {
                        filterParams.createdByAccountId = fallbackAccountId;
                    }
                }
                // For admin, use getMyBlogs which filters by accountId

                // Fetch blogs based on role
                const response =
                    role === 'DOCTOR' || role === 'STAFF'
                        ? await BlogService.getBlogs(filterParams)
                        : await BlogService.getMyBlogs(filterParams);
                const data = response.data;

                setBlogs(data.items || []);
                setPagination({
                    totalItems: data.totalItems || 0,
                    page: data.page || page,
                    pageSize: data.pageSize || itemsPerPage,
                    totalPages: Math.ceil((data.totalItems || 0) / (data.pageSize || itemsPerPage)),
                });
            } catch (err: any) {
                setError(err.message || 'Không thể tải danh sách blog');
                toast.error(err.message || 'Không thể tải danh sách blog');
            } finally {
                setIsLoading(false);
            }
        },
        [
            searchTerm,
            itemsPerPage,
            appliedCategories,
            appliedStatuses,
            appliedFeatured,
            role,
            doctorProfile?.id,
            hospitalProfile?.id,
        ]
    );

    // Fetch categories
    const fetchCategories = useCallback(async () => {
        try {
            const response = await BlogCategoryService.getCategories(true);
            setAllCategories(response.data || []);
        } catch (err) {
            console.error('Error fetching categories:', err);
        }
    }, []);

    // Initial fetch
    useEffect(() => {
        fetchBlogs(currentPage);
        fetchCategories();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, doctorProfile?.accountId, hospitalProfile?.accountId, location.pathname]);

    // Handle search with debounce
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setCurrentPage(1);
            fetchBlogs(1);
        }, 500);

        return () => clearTimeout(timeoutId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchTerm]);

    // Handle page change
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    // Handle filter submit
    const handleFilterSubmit = () => {
        setAppliedCategories([...selectedCategories]);
        setAppliedStatuses([...selectedStatuses]);
        setAppliedFeatured([...selectedFeatured]);
        setCurrentPage(1);
        setShowFilterModal(false);
        fetchBlogs(1);
    };

    // Handle clear filters
    const handleClearFilters = () => {
        setSelectedCategories([]);
        setSelectedStatuses([]);
        setSelectedFeatured([]);
        setAppliedCategories([]);
        setAppliedStatuses([]);
        setAppliedFeatured([]);
        setCurrentPage(1);
        fetchBlogs(1);
    };

    // Handle delete
    const handleDeleteClick = (blog: BlogSummaryDto) => {
        setBlogToDelete(blog);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        if (!blogToDelete) return;

        try {
            await BlogService.deleteBlog(blogToDelete.id);
            toast.success('Xóa blog thành công!');
            setShowDeleteModal(false);
            setBlogToDelete(null);
            fetchBlogs(currentPage);
        } catch (err: any) {
            toast.error(err.message || 'Không thể xóa blog');
        }
    };

    const handleDeleteCancel = () => {
        setShowDeleteModal(false);
        setBlogToDelete(null);
    };

    // Get status badge variant
    const getStatusVariant = (status: BlogStatus): StatusBadgeProps['variant'] => {
        switch (status) {
            case BlogStatus.Active:
            case BlogStatus.Approved:
                return 'success';
            case BlogStatus.Pending:
                return 'warning';
            case BlogStatus.Rejected:
            case BlogStatus.Inactive:
                return 'danger';
            default:
                return 'secondary';
        }
    };

    // Get status display text
    const getStatusText = (status: BlogStatus) => {
        switch (status) {
            case BlogStatus.Pending:
                return 'Chờ duyệt';
            case BlogStatus.Approved:
                return 'Đã duyệt';
            case BlogStatus.Rejected:
                return 'Từ chối';
            case BlogStatus.Active:
                return 'Hoạt động';
            case BlogStatus.Inactive:
                return 'Không hoạt động';
            default:
                return status;
        }
    };

    // Render table body
    const renderTableBody = () => {
        if (isLoading) {
            return <TableSkeleton rows={itemsPerPage} columns={blogTableColumns} />;
        }

        if (error) {
            return (
                <tr>
                    <td colSpan={7} className="text-center py-4">
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

        if (blogs.length === 0) {
            return (
                <tr>
                    <td colSpan={7} className="text-center py-4">
                        <p className="text-muted">Không có blog nào được tìm thấy.</p>
                    </td>
                </tr>
            );
        }

        return blogs.map((blog) => (
            <tr key={blog.id}>
                <td>
                    <div className="d-flex align-items-center">
                        <div className="avatar me-2">
                            <div className="avatar-title bg-primary-subtle text-primary rounded">
                                <i className="ti ti-file-text"></i>
                            </div>
                        </div>
                        <div>
                            <h6 className="mb-1 fs-14 fw-semibold">{blog.titleVi}</h6>
                            {blog.tag && (
                                <span className="text-muted fs-13 d-block">Tag: {blog.tag}</span>
                            )}
                        </div>
                    </div>
                </td>
                <td>
                    {blog.thumbnailUrl ? (
                        <div className="d-flex align-items-center">
                            <img
                                src={blog.thumbnailUrl}
                                alt={blog.titleVi}
                                style={{
                                    width: '60px',
                                    height: '60px',
                                    objectFit: 'cover',
                                    borderRadius: '4px',
                                }}
                                onError={(e) => {
                                    e.currentTarget.src =
                                        'https://via.placeholder.com/60x60?text=No+Image';
                                }}
                            />
                        </div>
                    ) : (
                        <span className="text-muted fs-14">Không có ảnh</span>
                    )}
                </td>
                <td>
                    {blog.category ? (
                        <StatusBadge
                            status="ACTIVE"
                            variant="info"
                            customText={blog.category.categoryName}
                        />
                    ) : (
                        <span className="text-muted fs-14">Chưa phân loại</span>
                    )}
                </td>
                <td>
                    <StatusBadge
                        status={blog.status}
                        variant={getStatusVariant(blog.status)}
                        customText={getStatusText(blog.status)}
                    />
                </td>
                <td>
                    {blog.featured ? (
                        <StatusBadge status="ACTIVE" variant="warning" customText="Nổi bật" />
                    ) : (
                        <span className="text-muted fs-14">-</span>
                    )}
                </td>
                <td>
                    <span className="text-muted fs-14">
                        {blog.publishedAt
                            ? new Date(blog.publishedAt).toLocaleDateString('vi-VN')
                            : 'Chưa đăng'}
                    </span>
                </td>
                <td className="action-item">
                    <div className="d-flex align-items-center gap-2">
                        <TableActions
                            id={blog.id}
                            onEdit={() => {
                                navigate(buildBlogPath(`/edit/${blog.id}`));
                            }}
                            onDelete={() => handleDeleteClick(blog)}
                            showEdit={true}
                            showDelete={true}
                            showHide={false}
                            showView={false}
                        />
                    </div>
                </td>
            </tr>
        ));
    };

    return (
        <div className="content">
            <div className="d-flex align-items-sm-center flex-sm-row flex-column gap-2 mb-3 pb-3 border-bottom">
                <div className="flex-grow-1">
                    <h4 className="fw-bold mb-0">
                        Danh sách bài viết{' '}
                        <span className="badge badge-soft-primary fs-13 fw-medium ms-2">
                            Tổng bài viết: {pagination.totalItems}
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
                        onClick={() => {
                            navigate(buildBlogPath('/add'));
                        }}
                    >
                        Thêm bài viết
                    </Button>
                </div>
            </div>

            <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-3">
                <div className="search-set mb-3">
                    <div className="d-flex align-items-center flex-wrap gap-2">
                        <div className="table-search d-flex align-items-center mb-0">
                            <div className="search-input">
                                <label htmlFor="blogSearch" aria-label="Search blogs">
                                    <input
                                        id="blogSearch"
                                        type="search"
                                        className="form-control form-control-sm"
                                        placeholder="Tìm kiếm bài viết..."
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
                        onClick={() => {
                            // Sync selected filters with applied filters when opening modal
                            setSelectedCategories([...appliedCategories]);
                            setSelectedStatuses([...appliedStatuses]);
                            setSelectedFeatured([...appliedFeatured]);
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
                            fetchBlogs(1);
                        }}
                        placeholder="Sắp xếp theo:"
                    />
                </div>
            </div>

            {/* Applied Filters */}
            <AppliedFilters
                appliedItems={appliedCategories}
                appliedStatuses={appliedStatuses}
                items={allCategories.map((cat) => ({
                    id: cat.id,
                    name: cat.categoryName,
                }))}
                onRemoveItem={(categoryId: string) => {
                    const newAppliedCategories = appliedCategories.filter(
                        (id) => id !== categoryId
                    );
                    setAppliedCategories(newAppliedCategories);
                    setSelectedCategories(newAppliedCategories);
                    setCurrentPage(1);
                    fetchBlogs(1);
                }}
                onRemoveStatus={(status: string) => {
                    const newAppliedStatuses = appliedStatuses.filter((s) => s !== status);
                    setAppliedStatuses(newAppliedStatuses);
                    setSelectedStatuses(newAppliedStatuses);
                    setCurrentPage(1);
                    fetchBlogs(1);
                }}
                onClearAll={handleClearFilters}
            />

            <div className="table-responsive">
                <table className="table table-nowrap datatable">
                    <thead className="thead-light">
                        <tr>
                            <th>Tiêu đề</th>
                            <th>Hình ảnh</th>
                            <th>Danh mục</th>
                            <th>Trạng thái</th>
                            <th>Nổi bật</th>
                            <th>Ngày đăng</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>{renderTableBody()}</tbody>
                </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="d-flex justify-content-center mt-3">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={pagination.totalPages}
                        onPageChange={handlePageChange}
                    />
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <ModalDelete
                show={showDeleteModal}
                onHide={handleDeleteCancel}
                onConfirm={handleDeleteConfirm}
                title="Xóa bài viết"
                message={`Bạn có chắc chắn muốn xóa bài viết "${blogToDelete?.titleVi}"? Hành động này không thể hoàn tác.`}
                confirmText="Có, Xóa"
            />

            {/* Filter Modal */}
            <ModalFilter
                show={showFilterModal}
                onHide={() => setShowFilterModal(false)}
                onApply={handleFilterSubmit}
                onReset={handleClearFilters}
                title="Bộ lọc bài viết"
                fields={[
                    {
                        name: 'categories',
                        label: 'Danh mục',
                        type: 'multiselect',
                        options: allCategories.map((category) => ({
                            value: category.id,
                            label: category.categoryName,
                        })),
                        value: selectedCategories,
                        onChange: setSelectedCategories,
                        resetValue: () => setSelectedCategories([]),
                    },
                    {
                        name: 'statuses',
                        label: 'Trạng thái',
                        type: 'multiselect',
                        options: [
                            { value: BlogStatus.Pending, label: 'Chờ duyệt' },
                            { value: BlogStatus.Approved, label: 'Đã duyệt' },
                            { value: BlogStatus.Rejected, label: 'Từ chối' },
                            { value: BlogStatus.Active, label: 'Hoạt động' },
                            { value: BlogStatus.Inactive, label: 'Không hoạt động' },
                        ],
                        value: selectedStatuses,
                        onChange: setSelectedStatuses,
                        resetValue: () => setSelectedStatuses([]),
                    },
                    {
                        name: 'featured',
                        label: 'Nổi bật',
                        type: 'multiselect',
                        options: [
                            { value: 'true', label: 'Có' },
                            { value: 'false', label: 'Không' },
                        ],
                        value: selectedFeatured,
                        onChange: setSelectedFeatured,
                        resetValue: () => setSelectedFeatured([]),
                    },
                ]}
            />
        </div>
    );
};

export default ListBlogs;
