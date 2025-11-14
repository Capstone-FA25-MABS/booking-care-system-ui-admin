import { useState, useCallback } from 'react';

export interface SubscriptionPlanFormData {
    name: string;
    description?: string;
    price: string;
    billingCycle: string;
    maxDoctors: string;
    maxSpecialties: string;
    maxAppointments: string;
    features?: string;
    status: 'ACTIVE' | 'INACTIVE';
}

export interface SubscriptionPlanValidationErrors {
    name?: string;
    description?: string;
    price?: string;
    billingCycle?: string;
    maxDoctors?: string;
    maxSpecialties?: string;
    maxAppointments?: string;
    features?: string;
    status?: string;
}

export interface CustomPlanConfig {
    maxDoctors: string;
    maxSpecialties: string;
    maxAppointments: string;
    unlimitedDoctors: boolean;
    unlimitedSpecialties: boolean;
    unlimitedAppointments: boolean;
    features?: string;
    status?: 'ACTIVE' | 'INACTIVE';
}

export interface CustomPlansConfig {
    quarterly?: CustomPlanConfig;
    yearly?: CustomPlanConfig;
}

// Helper functions to reduce cognitive complexity
const validateName = (name: string): string | undefined => {
    if (!name.trim()) {
        return 'Tên gói dịch vụ không được để trống';
    }

    const trimmedName = name.trim();
    if (trimmedName.length < 2) {
        return 'Tên gói dịch vụ phải có ít nhất 2 ký tự';
    }

    if (trimmedName.length > 100) {
        return 'Tên gói dịch vụ không được vượt quá 100 ký tự';
    }

    return undefined;
};

const validateDescription = (description: string | undefined): string | undefined => {
    if (!description || description.trim().length === 0) {
        return undefined; // Description is optional
    }

    const trimmedDescription = description.trim();
    if (trimmedDescription.length > 1000) {
        return 'Mô tả không được vượt quá 1000 ký tự';
    }

    if (trimmedDescription.length < 10 && trimmedDescription.length > 0) {
        return 'Mô tả phải có ít nhất 10 ký tự (nếu có)';
    }

    return undefined;
};

const validatePrice = (price: string): string | undefined => {
    if (!price.trim()) {
        return 'Giá không được để trống';
    }

    const priceValue = Number.parseFloat(price);
    if (Number.isNaN(priceValue)) {
        return 'Giá phải là một số hợp lệ';
    }

    if (priceValue < 0) {
        return 'Giá không được âm';
    }

    if (priceValue > 1000000000) {
        // 1 billion VND
        return 'Giá không được vượt quá 1 tỷ VNĐ';
    }

    return undefined;
};

const validateBillingCycle = (billingCycle: string): string | undefined => {
    if (!billingCycle) {
        return 'Vui lòng chọn chu kỳ thanh toán';
    }

    const validCycles = ['MONTHLY', 'QUARTERLY', 'YEARLY'];
    if (!validCycles.includes(billingCycle)) {
        return 'Chu kỳ thanh toán không hợp lệ';
    }

    return undefined;
};

const validateMaxDoctors = (maxDoctors: string): string | undefined => {
    if (!maxDoctors.trim()) {
        return 'Số bác sĩ tối đa không được để trống';
    }

    const value = Number.parseInt(maxDoctors, 10);
    if (Number.isNaN(value)) {
        return 'Số bác sĩ tối đa phải là một số hợp lệ';
    }

    // -1 represents unlimited
    if (value < -1) {
        return 'Giá trị không hợp lệ (dùng -1 cho không giới hạn)';
    }

    if (value > 1000 && value !== -1) {
        return 'Số bác sĩ tối đa không được vượt quá 1000';
    }

    return undefined;
};

const validateMaxSpecialties = (maxSpecialties: string): string | undefined => {
    if (!maxSpecialties.trim()) {
        return 'Số chuyên khoa tối đa không được để trống';
    }

    const value = Number.parseInt(maxSpecialties, 10);
    if (Number.isNaN(value)) {
        return 'Số chuyên khoa tối đa phải là một số hợp lệ';
    }

    // -1 represents unlimited
    if (value < -1) {
        return 'Giá trị không hợp lệ (dùng -1 cho không giới hạn)';
    }

    if (value > 100 && value !== -1) {
        return 'Số chuyên khoa tối đa không được vượt quá 100';
    }

    return undefined;
};

const validateMaxAppointments = (maxAppointments: string): string | undefined => {
    if (!maxAppointments.trim()) {
        return 'Số lịch hẹn tối đa không được để trống';
    }

    const value = Number.parseInt(maxAppointments, 10);
    if (Number.isNaN(value)) {
        return 'Số lịch hẹn tối đa phải là một số hợp lệ';
    }

    // -1 represents unlimited
    if (value < -1) {
        return 'Giá trị không hợp lệ (dùng -1 cho không giới hạn)';
    }

    if (value > 100000 && value !== -1) {
        return 'Số lịch hẹn tối đa không được vượt quá 100,000';
    }

    return undefined;
};

