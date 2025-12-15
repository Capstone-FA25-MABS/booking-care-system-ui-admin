import React, { useState, useEffect } from 'react';
import clsx from 'clsx';

import { Review } from '@/types/review.types';
import { DoctorService } from '@/services/doctor.service';
import { serviceService } from '@/services/service.service';
import BaseModal from '@/components/Modal/BaseModal';

import styles from './ReviewTargetDetailModal.module.scss';

interface ReviewTargetDetailModalProps {
    isOpen: boolean;
    review: Review;
    onClose: () => void;
}

interface DoctorDetail {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    gender: string;
    avatarUrl: string;
    address: string;
    yearsOfExperience: number;
    bio: string;
    hospital: {
        id: string;
        name: string;
        address: string;
        avatarUrl: string;
    };
    position: {
        id: string;
        name: string;
    };
    specialty: {
        id: string;
        name: string;
    };
    prices: Array<{
        id: string;
        serviceTypeName: string;
        amount: number;
    }>;
    languages: Array<{
        id: string;
        name: string;
    }>;
    reviewStatistics: {
        averageRating: number;
        totalReviews: number;
    };
}

interface ServiceDetail {
    id: string;
    name: string;
    description: string;
    price: number;
    durationTime: number;
    imageUrl: string;
    serviceCategoryName: string;
    status: string;
}

