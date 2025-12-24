import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';

interface UseImageUploadProps {
    onImageChange?: (imageUrl: string, imageFile: File | null) => void;
    onValidationError?: (field: string) => void;
    maxSize?: number; // in bytes, default 5MB
}

interface UseImageUploadReturn {
    imagePreview: string;
    imageFile: File | null;
    setImagePreview: (preview: string) => void;
    setImageFile: (file: File | null) => void;
    handleImageFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleRemoveImage: () => void;
    resetImage: () => void;
}

export const useImageUpload = ({
    onImageChange,
    onValidationError,
    maxSize = 5 * 1024 * 1024, // 5MB default
}: UseImageUploadProps = {}): UseImageUploadReturn => {
    const [imagePreview, setImagePreview] = useState<string>('');
    const [imageFile, setImageFile] = useState<File | null>(null);

    const handleImageFileChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (file) {
                // Validate file type
                if (!file.type.startsWith('image/')) {
                    toast.error('Vui lòng chọn file hình ảnh');
                    return;
                }

                // Validate file size
                if (file.size > maxSize) {
                    toast.error(
                        `Kích thước file không được vượt quá ${Math.round(maxSize / (1024 * 1024))}MB`
                    );
                    return;
                }

                setImageFile(file);

                // Create preview
                const reader = new FileReader();
                reader.onloadend = () => {
                    const result = reader.result as string;
                    setImagePreview(result);
                    onImageChange?.(result, file);
                    onValidationError?.('imageUrl');
                };
                reader.readAsDataURL(file);
            }
        },
        [maxSize, onImageChange, onValidationError]
    );

    const handleRemoveImage = useCallback(() => {
        setImageFile(null);
        setImagePreview('');
        onImageChange?.('', null);
        onValidationError?.('imageUrl');
    }, [onImageChange, onValidationError]);

    const resetImage = useCallback(() => {
        setImageFile(null);
        setImagePreview('');
    }, []);

    return {
        imagePreview,
        imageFile,
        setImagePreview,
        setImageFile,
        handleImageFileChange,
        handleRemoveImage,
        resetImage,
    };
};
