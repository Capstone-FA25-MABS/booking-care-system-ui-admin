import React from 'react';
import Select from 'react-select';
import Input from '@/components/Input';
import Textarea from '@/components/Textarea';
import StatusSelect from '@/components/FormComponents/StatusSelect';
import FeaturesInput from '@/components/FormComponents/FeaturesInput';
import Spinner from '@/components/Spinner';
import {
    SubscriptionPlanFormData,
    SubscriptionPlanValidationErrors,
} from '@/hooks/useSubscriptionPlanFormValidation';
import { selectCustomStyles } from '@/constants/select.styles';

interface SubscriptionPlanFormFieldsProps {
    formData: SubscriptionPlanFormData;
    errors: SubscriptionPlanValidationErrors;
    onNameChange: (value: string) => void;
    onDescriptionChange: (value: string) => void;
    onPriceChange: (value: string) => void;
    onBillingCycleChange?: (value: string) => void;
    onMaxDoctorsChange: (value: string) => void;
    onMaxSpecialtiesChange: (value: string) => void;
    onMaxAppointmentsChange: (value: string) => void;
    onFeaturesChange: (value: string) => void;
    onStatusChange?: (value: 'ACTIVE' | 'INACTIVE') => void;
    onSubmit: (e: React.FormEvent) => void;
    onCancel: () => void;
    isLoading?: boolean;
    isEdit?: boolean;
    // toggle unlimited
    isUnlimitedDoctors: boolean;
    isUnlimitedSpecialties: boolean;
    isUnlimitedAppointments: boolean;
    onToggleUnlimitedDoctors: (checked: boolean) => void;
    onToggleUnlimitedSpecialties: (checked: boolean) => void;
    onToggleUnlimitedAppointments: (checked: boolean) => void;
    // auto create all cycles option
    autoCreateAllCycles?: boolean;
    onToggleAutoCreateAllCycles?: (checked: boolean) => void;
}

