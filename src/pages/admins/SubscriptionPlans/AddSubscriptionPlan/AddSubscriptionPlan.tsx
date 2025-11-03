import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
    createSubscriptionPlan,
    CreateSubscriptionPlanRequest,
} from '@/services/subscription.service';

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
    const [customPlansConfig, setCustomPlansConfig] = useState<CustomPlansConfig>({});

    // Preview 3 gói sẽ được tạo (chỉ khi autoCreateAllCycles = true)
    const plansPreviews = useMemo(() => {
        if (!autoCreateAllCycles) return [];
        if (!formData.name || !formData.price || Number.isNaN(Number(formData.price))) {
            return [];
        }

        const price = Number.parseFloat(formData.price);
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
        const validationError = validateSubscriptionPlanForm(
            formData,
            isUnlimitedDoctors,
            isUnlimitedSpecialties,
            isUnlimitedAppointments,
            !autoCreateAllCycles
        );

        if (validationError) {
            toast.error(validationError);
            return;
        }

        try {
            setIsSubmitting(true);

            const basePrice = Number.parseFloat(formData.price);
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
                                                                        <i className="ti ti-star text-warning me-1"></i>{' '}
                                                                        Tính năng:
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
                                                                <i className="ti ti-arrow-up me-1"></i>{' '}
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
                                                            <i className="ti ti-settings text-info me-1"></i>{' '}
                                                            Tùy chỉnh giới hạn:
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
                                                                unlimited={preview.unlimitedDoctors}
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
                                                                    formData.maxSpecialties || '5'
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
                                                                    htmlFor={`status-${preview.billingCycle}-${index}`}
                                                                    className="form-label small mb-1"
                                                                >
                                                                    Trạng thái:
                                                                </label>
                                                                <select
                                                                    id={`status-${preview.billingCycle}-${index}`}
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
                                                    <i className="ti ti-info-circle me-1"></i> Để
                                                    trống = dùng tính năng gói tháng
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
