import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import DoctorFormFields from '../components/DoctorFormFields';
import { DoctorFormData } from '@/types/doctor.types';
import { useDoctorFormLogic } from '@/hooks/useDoctorFormLogic';
import { useDoctorFormOptions } from '@/hooks/useDoctorFormOptions';
import {
    prepareDoctorUpdatePayload,
    fetchDoctorDataForForm,
    handleDoctorFormError,
} from '@/utils/doctor.utils';
import {
    getDoctorById,
    getDoctorPrices,
    updateDoctor,
    updateDoctorWithAvatar,
} from '@/services/doctor.service';

const EditDoctor: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const initialData: DoctorFormData = {
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

    const {
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
    } = useDoctorFormLogic({ initialData, isEdit: true, doctorId: id });

    const {
        positions,
        specialties,
        languages,
        serviceTypes,
        isLoading: isLoadingOptions,
    } = useDoctorFormOptions();

    const [isLoadingDoctor, setIsLoadingDoctor] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchDoctorData = async () => {
            if (!id) return;
            try {
                setIsLoadingDoctor(true);
                const formMapped = await fetchDoctorDataForForm(id, getDoctorById, getDoctorPrices);
                setFormData(formMapped);
            } catch {
                // fallback silently; could show toast
            } finally {
                setIsLoadingDoctor(false);
            }
        };
        fetchDoctorData();
    }, [id, setFormData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm() || !id) return;

        const { doctorData, doctorPrices } = prepareSubmitData();

        try {
            setIsSubmitting(true);

            // Prepare common payload (email is excluded from update)
            const basePayload = prepareDoctorUpdatePayload({
                id,
                doctorData,
                languageIds: formData.languageIds,
                doctorPrices,
            });

            // Update with or without avatar file
            if (doctorData.avatar && doctorData.avatar instanceof File) {
                await updateDoctorWithAvatar(id, {
                    ...basePayload,
                    avatarFile: doctorData.avatar,
                });
            } else {
                await updateDoctor(id, basePayload);
            }

            toast.success('Cập nhật bác sĩ thành công!');
            navigate('/hospitals/doctors');
        } catch (err: any) {
            try {
                handleDoctorFormError(err, setErrors, 'Cập nhật bác sĩ thất bại');
            } catch (error: any) {
                toast.error(error.message || 'Cập nhật bác sĩ thất bại');
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
                    <h4 className="fw-bold mb-0">Chỉnh sửa bác sĩ</h4>
                </div>
            </div>
            <div className="row">
                <div className="col-sm-12">
                    <DoctorFormFields
                        formData={formData}
                        errors={errors}
                        onInputChange={handleInputChange}
                        onLanguageToggle={handleLanguageToggle}
                        onServicePriceChange={handleServicePriceChange}
                        onAddServicePrice={addServicePrice}
                        onRemoveServicePrice={removeServicePrice}
                        onFileChange={handleFileChange}
                        onSubmit={handleSubmit}
                        onCancel={handleCancel}
                        isEdit={true}
                        isLoading={isLoadingOptions || isLoadingDoctor || isSubmitting}
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

export default EditDoctor;