const SubscriptionPlanFormFields: React.FC<SubscriptionPlanFormFieldsProps> = ({
    formData,
    errors,
    onNameChange,
    onDescriptionChange,
    onPriceChange,
    onBillingCycleChange,
    onMaxDoctorsChange,
    onMaxSpecialtiesChange,
    onMaxAppointmentsChange,
    onFeaturesChange,
    onStatusChange,
    onSubmit,
    onCancel: _onCancel,
    isLoading = false,
    isEdit = false,
    isUnlimitedDoctors,
    isUnlimitedSpecialties,
    isUnlimitedAppointments,
    onToggleUnlimitedDoctors,
    onToggleUnlimitedSpecialties,
    onToggleUnlimitedAppointments,
    autoCreateAllCycles = true,
    onToggleAutoCreateAllCycles,
}) => {
    if (isLoading) {
        return (
            <div
                className="d-flex justify-content-center align-items-center"
                style={{
                    minHeight: 'calc(100vh - 300px)',
                    width: '100%',
                }}
            >
                <div className="text-center">
                    <Spinner size="large" variant="primary" />
                    <p className="mt-3 text-muted">Đang tải dữ liệu...</p>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={onSubmit}>
            {/* Basic Information Card */}
            <div className="card mb-4">
                <div className="card-body">
                    <h5 className="card-title mb-3">Thông tin cơ bản</h5>
                    <div className="row">
                        <div className="col-md-12">
                            <Input
                                wrapperClassName="mb-3"
                                label="Tên Gói Dịch Vụ"
                                required
                                name="name"
                                value={formData.name}
                                onChange={(e) => onNameChange(e.target.value)}
                                placeholder="Nhập tên gói dịch vụ"
                                error={errors.name}
                            />
                        </div>
                        <div className="col-md-12">
                            <Textarea
                                wrapperClassName="mb-3"
                                label="Mô tả"
                                name="description"
                                value={formData.description || ''}
                                onChange={(e) => onDescriptionChange(e.target.value)}
                                placeholder="Nhập mô tả gói dịch vụ"
                                rows={4}
                                error={errors.description}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Pricing & Limits Card */}
            <div className="card mb-4">
                <div className="card-body">
                    <h5 className="card-title mb-3">Giá và Giới hạn</h5>

                    {/* Auto Create All Cycles Toggle - Only show in Add mode */}
                    {!isEdit && onToggleAutoCreateAllCycles && (
                        <div className="mb-4 p-3 bg-light rounded">
                            <div className="form-check form-switch">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id="autoCreateAllCycles"
                                    checked={autoCreateAllCycles}
                                    onChange={(e) => onToggleAutoCreateAllCycles(e.target.checked)}
                                />
                                <label
                                    className="form-check-label fw-semibold"
                                    htmlFor="autoCreateAllCycles"
                                >
                                    <i className="ti ti-copy me-2"></i>
                                    Tự động tạo 3 gói (Tháng, Quý, Năm)
                                </label>
                            </div>
                            <small className="text-muted d-block mt-2">
                                {autoCreateAllCycles
                                    ? '✅ Hệ thống sẽ tự động tạo 3 gói với giá ưu đãi cho quý và năm'
                                    : '⚠️ Chỉ tạo 1 gói theo chu kỳ bạn chọn'}
                            </small>
                        </div>
                    )}

                    <div className="row">
                        <div className={autoCreateAllCycles && !isEdit ? 'col-md-12' : 'col-md-6'}>
                            <Input
                                wrapperClassName="mb-3"
                                label={
                                    autoCreateAllCycles && !isEdit
                                        ? 'Giá Gói Tháng (VNĐ)'
                                        : 'Giá (VNĐ)'
                                }
                                type="number"
                                required
                                name="price"
                                value={formData.price}
                                onChange={(e) => onPriceChange(e.target.value)}
                                placeholder={
                                    autoCreateAllCycles && !isEdit
                                        ? 'Nhập giá gói theo tháng (hệ thống tự tính giá quý và năm)'
                                        : 'Nhập giá gói dịch vụ'
                                }
                                error={errors.price}
                                min="0"
                                step="1000"
                            />
                            {autoCreateAllCycles && !isEdit && (
                                <small className="text-muted">
                                    <i className="ti ti-info-circle me-1"></i>
                                    Giá gói Quý sẽ giảm 10%, gói Năm sẽ giảm 20% so với giá tổng các
                                    tháng
                                </small>
                            )}
                        </div>

                        {/* Billing Cycle - Show when NOT auto-creating or in Edit mode */}
                        {(!autoCreateAllCycles || isEdit) && onBillingCycleChange && (
                            <div className="col-md-6 mb-3">
                                <label htmlFor="billingCycle" className="form-label">
                                    Chu Kỳ Thanh Toán <span className="text-danger">*</span>
                                </label>
                                <Select
                                    inputId="billingCycle"
                                    options={[
                                        { value: 'MONTHLY', label: 'Hàng tháng' },
                                        { value: 'QUARTERLY', label: 'Hàng quý' },
                                        { value: 'YEARLY', label: 'Hàng năm' },
                                    ]}
                                    value={
                                        formData.billingCycle
                                            ? (() => {
                                                  const getBillingCycleLabel = () => {
                                                      if (formData.billingCycle === 'MONTHLY')
                                                          return 'Hàng tháng';
                                                      if (formData.billingCycle === 'QUARTERLY')
                                                          return 'Hàng quý';
                                                      return 'Hàng năm';
                                                  };
                                                  return {
                                                      value: formData.billingCycle,
                                                      label: getBillingCycleLabel(),
                                                  };
                                              })()
                                            : null
                                    }
                                    onChange={(selectedOption) => {
                                        onBillingCycleChange(selectedOption?.value || '');
                                    }}
                                    placeholder="Chọn chu kỳ thanh toán"
                                    className={errors.billingCycle ? 'is-invalid' : ''}
                                    classNamePrefix="select2"
                                    styles={selectCustomStyles}
                                    menuPortalTarget={document.body}
                                />
                                {errors.billingCycle && (
                                    <div className="text-danger mt-1">{errors.billingCycle}</div>
                                )}
                            </div>
                        )}

                        <div className="col-md-4">
                            <label htmlFor="maxDoctors" className="form-label">
                                Số Bác Sĩ Tối Đa
                            </label>
                            <div className="d-flex align-items-center">
                                <Input
                                    id="maxDoctors"
                                    className="flex-grow-1"
                                    type="number"
                                    required
                                    name="maxDoctors"
                                    value={isUnlimitedDoctors ? '' : formData.maxDoctors}
                                    onChange={(e) => onMaxDoctorsChange(e.target.value)}
                                    placeholder="Nhập số lượng"
                                    error={errors.maxDoctors}
                                    min="1"
                                    disabled={isUnlimitedDoctors}
                                />
                                <div className="form-check form-switch ms-3">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id="unlimitedDoctors"
                                        checked={isUnlimitedDoctors}
                                        onChange={(e) => onToggleUnlimitedDoctors(e.target.checked)}
                                    />
                                    <label
                                        className="form-check-label ms-2"
                                        htmlFor="unlimitedDoctors"
                                    >
                                        Không giới hạn
                                    </label>
                                </div>
                            </div>
                            {errors.maxDoctors && (
                                <div className="form-text text-danger">{errors.maxDoctors}</div>
                            )}
                        </div>
                        <div className="col-md-4">
                            <label htmlFor="maxSpecialties" className="form-label">
                                Số Chuyên Khoa Tối Đa
                            </label>
                            <div className="d-flex align-items-center">
                                <Input
                                    id="maxSpecialties"
                                    className="flex-grow-1"
                                    type="number"
                                    required
                                    name="maxSpecialties"
                                    value={isUnlimitedSpecialties ? '' : formData.maxSpecialties}
                                    onChange={(e) => onMaxSpecialtiesChange(e.target.value)}
                                    placeholder="Nhập số lượng"
                                    error={errors.maxSpecialties}
                                    min="1"
                                    disabled={isUnlimitedSpecialties}
                                />
                                <div className="form-check form-switch ms-3">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id="unlimitedSpecialties"
                                        checked={isUnlimitedSpecialties}
                                        onChange={(e) =>
                                            onToggleUnlimitedSpecialties(e.target.checked)
                                        }
                                    />
                                    <label
                                        className="form-check-label ms-2"
                                        htmlFor="unlimitedSpecialties"
                                    >
                                        Không giới hạn
                                    </label>
                                </div>
                            </div>
                            {errors.maxSpecialties && (
                                <div className="form-text text-danger">{errors.maxSpecialties}</div>
                            )}
                        </div>
                        <div className="col-md-4">
                            <label htmlFor="maxAppointments" className="form-label">
                                Số Lịch Hẹn Tối Đa
                            </label>
                            <div className="d-flex align-items-center">
                                <Input
                                    id="maxAppointments"
                                    className="flex-grow-1"
                                    type="number"
                                    required
                                    name="maxAppointments"
                                    value={isUnlimitedAppointments ? '' : formData.maxAppointments}
                                    onChange={(e) => onMaxAppointmentsChange(e.target.value)}
                                    placeholder="Nhập số lượng"
                                    error={errors.maxAppointments}
                                    min="1"
                                    disabled={isUnlimitedAppointments}
                                />
                                <div className="form-check form-switch ms-3">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id="unlimitedAppointments"
                                        checked={isUnlimitedAppointments}
                                        onChange={(e) =>
                                            onToggleUnlimitedAppointments(e.target.checked)
                                        }
                                    />
                                    <label
                                        className="form-check-label ms-2"
                                        htmlFor="unlimitedAppointments"
                                    >
                                        Không giới hạn
                                    </label>
                                </div>
                            </div>
                            {errors.maxAppointments && (
                                <div className="form-text text-danger">
                                    {errors.maxAppointments}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Card */}
            <div className="card mb-4">
                <div className="card-body">
                    <h5 className="card-title mb-3">Tính Năng</h5>
                    <div className="mb-3">
                        <FeaturesInput
                            value={formData.features || ''}
                            onChange={onFeaturesChange}
                            validationError={errors.features}
                        />
                    </div>
                </div>
            </div>

            {/* Settings Card */}
            <div className="card mb-4">
                <div className="card-body">
                    <h5 className="card-title mb-3">Cài đặt</h5>
                    <div className="row">
                        {onStatusChange && (
                            <div className="col-md-6">
                                <label htmlFor="status" className="form-label">
                                    Trạng Thái <span className="text-danger">*</span>
                                </label>
                                <StatusSelect
                                    value={formData.status}
                                    onChange={onStatusChange}
                                    validationError={errors.status}
                                    className={errors.status ? 'is-invalid' : ''}
                                />
                                {errors.status && (
                                    <div className="text-danger mt-1">{errors.status}</div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </form>
    );
};

export default SubscriptionPlanFormFields;
