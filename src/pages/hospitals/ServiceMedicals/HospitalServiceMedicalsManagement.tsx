import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { AppDispatch } from '@/store';
import { useCurrentUserProfile } from '@/hooks/useCurrentUserProfile';
import { updateHospitalProfile, fetchProfileByRole } from '@/store/slices/userSlice';
import { Role } from '@/enums/common.enums';
import Button from '@/components/Button';
import Spinner from '@/components/Spinner';
import axiosInstance from '@/configs/axios.config';
import styles from './HospitalServiceMedicalsManagement.module.scss';

interface ServiceMedicalCategory {
    id: string;
    name: string;
    description?: string;
    imageUrl?: string;
    status?: string;
}

const HospitalServiceMedicalsManagement: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { profile, hospitalProfile } = useCurrentUserProfile();
    const hospitalId = hospitalProfile?.id || (profile as any)?.id;

    // State
    const [allServiceMedicals, setAllServiceMedicals] = useState<ServiceMedicalCategory[]>([]);
    const [selectedServiceMedicalIds, setSelectedServiceMedicalIds] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Load all service medicals and current hospital service medicals
    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                // Load all active service medical categories
                const response = await axiosInstance.get('/service-categories/active');
                console.log('Service medicals response:', response);

                let serviceMedicalsList: ServiceMedicalCategory[] = [];
                const responseData = response.data as any;

                if (Array.isArray(responseData)) {
                    serviceMedicalsList = responseData;
                    console.log(
                        'Found service medicals as direct array:',
                        serviceMedicalsList.length
                    );
                } else if (responseData?.data && Array.isArray(responseData.data)) {
                    serviceMedicalsList = responseData.data;
                    console.log('Found service medicals in data:', serviceMedicalsList.length);
                } else if (responseData?.categories && Array.isArray(responseData.categories)) {
                    serviceMedicalsList = responseData.categories;
                    console.log(
                        'Found service medicals in categories:',
                        serviceMedicalsList.length
                    );
                } else {
                    console.warn('Unknown response structure:', responseData);
                }

                console.log('All service medicals before filter:', serviceMedicalsList);

                // Filter only ACTIVE service medicals (or show all if status field doesn't exist)
                const activeServiceMedicals = serviceMedicalsList.filter(
                    (s: ServiceMedicalCategory) => !s.status || s.status === 'ACTIVE'
                );

                console.log('Active service medicals count:', activeServiceMedicals.length);

                // If no ACTIVE service medicals but we have data, show all
                if (activeServiceMedicals.length === 0 && serviceMedicalsList.length > 0) {
                    console.log('No ACTIVE service medicals found, showing all service medicals');
                    setAllServiceMedicals(serviceMedicalsList);
                } else {
                    setAllServiceMedicals(activeServiceMedicals);
                }

                // Load current hospital service medicals
                console.log('=== Loading Hospital Service Medicals ===');
                console.log('Hospital profile serviceMedicals:', hospitalProfile?.serviceMedicals);

                const serviceMedicals =
                    hospitalProfile?.serviceMedicals ||
                    (hospitalProfile as any)?.ServiceMedicals ||
                    (hospitalProfile as any)?.service_medicals ||
                    [];

                console.log('ServiceMedicals after fallback:', serviceMedicals);

                if (serviceMedicals && serviceMedicals.length > 0) {
                    const currentServiceMedicalIds = serviceMedicals
                        .map((s: any) => {
                            const id = s.serviceMedicalId || s.id || s.ServiceMedicalId || s.Id;
                            console.log(
                                'Mapping service medical object:',
                                s,
                                '-> extracted id:',
                                id
                            );
                            return id;
                        })
                        .filter(Boolean);

                    console.log('Current hospital service medical IDs:', currentServiceMedicalIds);
                    setSelectedServiceMedicalIds(currentServiceMedicalIds);
                } else {
                    console.warn('=== NO SERVICE MEDICALS FOUND ===');
                }
            } catch (error: any) {
                console.error('Error loading service medicals:', error);
                toast.error(
                    error?.message || 'Không thể tải danh sách dịch vụ bệnh viện. Vui lòng thử lại!'
                );
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [hospitalProfile]);

    // Filter service medicals by search term
    const filteredServiceMedicals = allServiceMedicals.filter((serviceMedical) =>
        serviceMedical.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Handle service medical toggle
    const handleServiceMedicalToggle = (serviceMedicalId: string) => {
        setSelectedServiceMedicalIds((prev) => {
            if (prev.includes(serviceMedicalId)) {
                return prev.filter((id) => id !== serviceMedicalId);
            } else {
                return [...prev, serviceMedicalId];
            }
        });
    };

    // Handle save
    const handleSave = async () => {
        if (!hospitalId) {
            toast.error('Không tìm thấy thông tin bệnh viện!');
            return;
        }

        if (!hospitalProfile) {
            toast.error('Không tìm thấy thông tin bệnh viện. Vui lòng tải lại trang!');
            return;
        }

        setIsSaving(true);
        try {
            // Include required fields from current hospital profile
            await dispatch(
                updateHospitalProfile({
                    hospitalId,
                    updateData: {
                        name: hospitalProfile.name,
                        address: hospitalProfile.address || '',
                        description: hospitalProfile.description || '',
                        serviceMedicalIds: selectedServiceMedicalIds,
                    },
                })
            ).unwrap();

            // Reload hospital profile to get updated data
            await dispatch(fetchProfileByRole({ role: Role.STAFF }));

            toast.success('Cập nhật dịch vụ bệnh viện thành công!');
        } catch (error: any) {
            console.error('Error updating service medicals:', error);
            const errorMessage =
                error?.message || 'Không thể cập nhật dịch vụ bệnh viện. Vui lòng thử lại!';
            toast.error(errorMessage);
        } finally {
            setIsSaving(false);
        }
    };

    // Check if has changes
    const currentServiceMedicalIds =
        hospitalProfile?.serviceMedicals
            ?.map((s: any) => s.serviceMedicalId || s.id)
            .filter(Boolean) || [];
    const hasChanges =
        selectedServiceMedicalIds.length !== currentServiceMedicalIds.length ||
        selectedServiceMedicalIds.some((id) => !currentServiceMedicalIds.includes(id)) ||
        currentServiceMedicalIds.some((id) => !selectedServiceMedicalIds.includes(id));

    if (isLoading) {
        return (
            <div className="content">
                <div
                    className="d-flex justify-content-center align-items-center"
                    style={{ minHeight: '400px' }}
                >
                    <Spinner size="large" variant="primary" />
                </div>
            </div>
        );
    }

    return (
        <div className={`content ${styles.pageContainer}`}>
            <div className={styles.contentWrapper}>
                {/* Header */}
                <div className="mb-3 border-bottom pb-3">
                    <h4 className="fw-bold mb-0">Quản lý dịch vụ bệnh viện</h4>
                    <p className="text-muted mt-2 mb-0">
                        Chọn các dịch vụ bệnh viện mà bệnh viện của bạn cung cấp
                    </p>
                </div>

                {/* Search and Filter Bar */}
                <div
                    className={`d-flex align-items-center flex-wrap gap-3 mb-4 ${styles.searchBar}`}
                >
                    <div className={styles.searchInput}>
                        <div className={styles.inputIconStart}>
                            <i className={`ti ti-search ${styles.inputIconAddon}`}></i>
                            <input
                                type="search"
                                className={`form-control ${styles.formControl}`}
                                placeholder="Tìm kiếm dịch vụ bệnh viện..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    {/* Selected count */}
                    <div className={styles.selectedCount}>
                        <span className="badge badge-soft-primary fs-13 fw-medium">
                            Đã chọn: {selectedServiceMedicalIds.length} /{' '}
                            {allServiceMedicals.length} dịch vụ
                        </span>
                    </div>
                </div>

                {/* Service medicals grid */}
                <div className={styles.serviceMedicalsGrid}>
                    {filteredServiceMedicals.length === 0 ? (
                        <div className="text-center py-5">
                            <p className="text-muted">Không tìm thấy dịch vụ bệnh viện nào</p>
                        </div>
                    ) : (
                        filteredServiceMedicals.map((serviceMedical) => {
                            const isSelected = selectedServiceMedicalIds.includes(
                                serviceMedical.id
                            );
                            return (
                                <div
                                    key={serviceMedical.id}
                                    className={`${styles.serviceMedicalCard} ${isSelected ? styles.selected : ''}`}
                                    onClick={() => handleServiceMedicalToggle(serviceMedical.id)}
                                >
                                    <div className={styles.serviceMedicalCardContent}>
                                        <div className={styles.checkboxWrapper}>
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() =>
                                                    handleServiceMedicalToggle(serviceMedical.id)
                                                }
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        </div>
                                        <div className={styles.serviceMedicalImage}>
                                            <img
                                                src={
                                                    serviceMedical.imageUrl ||
                                                    'https://via.placeholder.com/80x80?text=No+Image'
                                                }
                                                alt={serviceMedical.name}
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src =
                                                        'https://via.placeholder.com/80x80?text=No+Image';
                                                }}
                                            />
                                        </div>
                                        <div className={styles.serviceMedicalName}>
                                            {serviceMedical.name}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Save button at bottom */}
                {hasChanges && (
                    <div className="mt-4 d-flex justify-content-end">
                        <Button
                            variant="primary"
                            size="md"
                            onClick={handleSave}
                            disabled={isSaving}
                            icon={isSaving ? undefined : 'ti ti-device-floppy'}
                        >
                            {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HospitalServiceMedicalsManagement;
