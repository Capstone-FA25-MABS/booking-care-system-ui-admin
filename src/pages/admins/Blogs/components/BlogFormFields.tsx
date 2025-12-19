import React from 'react';
import Select from 'react-select';
import Input from '@/components/Input';
import CKEditor from '@/components/CKEditor';
import ImageUploadField from '@/components/ImageUploadField';
import { selectCustomStyles } from '@/constants/select.styles';

export interface BlogFormBase {
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

interface BlogFormFieldsProps {
    formData: BlogFormBase;
    errors: Partial<Record<keyof BlogFormBase, string>>;
    categoryOptions: { value: string | number; label: string }[];
    isLoadingCategories: boolean;
    onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    onSelectChange: (name: keyof BlogFormBase, value: string) => void;
    onContentChange: (name: 'contentVi' | 'contentEn', value: string) => void;
    onImageInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onThumbnailFileChange: (file: File | null) => void;
    onHeroFileChange: (file: File | null) => void;
}

const BlogFormFields: React.FC<BlogFormFieldsProps> = ({
    formData,
    errors,
    categoryOptions,
    isLoadingCategories,
    onInputChange,
    onSelectChange,
    onContentChange,
    onImageInputChange,
    onThumbnailFileChange,
    onHeroFileChange,
}) => {
    return (
        <>
            {/* Basic Info */}
            <div className="card mb-4">
                <div className="card-body">
                    <h5 className="card-title mb-4">Thông tin cơ bản</h5>

                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <Input
                                label="Tiêu đề tiếng Việt"
                                name="titleVi"
                                value={formData.titleVi}
                                onChange={onInputChange}
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
                                onChange={onInputChange}
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
                                    onSelectChange(
                                        'blogCategoryId',
                                        option?.value?.toString() || ''
                                    )
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
                                onChange={onInputChange}
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
                                onChange={onInputChange}
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
                                onFileChange={onThumbnailFileChange}
                                onUrlChange={onImageInputChange}
                                error={errors.thumbnailUrl}
                                description="Hiển thị trong danh sách blog và các khu vực liên quan."
                                helperText="Tối đa 5MB, định dạng JPG/PNG/GIF/WEBP."
                                previewAspect="landscape"
                            />
                        </div>
                        <div className="col-md-6 mb-3">
                            <ImageUploadField
                                label="Ảnh hero (tùy chọn)"
                                name="heroImageUrl"
                                file={formData.heroImageFile}
                                imageUrl={formData.heroImageUrl}
                                onFileChange={onHeroFileChange}
                                onUrlChange={onImageInputChange}
                                error={errors.heroImageUrl}
                                description="Ảnh lớn hiển thị ở đầu trang chi tiết blog."
                                helperText="Nếu bỏ trống, hệ thống sẽ sử dụng ảnh thumbnail."
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
                                onChange={(data) => onContentChange('contentVi', data)}
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
                                onChange={(data) => onContentChange('contentEn', data)}
                                placeholder="Nhập nội dung blog bằng tiếng Anh..."
                                error={errors.contentEn}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default BlogFormFields;
