import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import Select from 'react-select';
import Button from '@/components/Button';
import Input from '@/components/Input';
import CKEditor from '@/components/CKEditor';
import ImageUploadField from '@/components/ImageUploadField';
import { BlogService } from '@/services/blog.service';
import { BlogCategoryService } from '@/services/blogCategory.service';
import { UpdateBlogRequest, BlogStatus, BlogCategoryDto, BlogDetailDto } from '@/types/blog.types';
import { selectCustomStyles } from '@/constants/select.styles';
import { PATHS, buildPath } from '@/routes/paths';

interface BlogFormData {
    blogCategoryId: string;
    titleVi: string;
    contentVi: string;
    titleEn: string;
    contentEn: string;
    thumbnailUrl: string;
    thumbnailFile: File | null;
    heroImageUrl: string;
    heroImageFile: File | null;
    tag: string;
    source: string;
    status: BlogStatus;
    featured: boolean;
    publishedAt: string;
}

const EditBlog: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { id } = useParams<{ id: string }>();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingCategories, setIsLoadingCategories] = useState(false);
    const [categories, setCategories] = useState<BlogCategoryDto[]>([]);

    const [formData, setFormData] = useState<BlogFormData>({
        blogCategoryId: '',
        titleVi: '',
        contentVi: '',
        titleEn: '',
        contentEn: '',
        thumbnailUrl: '',
        thumbnailFile: null,
        heroImageUrl: '',
        heroImageFile: null,
        tag: '',
        source: '',
        status: BlogStatus.Pending,
        featured: false,
        publishedAt: '',
    });

    const [errors, setErrors] = useState<Partial<Record<keyof BlogFormData, string>>>({});

    const blogListPath = useMemo(() => {
        if (location.pathname.startsWith(PATHS.HOSPITAL.ROOT)) {
            return buildPath(PATHS.HOSPITAL.ROOT, PATHS.ADMIN.BLOGS.ROOT);
        }
        if (location.pathname.startsWith(PATHS.DOCTOR.ROOT)) {
            return buildPath(PATHS.DOCTOR.ROOT, PATHS.ADMIN.BLOGS.ROOT);
        }

        return buildPath(PATHS.ADMIN.ROOT, PATHS.ADMIN.BLOGS.ROOT);
    }, [location.pathname]);

    // Fetch blog data
    useEffect(() => {
        const fetchBlog = async () => {
            if (!id) {
                toast.error('Không tìm thấy ID blog');
                navigate(blogListPath);
                return;
            }

            setIsLoading(true);
            try {
                const response = await BlogService.getBlogById(id);
                const blog: BlogDetailDto = response.data;

                // Format publishedAt for datetime-local input
                let publishedAtFormatted = '';
                if (blog.publishedAt) {
                    const date = new Date(blog.publishedAt);
                    publishedAtFormatted = date.toISOString().slice(0, 16);
                }

                setFormData({
                    blogCategoryId: blog.category?.id || '',
                    titleVi: blog.titleVi || '',
                    contentVi: blog.contentVi || '',
                    titleEn: blog.titleEn || '',
                    contentEn: blog.contentEn || '',
                    thumbnailUrl: blog.thumbnailUrl || '',
                    thumbnailFile: null,
                    heroImageUrl: blog.heroImageUrl || '',
                    heroImageFile: null,
                    tag: blog.tag || '',
                    source: blog.source || '',
                    status: blog.status,
                    featured: blog.featured || false,
                    publishedAt: publishedAtFormatted,
                });
            } catch (err: any) {
                toast.error(err.message || 'Không thể tải thông tin blog');
                navigate(blogListPath);
            } finally {
                setIsLoading(false);
            }
        };

        fetchBlog();
    }, [blogListPath, id, navigate]);

    // Fetch categories
    useEffect(() => {
        const fetchCategories = async () => {
            setIsLoadingCategories(true);
            try {
                const response = await BlogCategoryService.getCategories(true);
                setCategories(response.data || []);
            } catch (err: any) {
                toast.error(err.message || 'Không thể tải danh mục');
            } finally {
                setIsLoadingCategories(false);
            }
        };

        fetchCategories();
    }, []);

    // Handle input change
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name as keyof BlogFormData]) {
            setErrors((prev) => ({ ...prev, [name]: undefined }));
        }
    };

    // Helper function to update form field
    const updateFormField = (name: keyof BlogFormData, value: any) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: undefined }));
        }
    };

    // Handle select change
    const handleSelectChange = (name: keyof BlogFormData, value: any) => {
        updateFormField(name, value);
    };

    // Handle CKEditor change
    const handleContentChange = (name: 'contentVi' | 'contentEn', value: string) => {
        updateFormField(name, value);
    };

    // Handle input change for image URLs
    const handleImageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        updateFormField(e.target.name as keyof BlogFormData, e.target.value);
    };

    const handleThumbnailFileChange = (file: File | null) => {
        updateFormField('thumbnailFile', file);
    };

    const handleHeroFileChange = (file: File | null) => {
        updateFormField('heroImageFile', file);
    };

    // Validate form
    const validateForm = (): boolean => {
        const newErrors: Partial<Record<keyof BlogFormData, string>> = {};

        if (!formData.titleVi.trim()) {
            newErrors.titleVi = 'Vui lòng nhập tiêu đề tiếng Việt';
        }

        if (!formData.contentVi.trim()) {
            newErrors.contentVi = 'Vui lòng nhập nội dung tiếng Việt';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!id) {
            toast.error('Không tìm thấy ID blog');
            return;
        }

        if (!validateForm()) {
            toast.error('Vui lòng kiểm tra lại thông tin');
            return;
        }

        setIsSubmitting(true);

        try {
            const request: UpdateBlogRequest = {
                blogCategoryId: formData.blogCategoryId || undefined,
                titleVi: formData.titleVi.trim(),
                contentVi: formData.contentVi.trim(),
                titleEn: formData.titleEn.trim() || undefined,
                contentEn: formData.contentEn.trim() || undefined,
                thumbnailUrl: formData.thumbnailUrl.trim() || undefined,
                heroImageUrl: formData.heroImageUrl.trim() || undefined,
                tag: formData.tag.trim() || undefined,
                source: formData.source.trim() || undefined,
            };

            const response = await BlogService.updateBlog(id, request, {
                thumbnailFile: formData.thumbnailFile || undefined,
                heroImageFile: formData.heroImageFile || undefined,
            });

            if (response.success) {
                toast.success('Cập nhật blog thành công!');
                navigate(blogListPath);
            } else {
                toast.error(response.message || 'Không thể cập nhật blog');
            }
        } catch (err: any) {
            toast.error(err.message || 'Không thể cập nhật blog');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle cancel
    const handleCancel = () => {
        navigate(blogListPath);
    };

    // Category options
    const categoryOptions = categories.map((cat) => ({
        value: cat.id,
        label: cat.categoryName,
    }));

    if (isLoading) {
        return (
            <div className="content">
                <div className="text-center py-5">
                    <div className="spinner-border">
                        <output className="visually-hidden">Loading...</output>
                    </div>
                    <p className="mt-3">Đang tải thông tin blog...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="content">
            <div className="d-flex align-items-sm-center flex-sm-row flex-column gap-2 mb-3 pb-3 border-bottom">
                <div className="flex-grow-1">
                    <h4 className="fw-bold mb-0">Chỉnh sửa blog</h4>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="card mb-4">
                    <div className="card-body">
                        <h5 className="card-title mb-4">Thông tin cơ bản</h5>

                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <Input
                                    label="Tiêu đề tiếng Việt"
                                    name="titleVi"
                                    value={formData.titleVi}
                                    onChange={handleInputChange}
                                    error={errors.titleVi}
                                    required
                                    icon="file-text"
                                    iconPrefix="feather"
                                />
                            </div>
                            <div className="col-md-6 mb-3">
                                <Input
                                    label="Tiêu đề tiếng Anh (tùy chọn)"
                                    name="titleEn"
                                    value={formData.titleEn}
                                    onChange={handleInputChange}
                                    error={errors.titleEn}
                                    icon="file-text"
                                    iconPrefix="feather"
                                />
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label htmlFor="blogCategoryId" className="form-label">
                                    <i className="feather-folder me-1"></i> Danh mục
                                </label>
                                <Select
                                    inputId="blogCategoryId"
                                    options={categoryOptions}
                                    value={categoryOptions.find(
                                        (opt) => opt.value === formData.blogCategoryId
                                    )}
                                    onChange={(option) =>
                                        handleSelectChange('blogCategoryId', option?.value || '')
                                    }
                                    placeholder="Chọn danh mục..."
                                    isClearable
                                    isLoading={isLoadingCategories}
                                    styles={selectCustomStyles}
                                />
                                {errors.blogCategoryId && (
                                    <div className="invalid-feedback d-block">
                                        {errors.blogCategoryId}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <Input
                                    label="Tag (tùy chọn)"
                                    name="tag"
                                    value={formData.tag}
                                    onChange={handleInputChange}
                                    error={errors.tag}
                                    icon="tag"
                                    iconPrefix="feather"
                                    placeholder="Ví dụ: sức khỏe, dinh dưỡng..."
                                />
                            </div>
                            <div className="col-md-6 mb-3">
                                <Input
                                    label="Nguồn (tùy chọn)"
                                    name="source"
                                    value={formData.source}
                                    onChange={handleInputChange}
                                    error={errors.source}
                                    icon="link"
                                    iconPrefix="feather"
                                    placeholder="URL nguồn bài viết"
                                />
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <ImageUploadField
                                    label="Ảnh thumbnail"
                                    name="thumbnailUrl"
                                    file={formData.thumbnailFile}
                                    imageUrl={formData.thumbnailUrl}
                                    onFileChange={handleThumbnailFileChange}
                                    onUrlChange={handleImageInputChange}
                                    error={errors.thumbnailUrl}
                                    description="Ảnh dùng trong danh sách blog và liên kết nội bộ."
                                    helperText="Tối đa 5MB, hỗ trợ JPG/PNG/GIF/WEBP."
                                    previewAspect="landscape"
                                />
                            </div>
                            <div className="col-md-6 mb-3">
                                <ImageUploadField
                                    label="Ảnh hero (tùy chọn)"
                                    name="heroImageUrl"
                                    file={formData.heroImageFile}
                                    imageUrl={formData.heroImageUrl}
                                    onFileChange={handleHeroFileChange}
                                    onUrlChange={handleImageInputChange}
                                    error={errors.heroImageUrl}
                                    description="Ảnh khổ lớn hiển thị ở đầu trang."
                                    helperText="Nếu không chọn, hệ thống sẽ dùng thumbnail."
                                    previewAspect="landscape"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <div className="card mb-4">
                    <div className="card-body">
                        <h5 className="card-title mb-4">Nội dung</h5>

                        <div className="row">
                            <div className="col-12 mb-4">
                                <CKEditor
                                    label="Nội dung tiếng Việt"
                                    icon="file-text"
                                    iconPrefix="feather"
                                    required
                                    name="contentVi"
                                    value={formData.contentVi}
                                    onChange={(data) => handleContentChange('contentVi', data)}
                                    placeholder="Nhập nội dung blog bằng tiếng Việt..."
                                    error={errors.contentVi}
                                />
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-12 mb-3">
                                <CKEditor
                                    label="Nội dung tiếng Anh (tùy chọn)"
                                    icon="file-text"
                                    iconPrefix="feather"
                                    name="contentEn"
                                    value={formData.contentEn}
                                    onChange={(data) => handleContentChange('contentEn', data)}
                                    placeholder="Nhập nội dung blog bằng tiếng Anh..."
                                    error={errors.contentEn}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="d-flex justify-content-end gap-2 mb-4">
                    <Button
                        variant="secondary"
                        size="md"
                        onClick={handleCancel}
                        disabled={isSubmitting}
                    >
                        Hủy
                    </Button>
                    <Button
                        variant="primary"
                        size="md"
                        type="submit"
                        disabled={isSubmitting}
                        icon={isSubmitting ? 'ti ti-loader' : 'ti ti-check'}
                    >
                        {isSubmitting ? 'Đang lưu...' : 'Lưu'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default EditBlog;
