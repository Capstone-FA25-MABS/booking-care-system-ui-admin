import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import Button from '@/components/Button';
import { BlogService } from '@/services/blog.service';
import { BlogCategoryService } from '@/services/blogCategory.service';
import {
    BlogDetailDto,
    CreateBlogRequest,
    UpdateBlogRequest,
    BlogStatus,
    BlogCategoryDto,
} from '@/types/blog.types';
import { PATHS, buildPath } from '@/routes/paths';
import { useAppSelector } from '@/store/hooks';
import { selectCurrentProfile } from '@/store/selectors/profile.selectors';
import BlogFormFields from '@/pages/admins/Blogs/components/BlogFormFields';

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
}

const AddBlog: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { id } = useParams<{ id?: string }>();
    const isEditMode = !!id;
    const currentProfile = useAppSelector(selectCurrentProfile);
    const [isSubmitting, setIsSubmitting] = useState(false);
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

    // Fetch blog data if in edit mode
    useEffect(() => {
        if (!isEditMode || !id) {
            return;
        }

        const fetchBlog = async () => {
            try {
                const response = await BlogService.getBlogById(id);
                const blog: BlogDetailDto = response.data;

                setFormData((prev) => ({
                    ...prev,
                    blogCategoryId: blog.category?.id || '',
                    titleVi: blog.titleVi || '',
                    contentVi: blog.contentVi || '',
                    titleEn: blog.titleEn || '',
                    contentEn: blog.contentEn || '',
                    thumbnailUrl: blog.thumbnailUrl || '',
                    heroImageUrl: blog.heroImageUrl || '',
                    tag: blog.tag || '',
                    source: blog.source || '',
                }));
            } catch (err: any) {
                toast.error(err.message || 'Không thể tải thông tin blog');
                navigate(blogListPath);
            }
        };

        fetchBlog();
    }, [blogListPath, id, isEditMode, navigate]);

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
    const updateFormField = (name: keyof BlogFormData, value: string | File | null) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: undefined }));
        }
    };

    // Handle select change
    const handleSelectChange = (name: keyof BlogFormData, value: string) => {
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
    const validateForm = (data: BlogFormData): boolean => {
        const newErrors: Partial<Record<keyof BlogFormData, string>> = {};

        if (!data.titleVi.trim()) {
            newErrors.titleVi = 'Vui lòng nhập tiêu đề tiếng Việt';
        }

        if (!data.contentVi.trim()) {
            newErrors.contentVi = 'Vui lòng nhập nội dung tiếng Việt';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle submit (create or update)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const isValid = validateForm(formData);
        if (!isValid) {
            toast.error('Vui lòng kiểm tra lại thông tin');
            return;
        }

        setIsSubmitting(true);

        try {
            const baseRequest: UpdateBlogRequest = {
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

            let response;
            if (isEditMode && id) {
                response = await BlogService.updateBlog(id, baseRequest, {
                    thumbnailFile: formData.thumbnailFile || undefined,
                    heroImageFile: formData.heroImageFile || undefined,
                });
            } else {
                const createRequest: CreateBlogRequest = {
                    ...baseRequest,
                    status: BlogStatus.Pending,
                    featured: false,
                    publishedAt: new Date().toISOString(),
                    // Ưu tiên truyền doctor/hospital ID thay vì accountId
                    createdByDoctorId: currentProfile?.doctorId || undefined,
                    createdByHospitalId: currentProfile?.hospitalId || undefined,
                };

                response = await BlogService.createBlog(createRequest, {
                    thumbnailFile: formData.thumbnailFile || undefined,
                    heroImageFile: formData.heroImageFile || undefined,
                });
            }

            if (response.success) {
                toast.success(isEditMode ? 'Cập nhật blog thành công!' : 'Tạo blog thành công!');
                navigate(blogListPath);
            } else {
                toast.error(
                    response.message ||
                        (isEditMode ? 'Không thể cập nhật blog' : 'Không thể tạo blog')
                );
            }
        } catch (err: any) {
            toast.error(
                err.message || (isEditMode ? 'Không thể cập nhật blog' : 'Không thể tạo blog')
            );
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

    return (
        <div className="content">
            <div className="d-flex align-items-sm-center flex-sm-row flex-column gap-2 mb-3 pb-3 border-bottom">
                <div className="flex-grow-1">
                    <h4 className="fw-bold mb-0">
                        {isEditMode ? 'Chỉnh sửa blog' : 'Thêm blog mới'}
                    </h4>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <BlogFormFields
                    formData={formData}
                    errors={errors}
                    categoryOptions={categoryOptions}
                    isLoadingCategories={isLoadingCategories}
                    onInputChange={handleInputChange}
                    onSelectChange={handleSelectChange}
                    onContentChange={handleContentChange}
                    onImageInputChange={handleImageInputChange}
                    onThumbnailFileChange={handleThumbnailFileChange}
                    onHeroFileChange={handleHeroFileChange}
                />

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

export default AddBlog;
