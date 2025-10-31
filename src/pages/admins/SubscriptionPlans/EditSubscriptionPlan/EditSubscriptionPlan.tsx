import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import SubscriptionPlanFormFields from '../AddSubscriptionPlan/SubscriptionPlanFormFields';
import FeaturesInput from '@/components/FormComponents/FeaturesInput';
import { useSubscriptionPlanFormValidation } from '@/hooks/useSubscriptionPlanFormValidation';
import {
    updateSubscriptionPlan,
    getSubscriptionPlanById,
    getAllSubscriptionPlans,
} from '@/services/subscription.service';
import { UpdateSubscriptionPlanRequest, SubscriptionPlan } from '@/services/subscription.service';

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
    const [customPlansConfig, setCustomPlansConfig] = useState<{
        quarterly?: {
            maxDoctors: string;
            maxSpecialties: string;
            maxAppointments: string;
            unlimitedDoctors: boolean;
            unlimitedSpecialties: boolean;
            unlimitedAppointments: boolean;
            features?: string;
            status?: 'ACTIVE' | 'INACTIVE';
        };
        yearly?: {
            maxDoctors: string;
            maxSpecialties: string;
            maxAppointments: string;
            unlimitedDoctors: boolean;
            unlimitedSpecialties: boolean;
            unlimitedAppointments: boolean;
            features?: string;
            status?: 'ACTIVE' | 'INACTIVE';
        };
    }>({});

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

    useEffect(() => {
        const fetchPlan = async () => {
            if (!id) return;

            try {
                setIsLoadingPlan(true);
                const response = await getSubscriptionPlanById(id);

                if (response.success && response.data) {
                    const plan = response.data;

                    // Lưu billing cycle của plan hiện tại
                    setCurrentPlanBillingCycle(plan.billingCycle);

                    // Nếu là gói MONTHLY, tìm các gói liên quan có cùng tên nhưng khác billing cycle
                    if (plan.billingCycle === 'MONTHLY') {
                        try {
                            const allPlansResponse = await getAllSubscriptionPlans();
                            if (
                                allPlansResponse.success &&
                                allPlansResponse.data?.subscriptionPlans
                            ) {
                                // Tìm các gói có cùng tên nhưng billing cycle là QUARTERLY hoặc YEARLY
                                const related = allPlansResponse.data.subscriptionPlans.filter(
                                    (p: SubscriptionPlan) =>
                                        p.name === plan.name &&
                                        (p.billingCycle === 'QUARTERLY' ||
                                            p.billingCycle === 'YEARLY')
                                );
                                setRelatedPlans(related);

                                // Tự động bật sync nếu tìm thấy các gói liên quan
                                if (related.length > 0) {
                                    setSyncWithRelatedPlans(true);
                                }
                            }
                        } catch (err) {
                            console.error('Error finding related plans:', err);
                        }
                    }

                    // Helper function to convert null to -1 for display in form
                    const displayLimit = (
                        value: number | null,
                        setUnlimited: (v: boolean) => void
                    ): string => {
                        if (value === null) {
                            setUnlimited(true);
                            return '';
                        }
                        setUnlimited(false);
                        return value.toString();
                    };

                    setFormData({
                        name: plan.name,
                        description: plan.description || '',
                        price: plan.price.toString(),
                        billingCycle: plan.billingCycle,
                        maxDoctors: displayLimit(plan.maxDoctors, setIsUnlimitedDoctors),
                        maxSpecialties: displayLimit(
                            plan.maxSpecialties,
                            setIsUnlimitedSpecialties
                        ),
                        maxAppointments: displayLimit(
                            plan.maxAppointments,
                            setIsUnlimitedAppointments
                        ),
                        features: plan.features || '',
                        status: plan.status,
                    });
                    setValidationErrors({});
                }
            } catch (error: any) {
                toast.error(error.message || 'Không thể tải thông tin gói dịch vụ');
                navigate('/admin/subscription-plans');
            } finally {
                setIsLoadingPlan(false);
            }
        };

        fetchPlan();
    }, [id, setFormData, setValidationErrors, navigate]);

    // Preview các gói sẽ được update khi sync enabled
    const relatedPlansPreviews = useMemo(() => {
        if (!syncWithRelatedPlans || relatedPlans.length === 0 || !formData.price) {
            return [];
        }

        const basePrice = parseFloat(formData.price);
        if (isNaN(basePrice)) return [];

        return relatedPlans.map((plan) => {
            let newPrice = basePrice;
            if (plan.billingCycle === 'QUARTERLY') {
                newPrice = Math.round(basePrice * 3 * (1 - DISCOUNT_QUARTER));
            } else if (plan.billingCycle === 'YEARLY') {
                newPrice = Math.round(basePrice * 12 * (1 - DISCOUNT_YEAR));
            }

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
                // Giới hạn: sử dụng custom nếu có, nếu không thì dùng từ form (nếu syncSameLimits) hoặc giữ nguyên
                maxDoctors:
                    customPlansConfig[
                        plan.billingCycle === 'QUARTERLY'
                            ? 'quarterly'
                            : ('yearly' as keyof typeof customPlansConfig)
                    ]?.maxDoctors ||
                    (syncSameLimits ? formData.maxDoctors : plan.maxDoctors?.toString() || ''),
                maxSpecialties:
                    customPlansConfig[
                        plan.billingCycle === 'QUARTERLY'
                            ? 'quarterly'
                            : ('yearly' as keyof typeof customPlansConfig)
                    ]?.maxSpecialties ||
                    (syncSameLimits
                        ? formData.maxSpecialties
                        : plan.maxSpecialties?.toString() || ''),
                maxAppointments:
                    customPlansConfig[
                        plan.billingCycle === 'QUARTERLY'
                            ? 'quarterly'
                            : ('yearly' as keyof typeof customPlansConfig)
                    ]?.maxAppointments ||
                    (syncSameLimits
                        ? formData.maxAppointments
                        : plan.maxAppointments?.toString() || ''),
                unlimitedDoctors:
                    customPlansConfig[
                        plan.billingCycle === 'QUARTERLY'
                            ? 'quarterly'
                            : ('yearly' as keyof typeof customPlansConfig)
                    ]?.unlimitedDoctors ??
                    (syncSameLimits ? isUnlimitedDoctors : plan.maxDoctors === null),
                unlimitedSpecialties:
                    customPlansConfig[
                        plan.billingCycle === 'QUARTERLY'
                            ? 'quarterly'
                            : ('yearly' as keyof typeof customPlansConfig)
                    ]?.unlimitedSpecialties ??
                    (syncSameLimits ? isUnlimitedSpecialties : plan.maxSpecialties === null),
                unlimitedAppointments:
                    customPlansConfig[
                        plan.billingCycle === 'QUARTERLY'
                            ? 'quarterly'
                            : ('yearly' as keyof typeof customPlansConfig)
                    ]?.unlimitedAppointments ??
                    (syncSameLimits ? isUnlimitedAppointments : plan.maxAppointments === null),
                features:
                    customPlansConfig[
                        plan.billingCycle === 'QUARTERLY'
                            ? 'quarterly'
                            : ('yearly' as keyof typeof customPlansConfig)
                    ]?.features || (syncSameLimits ? formData.features : plan.features),
                currentFeatures: plan.features,
                status:
                    customPlansConfig[
                        plan.billingCycle === 'QUARTERLY'
                            ? 'quarterly'
                            : ('yearly' as keyof typeof customPlansConfig)
                    ]?.status || (syncSameLimits ? formData.status : plan.status),
                currentStatus: plan.status,
            };
        });
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!id) {
            toast.error('Không tìm thấy ID gói dịch vụ');
            return;
        }

        // Custom validation - tương tự AddSubscriptionPlan
        // Validate tên và giá (bắt buộc)
        if (!formData.name || !formData.name.trim()) {
            toast.error('Vui lòng nhập tên gói dịch vụ');
            return;
        }

        if (!formData.price) {
            toast.error('Vui lòng nhập giá gói');
            return;
        }

        // Validate giá
        const price = parseFloat(formData.price);
        if (isNaN(price) || price <= 0) {
            toast.error('Giá gói phải là số dương');
            return;
        }

        // Validate billing cycle
        if (!formData.billingCycle) {
            toast.error('Vui lòng chọn chu kỳ thanh toán');
            return;
        }

        // Validate giới hạn (chỉ khi không unlimited)
        if (!isUnlimitedDoctors && (!formData.maxDoctors || parseInt(formData.maxDoctors) <= 0)) {
            toast.error('Vui lòng nhập số bác sĩ tối đa hoặc chọn không giới hạn');
            return;
        }

        if (
            !isUnlimitedSpecialties &&
            (!formData.maxSpecialties || parseInt(formData.maxSpecialties) <= 0)
        ) {
            toast.error('Vui lòng nhập số chuyên khoa tối đa hoặc chọn không giới hạn');
            return;
        }

        if (
            !isUnlimitedAppointments &&
            (!formData.maxAppointments || parseInt(formData.maxAppointments) <= 0)
        ) {
            toast.error('Vui lòng nhập số lịch hẹn tối đa hoặc chọn không giới hạn');
            return;
        }

        try {
            setIsSubmitting(true);

            // Helper function to parse and convert -1 to null for unlimited
            const parseLimit = (value: string, unlimited: boolean): number | null => {
                if (unlimited) return null;
                const num = parseInt(value);
                return num === -1 ? null : num;
            };

            const planData: UpdateSubscriptionPlanRequest = {
                name: formData.name,
                description: formData.description || undefined,
                price: parseFloat(formData.price),
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

            // Nếu sync và là gói MONTHLY, update các gói liên quan
            if (
                syncWithRelatedPlans &&
                currentPlanBillingCycle === 'MONTHLY' &&
                relatedPlans.length > 0
            ) {
                const basePrice = parseFloat(formData.price);
                let updatedCount = 0;

                for (const relatedPlan of relatedPlans) {
                    try {
                        let newPrice = basePrice;
                        const key =
                            relatedPlan.billingCycle === 'QUARTERLY' ? 'quarterly' : 'yearly';

                        // Tính giá mới dựa trên chu kỳ
                        if (relatedPlan.billingCycle === 'QUARTERLY') {
                            newPrice = Math.round(basePrice * 3 * (1 - DISCOUNT_QUARTER));
                        } else if (relatedPlan.billingCycle === 'YEARLY') {
                            newPrice = Math.round(basePrice * 12 * (1 - DISCOUNT_YEAR));
                        }

                        const relatedPlanData: UpdateSubscriptionPlanRequest = {
                            name: relatedPlan.name, // Giữ nguyên tên
                            description: formData.description || undefined,
                            price: newPrice,
                            billingCycle: relatedPlan.billingCycle,
                            // Nếu có custom config, dùng custom; nếu không và syncSameLimits = true, copy từ gói chính; nếu false, giữ nguyên
                            maxDoctors: parseLimit(
                                customPlansConfig[key as keyof typeof customPlansConfig]
                                    ?.maxDoctors ||
                                    (syncSameLimits
                                        ? formData.maxDoctors
                                        : relatedPlan.maxDoctors?.toString() || ''),
                                customPlansConfig[key as keyof typeof customPlansConfig]
                                    ?.unlimitedDoctors ??
                                    (syncSameLimits
                                        ? isUnlimitedDoctors
                                        : relatedPlan.maxDoctors === null)
                            ),
                            maxSpecialties: parseLimit(
                                customPlansConfig[key as keyof typeof customPlansConfig]
                                    ?.maxSpecialties ||
                                    (syncSameLimits
                                        ? formData.maxSpecialties
                                        : relatedPlan.maxSpecialties?.toString() || ''),
                                customPlansConfig[key as keyof typeof customPlansConfig]
                                    ?.unlimitedSpecialties ??
                                    (syncSameLimits
                                        ? isUnlimitedSpecialties
                                        : relatedPlan.maxSpecialties === null)
                            ),
                            maxAppointments: parseLimit(
                                customPlansConfig[key as keyof typeof customPlansConfig]
                                    ?.maxAppointments ||
                                    (syncSameLimits
                                        ? formData.maxAppointments
                                        : relatedPlan.maxAppointments?.toString() || ''),
                                customPlansConfig[key as keyof typeof customPlansConfig]
                                    ?.unlimitedAppointments ??
                                    (syncSameLimits
                                        ? isUnlimitedAppointments
                                        : relatedPlan.maxAppointments === null)
                            ),
                            features:
                                customPlansConfig[key as keyof typeof customPlansConfig]
                                    ?.features ||
                                (syncSameLimits
                                    ? formData.features || undefined
                                    : relatedPlan.features),
                            status:
                                customPlansConfig[key as keyof typeof customPlansConfig]?.status ||
                                (syncSameLimits ? formData.status : relatedPlan.status),
                        };

                        await updateSubscriptionPlan(relatedPlan.id, relatedPlanData);
                        updatedCount++;
                    } catch (err: any) {
                        console.error(`Error updating related plan ${relatedPlan.name}:`, err);
                        toast.warning(`Không thể cập nhật gói ${relatedPlan.name}`);
                    }
                }

                if (updatedCount > 0) {
                    toast.success(`Đã cập nhật gói chính và ${updatedCount} gói liên quan!`);
                } else {
                    toast.success('Cập nhật gói dịch vụ thành công!');
                }
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
                                    <i className="ti ti-refresh me-2"></i>
                                    Tự động cập nhật các gói liên quan
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
                                    <i className="ti ti-copy me-2"></i>
                                    Đồng bộ cả Giới hạn và Tính năng từ gói tháng
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
                                                                                {syncSameLimits &&
                                                                                !customPlansConfig[
                                                                                    preview.billingCycle ===
                                                                                    'QUARTERLY'
                                                                                        ? 'quarterly'
                                                                                        : ('yearly' as keyof typeof customPlansConfig)
                                                                                ]?.features
                                                                                    ? 'Tính năng (từ gói tháng):'
                                                                                    : 'Tính năng:'}
                                                                            </h6>
                                                                            <ul className="mb-0 ps-3">
                                                                                {parsedFeatures.map(
                                                                                    (
                                                                                        feature: any,
                                                                                        idx: number
                                                                                    ) => (
                                                                                        <li
                                                                                            key={
                                                                                                idx
                                                                                            }
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
                                                                        <i className="ti ti-alert-circle me-1"></i>
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
                                                                {syncSameLimits &&
                                                                !customPlansConfig[
                                                                    preview.billingCycle ===
                                                                    'QUARTERLY'
                                                                        ? 'quarterly'
                                                                        : ('yearly' as keyof typeof customPlansConfig)
                                                                ]?.maxDoctors
                                                                    ? 'Giới hạn (từ gói tháng):'
                                                                    : 'Tùy chỉnh giới hạn:'}
                                                            </h6>
                                                            <div className="small">
                                                                {/* Bác sĩ */}
                                                                <div className="mb-2">
                                                                    <label className="form-label small mb-1">
                                                                        Bác sĩ:
                                                                    </label>
                                                                    <div className="d-flex gap-1">
                                                                        <input
                                                                            type="number"
                                                                            className="form-control form-control-sm"
                                                                            placeholder={
                                                                                formData.maxDoctors ||
                                                                                '10'
                                                                            }
                                                                            value={
                                                                                preview.unlimitedDoctors
                                                                                    ? ''
                                                                                    : preview.maxDoctors
                                                                            }
                                                                            disabled={
                                                                                preview.unlimitedDoctors
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
                                                                                            maxDoctors:
                                                                                                e
                                                                                                    .target
                                                                                                    .value,
                                                                                            unlimitedDoctors: false,
                                                                                        },
                                                                                    })
                                                                                );
                                                                            }}
                                                                        />
                                                                        <div className="form-check">
                                                                            <input
                                                                                type="checkbox"
                                                                                className="form-check-input"
                                                                                checked={
                                                                                    preview.unlimitedDoctors
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
                                                                                                unlimitedDoctors:
                                                                                                    e
                                                                                                        .target
                                                                                                        .checked,
                                                                                                maxDoctors:
                                                                                                    '',
                                                                                            },
                                                                                        })
                                                                                    );
                                                                                }}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Chuyên khoa */}
                                                                <div className="mb-2">
                                                                    <label className="form-label small mb-1">
                                                                        Chuyên khoa:
                                                                    </label>
                                                                    <div className="d-flex gap-1">
                                                                        <input
                                                                            type="number"
                                                                            className="form-control form-control-sm"
                                                                            placeholder={
                                                                                formData.maxSpecialties ||
                                                                                '5'
                                                                            }
                                                                            value={
                                                                                preview.unlimitedSpecialties
                                                                                    ? ''
                                                                                    : preview.maxSpecialties
                                                                            }
                                                                            disabled={
                                                                                preview.unlimitedSpecialties
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
                                                                                            maxSpecialties:
                                                                                                e
                                                                                                    .target
                                                                                                    .value,
                                                                                            unlimitedSpecialties: false,
                                                                                        },
                                                                                    })
                                                                                );
                                                                            }}
                                                                        />
                                                                        <div className="form-check">
                                                                            <input
                                                                                type="checkbox"
                                                                                className="form-check-input"
                                                                                checked={
                                                                                    preview.unlimitedSpecialties
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
                                                                                                unlimitedSpecialties:
                                                                                                    e
                                                                                                        .target
                                                                                                        .checked,
                                                                                                maxSpecialties:
                                                                                                    '',
                                                                                            },
                                                                                        })
                                                                                    );
                                                                                }}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Lịch hẹn */}
                                                                <div className="mb-1">
                                                                    <label className="form-label small mb-1">
                                                                        Lịch hẹn:
                                                                    </label>
                                                                    <div className="d-flex gap-1">
                                                                        <input
                                                                            type="number"
                                                                            className="form-control form-control-sm"
                                                                            placeholder={
                                                                                formData.maxAppointments ||
                                                                                '100'
                                                                            }
                                                                            value={
                                                                                preview.unlimitedAppointments
                                                                                    ? ''
                                                                                    : preview.maxAppointments
                                                                            }
                                                                            disabled={
                                                                                preview.unlimitedAppointments
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
                                                                                            maxAppointments:
                                                                                                e
                                                                                                    .target
                                                                                                    .value,
                                                                                            unlimitedAppointments: false,
                                                                                        },
                                                                                    })
                                                                                );
                                                                            }}
                                                                        />
                                                                        <div className="form-check">
                                                                            <input
                                                                                type="checkbox"
                                                                                className="form-check-input"
                                                                                checked={
                                                                                    preview.unlimitedAppointments
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
                                                                                                unlimitedAppointments:
                                                                                                    e
                                                                                                        .target
                                                                                                        .checked,
                                                                                                maxAppointments:
                                                                                                    '',
                                                                                            },
                                                                                        })
                                                                                    );
                                                                                }}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <small className="text-muted">
                                                                    <i className="ti ti-check me-1"></i>{' '}
                                                                    = Không giới hạn
                                                                </small>

                                                                {/* Status dropdown cho gói Quý và Năm */}
                                                                <div className="mt-3">
                                                                    <label className="form-label small mb-1">
                                                                        Trạng thái:
                                                                    </label>
                                                                    <select
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
