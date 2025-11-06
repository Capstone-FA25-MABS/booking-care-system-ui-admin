import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { AppDispatch } from '@/store';
import { useCurrentUserProfile } from '@/hooks/useCurrentUserProfile';
import { updateHospitalProfile, fetchProfileByRole } from '@/store/slices/userSlice';
import { getAllSpecialtiesSimple } from '@/services/specialty.service';
import { Specialty } from '@/types/specialty.types';
import { Role } from '@/enums/common.enums';
import Button from '@/components/Button';
import Spinner from '@/components/Spinner';
import styles from './HospitalSpecialtiesManagement.module.scss';

const HospitalSpecialtiesManagement: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { profile, hospitalProfile } = useCurrentUserProfile();
    const hospitalId = hospitalProfile?.id || (profile as any)?.id;

    // State
    const [allSpecialties, setAllSpecialties] = useState<Specialty[]>([]);
    const [selectedSpecialtyIds, setSelectedSpecialtyIds] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Load all specialties and current hospital specialties
    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                // Load all active specialties using getAllSpecialtiesSimple (no pagination)
                const specialtiesResponse = await getAllSpecialtiesSimple();

                // Handle both response structures: array directly or wrapped in data
                let specialtiesList: Specialty[] = [];
                const responseData = specialtiesResponse.data as any;

                if (Array.isArray(responseData)) {
                    specialtiesList = responseData;
                } else if (responseData?.items && Array.isArray(responseData.items)) {
                    specialtiesList = responseData.items;
                } else if (responseData?.specialties && Array.isArray(responseData.specialties)) {
                    specialtiesList = responseData.specialties;
                }

                // Filter only ACTIVE specialties (or show all if status field doesn't exist)
                const activeSpecialties = specialtiesList.filter(
                    (s: Specialty) => !s.status || s.status === 'ACTIVE'
                );

                // If no ACTIVE specialties but we have data, show all
                if (activeSpecialties.length === 0 && specialtiesList.length > 0) {
                    setAllSpecialties(specialtiesList);
                } else {
                    setAllSpecialties(activeSpecialties);
                }

                // Load current hospital specialties
                if (hospitalProfile?.specialties && hospitalProfile.specialties.length > 0) {
                    const currentSpecialtyIds = hospitalProfile.specialties
                        .map((s: any) => {
                            // Handle both structures: { specialtyId: string } or { id: string }
                            return s.specialtyId || s.id;
                        })
                        .filter(Boolean); // Remove any undefined/null values
                    setSelectedSpecialtyIds(currentSpecialtyIds);
                }
            } catch (error: any) {
                console.error('Error loading specialties:', error);
                toast.error(
                    error?.message || 'Không thể tải danh sách chuyên khoa. Vui lòng thử lại!'
                );
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [hospitalProfile]);

    // Filter specialties by search term
    const filteredSpecialties = allSpecialties.filter((specialty) =>
        specialty.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Handle specialty toggle
    const handleSpecialtyToggle = (specialtyId: string) => {
        setSelectedSpecialtyIds((prev) => {
            if (prev.includes(specialtyId)) {
                return prev.filter((id) => id !== specialtyId);
            } else {
                return [...prev, specialtyId];
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
                        specialtyIds: selectedSpecialtyIds,
                    },
                })
            ).unwrap();

            // Reload hospital profile to get updated data
            await dispatch(fetchProfileByRole({ role: Role.STAFF }));

            toast.success('Cập nhật chuyên khoa thành công!');
        } catch (error: any) {
            console.error('Error updating specialties:', error);
            const errorMessage =
                error?.message || 'Không thể cập nhật chuyên khoa. Vui lòng thử lại!';
            toast.error(errorMessage);
        } finally {
            setIsSaving(false);
        }
    };

    // Check if has changes
    const currentSpecialtyIds =
        hospitalProfile?.specialties?.map((s: any) => s.specialtyId || s.id).filter(Boolean) || [];
    const hasChanges =
        selectedSpecialtyIds.length !== currentSpecialtyIds.length ||
        selectedSpecialtyIds.some((id) => !currentSpecialtyIds.includes(id)) ||
        currentSpecialtyIds.some((id) => !selectedSpecialtyIds.includes(id));

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
                    <h4 className="fw-bold mb-0">Quản lý chuyên khoa</h4>
                    <p className="text-muted mt-2 mb-0">
                        Chọn các chuyên khoa mà bệnh viện của bạn cung cấp dịch vụ
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
                                placeholder="Tìm kiếm chuyên khoa..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    {/* Selected count */}
                    <div className={styles.selectedCount}>
                        <span className="badge badge-soft-primary fs-13 fw-medium">
                            Đã chọn: {selectedSpecialtyIds.length} / {allSpecialties.length} chuyên
                            khoa
                        </span>
                    </div>
                </div>

                {/* Specialties grid */}
                <div className={styles.specialtiesGrid}>
                    {filteredSpecialties.length === 0 ? (
                        <div className="text-center py-5">
                            <p className="text-muted">Không tìm thấy chuyên khoa nào</p>
                        </div>
                    ) : (
                        filteredSpecialties.map((specialty) => {
                            const isSelected = selectedSpecialtyIds.includes(specialty.id);
                            return (
                                <div
                                    key={specialty.id}
                                    className={`${styles.specialtyCard} ${isSelected ? styles.selected : ''}`}
                                    onClick={() => handleSpecialtyToggle(specialty.id)}
                                >
                                    <div className={styles.specialtyCardContent}>
                                        <div className={styles.checkboxWrapper}>
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => handleSpecialtyToggle(specialty.id)}
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        </div>
                                        <div className={styles.specialtyImage}>
                                            <img
                                                src={specialty.imageUrl}
                                                alt={specialty.name}
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src =
                                                        'https://via.placeholder.com/80x80?text=No+Image';
                                                }}
                                            />
                                        </div>
                                        <div className={styles.specialtyName}>{specialty.name}</div>
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

export default HospitalSpecialtiesManagement;
