import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DoctorFormFields from '../components/DoctorFormFields';
import { DoctorFormData } from '@/types/doctor.types';
import { useDoctorFormLogic } from '@/hooks/useDoctorFormLogic';
import {
    getPositions,
    getSpecialties,
    getLanguages,
    getServiceTypes,
} from '@/services/doctor.service';

const AddDoctor: React.FC = () => {
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
        handleInputChange,
        handleLanguageToggle,
        handleServicePriceChange,
        addServicePrice,
        removeServicePrice,
        handleFileChange,
        validateForm,
        resetForm,
        prepareSubmitData,
    } = useDoctorFormLogic({ initialData, isEdit: false });

    const [positions, setPositions] = useState<Array<{ id: string; name: string }>>([]);
    const [specialties, setSpecialties] = useState<Array<{ id: string; name: string }>>([]);
    const [languages, setLanguages] = useState<Array<{ id: string; name: string }>>([]);
    const [serviceTypes, setServiceTypes] = useState<Array<{ id: string; name: string }>>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [isSubmitting] = useState(false); // Placeholder for future submit logic

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoadingData(true);
                const [positionsRes, specialtiesRes, languagesRes, servicesRes] = await Promise.all(
                    [getPositions(), getSpecialties(), getLanguages(), getServiceTypes()]
                );

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
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm()) {
            const { doctorData, doctorLanguages, doctorPrices } = prepareSubmitData();

            console.log('=== DOCTOR DATA ===');
            console.log('Doctor Data:', doctorData);
            console.log('Doctor Languages:', doctorLanguages);
            console.log('Doctor Prices:', doctorPrices);
            console.log('==================');

            alert('Thêm bác sĩ thành công!');
            navigate('/hospitals/doctors');
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
                        isEdit={false}
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

export default AddDoctor;
