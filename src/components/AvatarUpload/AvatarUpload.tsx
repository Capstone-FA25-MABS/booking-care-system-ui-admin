import React from 'react';
import badgeCheck from '@/assets/img/icons/badge-check.svg';
import styles from './AvatarUpload.module.scss';
import { useDragAndDropFileUpload } from '@/hooks/useDragAndDropFileUpload';

interface AvatarUploadProps {
    avatar?: File | string | null;
    avatarUrl?: string;
    avatarFile?: File | null;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    iconClassName?: string;
    label?: string;
    placeholderText?: string;
    accept?: string;
    name?: string;
    id?: string;
    className?: string;
    badgeIconSrc?: string;
    showBadge?: boolean;
}

/**
 * Avatar Upload Component with drag & drop support
 * Supports both File | string | null (for Doctor) and separate avatarUrl/avatarFile (for Hospital)
 */
const AvatarUpload: React.FC<AvatarUploadProps> = ({
    avatar,
    avatarUrl,
    avatarFile,
    onFileChange,
    iconClassName = 'feather-user',
    label = 'Ảnh đại diện',
    placeholderText = 'Kéo thả hoặc nhấp để chọn ảnh',
    accept = 'image/*',
    name = 'avatar',
    id = 'profileImage',
    className = '',
    badgeIconSrc = badgeCheck,
    showBadge = true,
}) => {
    const {
        isDragOver,
        isUploading,
        handleDragOver,
        handleDragLeave,
        handleDrop,
        handleFileChange,
        createObjectUrl,
    } = useDragAndDropFileUpload(onFileChange, accept, name);

    // Support both patterns: avatar (File | string | null) or avatarUrl/avatarFile
    const getAvatarSrc = (): string => {
        if (avatar !== undefined && avatar !== null) {
            if (typeof avatar === 'string') {
                return avatar;
            }
            if (avatar instanceof File) {
                return createObjectUrl(avatar);
            }
        }

        // Fallback to avatarUrl/avatarFile pattern
        if (avatarFile) {
            return createObjectUrl(avatarFile);
        }
        if (avatarUrl) {
            return avatarUrl;
        }

        return '';
    };

    const renderAvatarContent = (): React.ReactNode => {
        if (isUploading) {
            return (
                <output className="d-flex flex-column align-items-center">
                    <div className={`spinner-border text-primary ${styles.uploadSpinner}`}>
                        <span className="visually-hidden">Uploading...</span>
                    </div>
                    <small className="text-primary mt-2">Đang tải...</small>
                </output>
            );
        }

        const src = getAvatarSrc();
        if (src) {
            return <img src={src} alt="Profile" className={styles.avatarImage} />;
        }

        return (
            <div className="d-flex flex-column align-items-center">
                <i className={`${iconClassName} fs-1 text-muted mb-2`}></i>
                <small className="text-muted">Chọn ảnh</small>
            </div>
        );
    };

    return (
        <div className={`col-md-3 mb-4 ${className}`}>
            <div className="text-center">
                <div className="position-relative d-inline-block">
                    <div
                        className={`bg-light rounded-circle d-flex align-items-center justify-content-center ${styles.avatarContainer} ${isDragOver ? styles.dragOver : ''}`}
                        style={{ width: '140px', height: '140px' }}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        {renderAvatarContent()}

                        {/* Upload overlay */}
                        <div
                            className={`${styles.uploadOverlay} ${isDragOver ? styles.overlayVisible : ''}`}
                        >
                            <div className="d-flex flex-column align-items-center">
                                <i className="feather-upload fs-2 text-white mb-2"></i>
                                <small className="text-white">Thả ảnh vào đây</small>
                            </div>
                        </div>
                    </div>

                    {/* Badge Check Icon */}
                    {showBadge && (
                        <div
                            className={`${styles.badgeIcon} ${isUploading ? styles.badgeIconDisabled : ''}`}
                        >
                            <img
                                src={badgeIconSrc}
                                alt="Verified Badge"
                                className={styles.badgeIconImage}
                            />
                        </div>
                    )}

                    <input
                        type="file"
                        accept={accept}
                        name={name}
                        id={id}
                        onChange={handleFileChange}
                        className="d-none"
                    />
                    <label
                        htmlFor={id}
                        className={`position-absolute top-0 start-0 w-100 h-100 ${styles.uploadLabel}`}
                        aria-label={placeholderText}
                    ></label>
                </div>

                <div className="mt-3">
                    <p className="mb-1 fw-semibold text-dark">{label}</p>
                    <small className="text-muted">
                        {isDragOver ? 'Thả ảnh vào đây' : placeholderText}
                    </small>
                    <div className="mt-2">
                        <small className="text-muted">
                            <i className="feather-info me-1"></i> JPG, PNG, GIF (tối đa 5MB)
                        </small>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AvatarUpload;
