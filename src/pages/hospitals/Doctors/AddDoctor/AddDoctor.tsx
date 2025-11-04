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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error('Vui lòng kiểm tra lại thông tin');
            return;
        }

        try {
            setIsSubmitting(true);
            const { doctorData, doctorLanguages, doctorPrices } = prepareSubmitData();

            // Prepare RegisterDoctorRequest
            // Convert Gender enum to string for backend
            const genderString: 'MALE' | 'FEMALE' =
                doctorData.gender === Gender.MALE ? 'MALE' : 'FEMALE';

            const registerRequest: RegisterDoctorRequest = {
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

            const response = await registerDoctor(registerRequest);

            if (response.success) {
                toast.success(
                    'Thêm bác sĩ thành công! Thông tin đăng nhập đã được gửi đến email của bác sĩ.',
                    { autoClose: 5000 }
                );
                navigate('/hospitals/doctors');
            } else {
                // Extract and display detailed error message
                const errorMessage = response.message || 'Có lỗi xảy ra khi thêm bác sĩ';

                // Check if it's an email duplicate error
                const errorLower = errorMessage.toLowerCase();
                if (
                    errorLower.includes('email') &&
                    (errorLower.includes('already exists') ||
                        errorLower.includes('đã tồn tại') ||
                        errorLower.includes('already exist'))
                ) {
                    toast.error('Email này đã được sử dụng. Vui lòng chọn email khác.', {
                        autoClose: 5000,
                    });
                } else {
                    toast.error(errorMessage, { autoClose: 5000 });
                }
            }
        } catch (error: any) {
            // Extract detailed error message
            let errorMessage = error.message || 'Có lỗi xảy ra khi thêm bác sĩ';

            // Check if error.response.data has more details
            if (error.response?.data) {
                const errorData = error.response.data;
                // Priority: error field > message field > errors array
                if (errorData.error) {
                    errorMessage = errorData.error;
                } else if (errorData.message) {
                    errorMessage = errorData.message;
                } else if (
                    errorData.errors &&
                    Array.isArray(errorData.errors) &&
                    errorData.errors.length > 0
                ) {
                    errorMessage = errorData.errors[0];
                }
            }

            // Normalize error message to lowercase for detection
            const errorLower = errorMessage.toLowerCase();

            // Check if it's an email duplicate error (multiple patterns)
            const isEmailDuplicate =
                errorLower.includes('email') &&
                (errorLower.includes('already exists') ||
                    errorLower.includes('already exist') ||
                    errorLower.includes('đã tồn tại') ||
                    errorLower.includes('already exists') ||
                    errorLower.includes('account with email') ||
                    (errorLower.includes('email') && errorLower.includes('already')));

            if (isEmailDuplicate) {
                toast.error('Email này đã được sử dụng. Vui lòng chọn email khác.', {
                    autoClose: 5000,
                });
            } else {
                // Display the error message (may be in English or Vietnamese)
                toast.error(errorMessage, { autoClose: 5000 });
            }
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
