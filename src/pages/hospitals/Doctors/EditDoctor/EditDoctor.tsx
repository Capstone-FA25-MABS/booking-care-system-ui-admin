import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import DoctorFormFields from '../components/DoctorFormFields';
import { DoctorFormData } from '@/types/doctor.types';
import { useDoctorFormLogic } from '@/hooks/useDoctorFormLogic';
import {
    getDoctorById,
    getDoctorPrices,
    updateDoctor,
    updateDoctorWithAvatar,
    getPositions,
    getSpecialties,
    getLanguages,
    getServiceTypes,
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

    const [positions, setPositions] = useState<Array<{ id: string; name: string }>>([]);
    const [specialties, setSpecialties] = useState<Array<{ id: string; name: string }>>([]);
    const [languages, setLanguages] = useState<Array<{ id: string; name: string }>>([]);
    const [serviceTypes, setServiceTypes] = useState<Array<{ id: string; name: string }>>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            try {
                setIsLoadingData(true);
                const [
                    doctorRes,
                    pricesRes,
                    positionsRes,
                    specialtiesRes,
                    languagesRes,
                    servicesRes,
                ] = await Promise.all([
                    getDoctorById(id),
                    getDoctorPrices(id),
                    getPositions(),
                    getSpecialties(),
                    getLanguages(),
                    getServiceTypes(),
                ]);

                const d = doctorRes.data as any; // DoctorByIdResponse
                const formMapped: DoctorFormData = {
                    firstName: d.firstName || '',
                    lastName: d.lastName || '',
                    email: d.email || '',
                    phone: '',
                    dateOfBirth: '',
                    address: d.address || '',
                    gender: (d.gender as any) || '',
                    bio: d.bio || '',
                    yearsOfExperience: d.yearsOfExperience || 0,
                    avatar: d.avatarUrl || null,
                    positionId: d.position?.id || '',
                    specialtyId: d.specialty?.id || '',
                    hospitalId: d.hospital?.id || '',
                    languageIds: (d.languages || []).map((l: any) => l.id),
                    servicePrices: (pricesRes.data || []).map((p: any) => ({
                        id: p.id,
                        serviceTypeId: p.serviceTypeId,
                        amount: Number(p.amount),
                    })),
                };
                setFormData(formMapped);

                setPositions(
                    (positionsRes.data || []).map((p: any) => ({ id: p.id, name: p.name }))
                );
                setSpecialties(
                    (specialtiesRes.data || []).map((s: any) => ({ id: s.id, name: s.name }))
                );
                setLanguages(
                    (languagesRes.data || []).map((l: any) => ({ id: l.id, name: l.name }))
                );
                setServiceTypes(
                    (servicesRes.data || []).map((s: any) => ({ id: s.id, name: s.name }))
                );
            } catch {
                // fallback silently; could show toast
            } finally {
                setIsLoadingData(false);
            }
        };
        fetchData();
    }, [id, setFormData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm() || !id) return;

        const { doctorData, doctorPrices } = prepareSubmitData();

        try {
            setIsSubmitting(true);
            if (doctorData.avatar && doctorData.avatar instanceof File) {
                await updateDoctorWithAvatar(id, {
                    id,
                    email: formData.email, // Include email in update
                    firstName: doctorData.firstName,
                    lastName: doctorData.lastName,
                    address: doctorData.address,
                    gender: doctorData.gender as 'MALE' | 'FEMALE' | 'OTHER',
                    bio: doctorData.bio,
                    yearsOfExperience: doctorData.yearsOfExperience,
                    positionId: doctorData.positionId,
                    specialtyId: doctorData.specialtyId,
                    hospitalId: doctorData.hospitalId,
                    languageIds: formData.languageIds,
                    prices: doctorPrices.map((p) => ({
                        serviceTypeId: p.serviceTypeId,
                        amount: p.amount,
                    })),
                    avatarFile: doctorData.avatar,
                });
            } else {
                await updateDoctor(id, {
                    id,
                    email: formData.email, // Include email in update
                    firstName: doctorData.firstName,
                    lastName: doctorData.lastName,
                    address: doctorData.address,
                    gender: doctorData.gender as 'MALE' | 'FEMALE' | 'OTHER',
                    bio: doctorData.bio,
                    yearsOfExperience: doctorData.yearsOfExperience,
                    positionId: doctorData.positionId,
                    specialtyId: doctorData.specialtyId,
                    hospitalId: doctorData.hospitalId,
                    languageIds: formData.languageIds,
                    prices: doctorPrices.map((p) => ({
                        serviceTypeId: p.serviceTypeId,
                        amount: p.amount,
                    })),
                    // keep existing avatar if any; backend ignores nulls
                });
            }

            toast.success('Cập nhật bác sĩ thành công!');
            navigate('/hospitals/doctors');
        } catch (err: any) {
            const server = err?.response?.data;
            const errorMessages: string[] = server?.errors || [];

            if (Array.isArray(errorMessages) && errorMessages.length) {
                const fieldErrorMap: Record<string, string> = {};
                errorMessages.forEach((msg: string) => {
                    const [field, ...rest] = msg.split(':');
                    const message = rest.join(':').trim() || msg;
                    const key = (field || '').trim().toLowerCase();
                    if (key.includes('email')) fieldErrorMap.email = message;
                    if (key.includes('firstname')) fieldErrorMap.firstName = message;
                    if (key.includes('lastname')) fieldErrorMap.lastName = message;
                    if (key.includes('address')) fieldErrorMap.address = message;
                    if (key.includes('gender')) fieldErrorMap.gender = message;
                    if (key.includes('bio')) fieldErrorMap.bio = message;
                    if (key.includes('years')) fieldErrorMap.yearsOfExperience = message;
                    if (key.includes('position')) fieldErrorMap.positionId = message;
                    if (key.includes('specialty')) fieldErrorMap.specialtyId = message;
                    if (key.includes('hospital')) fieldErrorMap.hospitalId = message;
                    if (key.includes('language')) fieldErrorMap.languageIds = message;
                    if (key.includes('price') || key.includes('amount'))
                        fieldErrorMap.servicePrices = message;
                });
                if (Object.keys(fieldErrorMap).length) {
                    setErrors(fieldErrorMap as any);
                }

                // Check for email conflict error specifically
                const emailConflictError = errorMessages.find(
                    (msg: string) =>
                        msg.toLowerCase().includes('email') &&
                        (msg.toLowerCase().includes('đã tồn tại') ||
                            msg.toLowerCase().includes('already exists'))
                );
                if (emailConflictError) {
                    toast.error(emailConflictError);
                    return;
                }

                toast.error(server?.message || 'Cập nhật thất bại. Vui lòng kiểm tra dữ liệu.');
                return;
            }

            toast.error(err?.message || 'Cập nhật bác sĩ thất bại');
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
                    <h4 className="fw-bold mb-0">Chỉnh sửa Bác Sĩ</h4>
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
                        isLoading={isLoadingData || isSubmitting}
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
