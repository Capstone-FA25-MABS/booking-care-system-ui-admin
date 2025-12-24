import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import { toast } from 'react-toastify';

import Button from '@/components/Button';
import Input from '@/components/Input';
import { BlogCategoryService } from '@/services/blogCategory.service';
import { BlogCategoryDto, CategoryStatus, CreateBlogCategoryRequest } from '@/types/blog.types';
import { PATHS, buildPath } from '@/routes/paths';
import { selectCustomStyles } from '@/constants/select.styles';

type FormErrors = Partial<Record<keyof CreateBlogCategoryRequest, string>>;

interface ParentOption {
    value: string;
    label: string;
}

const AddBlogCategory: React.FC = () => {
    const navigate = useNavigate();

    const [categories, setCategories] = useState<BlogCategoryDto[]>([]);
    const [isLoadingParents, setIsLoadingParents] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState<CreateBlogCategoryRequest>({
        categoryName: '',
        description: '',
        imageUrl: '',
        status: CategoryStatus.Active,
        parentId: undefined,
    });
    const [errors, setErrors] = useState<FormErrors>({});

    // load parent categories
    useEffect(() => {
        const fetchCategories = async () => {
            setIsLoadingParents(true);
            try {
                const res = await BlogCategoryService.getCategories(true);
                if (res.success && res.data) {
                    setCategories(res.data);
                }
            } catch (err: any) {
                toast.error(err.message || 'Không thể tải danh mục blog');
            } finally {
                setIsLoadingParents(false);
            }
        };
        fetchCategories();
    }, []);

    const parentOptions: ParentOption[] = useMemo(
        () =>
            categories.map((cat) => ({
                value: cat.id,
                label: cat.categoryName,
            })),
        [categories]
    );

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ): void => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name as keyof CreateBlogCategoryRequest]) {
            setErrors((prev) => ({ ...prev, [name]: undefined }));
        }
    };

    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
        setFormData((prev) => ({ ...prev, status: e.target.value as CategoryStatus }));
    };

    const handleParentChange = (option: ParentOption | null) => {
        setFormData((prev) => ({ ...prev, parentId: option?.value }));
    };

    const validate = () => {
        const newErrors: FormErrors = {};
        if (!formData.categoryName?.trim()) {
            newErrors.categoryName = 'Vui lòng nhập tên danh mục';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) {
            toast.error('Vui lòng kiểm tra lại thông tin');
            return;
        }

        setIsSubmitting(true);
        try {
            const payload: CreateBlogCategoryRequest = {
                categoryName: formData.categoryName.trim(),
                description: formData.description?.trim() || undefined,
                imageUrl: formData.imageUrl?.trim() || undefined,
                status: formData.status || CategoryStatus.Active,
                parentId: formData.parentId || undefined,
            };

            const res = await BlogCategoryService.createCategory(payload);
            if (res.success) {
                toast.success('Tạo danh mục blog thành công');
                navigate(buildPath(PATHS.ADMIN.ROOT, PATHS.ADMIN.BLOG_CATEGORIES.ROOT));
            } else {
                toast.error(res.message || 'Không thể tạo danh mục blog');
            }
        } catch (err: any) {
            toast.error(err.message || 'Không thể tạo danh mục blog');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        navigate(buildPath(PATHS.ADMIN.ROOT, PATHS.ADMIN.BLOG_CATEGORIES.ROOT));
    };

    const selectedParent = parentOptions.find((opt) => opt.value === formData.parentId) || null;

    return (
        <div className="content">
            <div className="d-flex align-items-sm-center flex-sm-row flex-column gap-2 mb-3 pb-3 border-bottom">
                <div className="flex-grow-1">
                    <h4 className="fw-bold mb-0">Thêm danh mục blog</h4>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="card mb-4">
                    <div className="card-body">
                        <h5 className="card-title mb-4">Thông tin cơ bản</h5>

                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <Input
                                    label="Tên danh mục"
                                    name="categoryName"
                                    value={formData.categoryName}
                                    onChange={handleInputChange}
                                    required
                                    error={errors.categoryName}
                                    icon="folder"
                                    iconPrefix="feather"
                                />
                            </div>
                            <div className="col-md-6 mb-3">
                                <label htmlFor="status" className="form-label">
                                    <i className="feather-activity me-1"></i> Trạng thái
                                </label>
                                <select
                                    id="status"
                                    name="status"
                                    className="form-select"
                                    value={formData.status}
                                    onChange={handleStatusChange}
                                >
                                    <option value={CategoryStatus.Active}>Hoạt động</option>
                                    <option value={CategoryStatus.Inactive}>Không hoạt động</option>
                                </select>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label htmlFor="parentId" className="form-label">
                                    <i className="feather-folder me-1"></i> Danh mục cha (tùy chọn)
                                </label>
                                <Select
                                    inputId="parentId"
                                    options={parentOptions}
                                    value={selectedParent}
                                    onChange={(option) =>
                                        handleParentChange(option as ParentOption | null)
                                    }
                                    isClearable
                                    placeholder="Chọn danh mục cha..."
                                    isLoading={isLoadingParents}
                                    styles={selectCustomStyles}
                                />
                                <small className="text-muted d-block mt-1">
                                    Để trống nếu đây là danh mục gốc.
                                </small>
                            </div>
                            <div className="col-md-6 mb-3">
                                <Input
                                    label="Đường dẫn hình ảnh (URL)"
                                    name="imageUrl"
                                    value={formData.imageUrl || ''}
                                    onChange={handleInputChange}
                                    icon="image"
                                    iconPrefix="feather"
                                    placeholder="https://example.com/image.jpg"
                                />
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-12 mb-3">
                                <label htmlFor="description" className="form-label">
                                    <i className="feather-file-text me-1"></i> Mô tả (tùy chọn)
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    className="form-control"
                                    rows={3}
                                    value={formData.description || ''}
                                    onChange={handleInputChange}
                                    placeholder="Nhập mô tả cho danh mục..."
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="d-flex justify-content-end gap-2 mb-4">
                    <Button
                        variant="secondary"
                        size="md"
                        type="button"
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
                        {isSubmitting ? 'Đang lưu...' : 'Lưu danh mục'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default AddBlogCategory;
