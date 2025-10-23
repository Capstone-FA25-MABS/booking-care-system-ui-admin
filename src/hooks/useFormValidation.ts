import { useState, useCallback } from 'react';

export interface FormData {
    name: string;
    status: 'ACTIVE' | 'INACTIVE';
    imageUrl?: string; // Optional for entities with images
}

export interface ValidationErrors {
    name?: string;
    status?: string;
    imageUrl?: string; // Optional for entities with images
}

interface UseFormValidationProps {
    entityName: string; // e.g., 'học vị', 'ngôn ngữ'
}

export const useFormValidation = ({ entityName }: UseFormValidationProps) => {
    const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

    const validateForm = useCallback(
        (formData: FormData): boolean => {
            const errors: ValidationErrors = {};

            // Validate name
            if (!formData.name.trim()) {
                errors.name = `Tên ${entityName} không được để trống`;
            } else {
                const trimmedName = formData.name.trim();
                if (trimmedName.length < 2) {
                    errors.name = `Tên ${entityName} phải có ít nhất 2 ký tự`;
                } else if (trimmedName.length > 255) {
                    errors.name = `Tên ${entityName} không được vượt quá 255 ký tự`;
                }
            }

            // Validate status
            if (!formData.status) {
                errors.status = 'Vui lòng chọn trạng thái';
            }

            // Validate imageUrl if present in formData
            if ('imageUrl' in formData && formData.imageUrl !== undefined) {
                if (!formData.imageUrl.trim()) {
                    errors.imageUrl = `Hình ảnh ${entityName} không được để trống`;
                }
            }

            setValidationErrors(errors);
            return Object.keys(errors).length === 0;
        },
        [entityName]
    );

    const clearValidationError = useCallback((field: keyof ValidationErrors) => {
        setValidationErrors((prev) => ({ ...prev, [field]: undefined }));
    }, []);

    const clearAllValidationErrors = useCallback(() => {
        setValidationErrors({});
    }, []);

    return {
        validationErrors,
        validateForm,
        clearValidationError,
        clearAllValidationErrors,
        setValidationErrors,
    };
};
