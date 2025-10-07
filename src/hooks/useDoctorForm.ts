import { useState, useCallback } from 'react';
import { DoctorFormData, DoctorPrice, Guid } from '../types/doctor.types';
import { validateDoctorForm } from '../utils/doctorValidation';
import { emptyGuid } from '../utils/guid';

export const useDoctorForm = (initialData: DoctorFormData) => {
    const [formData, setFormData] = useState<DoctorFormData>(initialData);
    const [errors, setErrors] = useState<Partial<Record<keyof DoctorFormData, string>>>({});

    const handleInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const { name, value, type } = e.target;

            setFormData((prev) => ({
                ...prev,
                [name]: (() => {
                    if (type === 'checkbox') return (e.target as HTMLInputElement).checked;
                    if (type === 'number') return Number(value);
                    return value;
                })(),
            }));

            // Clear error when user starts typing
            if (errors[name as keyof DoctorFormData]) {
                setErrors((prev) => ({
                    ...prev,
                    [name]: undefined,
                }));
            }
        },
        [errors]
    );

    const handleLanguageToggle = useCallback((languageId: Guid) => {
        setFormData((prev) => {
            const existingIndex = prev.languageIds.findIndex((id) => id === languageId);

            if (existingIndex >= 0) {
                // Remove language
                return {
                    ...prev,
                    languageIds: prev.languageIds.filter((_, index) => index !== existingIndex),
                };
            } else {
                // Add language
                return {
                    ...prev,
                    languageIds: [...prev.languageIds, languageId],
                };
            }
        });
    }, []);

    const handleServicePriceChange = useCallback(
        (index: number, field: keyof DoctorPrice, value: string | number) => {
            setFormData((prev) => ({
                ...prev,
                servicePrices: prev.servicePrices.map((price, i) =>
                    i === index ? { ...price, [field]: value } : price
                ),
            }));

            // Clear validation errors for this field
            const errorKey = `servicePrices_${index}_${field}` as keyof DoctorFormData;
            if (errors[errorKey]) {
                setErrors((prev) => ({
                    ...prev,
                    [errorKey]: undefined,
                }));
            }
        },
        [errors]
    );

    const addServicePrice = useCallback(() => {
        setFormData((prev) => ({
            ...prev,
            servicePrices: [
                ...prev.servicePrices,
                { serviceTypeId: emptyGuid(), amount: 0, note: '' },
            ],
        }));

        // Clear servicePrices validation error when adding a new service
        if (errors.servicePrices) {
            setErrors((prev) => ({
                ...prev,
                servicePrices: undefined,
            }));
        }
    }, [errors]);

    const removeServicePrice = useCallback((index: number) => {
        setFormData((prev) => ({
            ...prev,
            servicePrices: prev.servicePrices.filter((_, i) => i !== index),
        }));
    }, []);

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFormData((prev) => ({
                ...prev,
                avatar: file,
            }));
        }
    }, []);

    const validateForm = useCallback(() => {
        const validationErrors = validateDoctorForm(formData);
        setErrors(validationErrors);
        return Object.keys(validationErrors).length === 0;
    }, [formData]);

    const resetForm = useCallback((newData: DoctorFormData) => {
        setFormData(newData);
        setErrors({});
    }, []);

    return {
        formData,
        errors,
        handleInputChange,
        handleLanguageToggle,
        handleServicePriceChange,
        addServicePrice,
        removeServicePrice,
        handleFileChange,
        validateForm,
        resetForm,
    };
};
