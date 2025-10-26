import { useState, useCallback } from 'react';
import { useFormValidation, ValidationErrors } from './useFormValidation';
import { useImageUpload } from './useImageUpload';

export interface EntityFormData {
    name: string;
    imageUrl: string;
    status: 'ACTIVE' | 'INACTIVE';
    description?: string; // Optional for ServiceType
}

export interface UseEntityFormProps {
    entityName: string;
    initialFormData: EntityFormData;
    onImageChange?: (imageUrl: string) => void;
    onValidationError?: (field: string) => void;
}

export interface UseEntityFormReturn<T extends EntityFormData> {
    // Form state
    showModal: boolean;
    setShowModal: (show: boolean) => void;
    modalMode: 'add' | 'edit';
    setModalMode: (mode: 'add' | 'edit') => void;
    isSubmitting: boolean;
    setIsSubmitting: (submitting: boolean) => void;
    formData: T;
    setFormData: (data: T) => void;

    // Validation
    validationErrors: ValidationErrors;
    validateForm: (data: T) => boolean;
    clearValidationError: (field: keyof ValidationErrors) => void;
    clearAllValidationErrors: () => void;

    // Image handling
    imagePreview: string;
    imageFile: File | null;
    setImagePreview: (preview: string) => void;
    setImageFile: (file: File | null) => void;
    handleImageFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleRemoveImage: () => void;
    resetImage: () => void;

    // Form handlers
    handleAddClick: () => void;
    handleCancel: () => void;
    handleNameChange: (value: string) => void;
    handleDescriptionChange?: (value: string) => void;
    handleStatusChange: (value: 'ACTIVE' | 'INACTIVE') => void;
    resetForm: () => void;
}

export const useEntityForm = <T extends EntityFormData>({
    entityName,
    initialFormData,
    onImageChange,
    onValidationError,
}: UseEntityFormProps): UseEntityFormReturn<T> => {
    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState<T>(initialFormData as T);

    // Use shared form validation hook
    const { validationErrors, validateForm, clearValidationError, clearAllValidationErrors } =
        useFormValidation({ entityName });

    // Use image upload hook
    const {
        imagePreview,
        imageFile,
        setImagePreview,
        setImageFile,
        handleRemoveImage,
        resetImage,
    } = useImageUpload({
        onImageChange: (imageUrl: string) => {
            setFormData((prev) => ({ ...prev, imageUrl }));
            onImageChange?.(imageUrl);
        },
        onValidationError: (field: string) => {
            clearValidationError(field as keyof ValidationErrors);
            onValidationError?.(field);
        },
    });

    // Wrapper to handle type conversion
    const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setImageFile(file);
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const imageUrl = event.target?.result as string;
                setImagePreview(imageUrl);
                setFormData((prev) => ({ ...prev, imageUrl }));
                onImageChange?.(imageUrl);
            };
            reader.readAsDataURL(file);
        }
    };

    // Form handlers
    const handleAddClick = useCallback(() => {
        setModalMode('add');
        setFormData(initialFormData as T);
        resetImage();
        clearAllValidationErrors();
        setShowModal(true);
    }, [initialFormData, clearAllValidationErrors, resetImage]);

    const handleCancel = useCallback(() => {
        setShowModal(false);
        setFormData(initialFormData as T);
        resetImage();
        clearAllValidationErrors();
    }, [initialFormData, clearAllValidationErrors, resetImage]);

    const handleNameChange = useCallback(
        (value: string) => {
            setFormData((prev) => ({ ...prev, name: value }));
            clearValidationError('name');
        },
        [clearValidationError]
    );

    const handleDescriptionChange = useCallback(
        (value: string) => {
            setFormData((prev) => ({ ...prev, description: value }));
            clearValidationError('description');
        },
        [clearValidationError]
    );

    const handleStatusChange = useCallback(
        (value: 'ACTIVE' | 'INACTIVE') => {
            setFormData((prev) => ({ ...prev, status: value }));
            clearValidationError('status');
        },
        [clearValidationError]
    );

    const resetForm = useCallback(() => {
        setFormData(initialFormData as T);
        resetImage();
        clearAllValidationErrors();
    }, [initialFormData, resetImage, clearAllValidationErrors]);

    return {
        // Form state
        showModal,
        setShowModal,
        modalMode,
        setModalMode,
        isSubmitting,
        setIsSubmitting,
        formData,
        setFormData,

        // Validation
        validationErrors,
        validateForm,
        clearValidationError,
        clearAllValidationErrors,

        // Image handling
        imagePreview,
        imageFile,
        setImagePreview,
        setImageFile,
        handleImageFileChange,
        handleRemoveImage,
        resetImage,

        // Form handlers
        handleAddClick,
        handleCancel,
        handleNameChange,
        handleDescriptionChange,
        handleStatusChange,
        resetForm,
    };
};
