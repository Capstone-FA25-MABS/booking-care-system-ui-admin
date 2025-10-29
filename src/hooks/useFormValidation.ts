import { useState, useCallback } from 'react';

export interface FormData {
    name: string;
    description?: string; // Optional description field
    status: 'ACTIVE' | 'INACTIVE';
    imageUrl?: string; // Optional for entities with images
}

export interface ValidationErrors {
    name?: string;
    description?: string; // Optional description field
    status?: string;
    imageUrl?: string; // Optional for entities with images
}

interface UseFormValidationProps {
    entityName: string; // e.g., 'học vị', 'ngôn ngữ'
}

// Helper functions to reduce cognitive complexity
const validateName = (name: string, entityName: string): string | undefined => {
    if (!name.trim()) {
        return `Tên ${entityName} không được để trống`;
    }

    const trimmedName = name.trim();
    if (trimmedName.length < 2) {
        return `Tên ${entityName} phải có ít nhất 2 ký tự`;
    }

    if (trimmedName.length > 255) {
        return `Tên ${entityName} không được vượt quá 255 ký tự`;
    }

    return undefined;
};

const validateDescription = (
    description: string | undefined,
    entityName: string
): string | undefined => {
    if (!description || description.trim().length === 0) {
        return `Mô tả ${entityName} không được để trống`;
    }

    const trimmedDescription = description.trim();
    if (trimmedDescription.length < 10) {
        return `Mô tả ${entityName} phải có ít nhất 10 ký tự`;
    }

    if (trimmedDescription.length > 255) {
        return `Mô tả ${entityName} không được vượt quá 255 ký tự`;
    }

    return undefined;
};

const validateStatus = (status: 'ACTIVE' | 'INACTIVE'): string | undefined => {
    if (!status) {
        return 'Vui lòng chọn trạng thái';
    }
    return undefined;
};

const validateImageUrl = (imageUrl: string | undefined, entityName: string): string | undefined => {
    if (!imageUrl?.trim()) {
        return `Hình ảnh ${entityName} không được để trống`;
    }
    return undefined;
};

export const useFormValidation = ({ entityName }: UseFormValidationProps) => {
    const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

    const validateForm = useCallback(
        (formData: FormData): boolean => {
            const errors: ValidationErrors = {};

            // Validate name
            const nameError = validateName(formData.name, entityName);
            if (nameError) {
                errors.name = nameError;
            }

            // Validate description if present
            if ('description' in formData && formData.description !== undefined) {
                const descriptionError = validateDescription(formData.description, entityName);
                if (descriptionError) {
                    errors.description = descriptionError;
                }
            }

            // Validate status
            const statusError = validateStatus(formData.status);
            if (statusError) {
                errors.status = statusError;
            }

            // Validate imageUrl if present in formData
            if ('imageUrl' in formData && formData.imageUrl !== undefined) {
                const imageUrlError = validateImageUrl(formData.imageUrl, entityName);
                if (imageUrlError) {
                    errors.imageUrl = imageUrlError;
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
