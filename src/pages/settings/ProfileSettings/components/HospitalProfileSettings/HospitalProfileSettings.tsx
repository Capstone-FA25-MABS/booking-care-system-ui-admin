import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { X } from 'lucide-react';
import Button from '@/components/Button';
import Input from '@/components/Input';
import CKEditor from '@/components/CKEditor';
import Spinner from '@/components/Spinner';
import CustomFileInput from '@/components/CustomFileInput';
import { AppDispatch, RootState } from '@/store';
import { updateHospitalProfile, setHospitalProfile } from '@/store/slices/userSlice';
import { UpdateHospitalRequest, HospitalProfile } from '@/types/user.types';
import { HospitalService } from '@/services/hospital.service';
import styles from './HospitalProfileSetting.module.scss';
import { prepareBioForSave, stripHtmlTags } from '@/utils/bioHtmlProcessor';
import AvatarUpload from '@/components/AvatarUpload';
import { useDragAndDropFileUpload } from '@/hooks/useDragAndDropFileUpload';

// Hospital Images Section Component
const HospitalImagesSection: React.FC<{
    images: Array<{ id: string; imageUrl: string }>;
    newImages: File[];
    onAddImages: (files: File[]) => void;
    onRemoveImage: (id: string) => void;
}> = ({ images, newImages, onAddImages, onRemoveImage }) => {
    return (
        <div className="card mb-4">
            <div className={`card-body ${styles.sectionBorder}`}>
                <h5 className="card-title mb-4">Ảnh của bệnh viện</h5>
                <div className="row">
                    <div className="col-12">
                        {/* Upload Area using CustomFileInput */}
                        <CustomFileInput
                            files={newImages}
                            onChange={onAddImages}
                            accept="image/*"
                            multiple={true}
                            maxSize={5}
                            id="hospitalImages"
                        />

                        {/* Existing Images */}
                        {images?.length > 0 && (
                            <div className="row mb-3 mt-4">
                                {images.map((image) => (
                                    <div key={image.id} className="col-md-3 mb-3">
                                        <div className="position-relative">
                                            <img
                                                src={image.imageUrl}
                                                alt="Bệnh viện"
                                                className="img-fluid rounded"
                                                style={{
                                                    width: '100%',
                                                    height: '200px',
                                                    objectFit: 'cover',
                                                }}
                                            />
                                            <button
                                                type="button"
                                                className="btn btn-danger btn-sm position-absolute top-0 end-0 m-2 d-flex align-items-center justify-content-center"
                                                onClick={() => onRemoveImage(image.id)}
                                                style={{
                                                    zIndex: 10,
                                                    width: '32px',
                                                    height: '32px',
                                                    padding: 0,
                                                }}
                                                aria-label="Xóa ảnh"
                                                title="Xóa ảnh"
                                            >
                                                <X size={18} aria-hidden="true" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Note: New images preview is handled by CustomFileInput component */}

                        {!images?.length && newImages.length === 0 && (
                            <p className="text-muted text-center mt-3">
                                Chưa có ảnh nào. Hãy thêm ảnh để hiển thị.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Background Image Section Component
const BackgroundImageSection: React.FC<{
    backgroundUrl: string;
    backgroundFile: File | null;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ backgroundUrl, backgroundFile, onFileChange }) => {
    const {
        isDragOver,
        isUploading,
        handleDragOver,
        handleDragLeave,
        handleDrop,
        handleFileChange,
        createObjectUrl,
    } = useDragAndDropFileUpload(onFileChange, 'image/*');

    const getBackgroundSrc = (): string => {
        if (backgroundFile) {
            return createObjectUrl(backgroundFile);
        }
        return backgroundUrl || '';
    };

    const renderBackgroundContent = (): React.ReactNode => {
        if (isUploading) {
            return (
                <div className="d-flex flex-column align-items-center justify-content-center h-100">
                    <div className={`spinner-border text-primary ${styles.uploadSpinner}`}>
                        <span className="visually-hidden">Uploading...</span>
                    </div>
                    <small className="text-primary mt-2">Đang tải...</small>
                </div>
            );
        }

        const src = getBackgroundSrc();
        if (src) {
            return <img src={src} alt="Nền bệnh viện" className={styles.backgroundImage} />;
        }

        return (
            <div className="d-flex flex-column align-items-center justify-content-center h-100">
                <i className="feather-image fs-1 text-muted mb-2"></i>
                <small className="text-muted">Chọn ảnh nền</small>
            </div>
        );
    };

    return (
        <div className="card mb-4">
            <div className={`card-body ${styles.sectionBorder}`}>
                <h5 className="card-title mb-4">Ảnh nền</h5>
                <div className="row">
                    <div className="col-12">
                        <div className="position-relative">
                            <div
                                role="region"
                                aria-label="Khu vực kéo thả ảnh nền"
                                className={`bg-light ${styles.backgroundContainer} ${isDragOver ? styles.dragOver : ''}`}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                            >
                                {renderBackgroundContent()}

                                <div
                                    className={`${styles.backgroundUploadOverlay} ${isDragOver ? styles.overlayVisible : ''}`}
                                    aria-hidden="true"
                                >
                                    <div className="d-flex flex-column align-items-center">
                                        <i
                                            className="feather-upload fs-2 text-white mb-2"
                                            aria-hidden="true"
                                        ></i>
                                        <small className="text-white">Thả ảnh vào đây</small>
                                    </div>
                                </div>
                            </div>

                            <input
                                type="file"
                                accept="image/*"
                                name="background"
                                id="backgroundImage"
                                onChange={handleFileChange}
                                className="d-none"
                            />
                            <label
                                htmlFor="backgroundImage"
                                className={`position-absolute top-0 start-0 w-100 h-100 ${styles.backgroundUploadLabel}`}
                                aria-label="Kéo thả hoặc nhấp để chọn ảnh nền"
                            ></label>
                        </div>
                        <div className="mt-3">
                            <p className="mb-1 fw-semibold text-dark">Ảnh nền</p>
                            <small className="text-muted">
                                {isDragOver
                                    ? 'Thả ảnh vào đây'
                                    : 'Kéo thả hoặc nhấp để chọn ảnh nền'}
                            </small>
                            <div className="mt-2">
                                <small className="text-muted">
                                    <i className="feather-info me-1"></i> JPG, PNG, GIF (tối đa 5MB)
                                </small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Basic Info Fields Component
const BasicInfoFields: React.FC<{
    formData: UpdateHospitalRequest;
    errors: Partial<Record<keyof UpdateHospitalRequest, string>>;
    onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    isEdit?: boolean;
}> = ({ formData, errors, onInputChange, isEdit = false }) => (
    <div className="col-md-9">
        <div className="row">
            <Input
                wrapperClassName="col-md-6 mb-3"
                label="Tên bệnh viện"
                icon="building"
                iconPrefix="feather"
                required
                name="name"
                value={formData.name || ''}
                onChange={onInputChange}
                placeholder="Nhập tên bệnh viện"
                error={errors.name}
            />
            <Input
                wrapperClassName="col-md-6 mb-3"
                label="Email"
                icon="mail"
                iconPrefix="feather"
                required
                type="email"
                name="email"
                value={formData.email || ''}
                onChange={onInputChange}
                placeholder="Nhập email"
                error={errors.email}
                disabled={isEdit}
                readOnly={isEdit}
            />
            <Input
                wrapperClassName="col-md-6 mb-3"
                label="Số điện thoại"
                icon="phone"
                iconPrefix="feather"
                type="tel"
                name="phone"
                value={formData.phone || ''}
                onChange={onInputChange}
                placeholder="Nhập số điện thoại"
                error={errors.phone}
                disabled={isEdit}
                readOnly={isEdit}
            />
            <Input
                wrapperClassName="col-md-6 mb-3"
                label="Địa chỉ"
                icon="map-pin"
                iconPrefix="feather"
                name="address"
                value={formData.address || ''}
                onChange={onInputChange}
                placeholder="Nhập địa chỉ"
                error={errors.address}
            />
        </div>
    </div>
);

const HospitalProfileSettings: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { hospitalProfile, isLoading } = useSelector((state: RootState) => state.user);

    const [formData, setFormData] = useState<UpdateHospitalRequest>({
        name: '',
        email: '',
        phone: '',
        address: '',
        description: '',
        avatarUrl: '',
        backgroundUrl: '',
    });

    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [backgroundFile, setBackgroundFile] = useState<File | null>(null);
    const [hospitalImages, setHospitalImages] = useState<
        Array<{ id: string; imageUrl: string; description?: string }>
    >([]);
    const [newHospitalImages, setNewHospitalImages] = useState<File[]>([]);
    const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
    const [errors, setErrors] = useState<Partial<Record<keyof UpdateHospitalRequest, string>>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Load hospital profile
    useEffect(() => {
        loadHospitalProfile();
    }, []);

    // Update form when profile loaded
    useEffect(() => {
        if (hospitalProfile) {
            setFormData({
                name: hospitalProfile.name || '',
                email: hospitalProfile.email || '',
                phone: hospitalProfile.phone || '',
                address: hospitalProfile.address || '',
                description: hospitalProfile.description || '',
                avatarUrl: hospitalProfile.avatarUrl || '',
                backgroundUrl: hospitalProfile.backgroundUrl || '',
            });
            setHospitalImages(hospitalProfile.images || []);
        }
    }, [hospitalProfile]);

    const loadHospitalProfile = async () => {
        try {
            const response = await HospitalService.getHospitalProfilesByAccountId();
            if (response.data?.length > 0) {
                dispatch({ type: 'user/setHospitalProfile', payload: response.data[0] });
            }
        } catch (error: any) {
            toast.error(error.message || 'Không thể tải thông tin bệnh viện');
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        // Clear error when user starts typing
        if (errors[name as keyof UpdateHospitalRequest]) {
            setErrors((prev) => ({
                ...prev,
                [name]: undefined,
            }));
        }
    };

    const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setAvatarFile(e.target.files[0]);
        }
    };

    const handleBackgroundFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setBackgroundFile(e.target.files[0]);
        }
    };

    const handleAddHospitalImages = (files: File[]) => {
        // CustomFileInput's onChange passes the entire updated files array
        // So we should replace the previous array instead of appending
        setNewHospitalImages(files);
    };

    const handleRemoveHospitalImage = (id: string) => {
        setHospitalImages((prev) => prev.filter((img) => img.id !== id));
        setImagesToDelete((prev) => [...prev, id]);
    };

    // Validate form data
    const validateForm = (): Partial<Record<keyof UpdateHospitalRequest, string>> | null => {
        const newErrors: Partial<Record<keyof UpdateHospitalRequest, string>> = {};

        if (!formData.name?.trim()) {
            newErrors.name = 'Tên bệnh viện là bắt buộc! Vui lòng nhập tên bệnh viện';
        }
        if (!formData.address?.trim()) {
            newErrors.address = 'Địa chỉ là bắt buộc! Vui lòng nhập địa chỉ';
        }

        const descriptionText = formData.description ? stripHtmlTags(formData.description) : '';
        if (!descriptionText) {
            newErrors.description = 'Mô tả là bắt buộc! Vui lòng nhập mô tả';
        }

        return Object.keys(newErrors).length > 0 ? newErrors : null;
    };

    // Delete hospital images
    const deleteHospitalImages = async (hospitalId: string): Promise<void> => {
        if (imagesToDelete.length === 0) return;

        for (const imageId of imagesToDelete) {
            try {
                await HospitalService.deleteHospitalImage(hospitalId, imageId);
            } catch (error: any) {
                console.error(`Failed to delete image ${imageId}:`, error);
            }
        }
    };

    // Upload new hospital images
    const uploadNewHospitalImages = async (
        hospitalId: string
    ): Promise<Array<{ id: string; imageUrl: string }>> => {
        if (newHospitalImages.length === 0) return [];

        try {
            const uploadResponse = await HospitalService.uploadHospitalImages(
                hospitalId,
                newHospitalImages
            );
            if (uploadResponse.data?.Images) {
                const uploadedImages = uploadResponse.data.Images;
                setHospitalImages((prev) => [...prev, ...uploadedImages]);
                setNewHospitalImages([]);
                return uploadedImages;
            }
        } catch (error: any) {
            console.error('Failed to upload hospital images:', error);
            toast.warning('Một số ảnh không thể upload. Vui lòng thử lại.');
        }
        return [];
    };

    // Update hospital profile with files
    const updateProfileWithFiles = async (hospitalId: string): Promise<HospitalProfile | null> => {
        if (avatarFile && backgroundFile) {
            const response = await HospitalService.updateHospitalProfileWithFiles(
                hospitalId,
                formData,
                avatarFile,
                backgroundFile
            );
            setAvatarFile(null);
            setBackgroundFile(null);
            return response.data;
        }

        if (avatarFile) {
            const response = await HospitalService.updateHospitalProfileWithAvatar(
                hospitalId,
                formData,
                avatarFile
            );
            setAvatarFile(null);
            return response.data;
        }

        if (backgroundFile) {
            const response = await HospitalService.updateHospitalProfileWithBackground(
                hospitalId,
                formData,
                backgroundFile
            );
            setBackgroundFile(null);
            return response.data;
        }

        return await dispatch(
            updateHospitalProfile({
                hospitalId,
                updateData: formData,
            })
        ).unwrap();
    };

    // Update Redux store with final profile data
    const updateReduxProfile = (
        updatedProfile: HospitalProfile | null,
        uploadedImages: Array<{ id: string; imageUrl: string }>
    ): void => {
        if (!updatedProfile) {
            loadHospitalProfile();
            return;
        }

        const finalProfile = {
            ...updatedProfile,
            images:
                uploadedImages.length > 0 || imagesToDelete.length > 0
                    ? hospitalImages
                          .filter((img) => !imagesToDelete.includes(img.id))
                          .concat(uploadedImages)
                    : updatedProfile?.images,
        };
        dispatch(setHospitalProfile(finalProfile));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!hospitalProfile?.id) {
            toast.error('Không tìm thấy thông tin bệnh viện');
            return;
        }

        const validationErrors = validateForm();
        if (validationErrors) {
            setErrors(validationErrors);
            return;
        }

        setIsSubmitting(true);
        try {
            await deleteHospitalImages(hospitalProfile.id);
            const uploadedImages = await uploadNewHospitalImages(hospitalProfile.id);
            const updatedProfile = await updateProfileWithFiles(hospitalProfile.id);
            updateReduxProfile(updatedProfile, uploadedImages);

            toast.success('Cập nhật thông tin bệnh viện thành công!');
            setImagesToDelete([]);
            setNewHospitalImages([]);
        } catch (error: any) {
            toast.error(error.message || 'Không thể cập nhật thông tin bệnh viện');
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderSubmitButtonText = (): React.ReactNode => {
        if (isSubmitting) {
            return (
                <>
                    <Spinner size="small" variant="primary" className="me-2" />
                    Đang cập nhật...
                </>
            );
        }
        return 'Cập nhật bệnh viện';
    };

    if (isLoading) {
        return (
            <div
                className="d-flex justify-content-center align-items-center"
                style={{ minHeight: '400px' }}
            >
                <Spinner size="large" variant="primary" />
            </div>
        );
    }

    return (
        <>
            <div className="card-header border-bottom px-0 mx-3">
                <h5 className="fw-bold">Thông tin bệnh viện</h5>
            </div>
            <div className="card-body px-0 mx-3">
                <form onSubmit={handleSubmit}>
                    <div className="card mb-4">
                        <div className={`card-body ${styles.sectionBorder}`}>
                            <h5 className="card-title mb-4">Thông tin cơ bản</h5>
                            <div className="row">
                                <AvatarUpload
                                    avatarUrl={formData.avatarUrl || ''}
                                    avatarFile={avatarFile}
                                    onFileChange={handleAvatarFileChange}
                                    iconClassName="feather-building"
                                    label="Ảnh đại diện"
                                    placeholderText="Kéo thả hoặc nhấp để chọn ảnh"
                                />
                                <BasicInfoFields
                                    formData={formData}
                                    errors={errors}
                                    onInputChange={handleInputChange}
                                    isEdit={true}
                                />
                            </div>
                            <div className="row">
                                <div className="col-12">
                                    <CKEditor
                                        wrapperClassName="mb-3"
                                        label="Mô tả"
                                        icon="file-text"
                                        iconPrefix="feather"
                                        required
                                        name="description"
                                        value={formData.description || ''}
                                        onChange={(data) => {
                                            const processedHtml = prepareBioForSave(data);
                                            handleInputChange({
                                                target: {
                                                    name: 'description',
                                                    value: processedHtml,
                                                },
                                            } as React.ChangeEvent<HTMLTextAreaElement>);
                                        }}
                                        placeholder="Mô tả về bệnh viện"
                                        error={errors.description}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Background Image Section */}
                    <BackgroundImageSection
                        backgroundUrl={formData.backgroundUrl || ''}
                        backgroundFile={backgroundFile}
                        onFileChange={handleBackgroundFileChange}
                    />

                    {/* Hospital Images Section */}
                    <HospitalImagesSection
                        images={hospitalImages}
                        newImages={newHospitalImages}
                        onAddImages={handleAddHospitalImages}
                        onRemoveImage={handleRemoveHospitalImage}
                    />

                    <div className="card mb-4">
                        <div className={`card-body ${styles.sectionBorder}`}>
                            <div className="text-end">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="md"
                                    className="btn btn-light btn-md me-2"
                                    onClick={() => {
                                        // Navigate back or reset form
                                        if (hospitalProfile) {
                                            setFormData({
                                                name: hospitalProfile.name || '',
                                                email: hospitalProfile.email || '',
                                                phone: hospitalProfile.phone || '',
                                                address: hospitalProfile.address || '',
                                                description: hospitalProfile.description || '',
                                                avatarUrl: hospitalProfile.avatarUrl || '',
                                                backgroundUrl: hospitalProfile.backgroundUrl || '',
                                            });
                                            setAvatarFile(null);
                                            setBackgroundFile(null);
                                            setErrors({});
                                        }
                                    }}
                                    disabled={isSubmitting}
                                >
                                    Hủy
                                </Button>
                                <Button type="submit" variant="primary" disabled={isSubmitting}>
                                    {renderSubmitButtonText()}
                                </Button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
};

export default HospitalProfileSettings;
