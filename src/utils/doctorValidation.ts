import { DoctorFormData } from '../types/doctor.types';

// Helper function to validate basic info
const validateBasicInfo = (
    formData: DoctorFormData,
    errors: Partial<Record<keyof DoctorFormData, string>>
) => {
    if (!formData.firstName.trim()) {
        errors.firstName = 'Tên là bắt buộc';
    }
    if (!formData.lastName.trim()) {
        errors.lastName = 'Họ là bắt buộc';
    }
    if (!formData.phone.trim()) {
        errors.phone = 'Số điện thoại là bắt buộc';
    }
};

// Helper function to validate email
const validateEmail = (
    formData: DoctorFormData,
    errors: Partial<Record<keyof DoctorFormData, string>>
) => {
    if (!formData.email.trim()) {
        errors.email = 'Email là bắt buộc';
        return;
    }
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email)) {
        errors.email = 'Định dạng email không hợp lệ';
    }
};

// Helper function to validate professional info
const validateProfessionalInfo = (
    formData: DoctorFormData,
    errors: Partial<Record<keyof DoctorFormData, string>>
) => {
    if (!formData.specialtyId) {
        errors.specialtyId = 'Chuyên khoa là bắt buộc';
    }
    if (!formData.positionId) {
        errors.positionId = 'Chức vụ là bắt buộc';
    }
    if (!formData.hospitalId) {
        errors.hospitalId = 'Bệnh viện là bắt buộc';
    }
    if (!formData.yearsOfExperience || formData.yearsOfExperience < 0) {
        errors.yearsOfExperience = 'Số năm kinh nghiệm phải lớn hơn hoặc bằng 0';
    }
};

// Helper function to validate service prices
const validateServicePrices = (
    formData: DoctorFormData,
    errors: Partial<Record<keyof DoctorFormData, string>>
) => {
    if (formData.servicePrices.length === 0) {
        errors.servicePrices = 'Vui lòng thêm ít nhất một dịch vụ';
        return;
    }

    for (let index = 0; index < formData.servicePrices.length; index++) {
        const servicePrice = formData.servicePrices[index];
        if (!servicePrice.serviceTypeId) {
            errors[`servicePrices_${index}_serviceTypeId` as keyof DoctorFormData] =
                'Vui lòng chọn loại dịch vụ';
        }
        if (!servicePrice.amount || servicePrice.amount <= 0) {
            errors[`servicePrices_${index}_amount` as keyof DoctorFormData] =
                'Giá dịch vụ phải lớn hơn 0';
        }
    }
};

export const validateDoctorForm = (
    formData: DoctorFormData
): Partial<Record<keyof DoctorFormData, string>> => {
    const errors: Partial<Record<keyof DoctorFormData, string>> = {};

    // Validate basic info
    validateBasicInfo(formData, errors);

    // Validate email
    validateEmail(formData, errors);

    // Validate professional info
    validateProfessionalInfo(formData, errors);

    // Validate languages
    if (formData.languageIds.length === 0) {
        errors.languageIds = 'Vui lòng chọn ít nhất một ngôn ngữ';
    }

    // Validate service prices
    validateServicePrices(formData, errors);

    return errors;
};
