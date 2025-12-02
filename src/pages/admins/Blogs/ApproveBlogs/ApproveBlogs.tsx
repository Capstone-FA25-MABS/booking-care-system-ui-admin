import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import Button from '@/components/Button';
import Spinner from '@/components/Spinner';
import BaseModal from '@/components/Modal/BaseModal';
import StatusBadge from '@/components/StatusBadge';
import {
    BlogCategoryDto,
    BlogDetailDto,
    BlogStatus,
    BlogSummaryDto,
    PagedResponse,
} from '@/types/blog.types';
import { BlogService } from '@/services/blog.service';
import { BlogCategoryService } from '@/services/blogCategory.service';

const ITEMS_PER_PAGE = 12;

const BlogApproval: React.FC = () => {
    const [blogs, setBlogs] = useState<BlogSummaryDto[]>([]);
    const [pendingTotal, setPendingTotal] = useState(0);
    const [categories, setCategories] = useState<BlogCategoryDto[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedKeyword, setDebouncedKeyword] = useState('');
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [previewState, setPreviewState] = useState<{
        isOpen: boolean;
        isLoading: boolean;
        detail: BlogDetailDto | null;
        error: string | null;
    }>({
        isOpen: false,
        isLoading: false,
        detail: null,
        error: null,
    });
    const [selectedBlog, setSelectedBlog] = useState<BlogSummaryDto | null>(null);
    const [blogFeaturedStatus, setBlogFeaturedStatus] = useState<Record<string, boolean>>({});

    const fetchCategories = useCallback(async () => {
        try {
            const response = await BlogCategoryService.getCategories(false);
            setCategories(response.data || []);
        } catch (err: any) {
            console.error('Không thể tải danh mục blog:', err);
        }
    }, []);

    const fetchPendingBlogs = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await BlogService.getBlogs({
                status: BlogStatus.Pending,
                keyword: debouncedKeyword || undefined,
                categoryId: selectedCategoryId || undefined,
                page: 1,
                pageSize: ITEMS_PER_PAGE,
            });
            const data = (response.data || {}) as PagedResponse<BlogSummaryDto>;

            setBlogs(data.items || []);
            setPendingTotal(data.totalItems || data.items?.length || 0);
        } catch (err: any) {
            const message = err?.message || 'Không thể tải danh sách blog chờ duyệt';
            setError(message);
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    }, [debouncedKeyword, selectedCategoryId]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedKeyword(searchTerm.trim());
        }, 400);

        return () => clearTimeout(handler);
    }, [searchTerm]);

    useEffect(() => {
        fetchPendingBlogs();
    }, [fetchPendingBlogs]);

    const formatDate = useCallback((dateString?: string) => {
        if (!dateString) return 'Chưa có ngày đăng';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    }, []);

    const handleClosePreview = useCallback(() => {
        setPreviewState({
            isOpen: false,
            isLoading: false,
            detail: null,
            error: null,
        });
        setSelectedBlog(null);
    }, []);

    const handleApprove = useCallback(
        async (blog: BlogSummaryDto, featured?: boolean) => {
            setProcessingId(blog.id);
            try {
                // Use provided featured or get from state, default to false
                const featuredStatus =
                    featured !== undefined ? featured : (blogFeaturedStatus[blog.id] ?? false);

                await BlogService.approveBlog(blog.id, featuredStatus);
                setSelectedBlog((prev) =>
                    prev && prev.id === blog.id ? { ...prev, status: BlogStatus.Active } : prev
                );
                setPreviewState((prev) => ({
                    ...prev,
                    detail:
                        prev.detail && prev.detail.id === blog.id
                            ? { ...prev.detail, status: BlogStatus.Active }
                            : prev.detail,
                }));
                // Clear featured status for this blog
                setBlogFeaturedStatus((prev) => {
                    const newState = { ...prev };
                    delete newState[blog.id];
                    return newState;
                });
                toast.success('Duyệt blog thành công!');
                await fetchPendingBlogs();

                if (selectedBlog?.id === blog.id) {
                    handleClosePreview();
                }
            } catch (err: any) {
                toast.error(err?.message || 'Không thể duyệt blog');
            } finally {
                setProcessingId(null);
            }
        },
        [fetchPendingBlogs, handleClosePreview, selectedBlog, blogFeaturedStatus]
    );

    const handleReject = useCallback(
        async (blog: BlogSummaryDto) => {
            setProcessingId(blog.id);
            try {
                await BlogService.rejectBlog(blog.id);
                toast.success('Đã từ chối blog');
                await fetchPendingBlogs();

                if (selectedBlog?.id === blog.id) {
                    handleClosePreview();
                }
            } catch (err: any) {
                toast.error(err?.message || 'Không thể từ chối blog');
            } finally {
                setProcessingId(null);
            }
        },
        [fetchPendingBlogs, handleClosePreview, selectedBlog]
    );

    const handleOpenPreview = useCallback(async (blog: BlogSummaryDto) => {
        setSelectedBlog(blog);
        setPreviewState({
            isOpen: true,
            isLoading: true,
            detail: null,
            error: null,
        });

        try {
            const response = await BlogService.getBlogById(blog.id);
            setPreviewState({
                isOpen: true,
                isLoading: false,
                detail: response.data,
                error: null,
            });
        } catch (err: any) {
            setPreviewState({
                isOpen: true,
                isLoading: false,
                detail: null,
                error: err?.message || 'Không thể tải nội dung blog',
            });
        }
    }, []);

    const pendingCountLabel = useMemo(() => {
        if (pendingTotal === 0) {
            return 'Không có blog nào chờ duyệt';
        }
        if (pendingTotal === 1) {
            return '1 blog cần duyệt';
        }
        return `${pendingTotal} blog cần duyệt`;
    }, [pendingTotal]);

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="text-center py-5">
                    <Spinner centered />
                    <p className="text-muted mt-2">Đang tải danh sách blog...</p>
                </div>
            );
        }

        if (error) {
            return (
                <div className="alert alert-danger" role="alert">
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <strong>Lỗi:</strong> {error}
                        </div>
                        <button
                            type="button"
                            className="btn btn-sm btn-light"
                            onClick={() => fetchPendingBlogs()}
                        >
                            Thử lại
                        </button>
                    </div>
                </div>
            );
        }

        if (blogs.length === 0) {
            return (
                <div className="text-center py-5">
                    <div
                        className="rounded-circle bg-light d-inline-flex align-items-center justify-content-center"
                        style={{ width: 96, height: 96 }}
                    >
                        <i className="ti ti-inbox text-muted fs-1"></i>
                    </div>
                    <h5 className="mt-3">Không có blog nào chờ duyệt</h5>
                    <p className="text-muted mb-3">
                        Khi tác giả gửi blog mới, bạn sẽ thấy chúng xuất hiện tại đây.
                    </p>
                    <Button
                        variant="white"
                        onClick={() => fetchPendingBlogs()}
                        icon="ti ti-refresh"
                    >
                        Làm mới danh sách
                    </Button>
                </div>
            );
        }

        return (
            <div className="d-flex flex-column gap-3">
                {blogs.map((blog) => (
                    <div key={blog.id} className="card shadow-sm border-0">
                        <div className="card-body">
                            <div className="d-flex flex-column flex-md-row gap-3">
                                <div className="flex-shrink-0">
                                    {blog.thumbnailUrl ? (
                                        <img
                                            src={blog.thumbnailUrl}
                                            alt={blog.titleVi}
                                            className="rounded"
                                            style={{
                                                width: 140,
                                                height: 140,
                                                objectFit: 'cover',
                                            }}
                                        />
                                    ) : (
                                        <div
                                            className="bg-light rounded d-flex align-items-center justify-content-center"
                                            style={{ width: 140, height: 140 }}
                                        >
                                            <i className="ti ti-photo text-muted fs-1"></i>
                                        </div>
                                    )}
                                </div>
                                <div className="flex-grow-1">
                                    <div className="d-flex flex-wrap justify-content-between gap-2">
                                        <div>
                                            <h5 className="mb-2">{blog.titleVi}</h5>
                                            <div className="d-flex flex-wrap gap-2 text-muted small">
                                                <span>
                                                    Danh mục:{' '}
                                                    {blog.category?.categoryName ||
                                                        'Chưa phân loại'}
                                                </span>
                                                <span>•</span>
                                                <span>{blog.source || 'Không rõ nguồn'}</span>
                                                {blog.tag && (
                                                    <>
                                                        <span>•</span>
                                                        <span>Tag: {blog.tag}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        <StatusBadge
                                            status="warning"
                                            variant="warning"
                                            customText="Chờ duyệt"
                                        />
                                    </div>
                                    <div className="mt-3 d-flex flex-wrap gap-3 text-muted">
                                        <div>
                                            <i className="ti ti-calendar me-1"></i>
                                            {formatDate(blog.publishedAt)}
                                        </div>
                                        <div>
                                            <i className="ti ti-star me-1"></i>
                                            {blog.featured ? 'Đề xuất nổi bật' : 'Blog thường'}
                                        </div>
                                    </div>
                                    <div className="mt-3 d-flex flex-wrap align-items-center gap-3">
                                        <div className="d-flex flex-wrap gap-2">
                                            <button
                                                type="button"
                                                className="btn btn-outline-secondary btn-sm"
                                                onClick={() => handleOpenPreview(blog)}
                                            >
                                                Xem chi tiết
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn-danger btn-sm"
                                                disabled={processingId === blog.id}
                                                onClick={() => handleReject(blog)}
                                            >
                                                {processingId === blog.id ? (
                                                    <span className="spinner-border spinner-border-sm"></span>
                                                ) : (
                                                    <i className="ti ti-x me-1"></i>
                                                )}
                                                Từ chối
                                            </button>
                                        </div>
                                        <div className="d-flex align-items-center gap-2">
                                            <div className="form-check">
                                                <input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    id={`featured-${blog.id}`}
                                                    checked={blogFeaturedStatus[blog.id] ?? false}
                                                    onChange={(e) =>
                                                        setBlogFeaturedStatus((prev) => ({
                                                            ...prev,
                                                            [blog.id]: e.target.checked,
                                                        }))
                                                    }
                                                    disabled={processingId === blog.id}
                                                />
                                                <label
                                                    className="form-check-label text-muted small"
                                                    htmlFor={`featured-${blog.id}`}
                                                >
                                                    <i className="ti ti-star me-1"></i>
                                                    Đánh dấu nổi bật
                                                </label>
                                            </div>
                                            <button
                                                type="button"
                                                className="btn btn-success btn-sm"
                                                disabled={processingId === blog.id}
                                                onClick={() => handleApprove(blog)}
                                            >
                                                {processingId === blog.id ? (
                                                    <span className="spinner-border spinner-border-sm"></span>
                                                ) : (
                                                    <i className="ti ti-check me-1"></i>
                                                )}
                                                Duyệt
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="content">
            <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
                <div>
                    <h4 className="fw-bold mb-1">Duyệt blog</h4>
                    <p className="text-muted mb-0">
                        Chỉ hiển thị những blog đang chờ duyệt từ bác sĩ và bệnh viện.
                    </p>
                </div>
                <div className="d-flex align-items-center gap-2">
                    <div className="badge bg-warning-subtle text-warning p-2">
                        {pendingCountLabel}
                    </div>
                    <Button
                        variant="white"
                        icon="ti ti-refresh"
                        className="fs-13"
                        onClick={() => fetchPendingBlogs()}
                    >
                        Làm mới
                    </Button>
                </div>
            </div>

            <div className="card border-0 shadow-sm mb-4">
                <div className="card-body">
                    <div className="row g-3">
                        <div className="col-md-5">
                            <label htmlFor="blogSearchInput" className="form-label text-muted">
                                Từ khóa
                            </label>
                            <input
                                id="blogSearchInput"
                                type="search"
                                className="form-control"
                                placeholder="Tìm theo tiêu đề, tag, nguồn..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="col-md-5">
                            <label htmlFor="blogCategoryFilter" className="form-label text-muted">
                                Danh mục
                            </label>
                            <select
                                id="blogCategoryFilter"
                                className="form-select"
                                value={selectedCategoryId}
                                onChange={(e) => setSelectedCategoryId(e.target.value)}
                            >
                                <option value="">Tất cả danh mục</option>
                                {categories.map((category) => (
                                    <option key={category.id} value={category.id}>
                                        {category.categoryName}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-2 d-flex align-items-end">
                            <Button
                                variant="outline-secondary"
                                className="w-100"
                                onClick={() => {
                                    setSearchTerm('');
                                    setSelectedCategoryId('');
                                }}
                                icon="ti ti-filter-x"
                            >
                                Xóa lọc
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {renderContent()}

            <BaseModal
                isOpen={previewState.isOpen}
                title={selectedBlog ? selectedBlog.titleVi : 'Xem chi tiết blog'}
                titleId="blogPreviewModal"
                onClose={handleClosePreview}
                size="lg"
            >
                <div className="modal-body">
                    {previewState.isLoading && (
                        <div className="text-center py-4">
                            <Spinner centered />
                            <p className="text-muted mt-2">Đang tải nội dung...</p>
                        </div>
                    )}
                    {!previewState.isLoading && previewState.error && (
                        <div className="alert alert-danger" role="alert">
                            {previewState.error}
                        </div>
                    )}
                    {!previewState.isLoading && previewState.detail && (
                        <>
                            <div className="mb-3">
                                <div className="text-muted small">Danh mục</div>
                                <div className="fw-semibold">
                                    {previewState.detail.category?.categoryName || 'Chưa phân loại'}
                                </div>
                            </div>
                            <div className="mb-3">
                                <div className="text-muted small">Nguồn</div>
                                <div className="fw-semibold">
                                    {previewState.detail.source || 'Không rõ nguồn'}
                                </div>
                            </div>
                            <div
                                className="border rounded p-3"
                                style={{ maxHeight: '60vh', overflow: 'auto' }}
                            >
                                <div
                                    className="blog-preview-content"
                                    dangerouslySetInnerHTML={{
                                        __html: previewState.detail.contentVi,
                                    }}
                                ></div>
                            </div>
                        </>
                    )}
                </div>
                <div className="modal-footer">
                    <div className="form-check me-auto">
                        <input
                            className="form-check-input"
                            type="checkbox"
                            id="modal-featured-checkbox"
                            checked={
                                selectedBlog
                                    ? (blogFeaturedStatus[selectedBlog.id] ?? false)
                                    : false
                            }
                            onChange={(e) =>
                                selectedBlog &&
                                setBlogFeaturedStatus((prev) => ({
                                    ...prev,
                                    [selectedBlog.id]: e.target.checked,
                                }))
                            }
                            disabled={!selectedBlog || processingId === selectedBlog?.id}
                        />
                        <label className="form-check-label" htmlFor="modal-featured-checkbox">
                            <i className="ti ti-star me-1"></i>
                            Đánh dấu nổi bật
                        </label>
                    </div>
                    <button type="button" className="btn btn-light" onClick={handleClosePreview}>
                        Đóng
                    </button>
                    <button
                        type="button"
                        className="btn btn-danger"
                        disabled={!selectedBlog || processingId === selectedBlog?.id}
                        onClick={() => selectedBlog && handleReject(selectedBlog)}
                    >
                        Từ chối
                    </button>
                    <button
                        type="button"
                        className="btn btn-success"
                        disabled={!selectedBlog || processingId === selectedBlog?.id}
                        onClick={() => selectedBlog && handleApprove(selectedBlog)}
                    >
                        Duyệt
                    </button>
                </div>
            </BaseModal>
        </div>
    );
};

export default BlogApproval;
