import { useState, useCallback } from 'react';
import { DoctorFormData } from '@/types/doctor.types';
import { DoctorPrice } from '@/types/service.types';

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
    const [errors, setErrors] = useState<
        Partial<
            Record<keyof DoctorFormData | `servicePrices_${number}_${keyof DoctorPrice}`, string>
        >
    >({});

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

    const handleLanguageToggle = useCallback((languageId: string) => {
        setFormData((prev) => ({
            ...prev,
            languageIds: prev.languageIds.includes(languageId)
                ? prev.languageIds.filter((id) => id !== languageId)
                : [...prev.languageIds, languageId],
        }));
    }, []);

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
        [errors]
    );

    const addServicePrice = useCallback(() => {
        setFormData((prev) => ({
            ...prev,
            servicePrices: [...prev.servicePrices, { serviceTypeId: '', amount: 0, note: '' }],
        }));
    }, []);

    const removeServicePrice = useCallback((index: number) => {
        setFormData((prev) => ({
            ...prev,
            servicePrices: prev.servicePrices.filter((_, i) => i !== index),
        }));
    }, []);

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setFormData((prev) => ({
            ...prev,
            avatar: file,
        }));
    }, []);

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

    // Helper function to validate service prices
    const validateServicePrices = useCallback(
        (
            errors: Partial<
                Record<
                    keyof DoctorFormData | `servicePrices_${number}_${keyof DoctorPrice}`,
                    string
                >
            >
        ) => {
            if (formData.servicePrices.length === 0) {
                errors.servicePrices = isEdit
                    ? 'Vui lòng thêm ít nhất một dịch vụ'
                    : 'Vui lòng thêm ít nhất một loại dịch vụ';
                return;
            }

            for (let index = 0; index < formData.servicePrices.length; index++) {
                const price = formData.servicePrices[index];
                if (!price.serviceTypeId) {
                    errors[`servicePrices_${index}_amount`] = 'Vui lòng chọn loại dịch vụ';
                }
                if (price.amount <= 0) {
                    errors[`servicePrices_${index}_amount`] = 'Giá phải lớn hơn 0';
                }
            }
        },
        [formData.servicePrices, isEdit]
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

        // Validate years of experience
        if (formData.yearsOfExperience < 0) {
            newErrors.yearsOfExperience = 'Số năm kinh nghiệm phải lớn hơn hoặc bằng 0';
        }

        // Validate languages
        if (formData.languageIds.length === 0) {
            newErrors.languageIds = 'Vui lòng chọn ít nhất một ngôn ngữ';
        }

        // Validate service prices
        validateServicePrices(newErrors);

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
            serviceTypeId: price.serviceTypeId,
            amount: price.amount,
            note: price.note,
        }));

        return { doctorData, doctorLanguages, doctorPrices };
    }, [formData, isEdit, doctorId]);

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
        prepareSubmitData,
    };
};
