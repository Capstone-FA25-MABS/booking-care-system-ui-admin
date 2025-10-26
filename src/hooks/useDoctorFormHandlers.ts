import { useCallback } from 'react';
import { DoctorPrice } from '@/types/serviceType.types';

/**
 * Shared hook for doctor form handlers
 * Used by both AddDoctorForm and EditDoctorForm to avoid code duplication
 */
export const useDoctorFormHandlers = <
    T extends { languageIds: string[]; servicePrices: DoctorPrice[] },
>(
    setFormData: React.Dispatch<React.SetStateAction<T>>,
    errors: Record<string, string>,
    setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>
) => {
    const handleLanguageToggle = useCallback(
        (languageId: string) => {
            setFormData((prev) => ({
                ...prev,
                languageIds: prev.languageIds.includes(languageId)
                    ? prev.languageIds.filter((id) => id !== languageId)
                    : [...prev.languageIds, languageId],
            }));
        },
        [setFormData]
    );

    const handleServicePriceChange = useCallback(
        (index: number, field: keyof DoctorPrice, value: string | number) => {
            setFormData((prev) => ({
                ...prev,
                servicePrices: prev.servicePrices.map((price, i) =>
                    i === index ? { ...price, [field]: value } : price
                ),
            }));
            if (errors[`servicePrices_${index}_${field}`]) {
                setErrors((prev) => ({ ...prev, [`servicePrices_${index}_${field}`]: '' }));
            }
        },
        [setFormData, errors, setErrors]
    );

    const addServicePrice = useCallback(() => {
        setFormData((prev) => ({
            ...prev,
            servicePrices: [
                ...prev.servicePrices,
                {
                    id: `temp-${Date.now()}`,
                    serviceTypeId: '',
                    amount: 0,
                },
            ],
        }));
    }, [setFormData]);

    const removeServicePrice = useCallback(
        (index: number) => {
            setFormData((prev) => ({
                ...prev,
                servicePrices: prev.servicePrices.filter((_, i) => i !== index),
            }));
        },
        [setFormData]
    );

    const handleFileChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0] || null;
            setFormData((prev) => ({
                ...prev,
                avatar: file,
            }));
        },
        [setFormData]
    );

    return {
        handleLanguageToggle,
        handleServicePriceChange,
        addServicePrice,
        removeServicePrice,
        handleFileChange,
    };
};
