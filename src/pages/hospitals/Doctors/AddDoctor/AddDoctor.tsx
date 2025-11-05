import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import AddDoctorFormFields from './AddDoctorFormFields';
import { AddDoctorFormData } from '@/types/doctor.types';
import { useAddDoctorForm } from '@/hooks/useAddDoctorForm';
import { useDoctorFormOptions } from '@/hooks/useDoctorFormOptions';
import { registerDoctor } from '@/services/auth.service';
import { RegisterDoctorRequest } from '@/types/auth.types';
import { Gender, Role } from '@/enums/common.enums';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

const AddDoctor: React.FC = () => {
    const navigate = useNavigate();
    const { roles } = useSelector((state: RootState) => state.auth);
    const { hospitalProfile } = useSelector((state: RootState) => state.user);
    const initialData: AddDoctorFormData = {
        fullName: '',
        email: '',
        address: '',
        gender: Gender.MALE,
        bio: '',
        yearsOfExperience: 0,
        avatar: null,
        positionId: '',
        specialtyId: '',
        hospitalId: '',
        languageIds: [],
        servicePrices: [],
    };

    const {
        formData,
        errors,
        handleInputChange,
        handleLanguageToggle,
        handleServicePriceChange,
        addServicePrice,
        removeServicePrice,
        validateForm,
        resetForm,
        prepareSubmitData,
    } = useAddDoctorForm({ initialData });

    const {
        positions,
        specialties,
        languages,
        serviceTypes,
        isLoading: isLoadingOptions,
    } = useDoctorFormOptions();

    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const primaryRole = roles[0]?.toUpperCase();

        // Check if doctor profile is loaded
        if (primaryRole === Role.STAFF && !hospitalProfile) {
            // Hospital profile not loaded yet - will be handled by component state
        }
    }, [roles, hospitalProfile]);

    // Helper function to extract error message from error response
    const extractErrorMessage = (error: any): string => {
        const defaultMessage = 'Có lỗi xảy ra khi thêm bác sĩ';
        if (!error.response?.data) {
            return error.message || defaultMessage;
        }

        const errorData = error.response.data;
        if (errorData.error) return errorData.error;
        if (errorData.message) return errorData.message;
        if (Array.isArray(errorData.errors) && errorData.errors.length > 0) {
            return errorData.errors[0];
        }
        return error.message || defaultMessage;
    };

    // Helper function to check if error is email duplicate
    const isEmailDuplicateError = (errorMessage: string): boolean => {
        const errorLower = errorMessage.toLowerCase();
        const hasEmail = errorLower.includes('email');
        const hasDuplicatePattern =
            errorLower.includes('already exists') ||
            errorLower.includes('already exist') ||
            errorLower.includes('đã tồn tại') ||
            errorLower.includes('account with email') ||
            (hasEmail && errorLower.includes('already'));

        return hasEmail && hasDuplicatePattern;
    };

    // Helper function to display error with appropriate message
    const displayError = (errorMessage: string) => {
        if (isEmailDuplicateError(errorMessage)) {
            toast.error('Email này đã được sử dụng. Vui lòng chọn email khác.', {
                autoClose: 5000,
            });
        } else {
            toast.error(errorMessage, { autoClose: 5000 });
        }
    };

    // Helper function to build register request
    const buildRegisterRequest = (
        doctorData: any,
        doctorLanguages: any[],
        doctorPrices: any[]
    ): RegisterDoctorRequest => {
        const genderString: 'MALE' | 'FEMALE' =
            doctorData.gender === Gender.MALE ? 'MALE' : 'FEMALE';

        return {
            email: doctorData.email,
            fullName: doctorData.fullName,
            gender: genderString,
            address: hospitalProfile?.address || '',
            doctorProfile: {
                positionId: doctorData.positionId,
                specialtyId: doctorData.specialtyId,
                hospitalId: hospitalProfile?.id || '',
                bio: doctorData.bio,
                yearsOfExperience: doctorData.yearsOfExperience,
                languageIds: doctorLanguages.map((lang) => lang.languageId),
                servicePrices: doctorPrices.map((price) => ({
                    serviceTypeId: price.serviceTypeId,
                    amount: price.amount,
                })),
            },
        };
    };

    // Helper function to handle successful registration
    const handleRegistrationSuccess = () => {
        toast.success(
            'Thêm bác sĩ thành công! Thông tin đăng nhập đã được gửi đến email của bác sĩ.',
            { autoClose: 5000 }
        );
        navigate('/hospitals/doctors');
    };

    // Helper function to handle registration response
    const handleRegistrationResponse = (response: any) => {
        if (response.success) {
            handleRegistrationSuccess();
        } else {
            const errorMessage = response.message || 'Có lỗi xảy ra khi thêm bác sĩ';
            displayError(errorMessage);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error('Vui lòng kiểm tra lại thông tin');
            return;
        }

        try {
            setIsSubmitting(true);
            const { doctorData, doctorLanguages, doctorPrices } = prepareSubmitData();
            const registerRequest = buildRegisterRequest(doctorData, doctorLanguages, doctorPrices);
            const response = await registerDoctor(registerRequest);
            handleRegistrationResponse(response);
        } catch (error: any) {
            const errorMessage = extractErrorMessage(error);
            displayError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        resetForm();
        navigate('/hospitals/doctors');
    };

    return (
        <div className="content">
            <div className="d-flex align-items-sm-center flex-sm-row flex-column gap-2 mb-3 pb-3 border-bottom">
                <div className="flex-grow-1">
                    <h4 className="fw-bold mb-0">Thêm Bác Sĩ</h4>
                </div>
            </div>
            <div className="row">
                <div className="col-sm-12">
                    <AddDoctorFormFields
                        formData={formData}
                        errors={errors}
                        onInputChange={handleInputChange}
                        onLanguageToggle={handleLanguageToggle}
                        onServicePriceChange={handleServicePriceChange}
                        onAddServicePrice={addServicePrice}
                        onRemoveServicePrice={removeServicePrice}
                        onSubmit={handleSubmit}
                        onCancel={handleCancel}
                        isLoading={isLoadingOptions || isSubmitting}
                        positions={positions}
                        specialties={specialties}
                        languages={languages}
                        serviceTypes={serviceTypes}
                    />
                </div>
            </div>
        </div>
    );
};

export default AddDoctor;
