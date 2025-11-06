import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { AppDispatch } from '@/store';
import { useCurrentUserProfile } from '@/hooks/useCurrentUserProfile';
import { updateHospitalProfile, fetchProfileByRole } from '@/store/slices/userSlice';
import { Role } from '@/enums/common.enums';
import Button from '@/components/Button';
import Spinner from '@/components/Spinner';
import { HospitalServiceMedicalService } from '@/services/hospitalServiceMedical.service';
import { ServiceCategory, Service } from '@/types/hospitalServiceMedical.types';
import styles from './HospitalServiceMedicalsManagement.module.scss';

const HospitalServiceMedicalsManagement: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { profile, hospitalProfile, role } = useCurrentUserProfile();
    const hospitalId = hospitalProfile?.id || (profile as any)?.id;

    // Auto-fetch profile if not loaded
    useEffect(() => {
        if (role === Role.STAFF && !hospitalProfile) {
            dispatch(fetchProfileByRole({ role }));
        }
    }, [role, hospitalProfile, dispatch]);

    // State
    const [categories, setCategories] = useState<ServiceCategory[]>([]);
    const [servicesByCategory, setServicesByCategory] = useState<Map<string, Service[]>>(new Map());
    const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
    const [initialServiceIds, setInitialServiceIds] = useState<string[]>([]); // Store initial selected IDs
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

    // Initialize all categories as expanded by default
    useEffect(() => {
        if (categories.length > 0) {
            setExpandedCategories(new Set(categories.map((cat) => cat.id)));
        }
    }, [categories]);

    // Load all service categories and services
    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                // Load all active service categories
                const categoriesResponse =
                    await HospitalServiceMedicalService.getActiveCategories();
                const categoriesList = categoriesResponse.data || [];

                // Filter only ACTIVE categories
                const activeCategories = categoriesList.filter(
                    (cat) => !cat.status || cat.status === 'ACTIVE'
                );

                // Load all active services
                const servicesResponse = await HospitalServiceMedicalService.getActiveServices();
                const servicesList = servicesResponse.data || [];

                // Filter only ACTIVE services
                const activeServices = servicesList.filter(
                    (s) => !s.status || s.status === 'ACTIVE'
                );

                // Get unique category IDs from services
                const categoryIdsFromServices = new Set<string>();
                activeServices.forEach((service) => {
                    const categoryId = service.serviceCategoryId || service.serviceCategory?.id;
                    if (categoryId) {
                        categoryIdsFromServices.add(categoryId);
                    }
                });

                // Filter categories to only include those that have services
                const categoriesWithServices = activeCategories.filter((cat) =>
                    categoryIdsFromServices.has(cat.id)
                );

                // Combine: show parent categories if they have children with services, otherwise show the category itself
                const categoriesToShow = new Map<string, ServiceCategory>();

                categoriesWithServices.forEach((cat) => {
                    if (cat.parentId) {
                        // This is a child category, find its parent
                        const parent = activeCategories.find((c) => c.id === cat.parentId);
                        if (parent) {
                            // Show parent category
                            categoriesToShow.set(parent.id, parent);
                        } else {
                            // No parent found, show the category itself
                            categoriesToShow.set(cat.id, cat);
                        }
                    } else {
                        // This is a parent category, show it
                        categoriesToShow.set(cat.id, cat);
                    }
                });

                const finalCategories = Array.from(categoriesToShow.values());
                setCategories(finalCategories);

                // Group services by categoryId (use parent category if service belongs to child category)
                const servicesMap = new Map<string, Service[]>();
                activeServices.forEach((service) => {
                    let categoryId = service.serviceCategoryId || service.serviceCategory?.id;
                    if (categoryId) {
                        // Find if this category has a parent
                        const category = activeCategories.find((c) => c.id === categoryId);
                        if (category?.parentId) {
                            // Use parent category ID for grouping
                            categoryId = category.parentId;
                        }

                        if (!servicesMap.has(categoryId)) {
                            servicesMap.set(categoryId, []);
                        }
                        servicesMap.get(categoryId)!.push(service);
                    }
                });

                setServicesByCategory(servicesMap);

                // Load current hospital services - check via hospitalProfile.serviceMedicals
                // But also check services with hospitalId = current hospitalId as fallback
                const hospitalProfileServiceIds: string[] = [];
                if (hospitalProfile?.serviceMedicals) {
                    hospitalProfile.serviceMedicals.forEach((sm: any) => {
                        const id = sm.serviceMedicalId || sm.id;
                        if (id) hospitalProfileServiceIds.push(id);
                    });
                }

                const hospitalServices = activeServices.filter(
                    (s) => s.hospitalId === hospitalId || hospitalProfileServiceIds.includes(s.id)
                );
                const currentServiceIds = hospitalServices.map((s) => s.id);
                setSelectedServiceIds(currentServiceIds);
                setInitialServiceIds(currentServiceIds); // Store initial state for comparison
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
    }, [hospitalProfile, hospitalId]);

    // Filter categories and services by search term
    // If search term is empty, show all categories that have services
    // If search term exists, filter categories that match or have matching services
    const filteredCategories = searchTerm
        ? categories.filter((category) => {
              const categoryServices = servicesByCategory.get(category.id) || [];
              return (
                  category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  categoryServices.some((service) =>
                      service.name.toLowerCase().includes(searchTerm.toLowerCase())
                  )
              );
          })
        : categories; // Show all categories when no search term

    // Handle service toggle
    const handleServiceToggle = (serviceId: string) => {
        setSelectedServiceIds((prev) => {
            if (prev.includes(serviceId)) {
                return prev.filter((id) => id !== serviceId);
            } else {
                return [...prev, serviceId];
            }
        });
    };

    // Handle category expand/collapse
    const handleCategoryToggle = (categoryId: string) => {
        setExpandedCategories((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(categoryId)) {
                newSet.delete(categoryId);
            } else {
                newSet.add(categoryId);
            }
            return newSet;
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
                        serviceMedicalIds: selectedServiceIds, // Save ServiceIds, not CategoryIds
                    },
                })
            ).unwrap();

            // Reload hospital profile to get updated data
            await dispatch(fetchProfileByRole({ role: Role.STAFF }));

            // Update initial state to match current selection
            setInitialServiceIds(selectedServiceIds);

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

    // Check if there are any changes by comparing with initial state
    const hasChanges = (() => {
        if (initialServiceIds.length === 0 && selectedServiceIds.length === 0) {
            return false; // No changes if both are empty
        }
        if (selectedServiceIds.length !== initialServiceIds.length) {
            return true; // Different lengths means changes
        }
        // Check if all selected IDs are in initial and vice versa
        const hasNewSelection = selectedServiceIds.some((id) => !initialServiceIds.includes(id));
        const hasRemovedSelection = initialServiceIds.some(
            (id) => !selectedServiceIds.includes(id)
        );
        return hasNewSelection || hasRemovedSelection;
    })();

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
                            Đã chọn: {selectedServiceIds.length} /{' '}
                            {Array.from(servicesByCategory.values()).flat().length} dịch vụ
                        </span>
                    </div>
                </div>

                {/* Categories with Services */}
                <div className={styles.categoriesContainer}>
                    {filteredCategories.length === 0 ? (
                        <div className={styles.emptyState}>
                            <p className="text-muted">Không tìm thấy dịch vụ bệnh viện nào</p>
                        </div>
                    ) : (
                        filteredCategories.map((category) => {
                            const categoryServices = servicesByCategory.get(category.id) || [];
                            const filteredCategoryServices = categoryServices.filter((service) =>
                                searchTerm
                                    ? service.name.toLowerCase().includes(searchTerm.toLowerCase())
                                    : true
                            );

                            // Always show category, even if no services (when no search term)
                            // Only hide when search term exists and no matches
                            if (filteredCategoryServices.length === 0 && searchTerm) {
                                return null; // Hide category if no matching services when searching
                            }

                            // Calculate selected count for this category
                            const selectedCount = filteredCategoryServices.filter((service) =>
                                selectedServiceIds.includes(service.id)
                            ).length;
                            const totalCount = filteredCategoryServices.length;
                            const isExpanded = expandedCategories.has(category.id);

                            return (
                                <div key={category.id} className={styles.categorySection}>
                                    <div
                                        className={styles.categoryHeader}
                                        onClick={() => handleCategoryToggle(category.id)}
                                    >
                                        <div className={styles.categoryInfo}>
                                            {category.imageUrl && (
                                                <img
                                                    src={category.imageUrl}
                                                    alt={category.name}
                                                    className={styles.categoryImage}
                                                    onError={(e) => {
                                                        (
                                                            e.target as HTMLImageElement
                                                        ).style.display = 'none';
                                                    }}
                                                />
                                            )}
                                            <div>
                                                <h5 className={styles.categoryName}>
                                                    {category.name}
                                                </h5>
                                                {category.description && (
                                                    <p className={styles.categoryDescription}>
                                                        {category.description}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className={styles.categoryActions}>
                                            <span className={styles.categoryServiceCount}>
                                                Đã chọn {selectedCount}/{totalCount} dịch vụ
                                            </span>
                                            <i
                                                className={`ti ti-chevron-${isExpanded ? 'up' : 'down'} ${styles.expandIcon}`}
                                            ></i>
                                        </div>
                                    </div>

                                    {/* Services grid */}
                                    {isExpanded && (
                                        <div className={styles.servicesGrid}>
                                            {filteredCategoryServices.length === 0 ? (
                                                <div className={styles.emptyCategoryState}>
                                                    <p className="text-muted">
                                                        Không có dịch vụ nào
                                                    </p>
                                                </div>
                                            ) : (
                                                filteredCategoryServices.map((service) => {
                                                    const isSelected = selectedServiceIds.includes(
                                                        service.id
                                                    );
                                                    return (
                                                        <div
                                                            key={service.id}
                                                            className={`${styles.serviceCard} ${isSelected ? styles.selected : ''}`}
                                                            onClick={() =>
                                                                handleServiceToggle(service.id)
                                                            }
                                                        >
                                                            <div
                                                                className={
                                                                    styles.serviceCardContent
                                                                }
                                                            >
                                                                <div
                                                                    className={
                                                                        styles.checkboxWrapper
                                                                    }
                                                                >
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={isSelected}
                                                                        onChange={() =>
                                                                            handleServiceToggle(
                                                                                service.id
                                                                            )
                                                                        }
                                                                        onClick={(e) =>
                                                                            e.stopPropagation()
                                                                        }
                                                                    />
                                                                </div>
                                                                <div
                                                                    className={styles.serviceImage}
                                                                >
                                                                    <img
                                                                        src={
                                                                            service.imageUrl ||
                                                                            service.serviceCategory
                                                                                ?.imageUrl ||
                                                                            'https://via.placeholder.com/80x80?text=No+Image'
                                                                        }
                                                                        alt={service.name}
                                                                        onError={(e) => {
                                                                            (
                                                                                e.target as HTMLImageElement
                                                                            ).src =
                                                                                'https://via.placeholder.com/80x80?text=No+Image';
                                                                        }}
                                                                    />
                                                                </div>
                                                                <div className={styles.serviceName}>
                                                                    {service.name}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            )}
                                        </div>
                                    )}
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
