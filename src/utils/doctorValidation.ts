import { DoctorFormData } from '../types/doctor.types';

export const validateDoctorForm = (
    formData: DoctorFormData
): Partial<Record<keyof DoctorFormData, string>> => {
    const errors: Partial<Record<keyof DoctorFormData, string>> = {};

    // Validate required fields
    if (!formData.firstName.trim()) {
        errors.firstName = 'Tên là bắt buộc';
    }
    if (!formData.lastName.trim()) {
        errors.lastName = 'Họ là bắt buộc';
    }

    if (!formData.email.trim()) {
        errors.email = 'Email là bắt buộc';
    } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email)) {
        errors.email = 'Định dạng email không hợp lệ';
    }

    if (!formData.phone.trim()) {
        errors.phone = 'Số điện thoại là bắt buộc';
    }

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

    if (formData.languageIds.length === 0) {
        errors.languageIds = 'Vui lòng chọn ít nhất một ngôn ngữ';
    }

    if (formData.servicePrices.length === 0) {
        errors.servicePrices = 'Vui lòng thêm ít nhất một dịch vụ';
    } else {
        // Validate each service price
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
    }

    return errors;
};
