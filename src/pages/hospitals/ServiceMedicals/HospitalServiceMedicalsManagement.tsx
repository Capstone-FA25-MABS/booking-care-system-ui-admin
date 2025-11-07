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

// Helper functions to reduce nesting depth

/**
 * Extract category IDs from services
 */
const extractCategoryIdsFromServices = (services: Service[]): Set<string> => {
    const categoryIds = new Set<string>();
    for (const service of services) {
        const categoryId = service.serviceCategoryId || service.serviceCategory?.id;
        if (categoryId) {
            categoryIds.add(categoryId);
        }
    }
    return categoryIds;
};

/**
 * Build categories to show (parent categories if children have services)
 */
const buildCategoriesToShow = (
    categoriesWithServices: ServiceCategory[],
    allCategories: ServiceCategory[]
): ServiceCategory[] => {
    const categoriesToShow = new Map<string, ServiceCategory>();

    for (const cat of categoriesWithServices) {
        if (cat.parentId) {
            const parent = allCategories.find((c) => c.id === cat.parentId);
            if (parent) {
                categoriesToShow.set(parent.id, parent);
            } else {
                categoriesToShow.set(cat.id, cat);
            }
        } else {
            categoriesToShow.set(cat.id, cat);
        }
    }

    return Array.from(categoriesToShow.values());
};

/**
 * Group services by category ID (using parent category if service belongs to child)
 */
const groupServicesByCategory = (
    services: Service[],
    allCategories: ServiceCategory[]
): Map<string, Service[]> => {
    const servicesMap = new Map<string, Service[]>();

    for (const service of services) {
        let categoryId = service.serviceCategoryId || service.serviceCategory?.id;
        if (categoryId) {
            const category = allCategories.find((c) => c.id === categoryId);
            if (category?.parentId) {
                categoryId = category.parentId;
            }

            if (!servicesMap.has(categoryId)) {
                servicesMap.set(categoryId, []);
            }
            servicesMap.get(categoryId)!.push(service);
        }
    }

    return servicesMap;
};

/**
 * Extract hospital service IDs from profile
 */
const extractHospitalServiceIds = (hospitalProfile: any): string[] => {
    const serviceIds: string[] = [];
    if (hospitalProfile?.serviceMedicals) {
        for (const sm of hospitalProfile.serviceMedicals) {
            const id = sm.serviceMedicalId || sm.id;
            if (id) {
                serviceIds.push(id);
            }
        }
    }
    return serviceIds;
};

/**
 * Check if category matches search term
 */
const categoryMatchesSearch = (
    category: ServiceCategory,
    categoryServices: Service[],
    searchTerm: string
): boolean => {
    const lowerSearchTerm = searchTerm.toLowerCase();
    if (category.name.toLowerCase().includes(lowerSearchTerm)) {
        return true;
    }
    return categoryServices.some((service) => service.name.toLowerCase().includes(lowerSearchTerm));
};

/**
 * Filter services by search term
 */
const filterServicesBySearch = (services: Service[], searchTerm: string): Service[] => {
    if (!searchTerm) {
        return services;
    }
    const lowerSearchTerm = searchTerm.toLowerCase();
    return services.filter((service) => service.name.toLowerCase().includes(lowerSearchTerm));
};

/**
 * Service Card Component
 */
interface ServiceCardProps {
    service: Service;
    isSelected: boolean;
    onToggle: (serviceId: string) => void;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service, isSelected, onToggle }) => {
    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
        e.currentTarget.src = 'https://via.placeholder.com/80x80?text=No+Image';
    };

    const handleCheckboxChange = () => {
        onToggle(service.id);
    };

    const handleCheckboxClick = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    const handleCardClick = () => {
        onToggle(service.id);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onToggle(service.id);
        }
    };

    const imageUrl =
        service.imageUrl ||
        service.serviceCategory?.imageUrl ||
        'https://via.placeholder.com/80x80?text=No+Image';

    return (
        <div
            role="button"
            tabIndex={0}
            aria-label={`${isSelected ? 'Bỏ chọn' : 'Chọn'} dịch vụ ${service.name}`}
            aria-pressed={isSelected}
            className={`${styles.serviceCard} ${isSelected ? styles.selected : ''}`}
            onClick={handleCardClick}
            onKeyDown={handleKeyDown}
        >
            <div className={styles.serviceCardContent}>
                <div className={styles.checkboxWrapper}>
                    <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={handleCheckboxChange}
                        onClick={handleCheckboxClick}
                        aria-label={`${isSelected ? 'Bỏ chọn' : 'Chọn'} dịch vụ ${service.name}`}
                    />
                </div>
                <div className={styles.serviceImage}>
                    <img src={imageUrl} alt={service.name} onError={handleImageError} />
                </div>
                <div className={styles.serviceName}>{service.name}</div>
            </div>
        </div>
    );
};

/**
 * Category Section Component
 */