const ReviewTargetDetailModal: React.FC<ReviewTargetDetailModalProps> = ({
    isOpen,
    review,
    onClose,
}) => {
    const [loading, setLoading] = useState(false);
    const [doctorDetail, setDoctorDetail] = useState<DoctorDetail | null>(null);
    const [serviceDetail, setServiceDetail] = useState<ServiceDetail | null>(null);
    const [error, setError] = useState<string | null>(null);

    const isDoctor = !!review.doctorId;
    const targetId = review.doctorId || review.serviceId;

    useEffect(() => {
        const fetchTargetDetail = async () => {
            if (!targetId) return;

            setLoading(true);
            setError(null);
            setDoctorDetail(null);
            setServiceDetail(null);

            try {
                if (isDoctor && review.doctorId) {
                    // Fetch doctor details
                    const response = await DoctorService.getDoctorById(review.doctorId);
                    if (response.success && response.data) {
                        setDoctorDetail(response.data as any);
                    }
                } else if (review.serviceId) {
                    // Fetch service details
                    const response = await serviceService.getServiceById(review.serviceId);
                    if (response.success && response.data) {
                        setServiceDetail(response.data as any);
                    }
                }
            } catch (err: any) {
                setError(err?.message || 'Không thể tải thông tin chi tiết');
                console.error('Failed to fetch target detail:', err);
            } finally {
                setLoading(false);
            }
        };

        if (isOpen && targetId) {
            fetchTargetDetail();
        }
    }, [isOpen, targetId, isDoctor, review.doctorId, review.serviceId]);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(price);
    };

    const renderDoctorDetail = () => {
        if (!doctorDetail) return null;

        const fullName = `${doctorDetail.lastName} ${doctorDetail.firstName}`;
        let genderLabel = 'Khác';
        if (doctorDetail.gender === 'MALE') {
            genderLabel = 'Nam';
        } else if (doctorDetail.gender === 'FEMALE') {
            genderLabel = 'Nữ';
        }

        return (
            <div className={styles.detailContent}>
                <div className={styles.header}>
                    <div className={styles.avatarSection}>
                        {doctorDetail.avatarUrl ? (
                            <img
                                src={doctorDetail.avatarUrl}
                                alt={fullName}
                                className={styles.avatar}
                            />
                        ) : (
                            <div className={styles.avatarPlaceholder}>
                                <i className="ti ti-user-doctor"></i>
                            </div>
                        )}
                    </div>
                    <div className={styles.headerInfo}>
                        <h3 className={styles.name}>{fullName}</h3>
                        <div className={styles.badges}>
                            {doctorDetail.position?.name && (
                                <span className={styles.badge}>
                                    <i className="ti ti-medal"></i>
                                    {doctorDetail.position.name}
                                </span>
                            )}
                            {doctorDetail.specialty?.name && (
                                <span className={styles.badge}>
                                    <i className="ti ti-stethoscope"></i>
                                    {doctorDetail.specialty.name}
                                </span>
                            )}
                            {doctorDetail.reviewStatistics && (
                                <span className={clsx(styles.badge, styles.ratingBadge)}>
                                    <i className="ti ti-star-filled"></i>
                                    {doctorDetail.reviewStatistics.averageRating.toFixed(1)} (
                                    {doctorDetail.reviewStatistics.totalReviews} đánh giá)
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className={styles.infoGrid}>
                    <div className={styles.infoItem}>
                        <div className={styles.infoLabel}>
                            <i className="ti ti-mail"></i> Email
                        </div>
                        <div className={styles.infoValue}>{doctorDetail.email}</div>
                    </div>

                    <div className={styles.infoItem}>
                        <div className={styles.infoLabel}>
                            <i className="ti ti-user"></i> Giới tính
                        </div>
                        <div className={styles.infoValue}>{genderLabel}</div>
                    </div>

                    <div className={styles.infoItem}>
                        <div className={styles.infoLabel}>
                            <i className="ti ti-briefcase"></i> Kinh nghiệm
                        </div>
                        <div className={styles.infoValue}>{doctorDetail.yearsOfExperience} năm</div>
                    </div>

                    {doctorDetail.hospital && (
                        <div className={styles.infoItem}>
                            <div className={styles.infoLabel}>
                                <i className="ti ti-building-hospital"></i> Bệnh viện
                            </div>
                            <div className={styles.infoValue}>{doctorDetail.hospital.name}</div>
                        </div>
                    )}
                </div>

                {doctorDetail.address && (
                    <div className={styles.section}>
                        <div className={styles.sectionLabel}>
                            <i className="ti ti-map-pin"></i> Địa chỉ
                        </div>
                        <div className={styles.sectionText}>{doctorDetail.address}</div>
                    </div>
                )}

                {doctorDetail.languages && doctorDetail.languages.length > 0 && (
                    <div className={styles.section}>
                        <div className={styles.sectionLabel}>
                            <i className="ti ti-language"></i> Ngôn ngữ
                        </div>
                        <div className={styles.languageTags}>
                            {doctorDetail.languages.map((lang) => (
                                <span key={lang.id} className={styles.tag}>
                                    {lang.name}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {doctorDetail.prices && doctorDetail.prices.length > 0 && (
                    <div className={styles.section}>
                        <div className={styles.sectionLabel}>
                            <i className="ti ti-coin"></i> Giá khám
                        </div>
                        <div className={styles.priceList}>
                            {doctorDetail.prices.map((price) => (
                                <div key={price.id} className={styles.priceItem}>
                                    <span className={clsx(styles.serviceType, 'me-1')}>
                                        {price.serviceTypeName}
                                    </span>
                                    <span className={styles.amount}>
                                        {formatPrice(price.amount)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {doctorDetail.bio && (
                    <div className={styles.section}>
                        <div className={styles.sectionLabel}>
                            <i className="ti ti-file-description"></i> Giới thiệu
                        </div>
                        <div
                            className={styles.sectionText}
                            dangerouslySetInnerHTML={{ __html: doctorDetail.bio }}
                        />
                    </div>
                )}
            </div>
        );
    };

    const renderServiceDetail = () => {
        if (!serviceDetail) return null;

        return (
            <div className={styles.detailContent}>
                <div className={styles.header}>
                    <div className={styles.imageSection}>
                        {serviceDetail.imageUrl ? (
                            <img
                                src={serviceDetail.imageUrl}
                                alt={serviceDetail.name}
                                className={styles.serviceImage}
                            />
                        ) : (
                            <div className={styles.imagePlaceholder}>
                                <i className="ti ti-medical-cross"></i>
                            </div>
                        )}
                    </div>
                    <div className={styles.headerInfo}>
                        <h3 className={styles.name}>{serviceDetail.name}</h3>
                        <div className={styles.badges}>
                            {serviceDetail.serviceCategoryName && (
                                <span className={styles.badge}>
                                    <i className="ti ti-category"></i>
                                    {serviceDetail.serviceCategoryName}
                                </span>
                            )}
                            <span
                                className={clsx(styles.statusBadge, {
                                    [styles.active]: serviceDetail.status === 'ACTIVE',
                                    [styles.inactive]: serviceDetail.status !== 'ACTIVE',
                                })}
                            >
                                {serviceDetail.status === 'ACTIVE'
                                    ? 'Đang hoạt động'
                                    : 'Không hoạt động'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className={styles.infoGrid}>
                    <div className={styles.infoItem}>
                        <div className={styles.infoLabel}>
                            <i className="ti ti-coin"></i> Giá dịch vụ
                        </div>
                        <div className={clsx(styles.infoValue, styles.price)}>
                            {formatPrice(serviceDetail.price)}
                        </div>
                    </div>

                    <div className={styles.infoItem}>
                        <div className={styles.infoLabel}>
                            <i className="ti ti-clock"></i> Thời gian
                        </div>
                        <div className={styles.infoValue}>{serviceDetail.durationTime} phút</div>
                    </div>
                </div>

                {serviceDetail.description && (
                    <div className={styles.description}>
                        <div className={styles.descriptionLabel}>
                            <i className="ti ti-file-description"></i> Mô tả dịch vụ
                        </div>
                        <div className={styles.descriptionText}>{serviceDetail.description}</div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <BaseModal
            isOpen={isOpen}
            title={isDoctor ? 'Thông tin bác sĩ' : 'Thông tin dịch vụ'}
            titleId="review-target-detail-modal"
            onClose={onClose}
            size="lg"
        >
            <div
                className="modal-body"
                style={{ maxHeight: 'calc(90vh - 120px)', overflowY: 'auto' }}
            >
                <div className={styles.container}>
                    {loading && (
                        <div className={styles.loading}>
                            <div className={styles.spinner}></div>
                            <p>Đang tải thông tin...</p>
                        </div>
                    )}

                    {error && (
                        <div className={styles.error}>
                            <i className="ti ti-alert-circle"></i>
                            <p>{error}</p>
                        </div>
                    )}

                    {!loading && !error && (
                        <>{isDoctor ? renderDoctorDetail() : renderServiceDetail()}</>
                    )}
                </div>
            </div>

            {!loading && !error && (
                <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={onClose}>
                        Đóng
                    </button>
                </div>
            )}
        </BaseModal>
    );
};

export default ReviewTargetDetailModal;
