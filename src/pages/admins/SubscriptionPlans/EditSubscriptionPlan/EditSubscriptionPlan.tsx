import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import SubscriptionPlanFormFields from '../components/SubscriptionPlanFormFields';
import PreviewLimitInput from '../components/PreviewLimitInput';
import FeaturesInput from '@/components/FormComponents/FeaturesInput';
import {
    useSubscriptionPlanFormValidation,
    CustomPlansConfig,
    validateSubscriptionPlanForm,
    parseLimit,
} from '@/hooks/useSubscriptionPlanFormValidation';
import {
    updateSubscriptionPlan,
    getSubscriptionPlanById,
    getAllSubscriptionPlans,
    UpdateSubscriptionPlanRequest,
    SubscriptionPlan,
} from '@/services/subscription.service';

// Constants for discount
const DISCOUNT_QUARTER = 0.1;
const DISCOUNT_YEAR = 0.2;

// Helper function to safely parse JSON
const safeParseJSON = (jsonString: string): any[] | null => {
    try {
        const parsed = JSON.parse(jsonString);
        return Array.isArray(parsed) && parsed.length > 0 ? parsed : null;
    } catch {
        return null;
    }
};

// Helper function to calculate price based on billing cycle
const calculatePriceByCycle = (basePrice: number, billingCycle: string): number => {
    if (billingCycle === 'QUARTERLY') {
        return Math.round(basePrice * 3 * (1 - DISCOUNT_QUARTER));
    }
    if (billingCycle === 'YEARLY') {
        return Math.round(basePrice * 12 * (1 - DISCOUNT_YEAR));
    }
    return basePrice;
};

// Helper function to get config key from billing cycle
const getConfigKey = (billingCycle: string): 'quarterly' | 'yearly' => {
    return billingCycle === 'QUARTERLY' ? 'quarterly' : 'yearly';
};

// Helper function to get limit value (used for both preview and update)
const getLimitValue = (
    config: CustomPlansConfig | undefined,
    key: 'quarterly' | 'yearly',
    limitType: 'maxDoctors' | 'maxSpecialties' | 'maxAppointments',
    syncSameLimits: boolean,
    formValue: string,
    planValue: number | null | undefined
): string => {
    const configValue = config?.[key]?.[limitType];
    if (configValue) return configValue;
    if (syncSameLimits) return formValue;
    return planValue?.toString() || '';
};

// Helper function to get unlimited flag (used for both preview and update)
const getUnlimitedFlag = (
    config: CustomPlansConfig | undefined,
    key: 'quarterly' | 'yearly',
    limitType: 'unlimitedDoctors' | 'unlimitedSpecialties' | 'unlimitedAppointments',
    syncSameLimits: boolean,
    formUnlimited: boolean,
    planValue: number | null | undefined
): boolean => {
    const configValue = config?.[key]?.[limitType];
    if (configValue !== undefined) return configValue;
    if (syncSameLimits) return formUnlimited;
    return planValue === null;
};

