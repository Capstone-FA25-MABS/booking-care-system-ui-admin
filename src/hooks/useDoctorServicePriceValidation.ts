import { useCallback } from 'react';
import { DoctorPrice } from '@/types/serviceType.types';

/**
 * Shared validation logic for doctor service prices
 * Used by both AddDoctorForm and EditDoctorForm to avoid code duplication
 */
export const useDoctorServicePriceValidation = <T extends { servicePrices: DoctorPrice[] }>(
    formData: T,
    isEdit: boolean = false
) => {
    const validateServicePrices = useCallback(
        (errors: Record<string, string>) => {
            if (formData.servicePrices.length === 0) {
                errors.servicePrices = isEdit
                    ? 'Vui lòng thêm ít nhất một dịch vụ'
                    : 'Vui lòng thêm ít nhất một loại dịch vụ';
                return;
            }

            // Check for duplicate service types
            const serviceTypeIds = formData.servicePrices
                .map((price) => price.serviceTypeId)
                .filter(Boolean);
            const duplicateServiceTypes = new Set(
                serviceTypeIds.filter((id, index) => serviceTypeIds.indexOf(id) !== index)
            );

            for (let index = 0; index < formData.servicePrices.length; index++) {
                const price = formData.servicePrices[index];
                if (!price.serviceTypeId) {
                    errors[`servicePrices_${index}_amount`] = 'Vui lòng chọn loại dịch vụ';
                } else if (duplicateServiceTypes.has(price.serviceTypeId)) {
                    errors[`servicePrices_${index}_amount`] =
                        'Loại dịch vụ này đã được chọn. Mỗi bác sĩ chỉ được có một giá cho mỗi loại dịch vụ';
                }
                if (price.amount <= 0) {
                    errors[`servicePrices_${index}_amount`] = 'Giá phải lớn hơn 0';
                }
            }
        },
        [formData.servicePrices, isEdit]
    );

    return { validateServicePrices };
};
