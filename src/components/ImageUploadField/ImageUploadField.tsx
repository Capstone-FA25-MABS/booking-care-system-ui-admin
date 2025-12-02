import React, { useEffect, useRef, useState } from 'react';
import Input from '@/components/Input';

interface ImageUploadFieldProps {
    label: string;
    name: string;
    file: File | null;
    imageUrl: string;
    onFileChange: (file: File | null) => void;
    onUrlChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    error?: string;
    description?: string;
    helperText?: string;
    accept?: string;
    required?: boolean;
    placeholder?: string;
    previewAspect?: 'square' | 'landscape';
}

/**
 * ImageUploadField component
 * Combines a native file input, preview block, and fallback URL input.
 */
const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
    label,
    name,
    file,
    imageUrl,
    onFileChange,
    onUrlChange,
    error,
    description,
    helperText,
    accept = 'image/*',
    required = false,
    placeholder = 'https://...',
    previewAspect = 'landscape',
}) => {
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [objectUrl, setObjectUrl] = useState<string>('');

    useEffect(() => {
        if (!file) {
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
                setObjectUrl('');
            }
            return;
        }

        const newUrl = URL.createObjectURL(file);
        setObjectUrl(newUrl);

        return () => {
            URL.revokeObjectURL(newUrl);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [file]);

    const previewSrc = file ? objectUrl : imageUrl;

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0] || null;
        onFileChange(selected);
    };

    const handleClearFile = () => {
        onFileChange(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const aspectPadding = previewAspect === 'square' ? '100%' : '56.25%'; // 16:9 default

    return (
        <div>
            <label className="form-label fw-semibold">
                {label}
                {required && <span className="text-danger ms-1">*</span>}
            </label>

            {description && <p className="text-muted small mb-2">{description}</p>}

            <input
                ref={fileInputRef}
                type="file"
                accept={accept}
                className={`form-control ${error ? 'is-invalid' : ''}`}
                onChange={handleFileInputChange}
                aria-label={`Chọn ${label}`}
            />

            <div className="d-flex align-items-center mt-2 gap-2">
                {file && (
                    <small className="text-muted">
                        <i className="feather-paperclip me-1" aria-hidden="true"></i>
                        {file.name}
                    </small>
                )}
                {file && (
                    <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary ms-auto"
                        onClick={handleClearFile}
                    >
                        Xóa ảnh đã chọn
                    </button>
                )}
            </div>

            {helperText && <small className="text-muted d-block mt-1">{helperText}</small>}

            {previewSrc && (
                <div className="mt-3">
                    <div
                        className="position-relative border rounded overflow-hidden"
                        style={{ paddingBottom: aspectPadding }}
                    >
                        <img
                            src={previewSrc}
                            alt={`${label} preview`}
                            className="position-absolute top-0 start-0 w-100 h-100"
                            style={{ objectFit: 'cover' }}
                        />
                    </div>
                </div>
            )}

            <div className="mt-3">
                <Input
                    label={`${label} - URL (tùy chọn)`}
                    name={name}
                    value={imageUrl}
                    onChange={onUrlChange}
                    placeholder={placeholder}
                    icon="link"
                    iconPrefix="feather"
                    error={error}
                />
            </div>
        </div>
    );
};

export default ImageUploadField;