const EditSubscriptionPlan: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [isLoadingPlan, setIsLoadingPlan] = useState(true);
    const [isUnlimitedDoctors, setIsUnlimitedDoctors] = useState(false);
    const [isUnlimitedSpecialties, setIsUnlimitedSpecialties] = useState(false);
    const [isUnlimitedAppointments, setIsUnlimitedAppointments] = useState(false);

    // State để track việc sync với các gói khác
    const [syncWithRelatedPlans, setSyncWithRelatedPlans] = useState(false);
    const [syncSameLimits, setSyncSameLimits] = useState(true); // Mặc định sync cùng giới hạn
    const [currentPlanBillingCycle, setCurrentPlanBillingCycle] = useState<string>('');
    const [relatedPlans, setRelatedPlans] = useState<SubscriptionPlan[]>([]);

    // State để lưu custom config cho từng gói khi sync
    const [customPlansConfig, setCustomPlansConfig] = useState<CustomPlansConfig>({});

    const {
        formData,
        validationErrors,
        isSubmitting,
        setIsSubmitting,
        setFormData,
        setValidationErrors,
        handleNameChange,
        handleDescriptionChange,
        handlePriceChange,
        handleBillingCycleChange,
        handleMaxDoctorsChange,
        handleMaxSpecialtiesChange,
        handleMaxAppointmentsChange,
        handleFeaturesChange,
        handleStatusChange,
        resetForm,
    } = useSubscriptionPlanFormValidation();

    // Helper function to fetch related plans for MONTHLY plans
    const fetchRelatedPlans = async (planName: string) => {
        try {
            const allPlansResponse = await getAllSubscriptionPlans();
            if (!allPlansResponse.success || !allPlansResponse.data?.subscriptionPlans) {
                return;
            }

            // Tìm các gói có cùng tên nhưng billing cycle là QUARTERLY hoặc YEARLY
            const related = allPlansResponse.data.subscriptionPlans.filter(
                (p: SubscriptionPlan) =>
                    p.name === planName &&
                    (p.billingCycle === 'QUARTERLY' || p.billingCycle === 'YEARLY')
            );
            setRelatedPlans(related);

            // Tự động bật sync nếu tìm thấy các gói liên quan
            if (related.length > 0) {
                setSyncWithRelatedPlans(true);
            }
        } catch (err) {
            console.error('Error finding related plans:', err);
        }
    };

    // Helper function to convert null to empty string for display in form
    const displayLimit = (value: number | null, setUnlimited: (v: boolean) => void): string => {
        if (value === null) {
            setUnlimited(true);
            return '';
        }
        setUnlimited(false);
        return value.toString();
    };

    useEffect(() => {
        const fetchPlan = async () => {
            if (!id) return;

            try {
                setIsLoadingPlan(true);
                const response = await getSubscriptionPlanById(id);

                if (!response.success || !response.data) {
                    return;
                }

                const plan = response.data;

                // Lưu billing cycle của plan hiện tại
                setCurrentPlanBillingCycle(plan.billingCycle);

                // Nếu là gói MONTHLY, tìm các gói liên quan có cùng tên nhưng khác billing cycle
                if (plan.billingCycle === 'MONTHLY') {
                    await fetchRelatedPlans(plan.name);
                }

                setFormData({
                    name: plan.name,
                    description: plan.description || '',
                    price: plan.price.toString(),
                    billingCycle: plan.billingCycle,
                    maxDoctors: displayLimit(plan.maxDoctors, setIsUnlimitedDoctors),
                    maxSpecialties: displayLimit(plan.maxSpecialties, setIsUnlimitedSpecialties),
                    maxAppointments: displayLimit(plan.maxAppointments, setIsUnlimitedAppointments),
                    features: plan.features || '',
                    status: plan.status,
                });
                setValidationErrors({});
            } catch (error: any) {
                toast.error(error.message || 'Không thể tải thông tin gói dịch vụ');
                navigate('/admin/subscription-plans');
            } finally {
                setIsLoadingPlan(false);
            }
        };

        fetchPlan();
    }, [id, setFormData, setValidationErrors, navigate]);

    // Helper function to create preview object for a related plan
    const createPlanPreview = (plan: SubscriptionPlan, basePrice: number) => {
        const configKey = getConfigKey(plan.billingCycle);
        const newPrice = calculatePriceByCycle(basePrice, plan.billingCycle);
        const label = plan.billingCycle === 'QUARTERLY' ? 'Gói Quý' : 'Gói Năm';
        const discount = plan.billingCycle === 'QUARTERLY' ? DISCOUNT_QUARTER : DISCOUNT_YEAR;

        return {
            id: plan.id,
            name: plan.name,
            billingCycle: plan.billingCycle,
            oldPrice: plan.price,
            newPrice: newPrice,
            discount: discount,
            label: label,
            maxDoctors: getLimitValue(
                customPlansConfig,
                configKey,
                'maxDoctors',
                syncSameLimits,
                formData.maxDoctors,
                plan.maxDoctors
            ),
            maxSpecialties: getLimitValue(
                customPlansConfig,
                configKey,
                'maxSpecialties',
                syncSameLimits,
                formData.maxSpecialties,
                plan.maxSpecialties
            ),
            maxAppointments: getLimitValue(
                customPlansConfig,
                configKey,
                'maxAppointments',
                syncSameLimits,
                formData.maxAppointments,
                plan.maxAppointments
            ),
            unlimitedDoctors: getUnlimitedFlag(
                customPlansConfig,
                configKey,
                'unlimitedDoctors',
                syncSameLimits,
                isUnlimitedDoctors,
                plan.maxDoctors
            ),
            unlimitedSpecialties: getUnlimitedFlag(
                customPlansConfig,
                configKey,
                'unlimitedSpecialties',
                syncSameLimits,
                isUnlimitedSpecialties,
                plan.maxSpecialties
            ),
            unlimitedAppointments: getUnlimitedFlag(
                customPlansConfig,
                configKey,
                'unlimitedAppointments',
                syncSameLimits,
                isUnlimitedAppointments,
                plan.maxAppointments
            ),
            features:
                customPlansConfig[configKey]?.features ||
                (syncSameLimits ? formData.features : plan.features),
            currentFeatures: plan.features,
            status:
                customPlansConfig[configKey]?.status ||
                (syncSameLimits ? formData.status : plan.status),
            currentStatus: plan.status,
        };
    };

    // Preview các gói sẽ được update khi sync enabled
    const relatedPlansPreviews = useMemo(() => {
        if (!syncWithRelatedPlans || relatedPlans.length === 0 || !formData.price) {
            return [];
        }

        const basePrice = Number.parseFloat(formData.price);
        if (Number.isNaN(basePrice)) return [];

        return relatedPlans.map((plan) => createPlanPreview(plan, basePrice));
    }, [
        syncWithRelatedPlans,
        relatedPlans,
        formData.price,
        formData.maxDoctors,
        formData.maxSpecialties,
        formData.maxAppointments,
        formData.features,
        formData.status,
        syncSameLimits,
        isUnlimitedDoctors,
        isUnlimitedSpecialties,
        isUnlimitedAppointments,
        customPlansConfig,
    ]);

    // Helper function to create update data for a related plan
    const createRelatedPlanUpdateData = (
        relatedPlan: SubscriptionPlan,
        basePrice: number
    ): UpdateSubscriptionPlanRequest => {
        const key = getConfigKey(relatedPlan.billingCycle);
        const newPrice = calculatePriceByCycle(basePrice, relatedPlan.billingCycle);

        return {
            name: relatedPlan.name, // Giữ nguyên tên
            description: formData.description || undefined,
            price: newPrice,
            billingCycle: relatedPlan.billingCycle,
            maxDoctors: parseLimit(
                getLimitValue(
                    customPlansConfig,
                    key,
                    'maxDoctors',
                    syncSameLimits,
                    formData.maxDoctors,
                    relatedPlan.maxDoctors
                ),
                getUnlimitedFlag(
                    customPlansConfig,
                    key,
                    'unlimitedDoctors',
                    syncSameLimits,
                    isUnlimitedDoctors,
                    relatedPlan.maxDoctors
                )
            ),
            maxSpecialties: parseLimit(
                getLimitValue(
                    customPlansConfig,
                    key,
                    'maxSpecialties',
                    syncSameLimits,
                    formData.maxSpecialties,
                    relatedPlan.maxSpecialties
                ),
                getUnlimitedFlag(
                    customPlansConfig,
                    key,
                    'unlimitedSpecialties',
                    syncSameLimits,
                    isUnlimitedSpecialties,
                    relatedPlan.maxSpecialties
                )
            ),
            maxAppointments: parseLimit(
                getLimitValue(
                    customPlansConfig,
                    key,
                    'maxAppointments',
                    syncSameLimits,
                    formData.maxAppointments,
                    relatedPlan.maxAppointments
                ),
                getUnlimitedFlag(
                    customPlansConfig,
                    key,
                    'unlimitedAppointments',
                    syncSameLimits,
                    isUnlimitedAppointments,
                    relatedPlan.maxAppointments
                )
            ),
            features:
                customPlansConfig[key]?.features ||
                (syncSameLimits ? formData.features || undefined : relatedPlan.features),
            status:
                customPlansConfig[key]?.status ||
                (syncSameLimits ? formData.status : relatedPlan.status),
        };
    };

    // Helper function to update related plans
    const updateRelatedPlans = async (basePrice: number): Promise<number> => {
        if (
            !syncWithRelatedPlans ||
            currentPlanBillingCycle !== 'MONTHLY' ||
            relatedPlans.length === 0
        ) {
            return 0;
        }

        let updatedCount = 0;

        for (const relatedPlan of relatedPlans) {
            try {
                const relatedPlanData = createRelatedPlanUpdateData(relatedPlan, basePrice);
                await updateSubscriptionPlan(relatedPlan.id, relatedPlanData);
                updatedCount++;
            } catch (err: any) {
                console.error(`Error updating related plan ${relatedPlan.name}:`, err);
                toast.warning(`Không thể cập nhật gói ${relatedPlan.name}`);
            }
        }

        return updatedCount;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!id) {
            toast.error('Không tìm thấy ID gói dịch vụ');
            return;
        }

        // Custom validation - tương tự AddSubscriptionPlan
        const validationError = validateSubscriptionPlanForm(
            formData,
            isUnlimitedDoctors,
            isUnlimitedSpecialties,
            isUnlimitedAppointments,
            true
        );

        if (validationError) {
            toast.error(validationError);
            return;
        }

        try {
            setIsSubmitting(true);

            const planData: UpdateSubscriptionPlanRequest = {
                name: formData.name,
                description: formData.description || undefined,
                price: Number.parseFloat(formData.price),
                billingCycle: formData.billingCycle as 'MONTHLY' | 'QUARTERLY' | 'YEARLY',
                maxDoctors: parseLimit(formData.maxDoctors, isUnlimitedDoctors),
                maxSpecialties: parseLimit(formData.maxSpecialties, isUnlimitedSpecialties),
                maxAppointments: parseLimit(formData.maxAppointments, isUnlimitedAppointments),
                features: formData.features || undefined,
                status: formData.status,
            };

            // Update gói hiện tại
            const success = await updateSubscriptionPlan(id, planData);

            if (!success) {
                throw new Error('Cập nhật gói chính thất bại');
            }

            // Update các gói liên quan nếu có
            const basePrice = Number.parseFloat(formData.price);
            const updatedCount = await updateRelatedPlans(basePrice);

            if (updatedCount > 0) {
                toast.success(`Đã cập nhật gói chính và ${updatedCount} gói liên quan!`);
            } else {
                toast.success('Cập nhật gói dịch vụ thành công!');
            }

            navigate('/admin/subscription-plans');
        } catch (error: any) {
            toast.error(error.message || 'Có lỗi xảy ra khi cập nhật gói dịch vụ');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        resetForm();
        navigate('/admin/subscription-plans');
    };

    return (
        <div className="content">
            <div className="d-flex align-items-sm-center flex-sm-row flex-column gap-2 mb-3 pb-3 border-bottom">
                <div className="flex-grow-1">
                    <h4 className="fw-bold mb-0">Chỉnh Sửa Gói Dịch Vụ</h4>
                </div>
            </div>
            <div className="row">
                <div className="col-sm-12">
                    <SubscriptionPlanFormFields
                        formData={formData}
                        errors={validationErrors}
                        onNameChange={handleNameChange}
                        onDescriptionChange={handleDescriptionChange}
                        onPriceChange={handlePriceChange}
                        onBillingCycleChange={handleBillingCycleChange}
                        onMaxDoctorsChange={handleMaxDoctorsChange}
                        onMaxSpecialtiesChange={handleMaxSpecialtiesChange}
                        onMaxAppointmentsChange={handleMaxAppointmentsChange}
                        onFeaturesChange={handleFeaturesChange}
                        onStatusChange={handleStatusChange}
                        onSubmit={handleSubmit}
                        onCancel={handleCancel}
                        isLoading={isLoadingPlan || isSubmitting}
                        isEdit={true}
                        // truyền xuống
                        isUnlimitedDoctors={isUnlimitedDoctors}
                        isUnlimitedSpecialties={isUnlimitedSpecialties}
                        isUnlimitedAppointments={isUnlimitedAppointments}
                        onToggleUnlimitedDoctors={setIsUnlimitedDoctors}
                        onToggleUnlimitedSpecialties={setIsUnlimitedSpecialties}
                        onToggleUnlimitedAppointments={setIsUnlimitedAppointments}
                    />
                </div>
            </div>

            {/* Sync với gói liên quan - Chỉ hiện khi edit gói MONTHLY và có gói liên quan */}
            {currentPlanBillingCycle === 'MONTHLY' && relatedPlans.length > 0 && !isLoadingPlan && (
                <div className="mb-3 mt-4">
                    <div className="card border-info">
                        <div className="card-body">
                            <div className="form-check form-switch mb-3">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id="syncWithRelatedPlans"
                                    checked={syncWithRelatedPlans}
                                    onChange={(e) => setSyncWithRelatedPlans(e.target.checked)}
                                />
                                <label
                                    className="form-check-label fw-semibold"
                                    htmlFor="syncWithRelatedPlans"
                                >
                                    <i className="ti ti-refresh me-2"></i> Tự động cập nhật các gói
                                    liên quan
                                </label>
                            </div>

                            {!syncWithRelatedPlans && (
                                <small className="text-muted d-block">
                                    ⚠️ Chỉ cập nhật gói hiện tại, không ảnh hưởng đến{' '}
                                    {relatedPlans.length} gói khác
                                </small>
                            )}
                        </div>
                    </div>

                    {/* Preview các gói sẽ được update */}
                    {syncWithRelatedPlans && relatedPlansPreviews.length > 0 && (
                        <>
                            <div className="alert alert-info mt-3">
                                <i className="ti ti-info-circle me-2"></i>
                                <strong>Lưu ý:</strong> Khi nhấn "Cập Nhật Gói Dịch Vụ", hệ thống sẽ
                                tự động cập nhật {relatedPlansPreviews.length} gói liên quan. Bạn có
                                thể tùy chỉnh giới hạn và tính năng cho từng gói:
                            </div>

                            <div className="form-check form-switch mb-3 ms-2">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id="syncSameLimits"
                                    checked={syncSameLimits}
                                    onChange={(e) => setSyncSameLimits(e.target.checked)}
                                />
                                <label className="form-check-label" htmlFor="syncSameLimits">
                                    <i className="ti ti-copy me-2"></i> Đồng bộ cả Giới hạn và Tính
                                    năng từ gói tháng
                                </label>
                            </div>

                            <div className="d-flex flex-column gap-3">
                                {relatedPlansPreviews.map((preview) => (
                                    <div key={preview.id}>
                                        <div className="card border-success">
                                            <div className="card-body">
                                                {/* Header với thông tin cơ bản */}
                                                <div className="row mb-3">
                                                    <div className="col-md-4">
                                                        <div className="d-flex align-items-center mb-2">
                                                            <i className="ti ti-package text-success me-2 fs-4"></i>
                                                            <h5 className="mb-0 fw-bold">
                                                                {preview.label}
                                                            </h5>
                                                        </div>
                                                        <div className="mb-1">
                                                            <small className="text-muted">
                                                                Tên gói:
                                                            </small>
                                                            <br />
                                                            <strong>{preview.name}</strong>
                                                        </div>
                                                        <div className="mb-1">
                                                            <small className="text-muted">
                                                                Giá:
                                                            </small>
                                                            <br />
                                                            <span className="text-success fw-bold fs-5">
                                                                {preview.newPrice.toLocaleString(
                                                                    'vi-VN'
                                                                )}{' '}
                                                                VNĐ
                                                            </span>
                                                            {preview.oldPrice !==
                                                                preview.newPrice && (
                                                                <span className="text-muted small ms-2">
                                                                    (từ{' '}
                                                                    {preview.oldPrice.toLocaleString(
                                                                        'vi-VN'
                                                                    )}
                                                                    )
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="mt-2">
                                                            <span className="badge bg-success">
                                                                Tiết kiệm{' '}
                                                                {(preview.discount * 100).toFixed(
                                                                    0
                                                                )}
                                                                %
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Cột 2: Tính năng */}
                                                    <div className="col-md-4">
                                                        {preview.features &&
                                                            (() => {
                                                                const parsedFeatures =
                                                                    safeParseJSON(preview.features);

                                                                if (
                                                                    parsedFeatures &&
                                                                    parsedFeatures.length > 0
                                                                ) {
                                                                    return (
                                                                        <div>
                                                                            <h6 className="fw-bold mb-2">
                                                                                <i className="ti ti-star text-warning me-1"></i>
                                                                                {(() => {
                                                                                    const configKey =
                                                                                        preview.billingCycle ===
                                                                                        'QUARTERLY'
                                                                                            ? 'quarterly'
                                                                                            : ('yearly' as keyof typeof customPlansConfig);
                                                                                    const hasCustomFeatures =
                                                                                        customPlansConfig[
                                                                                            configKey
                                                                                        ]?.features;
                                                                                    if (
                                                                                        syncSameLimits &&
                                                                                        !hasCustomFeatures
                                                                                    ) {
                                                                                        return 'Tính năng (từ gói tháng):';
                                                                                    }
                                                                                    return 'Tính năng:';
                                                                                })()}
                                                                            </h6>
                                                                            <ul className="mb-0 ps-3">
                                                                                {parsedFeatures.map(
                                                                                    (
                                                                                        feature: any,
                                                                                        idx: number
                                                                                    ) => (
                                                                                        <li
                                                                                            key={`feature-${idx}-${feature.text}`}
                                                                                            className="text-muted mb-1"
                                                                                        >
                                                                                            {
                                                                                                feature.text
                                                                                            }
                                                                                        </li>
                                                                                    )
                                                                                )}
                                                                            </ul>
                                                                        </div>
                                                                    );
                                                                }

                                                                return (
                                                                    <div className="text-muted small">
                                                                        <i className="ti ti-alert-circle me-1"></i>{' '}
                                                                        Chưa có tính năng
                                                                    </div>
                                                                );
                                                            })()}
                                                    </div>

                                                    {/* Cột 3: Giới hạn */}
                                                    <div className="col-md-4">
                                                        <div>
                                                            <h6 className="fw-bold mb-2">
                                                                <i className="ti ti-settings text-info me-1"></i>
                                                                {(() => {
                                                                    const configKey =
                                                                        preview.billingCycle ===
                                                                        'QUARTERLY'
                                                                            ? 'quarterly'
                                                                            : ('yearly' as keyof typeof customPlansConfig);
                                                                    const hasCustomMaxDoctors =
                                                                        customPlansConfig[configKey]
                                                                            ?.maxDoctors;
                                                                    if (
                                                                        syncSameLimits &&
                                                                        !hasCustomMaxDoctors
                                                                    ) {
                                                                        return 'Giới hạn (từ gói tháng):';
                                                                    }
                                                                    return 'Tùy chỉnh giới hạn:';
                                                                })()}
                                                            </h6>
                                                            <div className="small">
                                                                {/* Bác sĩ */}
                                                                <PreviewLimitInput
                                                                    label="Bác sĩ"
                                                                    type="doctors"
                                                                    billingCycle={
                                                                        preview.billingCycle as
                                                                            | 'QUARTERLY'
                                                                            | 'YEARLY'
                                                                    }
                                                                    value={preview.maxDoctors}
                                                                    unlimited={
                                                                        preview.unlimitedDoctors
                                                                    }
                                                                    placeholder={
                                                                        formData.maxDoctors || '10'
                                                                    }
                                                                    setCustomPlansConfig={
                                                                        setCustomPlansConfig
                                                                    }
                                                                />

                                                                {/* Chuyên khoa */}
                                                                <PreviewLimitInput
                                                                    label="Chuyên khoa"
                                                                    type="specialties"
                                                                    billingCycle={
                                                                        preview.billingCycle as
                                                                            | 'QUARTERLY'
                                                                            | 'YEARLY'
                                                                    }
                                                                    value={preview.maxSpecialties}
                                                                    unlimited={
                                                                        preview.unlimitedSpecialties
                                                                    }
                                                                    placeholder={
                                                                        formData.maxSpecialties ||
                                                                        '5'
                                                                    }
                                                                    setCustomPlansConfig={
                                                                        setCustomPlansConfig
                                                                    }
                                                                />

                                                                {/* Lịch hẹn */}
                                                                <PreviewLimitInput
                                                                    label="Lịch hẹn"
                                                                    type="appointments"
                                                                    billingCycle={
                                                                        preview.billingCycle as
                                                                            | 'QUARTERLY'
                                                                            | 'YEARLY'
                                                                    }
                                                                    value={preview.maxAppointments}
                                                                    unlimited={
                                                                        preview.unlimitedAppointments
                                                                    }
                                                                    placeholder={
                                                                        formData.maxAppointments ||
                                                                        '100'
                                                                    }
                                                                    setCustomPlansConfig={
                                                                        setCustomPlansConfig
                                                                    }
                                                                />

                                                                <small className="text-muted">
                                                                    <i className="ti ti-check me-1"></i>{' '}
                                                                    = Không giới hạn
                                                                </small>

                                                                {/* Status dropdown cho gói Quý và Năm */}
                                                                <div className="mt-3">
                                                                    <label
                                                                        htmlFor={`status-${preview.id}`}
                                                                        className="form-label small mb-1"
                                                                    >
                                                                        Trạng thái:
                                                                    </label>
                                                                    <select
                                                                        id={`status-${preview.id}`}
                                                                        className="form-select form-select-sm"
                                                                        value={
                                                                            preview.status ||
                                                                            'ACTIVE'
                                                                        }
                                                                        onChange={(e) => {
                                                                            const key =
                                                                                preview.billingCycle ===
                                                                                'QUARTERLY'
                                                                                    ? 'quarterly'
                                                                                    : 'yearly';
                                                                            setCustomPlansConfig(
                                                                                (prev) => ({
                                                                                    ...prev,
                                                                                    [key]: {
                                                                                        ...prev[
                                                                                            key as keyof typeof prev
                                                                                        ],
                                                                                        status: e
                                                                                            .target
                                                                                            .value as
                                                                                            | 'ACTIVE'
                                                                                            | 'INACTIVE',
                                                                                    },
                                                                                })
                                                                            );
                                                                        }}
                                                                    >
                                                                        <option value="ACTIVE">
                                                                            Active
                                                                        </option>
                                                                        <option value="INACTIVE">
                                                                            Inactive
                                                                        </option>
                                                                    </select>
                                                                    {preview.currentStatus &&
                                                                        preview.currentStatus !==
                                                                            preview.status && (
                                                                            <small className="text-muted d-block mt-1">
                                                                                Hiện tại:{' '}
                                                                                {
                                                                                    preview.currentStatus
                                                                                }
                                                                            </small>
                                                                        )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Tính năng riêng (full width) */}
                                                <div className="mt-3 pt-3 border-top">
                                                    <h6 className="fw-bold mb-2">
                                                        <i className="ti ti-sparkles text-primary me-1"></i>
                                                        Tính năng riêng cho {preview.label}:
                                                    </h6>
                                                    <FeaturesInput
                                                        value={preview.features || ''}
                                                        onChange={(newFeatures: string) => {
                                                            const key =
                                                                preview.billingCycle === 'QUARTERLY'
                                                                    ? 'quarterly'
                                                                    : 'yearly';
                                                            setCustomPlansConfig((prev) => ({
                                                                ...prev,
                                                                [key]: {
                                                                    ...prev[
                                                                        key as keyof typeof prev
                                                                    ],
                                                                    features: newFeatures,
                                                                },
                                                            }));
                                                        }}
                                                    />
                                                    <small className="text-muted d-block mt-2">
                                                        <i className="ti ti-info-circle me-1"></i>
                                                        {syncSameLimits
                                                            ? 'Để trống = dùng tính năng gói tháng'
                                                            : 'Để trống = giữ nguyên tính năng hiện tại'}
                                                    </small>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Action Buttons Card - Di chuyển xuống dưới cùng */}
            {!isLoadingPlan && (
                <div className="card mt-4">
                    <div className="card-body">
                        <div className="d-flex justify-content-end gap-2">
                            <button
                                type="button"
                                className="btn btn-light btn-lg"
                                onClick={() => navigate('/admin/subscription-plans')}
                                disabled={isSubmitting}
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary btn-lg"
                                disabled={isSubmitting}
                                onClick={handleSubmit}
                            >
                                <i className="ti ti-edit me-2"></i>
                                {isSubmitting ? 'Đang cập nhật...' : 'Cập Nhật Gói Dịch Vụ'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EditSubscriptionPlan;
