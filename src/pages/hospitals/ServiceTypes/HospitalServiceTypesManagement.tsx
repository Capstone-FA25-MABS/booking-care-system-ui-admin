import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { AppDispatch } from '@/store';
import { useCurrentUserProfile } from '@/hooks/useCurrentUserProfile';
import { fetchProfileByRole } from '@/store/slices/userSlice';
import { getAllServiceTypesSimple } from '@/services/serviceType.service';
import { ServiceType } from '@/types/serviceType.types';
import { Role } from '@/enums/common.enums';
import Button from '@/components/Button';
import Spinner from '@/components/Spinner';
import styles from './HospitalServiceTypesManagement.module.scss';
import HospitalService from '@/services/hospital.service';

const HospitalServiceTypesManagement: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { profile, hospitalProfile, role } = useCurrentUserProfile();
    const hospitalId = hospitalProfile?.id || (profile as any)?.id;

    // State
    const [allServiceTypes, setAllServiceTypes] = useState<ServiceType[]>([]);
    const [selectedServiceTypeIds, setSelectedServiceTypeIds] = useState<string[]>([]);
    const [initialServiceTypeIds, setInitialServiceTypeIds] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Ensure hospital profile is loaded for STAFF role
    useEffect(() => {
        if (role === Role.STAFF && !hospitalProfile) {
            dispatch(fetchProfileByRole({ role }));
        }
    }, [role, hospitalProfile, dispatch]);

    // Helper: safely extract serviceTypeId from various backend shapes
    const extractServiceTypeId = (item: any): string | undefined => {
        if (!item) return undefined;
        // Common shapes:
        // - { serviceTypeId: string }
        // - { id: string }
        // - { ServiceTypeId: string } (legacy/casing)
        // - { Id: string } (legacy/casing)
        // - { serviceType: { id: string } } (nested)
        return (
            item.serviceTypeId ||
            item.id ||
            item.ServiceTypeId ||
            item.Id ||
            item.serviceType?.id ||
            item.ServiceType?.Id
        );
    };

    // Load all service types and current hospital service types
    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                // Load all active service types using getAllServiceTypesSimple (no pagination)
                const serviceTypesResponse = await getAllServiceTypesSimple();

                // Handle both response structures: array directly or wrapped in data
                let serviceTypesList: ServiceType[] = [];
                const responseData = serviceTypesResponse.data as any;

                if (Array.isArray(responseData)) {
                    serviceTypesList = responseData;
                } else if (responseData?.items && Array.isArray(responseData.items)) {
                    serviceTypesList = responseData.items;
                } else if (responseData?.serviceTypes && Array.isArray(responseData.serviceTypes)) {
                    serviceTypesList = responseData.serviceTypes;
                }

                // Filter only ACTIVE service types (or show all if status field doesn't exist)
                const activeServiceTypes = serviceTypesList.filter(
                    (s: ServiceType) => !s.status || s.status === 'ACTIVE'
                );

                // If no ACTIVE service types but we have data, show all
                if (activeServiceTypes.length === 0 && serviceTypesList.length > 0) {
                    setAllServiceTypes(serviceTypesList);
                } else {
                    setAllServiceTypes(activeServiceTypes);
                }

                // Load current hospital service types via lightweight endpoint
                if (hospitalId) {
                    const idsResponse = await HospitalService.getHospitalServiceTypeIds(hospitalId);
                    const idsData = idsResponse.data as any;
                    const currentIds: string[] = Array.isArray(idsData)
                        ? (idsData
                              .map((x: any) =>
                                  typeof x === 'string' ? x : extractServiceTypeId(x)
                              )
                              .filter(Boolean) as string[])
                        : [];
                    setSelectedServiceTypeIds(currentIds);
                    setInitialServiceTypeIds(currentIds);
                }
            } catch (error: any) {
                console.error('Error loading service types:', error);
                toast.error(
                    error?.message || 'Không thể tải danh sách dịch vụ bác sĩ. Vui lòng thử lại!'
                );
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [hospitalProfile]);

    // Filter service types by search term
    const filteredServiceTypes = allServiceTypes.filter((serviceType) =>
        serviceType.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Handle service type toggle
    const handleServiceTypeToggle = (serviceTypeId: string) => {
        setSelectedServiceTypeIds((prev) => {
            if (prev.includes(serviceTypeId)) {
                return prev.filter((id) => id !== serviceTypeId);
            } else {
                return [...prev, serviceTypeId];
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
            // Update only hospital service types
            await HospitalService.updateHospitalServiceTypes(hospitalId, selectedServiceTypeIds);
            // No need to refresh profile - update local state only for better performance

            // Update baseline for change detection
            setInitialServiceTypeIds(selectedServiceTypeIds);

            toast.success('Cập nhật dịch vụ bác sĩ thành công!');
        } catch (error: any) {
            console.error('Error updating service types:', error);
            const errorMessage =
                error?.message || 'Không thể cập nhật dịch vụ bác sĩ. Vui lòng thử lại!';
            toast.error(errorMessage);
        } finally {
            setIsSaving(false);
        }
    };

    // Check if there are changes based on initial snapshot
    const hasChanges =
        selectedServiceTypeIds.length !== initialServiceTypeIds.length ||
        selectedServiceTypeIds.some((id) => !initialServiceTypeIds.includes(id)) ||
        initialServiceTypeIds.some((id) => !selectedServiceTypeIds.includes(id));

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
                    <h4 className="fw-bold mb-0">Quản lý dịch vụ bác sĩ</h4>
                    <p className="text-muted mt-2 mb-0">
                        Chọn các dịch vụ bác sĩ mà bệnh viện của bạn cung cấp
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
                                placeholder="Tìm kiếm dịch vụ bác sĩ..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    {/* Selected count */}
                    <div className={styles.selectedCount}>
                        <span className="badge badge-soft-primary fs-13 fw-medium">
                            Đã chọn: {selectedServiceTypeIds.length} / {allServiceTypes.length} dịch
                            vụ
                        </span>
                    </div>
                </div>

                {/* Service types grid */}
                <div className={styles.serviceTypesGrid}>
                    {filteredServiceTypes.length === 0 ? (
                        <div className="text-center py-5">
                            <p className="text-muted">Không tìm thấy dịch vụ bác sĩ nào</p>
                        </div>
                    ) : (
                        filteredServiceTypes.map((serviceType) => {
                            const isSelected = selectedServiceTypeIds.includes(serviceType.id);
                            const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    handleServiceTypeToggle(serviceType.id);
                                }
                            };
                            return (
                                <div
                                    key={serviceType.id}
                                    role="button"
                                    tabIndex={0}
                                    aria-label={`${isSelected ? 'Bỏ chọn' : 'Chọn'} dịch vụ ${serviceType.name}`}
                                    aria-pressed={isSelected}
                                    className={`${styles.serviceTypeCard} ${isSelected ? styles.selected : ''}`}
                                    onClick={() => handleServiceTypeToggle(serviceType.id)}
                                    onKeyDown={handleKeyDown}
                                >
                                    <div className={styles.serviceTypeCardContent}>
                                        <div className={styles.checkboxWrapper}>
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() =>
                                                    handleServiceTypeToggle(serviceType.id)
                                                }
                                                onClick={(e) => e.stopPropagation()}
                                                aria-label={`${isSelected ? 'Bỏ chọn' : 'Chọn'} dịch vụ ${serviceType.name}`}
                                            />
                                        </div>
                                        <div className={styles.serviceTypeImage}>
                                            <img
                                                src={serviceType.imageUrl}
                                                alt={serviceType.name}
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src =
                                                        'https://via.placeholder.com/80x80?text=No+Image';
                                                }}
                                            />
                                        </div>
                                        <div className={styles.serviceTypeName}>
                                            {serviceType.name}
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

export default HospitalServiceTypesManagement;
