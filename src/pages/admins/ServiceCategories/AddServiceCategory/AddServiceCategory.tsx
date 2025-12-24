import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import Select from 'react-select';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { ServiceCategory, ServiceCategoryFormData } from '@/types/serviceCategory.types';
import {
    createServiceCategory,
    updateServiceCategory,
    createServiceCategoryWithImage,
    updateServiceCategoryWithImage,
    getServiceCategoryById,
    getAllServiceCategories,
} from '@/services/serviceCategory.service';
import { PATHS, buildPath } from '@/routes/paths';
import { selectCustomStyles } from '@/constants/select.styles';

type FormErrors = Partial<Record<keyof ServiceCategoryFormData, string>>;

interface ParentOption {
    value: string;
    label: string;
}

const AddServiceCategory: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const isEditMode = !!id;
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(isEditMode);
    const [isLoadingParents, setIsLoadingParents] = useState(false);
    const [categories, setCategories] = useState<ServiceCategory[]>([]);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreviewUrl, setImagePreviewUrl] = useState<string>('');

    const [formData, setFormData] = useState<ServiceCategoryFormData>({
        name: '',
        description: '',
        imageUrl: '',
        status: 'ACTIVE',
        parentId: null,
    });

    const [errors, setErrors] = useState<FormErrors>({});

    // Fetch service category data if in edit mode
    useEffect(() => {
        const fetchServiceCategory = async () => {
            if (!id) return;

            setIsLoading(true);
            try {
                console.debug(
                    '[AddServiceCategory] Fetching service category with id:',
                    id,
                    'currentPath:',
                    window.location.href
                );
                const response = await getServiceCategoryById(id);
                if (response.success && response.data) {
                    const category = response.data;
                    setFormData({
                        name: category.name,
                        description: category.description || '',
                        imageUrl: category.imageUrl || '',
                        status: category.status,
                        parentId: category.parentId || null,
                    });
                    setImagePreviewUrl(category.imageUrl || '');
                } else {
                    toast.error('Không tìm thấy danh mục dịch vụ');
                    navigate(buildPath(PATHS.ADMIN.ROOT, PATHS.ADMIN.SERVICE_CATEGORIES.ROOT));
                }
            } catch (err: any) {
                toast.error(err.message || 'Không thể tải thông tin danh mục dịch vụ');
                navigate(buildPath(PATHS.ADMIN.ROOT, PATHS.ADMIN.SERVICE_CATEGORIES.ROOT));
            } finally {
                setIsLoading(false);
            }
        };

        fetchServiceCategory();
    }, [id, navigate]);

    // Fetch all categories for parent selection
    useEffect(() => {
        const fetchCategories = async () => {
            setIsLoadingParents(true);
            try {
                const response = await getAllServiceCategories('Name', 'asc');
                if (response.success && response.data) {
                    // Filter out current category if editing (to prevent self-parent)
                    const filteredCategories =
                        isEditMode && id
                            ? response.data.filter((cat) => cat.id !== id)
                            : response.data;
                    setCategories(filteredCategories);
                }
            } catch (err: any) {
                toast.error(err.message || 'Không thể tải danh sách danh mục dịch vụ');
            } finally {
                setIsLoadingParents(false);
            }
        };

        fetchCategories();
    }, [isEditMode, id]);

    const parentOptions: ParentOption[] = useMemo(() => {
        const parents = categories.filter((cat) => !cat.parentId);
        return parents.map((cat) => ({
            value: cat.id,
            label: cat.name,
        }));
    }, [categories]);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ): void => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name as keyof ServiceCategoryFormData]) {
            setErrors((prev) => ({ ...prev, [name]: undefined }));
        }
    };

    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
        const { value } = e.target;
        setFormData((prev) => ({ ...prev, status: value as 'ACTIVE' | 'INACTIVE' }));
        if (errors.status) {
            setErrors((prev) => ({ ...prev, status: undefined }));
        }
    };

    const handleParentChange = (option: ParentOption | null): void => {
        setFormData((prev) => ({ ...prev, parentId: option ? option.value : null }));
    };

    const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) {
            setImageFile(null);
            setImagePreviewUrl(formData.imageUrl || '');
            return;
        }

        const fileSizeMB = file.size / (1024 * 1024);
        if (fileSizeMB > 5) {
            toast.error('Kích thước ảnh tối đa 5MB');
            return;
        }

        setImageFile(file);
        setImagePreviewUrl(URL.createObjectURL(file));
        setFormData((prev) => ({ ...prev, imageUrl: '' }));
    };

    const handleClearImageFile = () => {
        setImageFile(null);
        setImagePreviewUrl(formData.imageUrl || '');
    };

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.name || formData.name.trim().length === 0) {
            newErrors.name = 'Vui lòng nhập tên danh mục dịch vụ';
        }

        if (!formData.status) {
            newErrors.status = 'Vui lòng chọn trạng thái';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const buildPayload = (): ServiceCategoryFormData => ({
        name: formData.name.trim(),
        description: formData.description?.trim() || '',
        imageUrl: imageFile ? '' : formData.imageUrl.trim(),
        status: formData.status,
        parentId: formData.parentId || null,
    });

    const getSubmitMessages = () => {
        if (isEditMode) {
            return {
                success: 'Cập nhật danh mục dịch vụ thành công!',
                failure: 'Không thể cập nhật danh mục dịch vụ',
            };
        }

        return {
            success: 'Tạo danh mục dịch vụ thành công!',
            failure: 'Không thể tạo danh mục dịch vụ',
        };
    };

    const submitCategory = async (payload: ServiceCategoryFormData) => {
        if (isEditMode && id) {
            return imageFile
                ? await updateServiceCategoryWithImage(id, payload, imageFile)
                : await updateServiceCategory(id, payload);
        }

        return imageFile
            ? await createServiceCategoryWithImage(payload, imageFile)
            : await createServiceCategory(payload);
    };

    const getErrorMessage = (err: unknown, fallback: string) => {
        if (err instanceof Error && err.message) return err.message;
        return fallback;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error('Vui lòng kiểm tra lại thông tin danh mục dịch vụ');
            return;
        }

        setIsSubmitting(true);

        try {
            const payload = buildPayload();
            const messages = getSubmitMessages();

            const response = await submitCategory(payload);

            if (!response.success) {
                toast.error(response.message || messages.failure);
                return;
            }

            toast.success(messages.success);
            navigate(buildPath(PATHS.ADMIN.ROOT, PATHS.ADMIN.SERVICE_CATEGORIES.ROOT));
        } catch (err: unknown) {
            const messages = getSubmitMessages();
            toast.error(getErrorMessage(err, messages.failure));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        navigate(buildPath(PATHS.ADMIN.ROOT, PATHS.ADMIN.SERVICE_CATEGORIES.ROOT));
    };

    const selectedParentOption =
        parentOptions.find((opt) => opt.value === formData.parentId) || null;

    const getSubmitButtonText = () => {
        if (isSubmitting) return 'Đang lưu...';
        return isEditMode ? 'Cập nhật danh mục' : 'Lưu danh mục';
    };

    if (isLoading) {
        return (
            <div className="content">
                <div className="text-center py-5">
                    <div className="spinner-border">
                        <output className="visually-hidden">Loading...</output>
                    </div>
                    <p className="mt-3">Đang tải thông tin danh mục dịch vụ...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="content">
            <div className="d-flex align-items-sm-center flex-sm-row flex-column gap-2 mb-3 pb-3 border-bottom">
                <div className="flex-grow-1">
                    <h4 className="fw-bold mb-0">
                        {isEditMode ? 'Chỉnh Sửa Danh Mục Dịch Vụ' : 'Thêm Danh Mục Dịch Vụ Mới'}
                    </h4>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="card mb-4">
                    <div className="card-body">
                        <h5 className="card-title mb-4">Thông tin cơ bản</h5>

                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <Input
                                    label="Tên danh mục dịch vụ"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                    error={errors.name}
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
                                    className={`form-select ${errors.status ? 'is-invalid' : ''}`}
                                    value={formData.status}
                                    onChange={handleStatusChange}
                                >
                                    <option value="ACTIVE">Hoạt động</option>
                                    <option value="INACTIVE">Không hoạt động</option>
                                </select>
                                {errors.status && (
                                    <div className="invalid-feedback d-block">{errors.status}</div>
                                )}
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
                                    value={selectedParentOption}
                                    onChange={(option) =>
                                        handleParentChange(option as ParentOption | null)
                                    }
                                    isClearable
                                    placeholder="Chọn danh mục cha (nếu có)..."
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
                                    value={formData.imageUrl}
                                    onChange={handleInputChange}
                                    icon="image"
                                    iconPrefix="feather"
                                    placeholder="https://example.com/image.jpg"
                                />
                                <small className="text-muted d-block mt-1">
                                    Có thể để trống, hệ thống sẽ hiển thị biểu tượng mặc định.
                                </small>
                                <div className="mt-2">
                                    <label
                                        className="form-label"
                                        htmlFor="serviceCategoryImageFile"
                                    >
                                        <i className="feather-upload-cloud me-1"></i> Hoặc tải ảnh
                                        lên (tối đa 5MB)
                                    </label>
                                    <input
                                        id="serviceCategoryImageFile"
                                        type="file"
                                        accept="image/*"
                                        className="form-control"
                                        onChange={handleImageFileChange}
                                    />
                                    {imageFile && (
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-outline-secondary mt-2"
                                            onClick={handleClearImageFile}
                                        >
                                            Xóa ảnh vừa chọn
                                        </button>
                                    )}
                                    {imagePreviewUrl && (
                                        <div className="mt-3">
                                            <span className="d-block mb-1 text-muted">
                                                Xem trước ảnh:
                                            </span>
                                            <img
                                                src={imagePreviewUrl}
                                                alt="Preview"
                                                className="img-thumbnail"
                                                style={{ maxHeight: 180 }}
                                            />
                                        </div>
                                    )}
                                </div>
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
                                    placeholder="Nhập mô tả ngắn cho danh mục dịch vụ..."
                                />
                                {errors.description && (
                                    <div className="invalid-feedback d-block">
                                        {errors.description}
                                    </div>
                                )}
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
                        {getSubmitButtonText()}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default AddServiceCategory;