interface CategorySectionProps {
    category: ServiceCategory;
    services: Service[];
    selectedServiceIds: string[];
    expandedCategories: Set<string>;
    searchTerm: string;
    onCategoryToggle: (categoryId: string) => void;
    onServiceToggle: (serviceId: string) => void;
}

const CategorySection: React.FC<CategorySectionProps> = ({
    category,
    services,
    selectedServiceIds,
    expandedCategories,
    searchTerm,
    onCategoryToggle,
    onServiceToggle,
}) => {
    const filteredServices = filterServicesBySearch(services, searchTerm);

    if (filteredServices.length === 0 && searchTerm) {
        return null;
    }

    const selectedCount = filteredServices.filter((service) =>
        selectedServiceIds.includes(service.id)
    ).length;
    const totalCount = filteredServices.length;
    const isExpanded = expandedCategories.has(category.id);

    const handleCategoryClick = () => {
        onCategoryToggle(category.id);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onCategoryToggle(category.id);
        }
    };

    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
        e.currentTarget.style.display = 'none';
    };

    return (
        <div className={styles.categorySection}>
            <div
                role="button"
                tabIndex={0}
                aria-label={`${isExpanded ? 'Thu gọn' : 'Mở rộng'} danh mục ${category.name}`}
                aria-expanded={isExpanded}
                className={styles.categoryHeader}
                onClick={handleCategoryClick}
                onKeyDown={handleKeyDown}
            >
                <div className={styles.categoryInfo}>
                    {category.imageUrl && (
                        <img
                            src={category.imageUrl}
                            alt={category.name}
                            className={styles.categoryImage}
                            onError={handleImageError}
                        />
                    )}
                    <div>
                        <h5 className={styles.categoryName}>{category.name}</h5>
                        {category.description && (
                            <p className={styles.categoryDescription}>{category.description}</p>
                        )}
                    </div>
                </div>
                <div className={styles.categoryActions}>
                    <span className={styles.categoryServiceCount}>
                        Đã chọn {selectedCount}/{totalCount} dịch vụ
                    </span>
                    <i
                        className={`ti ti-chevron-${isExpanded ? 'up' : 'down'} ${styles.expandIcon}`}
                        aria-hidden="true"
                    ></i>
                </div>
            </div>

            {isExpanded && (
                <div className={styles.servicesGrid}>
                    {filteredServices.length === 0 ? (
                        <div className={styles.emptyCategoryState}>
                            <p className="text-muted">Không có dịch vụ nào</p>
                        </div>
                    ) : (
                        filteredServices.map((service) => (
                            <ServiceCard
                                key={service.id}
                                service={service}
                                isSelected={selectedServiceIds.includes(service.id)}
                                onToggle={onServiceToggle}
                            />
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

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
                const categoryIdsFromServices = extractCategoryIdsFromServices(activeServices);

                // Filter categories to only include those that have services
                const categoriesWithServices = activeCategories.filter((cat) =>
                    categoryIdsFromServices.has(cat.id)
                );

                // Build categories to show (parent categories if children have services)
                const finalCategories = buildCategoriesToShow(
                    categoriesWithServices,
                    activeCategories
                );
                setCategories(finalCategories);

                // Group services by categoryId
                const servicesMap = groupServicesByCategory(activeServices, activeCategories);
                setServicesByCategory(servicesMap);

                // Load current hospital services
                const hospitalProfileServiceIds = extractHospitalServiceIds(hospitalProfile);
                const hospitalServices = activeServices.filter(
                    (s) => s.hospitalId === hospitalId || hospitalProfileServiceIds.includes(s.id)
                );
                const currentServiceIds = hospitalServices.map((s) => s.id);
                setSelectedServiceIds(currentServiceIds);
                setInitialServiceIds(currentServiceIds);
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
    const filteredCategories = searchTerm
        ? categories.filter((category) => {
              const categoryServices = servicesByCategory.get(category.id) || [];
              return categoryMatchesSearch(category, categoryServices, searchTerm);
          })
        : categories;

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
    const checkHasChanges = (): boolean => {
        if (initialServiceIds.length === 0 && selectedServiceIds.length === 0) {
            return false;
        }
        if (selectedServiceIds.length !== initialServiceIds.length) {
            return true;
        }
        const hasNewSelection = selectedServiceIds.some((id) => !initialServiceIds.includes(id));
        const hasRemovedSelection = initialServiceIds.some(
            (id) => !selectedServiceIds.includes(id)
        );
        return hasNewSelection || hasRemovedSelection;
    };

    const hasChanges = checkHasChanges();

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
                            return (
                                <CategorySection
                                    key={category.id}
                                    category={category}
                                    services={categoryServices}
                                    selectedServiceIds={selectedServiceIds}
                                    expandedCategories={expandedCategories}
                                    searchTerm={searchTerm}
                                    onCategoryToggle={handleCategoryToggle}
                                    onServiceToggle={handleServiceToggle}
                                />
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
