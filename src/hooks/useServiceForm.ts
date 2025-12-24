import { useState, useCallback } from 'react';
import { ServiceFormData } from '@/types/service.types';
import { useImageUpload } from './useImageUpload';

interface UseServiceFormProps {
    initialHospitalId?: string;
    onValidationError?: (field: string) => void;
}

interface UseServiceFormReturn {
    formData: ServiceFormData;
    errors: Record<string, string>;
    imagePreview: string;
    imageFile: File | null;
    setFormData: React.Dispatch<React.SetStateAction<ServiceFormData>>;
    setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
    setImagePreview: (preview: string) => void;
    handleInputChange: (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => void;
    handleImageFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleRemoveImage: () => void;
    resetForm: (hospitalId?: string) => void;
    validateForm: (hospitalId?: string) => boolean;
}

export const useServiceForm = ({
    initialHospitalId,
    onValidationError,
}: UseServiceFormProps = {}): UseServiceFormReturn => {
    const [formData, setFormData] = useState<ServiceFormData>({
        name: '',
        description: '',
        price: 0,
        durationTime: 30,
        hospitalId: initialHospitalId || '',
        serviceTypeId: '',
        status: 'ACTIVE',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const {
        imagePreview,
        imageFile,
        setImagePreview,
        handleImageFileChange: handleImageFileChangeHook,
        handleRemoveImage: handleRemoveImageHook,
        resetImage,
    } = useImageUpload({
        maxSize: 5 * 1024 * 1024, // 5MB
        onValidationError: (field) => {
            if (field === 'imageUrl') {
                setErrors((prev) => {
                    const newErrors = { ...prev };
                    delete newErrors.imageUrl;
                    return newErrors;
                });
            }
            onValidationError?.(field);
        },
    });

    const handleInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
            const { name, value } = e.target;
            setFormData((prev) => ({
                ...prev,
                [name]: name === 'price' || name === 'durationTime' ? Number(value) : value,
            }));
            // Clear error when user types
            setErrors((prev) => {
                if (prev[name]) {
                    const newErrors = { ...prev };
                    delete newErrors[name];
                    return newErrors;
                }
                return prev;
            });
        },
        []
    );

    const handleImageFileChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            handleImageFileChangeHook(e);
        },
        [handleImageFileChangeHook]
    );

    const handleRemoveImage = useCallback(() => {
        handleRemoveImageHook();
    }, [handleRemoveImageHook]);

    const validateForm = useCallback(
        (hospitalId?: string): boolean => {
            const newErrors: Record<string, string> = {};

            if (!formData.name.trim()) {
                newErrors.name = 'Tên dịch vụ không được để trống';
            }

            if (formData.price <= 0) {
                newErrors.price = 'Giá dịch vụ phải lớn hơn 0';
            }

            if (formData.durationTime <= 0) {
                newErrors.durationTime = 'Thời gian dịch vụ phải lớn hơn 0';
            }

            if (!formData.serviceTypeId) {
                newErrors.serviceTypeId = 'Vui lòng chọn loại dịch vụ';
            }

            const targetHospitalId = hospitalId || formData.hospitalId;
            if (!targetHospitalId) {
                newErrors.hospitalId = 'Bệnh viện không được để trống';
            }

            setErrors(newErrors);
            return Object.keys(newErrors).length === 0;
        },
        [formData]
    );

    const resetForm = useCallback(
        (hospitalId?: string) => {
            setFormData({
                name: '',
                description: '',
                price: 0,
                durationTime: 30,
                hospitalId: hospitalId || initialHospitalId || '',
                serviceTypeId: '',
                status: 'ACTIVE',
            });
            setErrors({});
            resetImage();
        },
        [initialHospitalId, resetImage]
    );

    return {
        formData,
        errors,
        imagePreview,
        imageFile,
        setFormData,
        setErrors,
        setImagePreview,
        handleInputChange,
        handleImageFileChange,
        handleRemoveImage,
        resetForm,
        validateForm,
    };
};
