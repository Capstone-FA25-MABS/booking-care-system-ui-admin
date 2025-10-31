import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import SubscriptionPlanFormFields from './SubscriptionPlanFormFields';
import FeaturesInput from '@/components/FormComponents/FeaturesInput';
import { useSubscriptionPlanFormValidation } from '@/hooks/useSubscriptionPlanFormValidation';
import { createSubscriptionPlan } from '@/services/subscription.service';
import { CreateSubscriptionPlanRequest } from '@/services/subscription.service';

// Thêm state toggle unlimited
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

const AddSubscriptionPlan: React.FC = () => {
    const navigate = useNavigate();
    const [isUnlimitedDoctors, setIsUnlimitedDoctors] = useState(false);
    const [isUnlimitedSpecialties, setIsUnlimitedSpecialties] = useState(false);
    const [isUnlimitedAppointments, setIsUnlimitedAppointments] = useState(false);
    const [autoCreateAllCycles, setAutoCreateAllCycles] = useState(true); // Mặc định tạo 3 gói

    const {
        formData,
        validationErrors,
        isSubmitting,
        setIsSubmitting,
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

    // State để lưu custom config cho từng gói
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

    // Preview 3 gói sẽ được tạo (chỉ khi autoCreateAllCycles = true)
    const plansPreviews = useMemo(() => {
        if (!autoCreateAllCycles) return [];
        if (!formData.name || !formData.price || Number.isNaN(Number(formData.price))) {
            return [];
        }

        const price = parseFloat(formData.price);
        const baseName = formData.name;

        return [
            {
                name: baseName,
                billingCycle: 'MONTHLY',
                price: price,
                discount: 0,
                label: 'Gói Tháng',
                description: 'Thanh toán hàng tháng',
                maxDoctors: formData.maxDoctors,
                maxSpecialties: formData.maxSpecialties,
                maxAppointments: formData.maxAppointments,
                unlimitedDoctors: isUnlimitedDoctors,
                unlimitedSpecialties: isUnlimitedSpecialties,
                unlimitedAppointments: isUnlimitedAppointments,
                features: formData.features,
                status: formData.status,
            },
            {
                name: baseName,
                billingCycle: 'QUARTERLY',
                price: Math.round(price * 3 * (1 - DISCOUNT_QUARTER)),
                discount: DISCOUNT_QUARTER,
                label: 'Gói Quý',
                description: `Thanh toán theo quý - Giảm ${DISCOUNT_QUARTER * 100}%`,
                maxDoctors: customPlansConfig.quarterly?.maxDoctors || formData.maxDoctors,
                maxSpecialties:
                    customPlansConfig.quarterly?.maxSpecialties || formData.maxSpecialties,
                maxAppointments:
                    customPlansConfig.quarterly?.maxAppointments || formData.maxAppointments,
                unlimitedDoctors:
                    customPlansConfig.quarterly?.unlimitedDoctors ?? isUnlimitedDoctors,
                unlimitedSpecialties:
                    customPlansConfig.quarterly?.unlimitedSpecialties ?? isUnlimitedSpecialties,
                unlimitedAppointments:
                    customPlansConfig.quarterly?.unlimitedAppointments ?? isUnlimitedAppointments,
                features: customPlansConfig.quarterly?.features || formData.features,
                status: customPlansConfig.quarterly?.status || formData.status,
            },
            {
                name: baseName,
                billingCycle: 'YEARLY',
                price: Math.round(price * 12 * (1 - DISCOUNT_YEAR)),
                discount: DISCOUNT_YEAR,
                label: 'Gói Năm',
                description: `Thanh toán theo năm - Giảm ${DISCOUNT_YEAR * 100}%`,
                maxDoctors: customPlansConfig.yearly?.maxDoctors || formData.maxDoctors,
                maxSpecialties: customPlansConfig.yearly?.maxSpecialties || formData.maxSpecialties,
                maxAppointments:
                    customPlansConfig.yearly?.maxAppointments || formData.maxAppointments,
                unlimitedDoctors: customPlansConfig.yearly?.unlimitedDoctors ?? isUnlimitedDoctors,
                unlimitedSpecialties:
                    customPlansConfig.yearly?.unlimitedSpecialties ?? isUnlimitedSpecialties,
                unlimitedAppointments:
                    customPlansConfig.yearly?.unlimitedAppointments ?? isUnlimitedAppointments,
                features: customPlansConfig.yearly?.features || formData.features,
                status: customPlansConfig.yearly?.status || formData.status,
            },
        ];
    }, [
        formData.name,
        formData.price,
        formData.maxDoctors,
        formData.maxSpecialties,
        formData.maxAppointments,
        formData.features,
        formData.status,
        autoCreateAllCycles,
        isUnlimitedDoctors,
        isUnlimitedSpecialties,
        isUnlimitedAppointments,
        customPlansConfig,
    ]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Custom validation - không cần billing cycle vì tự động tạo 3 gói
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

        // Validate billing cycle (chỉ khi tạo 1 gói)
        if (!autoCreateAllCycles && !formData.billingCycle) {
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
                if (unlimited) return null; // null = không giới hạn khi gửi lên server
                const num = parseInt(value);
                return num === -1 ? null : num;
            };

            const basePrice = parseFloat(formData.price);
            const baseName = formData.name;

            let plansToCreate: CreateSubscriptionPlanRequest[] = [];

            if (autoCreateAllCycles) {
                // Tạo 3 gói: Monthly, Quarterly, Yearly với custom config
                plansToCreate = [
                    {
                        name: baseName,
                        description: formData.description || undefined,
                        price: basePrice,
                        billingCycle: 'MONTHLY',
                        maxDoctors: parseLimit(formData.maxDoctors, isUnlimitedDoctors),
                        maxSpecialties: parseLimit(formData.maxSpecialties, isUnlimitedSpecialties),
                        maxAppointments: parseLimit(
                            formData.maxAppointments,
                            isUnlimitedAppointments
                        ),
                        features: formData.features || undefined,
                        status: formData.status,
                    },
                    {
                        name: baseName,
                        description: formData.description || undefined,
                        price: Math.round(basePrice * 3 * (1 - DISCOUNT_QUARTER)),
                        billingCycle: 'QUARTERLY',
                        maxDoctors: parseLimit(
                            customPlansConfig.quarterly?.maxDoctors || formData.maxDoctors,
                            customPlansConfig.quarterly?.unlimitedDoctors ?? isUnlimitedDoctors
                        ),
                        maxSpecialties: parseLimit(
                            customPlansConfig.quarterly?.maxSpecialties || formData.maxSpecialties,
                            customPlansConfig.quarterly?.unlimitedSpecialties ??
                                isUnlimitedSpecialties
                        ),
                        maxAppointments: parseLimit(
                            customPlansConfig.quarterly?.maxAppointments ||
                                formData.maxAppointments,
                            customPlansConfig.quarterly?.unlimitedAppointments ??
                                isUnlimitedAppointments
                        ),
                        features:
                            customPlansConfig.quarterly?.features || formData.features || undefined,
                        status: customPlansConfig.quarterly?.status || formData.status,
                    },
                    {
                        name: baseName,
                        description: formData.description || undefined,
                        price: Math.round(basePrice * 12 * (1 - DISCOUNT_YEAR)),
                        billingCycle: 'YEARLY',
                        maxDoctors: parseLimit(
                            customPlansConfig.yearly?.maxDoctors || formData.maxDoctors,
                            customPlansConfig.yearly?.unlimitedDoctors ?? isUnlimitedDoctors
                        ),
                        maxSpecialties: parseLimit(
                            customPlansConfig.yearly?.maxSpecialties || formData.maxSpecialties,
                            customPlansConfig.yearly?.unlimitedSpecialties ?? isUnlimitedSpecialties
                        ),
                        maxAppointments: parseLimit(
                            customPlansConfig.yearly?.maxAppointments || formData.maxAppointments,
                            customPlansConfig.yearly?.unlimitedAppointments ??
                                isUnlimitedAppointments
                        ),
                        features:
                            customPlansConfig.yearly?.features || formData.features || undefined,
                        status: customPlansConfig.yearly?.status || formData.status,
                    },
                ];
            } else {
                // Chỉ tạo 1 gói theo billing cycle đã chọn
                plansToCreate = [
                    {
                        name: formData.name, // Giữ nguyên tên, không thêm suffix
                        description: formData.description || undefined,
                        price: basePrice,
                        billingCycle: formData.billingCycle as 'MONTHLY' | 'QUARTERLY' | 'YEARLY',
                        maxDoctors: parseLimit(formData.maxDoctors, isUnlimitedDoctors),
                        maxSpecialties: parseLimit(formData.maxSpecialties, isUnlimitedSpecialties),
                        maxAppointments: parseLimit(
                            formData.maxAppointments,
                            isUnlimitedAppointments
                        ),
                        features: formData.features || undefined,
                        status: formData.status,
                    },
                ];
            }

            // Tạo lần lượt từng gói
            let successCount = 0;
            for (const plan of plansToCreate) {
                try {
                    await createSubscriptionPlan(plan);
                    successCount++;
                } catch (error: any) {
                    console.error(`Lỗi khi tạo gói ${plan.name}:`, error);
                    toast.error(`Không thể tạo gói ${plan.name}: ${error.message}`);
                }
            }

            if (successCount === plansToCreate.length) {
                if (autoCreateAllCycles) {
                    toast.success('Đã tạo thành công 3 gói dịch vụ (Tháng, Quý, Năm)!');
                } else {
                    toast.success('Tạo gói dịch vụ thành công!');
                }
                navigate('/admin/subscription-plans');
            } else if (successCount > 0) {
                toast.warning(
                    `Đã tạo ${successCount}/${plansToCreate.length} gói. Vui lòng kiểm tra lại.`
                );
                navigate('/admin/subscription-plans');
            } else {
                toast.error('Không thể tạo gói dịch vụ nào. Vui lòng thử lại.');
            }
        } catch (error: any) {
            toast.error(error.message || 'Có lỗi xảy ra khi thêm gói dịch vụ');
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
                    <h4 className="fw-bold mb-0">Thêm Gói Dịch Vụ</h4>
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
                        isLoading={isSubmitting}
                        isEdit={false}
                        // truyền xuống
                        isUnlimitedDoctors={isUnlimitedDoctors}
                        isUnlimitedSpecialties={isUnlimitedSpecialties}
                        isUnlimitedAppointments={isUnlimitedAppointments}
                        onToggleUnlimitedDoctors={setIsUnlimitedDoctors}
                        onToggleUnlimitedSpecialties={setIsUnlimitedSpecialties}
                        onToggleUnlimitedAppointments={setIsUnlimitedAppointments}
                        // Auto create all cycles option
                        autoCreateAllCycles={autoCreateAllCycles}
                        onToggleAutoCreateAllCycles={setAutoCreateAllCycles}
                    />
                </div>
            </div>
            {/* Preview 3 gói sẽ được tạo */}
            {plansPreviews.length > 0 && (
                <div className="mb-3 mt-4">
                    <div className="alert alert-info">
                        <i className="ti ti-info-circle me-2"></i>
                        <strong>Lưu ý:</strong> Khi nhấn "Tạo Gói Dịch Vụ", hệ thống sẽ tự động tạo
                        3 gói sau. Bạn có thể tùy chỉnh giới hạn và tính năng cho từng gói:
                    </div>
                    <div className="d-flex flex-column gap-3">
                        {plansPreviews.map((preview, index) => (
                            <div key={preview.billingCycle}>
                                <div className="card border-primary">
                                    <div className="card-body">
                                        {/* Header với thông tin cơ bản */}
                                        <div className="row mb-3">
                                            <div className="col-md-4">
                                                <div className="d-flex align-items-center mb-2">
                                                    <i className="ti ti-package text-primary me-2 fs-4"></i>
                                                    <h5 className="mb-0 fw-bold">
                                                        {preview.label}
                                                    </h5>
                                                </div>
                                                <div className="mb-1">
                                                    <small className="text-muted">Tên gói:</small>
                                                    <br />
                                                    <strong>{preview.name}</strong>
                                                </div>
                                                <div className="mb-1">
                                                    <small className="text-muted">Giá:</small>
                                                    <br />
                                                    <span className="text-success fw-bold fs-5">
                                                        {preview.price.toLocaleString('vi-VN')} VNĐ
                                                    </span>
                                                </div>
                                                {preview.discount > 0 && (
                                                    <div className="mt-2">
                                                        <span className="badge bg-success">
                                                            Tiết kiệm{' '}
                                                            {(preview.discount * 100).toFixed(0)}%
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Cột 2: Tính năng hiện tại */}
                                            <div className="col-md-4">
                                                {preview.features &&
                                                    (() => {
                                                        const parsedFeatures = safeParseJSON(
                                                            preview.features
                                                        );

                                                        if (
                                                            parsedFeatures &&
                                                            parsedFeatures.length > 0
                                                        ) {
                                                            return (
                                                                <div>
                                                                    <h6 className="fw-bold mb-2">
                                                                        <i className="ti ti-star text-warning me-1"></i>
                                                                        Tính năng:
                                                                    </h6>
                                                                    <ul className="mb-0 ps-3">
                                                                        {parsedFeatures.map(
                                                                            (
                                                                                feature: any,
                                                                                idx: number
                                                                            ) => (
                                                                                <li
                                                                                    key={idx}
                                                                                    className="text-muted mb-1"
                                                                                >
                                                                                    {feature.text}
                                                                                </li>
                                                                            )
                                                                        )}
                                                                    </ul>
                                                                </div>
                                                            );
                                                        }
                                                        return (
                                                            <div className="text-muted small">
                                                                <i className="ti ti-arrow-up me-1"></i>
                                                                Tính năng từ form trên
                                                            </div>
                                                        );
                                                    })()}
                                            </div>

                                            {/* Cột 3: Giới hạn (cho gói Quý và Năm) hoặc thông tin cho gói Tháng */}
                                            <div className="col-md-4">
                                                {index > 0 ? (
                                                    <div>
                                                        <h6 className="fw-bold mb-2">
                                                            <i className="ti ti-settings text-info me-1"></i>
                                                            Tùy chỉnh giới hạn:
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
                                                                                            e.target
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
                                                                                            e.target
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
                                                                                            e.target
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
                                                                        preview.status || 'ACTIVE'
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
                                                                                    status: e.target
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
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="text-muted small">
                                                        <i className="ti ti-arrow-up me-1"></i>
                                                        <strong>Gói tháng sử dụng:</strong>
                                                        <ul className="mb-0 mt-1 ps-3">
                                                            <li>Giới hạn từ form trên</li>
                                                            <li>Tính năng từ form trên</li>
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Tính năng riêng cho gói Quý và Năm (full width) */}
                                        {index > 0 && (
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
                                                                ...prev[key as keyof typeof prev],
                                                                features: newFeatures,
                                                            },
                                                        }));
                                                    }}
                                                />
                                                <small className="text-muted d-block mt-2">
                                                    <i className="ti ti-info-circle me-1"></i>
                                                    Để trống = dùng tính năng gói tháng
                                                </small>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Action Buttons Card - Di chuyển xuống dưới cùng */}
            <div className="card mt-4">
                <div className="card-body">
                    <div className="d-flex justify-content-end gap-2">
                        <button
                            type="button"
                            className="btn btn-light btn-lg"
                            onClick={handleCancel}
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
                            <i className="ti ti-plus me-2"></i>
                            {isSubmitting ? 'Đang tạo...' : 'Tạo Gói Dịch Vụ'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddSubscriptionPlan;
