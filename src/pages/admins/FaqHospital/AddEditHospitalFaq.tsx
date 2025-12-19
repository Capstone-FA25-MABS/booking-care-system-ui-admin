import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Textarea from '@/components/Textarea';
import {
    CreateHospitalFaqRequest,
    UpdateHospitalFaqRequest,
    HospitalFaqResponse,
} from '@/types/hospitalFaq.types';
import { HospitalFaqService } from '@/services/hospitalFaq.service';
import { HospitalService } from '@/services/hospital.service';
import { PATHS, buildPath } from '@/routes/paths';
import Select from 'react-select';
import { selectCustomStyles } from '@/constants/select.styles';
import { useCurrentUserProfile } from '@/hooks/useCurrentUserProfile';
import { useAppSelector } from '@/store/hooks';
import { selectCurrentProfile } from '@/store/selectors/profile.selectors';

interface HospitalOption {
    value: string;
    label: string;
}

interface FaqFormData {
    hospitalId: string;
    question: string;
    answer: string;
    displayOrder: number;
}

const AddEditHospitalFaq: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { id } = useParams<{ id: string }>();
    const isEditMode = !!id;

    // Get current user profile and role
    const { hospitalProfile, isHospital, isAdmin: isAdminUser } = useCurrentUserProfile();
    const currentProfile = useAppSelector(selectCurrentProfile);
    const isStaff = isHospital;
    const isAdmin = isAdminUser;

    // Get hospital ID from profile (for staff) or from form (for admin)
    const currentHospitalId = useMemo(() => {
        if (isStaff && hospitalProfile?.id) {
            return hospitalProfile.id;
        }
        return currentProfile?.hospitalId;
    }, [isStaff, hospitalProfile, currentProfile]);

    const faqBasePath = useMemo(() => {
        if (location.pathname.startsWith(PATHS.HOSPITAL.ROOT)) {
            return PATHS.HOSPITAL.ROOT;
        }
        return PATHS.ADMIN.ROOT;
    }, [location.pathname]);

    const buildFaqPath = useCallback(
        (suffix: string = '') => {
            const base = location.pathname.startsWith(PATHS.HOSPITAL.ROOT)
                ? PATHS.HOSPITAL.HOSPITAL_FAQS
                : PATHS.ADMIN.HOSPITAL_FAQS;
            if (suffix) {
                return buildPath(faqBasePath, base.ROOT, suffix);
            }
            return buildPath(faqBasePath, base.ROOT);
        },
        [faqBasePath, location.pathname]
    );

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [hospitalOptions, setHospitalOptions] = useState<HospitalOption[]>([]);
    const [isLoadingHospitals, setIsLoadingHospitals] = useState(false);

    const submitLabel = useMemo(() => {
        if (isSubmitting) return 'Đang lưu...';
        return isEditMode ? 'Cập nhật' : 'Lưu';
    }, [isEditMode, isSubmitting]);

    const [formData, setFormData] = useState<FaqFormData>({
        hospitalId: currentHospitalId || '',
        question: '',
        answer: '',
        displayOrder: 0,
    });

    const [errors, setErrors] = useState<Partial<Record<keyof FaqFormData, string>>>({});

    // Fetch hospitals (only for admin)
    useEffect(() => {
        if (isAdmin) {
            const fetchHospitals = async () => {
                setIsLoadingHospitals(true);
                try {
                    const response = await HospitalService.getHospitals({
                        pageNumber: 1,
                        pageSize: 100,
                    });
                    const hospitals = response.data?.hospitals || [];
                    setHospitalOptions(
                        hospitals.map((h: any) => ({
                            value: h.id,
                            label: h.name,
                        }))
                    );
                } catch (err: any) {
                    toast.error(err.message || 'Không thể tải danh sách bệnh viện');
                } finally {
                    setIsLoadingHospitals(false);
                }
            };

            fetchHospitals();
        }
    }, [isAdmin]);

    // Auto-set hospital ID for staff
    useEffect(() => {
        if (isStaff && currentHospitalId && !isEditMode) {
            setFormData((prev) => ({ ...prev, hospitalId: currentHospitalId }));
        }
    }, [isStaff, currentHospitalId, isEditMode]);

    // Fetch FAQ data if in edit mode
    useEffect(() => {
        if (isEditMode && id) {
            const fetchFaq = async () => {
                setIsLoading(true);
                try {
                    const response = await HospitalFaqService.getFaqById(id);
                    const faq: HospitalFaqResponse = response.data;
                    setFormData({
                        hospitalId: faq.hospitalId,
                        question: faq.question,
                        answer: faq.answer,
                        displayOrder: faq.displayOrder,
                    });
                } catch (err: any) {
                    toast.error(err.message || 'Không thể tải thông tin FAQ');
                    navigate(buildFaqPath(), { replace: true });
                } finally {
                    setIsLoading(false);
                }
            };

            fetchFaq();
        }
    }, [id, isEditMode, navigate]);

    // Handle input change
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const numValue = name === 'displayOrder' ? Number.parseInt(value, 10) || 0 : value;
        setFormData((prev) => ({ ...prev, [name]: numValue }));
        if (errors[name as keyof FaqFormData]) {
            setErrors((prev) => ({ ...prev, [name]: undefined }));
        }
    };

    // Handle select change
    const handleSelectChange = (name: keyof FaqFormData, value: any) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: undefined }));
        }
    };

    // Validate form
    const validateForm = (): boolean => {
        const newErrors: Partial<Record<keyof FaqFormData, string>> = {};

        if (!formData.hospitalId) {
            if (isAdmin) {
                newErrors.hospitalId = 'Vui lòng chọn bệnh viện';
            } else {
                newErrors.hospitalId = 'Không tìm thấy thông tin bệnh viện';
            }
        }

        if (!formData.question.trim()) {
            newErrors.question = 'Vui lòng nhập câu hỏi';
        } else if (formData.question.length > 1000) {
            newErrors.question = 'Câu hỏi không được vượt quá 1000 ký tự';
        }

        if (!formData.answer.trim()) {
            newErrors.answer = 'Vui lòng nhập câu trả lời';
        } else if (formData.answer.length > 5000) {
            newErrors.answer = 'Câu trả lời không được vượt quá 5000 ký tự';
        }

        if (formData.displayOrder < 0) {
            newErrors.displayOrder = 'Thứ tự hiển thị phải lớn hơn hoặc bằng 0';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error('Vui lòng kiểm tra lại thông tin');
            return;
        }

        setIsSubmitting(true);

        try {
            if (isEditMode && id) {
                const updateRequest: UpdateHospitalFaqRequest = {
                    question: formData.question.trim(),
                    answer: formData.answer.trim(),
                    displayOrder: formData.displayOrder,
                };
                await HospitalFaqService.updateFaq(id, updateRequest);
                toast.success('Cập nhật FAQ thành công!');
            } else {
                const createRequest: CreateHospitalFaqRequest = {
                    hospitalId: formData.hospitalId,
                    question: formData.question.trim(),
                    answer: formData.answer.trim(),
                    displayOrder: formData.displayOrder,
                };
                await HospitalFaqService.createFaq(createRequest);
                toast.success('Tạo FAQ thành công!');
            }

            navigate(buildFaqPath(), {
                replace: true,
            });
        } catch (err: any) {
            toast.error(err.message || 'Không thể lưu FAQ');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle cancel
    const handleCancel = () => {
        navigate(buildFaqPath(), { replace: true });
    };

    if (isLoading) {
        return (
            <div className="content">
                <div className="text-center py-5">
                    <output className="spinner-border" aria-live="polite">
                        <span className="visually-hidden">Đang tải...</span>
                    </output>
                    <p className="mt-3">Đang tải thông tin FAQ...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="content">
            <div className="d-flex align-items-sm-center flex-sm-row flex-column gap-2 mb-3 pb-3 border-bottom">
                <div className="flex-grow-1">
                    <h4 className="fw-bold mb-0">
                        {isEditMode ? 'Chỉnh sửa FAQ' : 'Thêm FAQ mới'}
                    </h4>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="card mb-4">
                    <div className="card-body">
                        <h5 className="card-title mb-4">Thông tin FAQ</h5>

                        <div className="row">
                            {/* Only show hospital selector for admin */}
                            {isAdmin && (
                                <div className="col-md-6 mb-3">
                                    <label htmlFor="hospitalId" className="form-label">
                                        <i className="feather-hospital me-1"></i> Bệnh viện{' '}
                                        <span className="text-danger">*</span>
                                    </label>
                                    <Select
                                        inputId="hospitalId"
                                        options={hospitalOptions}
                                        value={hospitalOptions.find(
                                            (opt) => opt.value === formData.hospitalId
                                        )}
                                        onChange={(option) =>
                                            handleSelectChange('hospitalId', option?.value || '')
                                        }
                                        placeholder="Chọn bệnh viện..."
                                        isClearable={false}
                                        isDisabled={isEditMode} // Disable when editing
                                        isLoading={isLoadingHospitals}
                                        styles={selectCustomStyles}
                                    />
                                    {errors.hospitalId && (
                                        <div className="invalid-feedback d-block">
                                            {errors.hospitalId}
                                        </div>
                                    )}
                                </div>
                            )}
                            {/* Show hospital name for staff (read-only) */}
                            {isStaff && hospitalProfile && (
                                <div className="col-md-6 mb-3">
                                    <label htmlFor="hospitalName" className="form-label">
                                        <i className="feather-hospital me-1"></i> Bệnh viện
                                    </label>
                                    <Input
                                        label=""
                                        name="hospitalName"
                                        value={hospitalProfile.name || ''}
                                        onChange={() => {}} // No-op for disabled field
                                        disabled
                                        icon="hospital"
                                        iconPrefix="feather"
                                    />
                                    <small className="text-muted">Bệnh viện của bạn</small>
                                </div>
                            )}
                            <div className={isAdmin ? 'col-md-6 mb-3' : 'col-md-12 mb-3'}>
                                <div>
                                    <Input
                                        label="Thứ tự hiển thị"
                                        name="displayOrder"
                                        type="number"
                                        value={formData.displayOrder.toString()}
                                        onChange={handleInputChange}
                                        error={errors.displayOrder}
                                        icon="sort"
                                        iconPrefix="feather"
                                        min="0"
                                    />
                                    <small className="text-muted">
                                        Số nhỏ hơn sẽ hiển thị trước
                                    </small>
                                </div>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-12 mb-3">
                                <Input
                                    label="Câu hỏi"
                                    name="question"
                                    value={formData.question}
                                    onChange={handleInputChange}
                                    error={errors.question}
                                    required
                                    icon="help-circle"
                                    iconPrefix="feather"
                                    placeholder="Nhập câu hỏi..."
                                    maxLength={1000}
                                />
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-12 mb-3">
                                <Textarea
                                    label="Câu trả lời"
                                    name="answer"
                                    value={formData.answer}
                                    onChange={handleInputChange}
                                    error={errors.answer}
                                    required
                                    icon="message-square"
                                    iconPrefix="feather"
                                    placeholder="Nhập câu trả lời..."
                                    rows={6}
                                    maxLength={5000}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="d-flex justify-content-end gap-2 mb-4">
                    <Button
                        variant="secondary"
                        size="md"
                        onClick={handleCancel}
                        disabled={isSubmitting}
                    >
                        Hủy
                    </Button>
                    <Button
                        variant="primary"
                        size="md"
                        type="submit"
                        disabled={isSubmitting}
                        icon={isSubmitting ? 'ti ti-loader' : 'ti ti-check'}
                    >
                        {submitLabel}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default AddEditHospitalFaq;
