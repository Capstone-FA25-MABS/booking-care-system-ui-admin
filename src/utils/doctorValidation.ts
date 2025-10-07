import { DoctorFormData } from '../types/doctor.types';

// Helper functions to reduce cognitive complexity
const validateRequiredTextFields = (formData: DoctorFormData, errors: Record<string, string>) => {
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

const validateEmail = (formData: DoctorFormData, errors: Record<string, string>) => {
    if (!formData.email.trim()) {
        errors.email = 'Email là bắt buộc';
    } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email)) {
        errors.email = 'Định dạng email không hợp lệ';
    }
};

const validateRequiredIds = (formData: DoctorFormData, errors: Record<string, string>) => {
    if (!formData.specialtyId) {
        errors.specialtyId = 'Chuyên khoa là bắt buộc';
    }
    if (!formData.positionId) {
        errors.positionId = 'Chức vụ là bắt buộc';
    }
    if (!formData.hospitalId) {
        errors.hospitalId = 'Bệnh viện là bắt buộc';
    }
};

const validateYearsOfExperience = (formData: DoctorFormData, errors: Record<string, string>) => {
    if (!formData.yearsOfExperience || formData.yearsOfExperience < 0) {
        errors.yearsOfExperience = 'Số năm kinh nghiệm phải lớn hơn hoặc bằng 0';
    }
};

const validateLanguages = (formData: DoctorFormData, errors: Record<string, string>) => {
    if (formData.languageIds.length === 0) {
        errors.languageIds = 'Vui lòng chọn ít nhất một ngôn ngữ';
    }
};

const validateServicePrices = (formData: DoctorFormData, errors: Record<string, string>) => {
    if (formData.servicePrices.length === 0) {
        errors.servicePrices = 'Vui lòng thêm ít nhất một dịch vụ';
        return;
    }

    for (const [index, servicePrice] of formData.servicePrices.entries()) {
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

    validateRequiredTextFields(formData, errors);
    validateEmail(formData, errors);
    validateRequiredIds(formData, errors);
    validateYearsOfExperience(formData, errors);
    validateLanguages(formData, errors);
    validateServicePrices(formData, errors);

    return errors;
};
