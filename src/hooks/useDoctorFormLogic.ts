import { useState, useCallback } from 'react';
import { DoctorFormData } from '@/types/doctor.types';
import { DoctorPrice } from '@/types/serviceType.types';
import { useDoctorFormHandlers } from './useDoctorFormHandlers';
import { useDoctorServicePriceValidation } from './useDoctorServicePriceValidation';

export interface UseDoctorFormLogicProps {
    initialData: DoctorFormData;
    isEdit?: boolean;
    doctorId?: string;
}

export const useDoctorFormLogic = ({
    initialData,
    isEdit = false,
    doctorId,
}: UseDoctorFormLogicProps) => {
    const [formData, setFormData] = useState<DoctorFormData>(initialData);
    const [initialFormData, setInitialFormData] = useState<DoctorFormData>(initialData);
    const [errors, setErrors] = useState<
        Partial<
            Record<keyof DoctorFormData | `servicePrices_${number}_${keyof DoctorPrice}`, string>
        >
    >({});

    // Use shared handlers to reduce duplication
    const {
        handleLanguageToggle,
        handleServicePriceChange,
        addServicePrice,
        removeServicePrice,
        handleFileChange,
    } = useDoctorFormHandlers(setFormData, errors as Record<string, string>, setErrors as any);

    // Use shared validation to reduce duplication
    const { validateServicePrices } = useDoctorServicePriceValidation(formData, isEdit);

    const handleInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const { name, value } = e.target;
            setFormData((prev) => ({
                ...prev,
                [name]: name === 'yearsOfExperience' ? Number(value) : value,
            }));
            if (errors[name as keyof typeof errors]) {
                setErrors((prev) => ({ ...prev, [name]: '' }));
            }
        },
        [errors]
    );

    // Helper function to validate required fields
    const validateRequiredFields = useCallback(
        (
            errors: Partial<
                Record<
                    keyof DoctorFormData | `servicePrices_${number}_${keyof DoctorPrice}`,
                    string
                >
            >
        ) => {
            const requiredFields = [
                'firstName',
                'lastName',
                'email',
                'address',
                'gender',
                'bio',
                'positionId',
                'specialtyId',
                'hospitalId',
            ];

            for (const field of requiredFields) {
                if (!formData[field as keyof DoctorFormData]) {
                    errors[field as keyof typeof errors] = 'Trường này là bắt buộc';
                }
            }
        },
        [formData]
    );

    const validateForm = useCallback((): boolean => {
        const newErrors: Partial<
            Record<keyof DoctorFormData | `servicePrices_${number}_${keyof DoctorPrice}`, string>
        > = {};

        // Validate required fields
        validateRequiredFields(newErrors);

        // Validate email format
        if (
            formData.email &&
            !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email)
        ) {
            newErrors.email = isEdit ? 'Email không hợp lệ' : 'Định dạng email không hợp lệ';
        }

        // Validate years of experience (0-80)
        if (formData.yearsOfExperience < 0) {
            newErrors.yearsOfExperience = 'Số năm kinh nghiệm phải lớn hơn hoặc bằng 0';
        } else if (formData.yearsOfExperience > 80) {
            newErrors.yearsOfExperience = 'Số năm kinh nghiệm không được vượt quá 80 năm';
        }

        // Validate languages
        if (formData.languageIds.length === 0) {
            newErrors.languageIds = 'Vui lòng chọn ít nhất một ngôn ngữ';
        }

        // Validate service prices
        validateServicePrices(newErrors as Record<string, string>);

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData, isEdit, validateRequiredFields, validateServicePrices]);

    const resetForm = useCallback(() => {
        const emptyFormData: DoctorFormData = {
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            dateOfBirth: '',
            address: '',
            gender: '',
            bio: '',
            yearsOfExperience: 0,
            avatar: null,
            positionId: '',
            specialtyId: '',
            hospitalId: '',
            languageIds: [],
            servicePrices: [],
        };
        setFormData(emptyFormData);
        setErrors({});
    }, []);

    const prepareSubmitData = useCallback(() => {
        const doctorData = {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            address: formData.address,
            gender: formData.gender as 'MALE' | 'FEMALE',
            bio: formData.bio,
            yearsOfExperience: formData.yearsOfExperience,
            positionId: formData.positionId,
            specialtyId: formData.specialtyId,
            hospitalId: formData.hospitalId,
            avatar: formData.avatar,
        };

        const doctorLanguages = formData.languageIds.map((languageId) => ({
            doctorId: isEdit ? doctorId : '',
            languageId,
        }));

        const doctorPrices: DoctorPrice[] = formData.servicePrices.map((price) => ({
            id: price.id,
            serviceTypeId: price.serviceTypeId,
            amount: price.amount,
        }));

        return { doctorData, doctorLanguages, doctorPrices };
    }, [formData, isEdit, doctorId]);

    // Check if form has changes
    const hasChanges = useCallback((): boolean => {
        // Check basic fields
        const fieldsToCompare: (keyof DoctorFormData)[] = [
            'firstName',
            'lastName',
            'email',
            'phone',
            'dateOfBirth',
            'address',
            'gender',
            'bio',
            'yearsOfExperience',
            'positionId',
            'specialtyId',
            'hospitalId',
        ];

        const basicFieldsChanged = fieldsToCompare.some(
            (field) => formData[field] !== initialFormData[field]
        );

        // Check avatar file
        const avatarChanged = formData.avatar instanceof File;

        // Check languages
        const languagesChanged =
            formData.languageIds.length !== initialFormData.languageIds.length ||
            formData.languageIds.some((id, index) => id !== initialFormData.languageIds[index]);

        // Check service prices
        const pricesChanged =
            formData.servicePrices.length !== initialFormData.servicePrices.length ||
            formData.servicePrices.some((price, index) => {
                const initialPrice = initialFormData.servicePrices[index];
                return (
                    !initialPrice ||
                    price.serviceTypeId !== initialPrice.serviceTypeId ||
                    price.amount !== initialPrice.amount
                );
            });

        return basicFieldsChanged || avatarChanged || languagesChanged || pricesChanged;
    }, [formData, initialFormData]);

    return {
        formData,
        errors,
        setFormData,
        setErrors,
        handleInputChange,
        handleLanguageToggle,
        handleServicePriceChange,
        addServicePrice,
        removeServicePrice,
        handleFileChange,
        validateForm,
        resetForm,
        prepareSubmitData,
        hasChanges,
        initialFormData,
        setInitialFormData,
    };
};