const validateFeatureItem = (feature: unknown, index: number): string | undefined => {
    if (!feature || typeof feature !== 'object') {
        return `Tính năng thứ ${index + 1} không hợp lệ`;
    }

    const featureObj = feature as Record<string, unknown>;

    // Text is required
    if (
        !featureObj.text ||
        typeof featureObj.text !== 'string' ||
        featureObj.text.trim().length === 0
    ) {
        return `Tính năng thứ ${index + 1} phải có nội dung`;
    }

    // Validate iconType
    const validIconTypes = ['check', 'plus', 'star', 'info'];
    if (featureObj.iconType && !validIconTypes.includes(featureObj.iconType as string)) {
        return `Tính năng thứ ${index + 1} có loại icon không hợp lệ`;
    }

    // Validate text length
    if (featureObj.text.length > 500) {
        return `Tính năng thứ ${index + 1} có nội dung quá dài (tối đa 500 ký tự)`;
    }

    // Validate subtext length if exists
    if (
        featureObj.subtext &&
        typeof featureObj.subtext === 'string' &&
        featureObj.subtext.length > 200
    ) {
        return `Tính năng thứ ${index + 1} có mô tả phụ quá dài (tối đa 200 ký tự)`;
    }

    return undefined;
};

const validateFeatures = (features: string | undefined): string | undefined => {
    if (!features || features.trim().length === 0) {
        return undefined; // Features is optional
    }

    const trimmedFeatures = features.trim();

    // Validate total JSON length first
    if (trimmedFeatures.length > 5000) {
        return 'Tổng độ dài tính năng không được vượt quá 5000 ký tự';
    }

    // Validate JSON format
    let parsed: unknown;
    try {
        parsed = JSON.parse(trimmedFeatures);
    } catch {
        return 'Tính năng phải là một JSON hợp lệ';
    }

    if (!Array.isArray(parsed)) {
        return 'Tính năng phải là một mảng JSON hợp lệ';
    }

    // Validate total features count
    if (parsed.length > 50) {
        return 'Số lượng tính năng không được vượt quá 50';
    }

    // Validate each feature object
    for (let i = 0; i < parsed.length; i++) {
        const error = validateFeatureItem(parsed[i], i);
        if (error) {
            return error;
        }
    }

    return undefined;
};

const validateStatus = (status: 'ACTIVE' | 'INACTIVE'): string | undefined => {
    if (!status) {
        return 'Vui lòng chọn trạng thái';
    }

    const validStatuses = ['ACTIVE', 'INACTIVE'];
    if (!validStatuses.includes(status)) {
        return 'Trạng thái không hợp lệ';
    }

    return undefined;
};

export const useSubscriptionPlanFormValidation = () => {
    const [formData, setFormData] = useState<SubscriptionPlanFormData>({
        name: '',
        description: '',
        price: '',
        billingCycle: '',
        maxDoctors: '',
        maxSpecialties: '',
        maxAppointments: '',
        features: '',
        status: 'ACTIVE',
    });

    const [validationErrors, setValidationErrors] = useState<SubscriptionPlanValidationErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Individual field change handlers
    const handleNameChange = useCallback(
        (value: string) => {
            setFormData((prev) => ({ ...prev, name: value }));
            // Clear error when user starts typing
            if (validationErrors.name) {
                setValidationErrors((prev) => ({ ...prev, name: undefined }));
            }
        },
        [validationErrors.name]
    );

    const handleDescriptionChange = useCallback(
        (value: string) => {
            setFormData((prev) => ({ ...prev, description: value }));
            if (validationErrors.description) {
                setValidationErrors((prev) => ({ ...prev, description: undefined }));
            }
        },
        [validationErrors.description]
    );

    const handlePriceChange = useCallback(
        (value: string) => {
            setFormData((prev) => ({ ...prev, price: value }));
            if (validationErrors.price) {
                setValidationErrors((prev) => ({ ...prev, price: undefined }));
            }
        },
        [validationErrors.price]
    );

    const handleBillingCycleChange = useCallback(
        (value: string) => {
            setFormData((prev) => ({ ...prev, billingCycle: value }));
            if (validationErrors.billingCycle) {
                setValidationErrors((prev) => ({ ...prev, billingCycle: undefined }));
            }
        },
        [validationErrors.billingCycle]
    );

    const handleMaxDoctorsChange = useCallback(
        (value: string) => {
            setFormData((prev) => ({ ...prev, maxDoctors: value }));
            if (validationErrors.maxDoctors) {
                setValidationErrors((prev) => ({ ...prev, maxDoctors: undefined }));
            }
        },
        [validationErrors.maxDoctors]
    );

    const handleMaxSpecialtiesChange = useCallback(
        (value: string) => {
            setFormData((prev) => ({ ...prev, maxSpecialties: value }));
            if (validationErrors.maxSpecialties) {
                setValidationErrors((prev) => ({ ...prev, maxSpecialties: undefined }));
            }
        },
        [validationErrors.maxSpecialties]
    );

    const handleMaxAppointmentsChange = useCallback(
        (value: string) => {
            setFormData((prev) => ({ ...prev, maxAppointments: value }));
            if (validationErrors.maxAppointments) {
                setValidationErrors((prev) => ({ ...prev, maxAppointments: undefined }));
            }
        },
        [validationErrors.maxAppointments]
    );

    const handleFeaturesChange = useCallback(
        (value: string) => {
            setFormData((prev) => ({ ...prev, features: value }));
            if (validationErrors.features) {
                setValidationErrors((prev) => ({ ...prev, features: undefined }));
            }
        },
        [validationErrors.features]
    );

    const handleStatusChange = useCallback(
        (value: 'ACTIVE' | 'INACTIVE') => {
            setFormData((prev) => ({ ...prev, status: value }));
            if (validationErrors.status) {
                setValidationErrors((prev) => ({ ...prev, status: undefined }));
            }
        },
        [validationErrors.status]
    );

    // Validation function
    const validateForm = useCallback((): boolean => {
        const errors: SubscriptionPlanValidationErrors = {};

        const nameError = validateName(formData.name);
        if (nameError) errors.name = nameError;

        const descriptionError = validateDescription(formData.description);
        if (descriptionError) errors.description = descriptionError;

        const priceError = validatePrice(formData.price);
        if (priceError) errors.price = priceError;

        const billingCycleError = validateBillingCycle(formData.billingCycle);
        if (billingCycleError) errors.billingCycle = billingCycleError;

        const maxDoctorsError = validateMaxDoctors(formData.maxDoctors);
        if (maxDoctorsError) errors.maxDoctors = maxDoctorsError;

        const maxSpecialtiesError = validateMaxSpecialties(formData.maxSpecialties);
        if (maxSpecialtiesError) errors.maxSpecialties = maxSpecialtiesError;

        const maxAppointmentsError = validateMaxAppointments(formData.maxAppointments);
        if (maxAppointmentsError) errors.maxAppointments = maxAppointmentsError;

        const featuresError = validateFeatures(formData.features);
        if (featuresError) errors.features = featuresError;

        const statusError = validateStatus(formData.status);
        if (statusError) errors.status = statusError;

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    }, [formData]);

    // Reset form
    const resetForm = useCallback(() => {
        setFormData({
            name: '',
            description: '',
            price: '',
            billingCycle: '',
            maxDoctors: '',
            maxSpecialties: '',
            maxAppointments: '',
            features: '',
            status: 'ACTIVE',
        });
        setValidationErrors({});
        setIsSubmitting(false);
    }, []);

    return {
        formData,
        validationErrors,
        isSubmitting,
        setIsSubmitting,
        handleNameChange,
        handleDescriptionChange,
        handlePriceChange,
        handleBillingCycleChange,
        handleMaxDoctorsChange,
        handleMaxSpecialtiesChange,
        handleMaxAppointmentsChange,
        handleFeaturesChange,
        handleStatusChange,
        validateForm,
        resetForm,
        setFormData,
        setValidationErrors,
    };
};

export const validateSubscriptionPlanForm = (
    formData: {
        name: string;
        price: string;
        billingCycle?: string;
        maxDoctors: string;
        maxSpecialties: string;
        maxAppointments: string;
    },
    isUnlimitedDoctors: boolean,
    isUnlimitedSpecialties: boolean,
    isUnlimitedAppointments: boolean,
    requiresBillingCycle: boolean = true
): string | null => {
    if (!formData.name?.trim()) {
        return 'Vui lòng nhập tên gói dịch vụ';
    }

    if (!formData.price) {
        return 'Vui lòng nhập giá gói';
    }

    const price = Number.parseFloat(formData.price);
    if (Number.isNaN(price) || price < 0) {
        return 'Giá gói phải là số không âm (có thể là 0 cho gói miễn phí)';
    }

    if (requiresBillingCycle && !formData.billingCycle) {
        return 'Vui lòng chọn chu kỳ thanh toán';
    }

    if (
        !isUnlimitedDoctors &&
        (!formData.maxDoctors || Number.parseInt(formData.maxDoctors, 10) <= 0)
    ) {
        return 'Vui lòng nhập số bác sĩ tối đa hoặc chọn không giới hạn';
    }

    if (
        !isUnlimitedSpecialties &&
        (!formData.maxSpecialties || Number.parseInt(formData.maxSpecialties, 10) <= 0)
    ) {
        return 'Vui lòng nhập số chuyên khoa tối đa hoặc chọn không giới hạn';
    }

    if (
        !isUnlimitedAppointments &&
        (!formData.maxAppointments || Number.parseInt(formData.maxAppointments, 10) <= 0)
    ) {
        return 'Vui lòng nhập số lịch hẹn tối đa hoặc chọn không giới hạn';
    }

    return null;
};

export const parseLimit = (value: string, unlimited: boolean): number | null => {
    if (unlimited) return null;
    const num = Number.parseInt(value, 10);
    return num === -1 ? null : num;
};

export default useSubscriptionPlanFormValidation;
