import React from 'react';
import clsx from 'clsx';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

import { Review, Reply } from '@/types/review.types';
import Pagination from '@/components/Pagination';

import styles from './ReviewList.module.scss';

interface ReviewListProps {
    reviews: Review[];
    totalCount: number;
    currentPage: number;
    totalPages: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    onAddReply: (review: Review) => void;
    onEditReply: (review: Review, replyId: string) => void;
    onDeleteReply: (reviewId: string, replyId: string) => void;
    onViewTargetDetail?: (review: Review) => void;
    hospitalStaffId: string;
    showTargetDetailButton?: boolean;
}

const ReviewList: React.FC<ReviewListProps> = ({
    reviews,
    totalCount,
    currentPage,
    totalPages,
    pageSize,
    onPageChange,
    onAddReply,
    onEditReply,
    onDeleteReply,
    onViewTargetDetail,
    hospitalStaffId,
    showTargetDetailButton = true,
}) => {
    const renderStars = (rating: number) => {
        return (
            <div className={styles.stars}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <i
                        key={star}
                        className={clsx('ti ti-star-filled', {
                            [styles.filled]: star <= rating,
                            [styles.empty]: star > rating,
                        })}
                    ></i>
                ))}
            </div>
        );
    };

    const formatDate = (dateString: string) => {
        try {
            return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: vi });
        } catch {
            return dateString;
        }
    };

    const getTargetType = (review: Review) => {
        if (review.doctorId) return 'Bác sĩ';
        if (review.serviceId) return 'Dịch vụ';
        return 'Không xác định';
    };

    const renderReply = (review: Review, reply: Reply) => {
        const isOwnReply = reply.authorId === hospitalStaffId;

        return (
            <div key={reply.id} className={styles.reply}>
                <div className={styles.replyHeader}>
                    <div className={styles.replyAuthor}>
                        {reply.authorInfo?.avatarUrl && (
                            <img
                                src={reply.authorInfo.avatarUrl}
                                alt={reply.authorInfo.fullName}
                                className={styles.avatar}
                            />
                        )}
                        <div className={styles.authorInfo}>
                            <div className={styles.authorName}>
                                {reply.authorInfo?.fullName || 'Người dùng'}
                                {reply.authorInfo?.role && (
                                    <span className={styles.role}>({reply.authorInfo.role})</span>
                                )}
                            </div>
                            <div className={styles.replyDate}>
                                {formatDate(reply.createdAt)}
                                {reply.updatedAt !== reply.createdAt && (
                                    <span className={styles.edited}> (Đã chỉnh sửa)</span>
                                )}
                            </div>
                        </div>
                    </div>
                    {isOwnReply && (
                        <div className={styles.replyActions}>
                            <button
                                className={styles.editBtn}
                                onClick={() => onEditReply(review, reply.id)}
                                title="Chỉnh sửa"
                            >
                                <i className="ti ti-edit"></i>
                            </button>
                            <button
                                className={styles.deleteBtn}
                                onClick={() => onDeleteReply(review.id, reply.id)}
                                title="Xóa"
                            >
                                <i className="ti ti-trash"></i>
                            </button>
                        </div>
                    )}
                </div>
                <div className={styles.replyContent}>{reply.content}</div>
            </div>
        );
    };

    if (reviews.length === 0) {
        return (
            <div className={styles.container}>
                <div className={styles.emptyState}>
                    <i className="ti ti-message-off"></i>
                    <p>Chưa có đánh giá nào</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.resultInfo}>
                    Hiển thị {(currentPage - 1) * pageSize + 1} -{' '}
                    {Math.min(currentPage * pageSize, totalCount)} trong tổng số {totalCount} đánh
                    giá
                </div>
            </div>

            <div className={styles.reviewsList}>
                {reviews.map((review) => (
                    <div key={review.id} className={styles.reviewCard}>
                        <div className={styles.reviewHeader}>
                            <div className={styles.patientInfo}>
                                {review.patientInfo?.avatarUrl && (
                                    <img
                                        src={review.patientInfo.avatarUrl}
                                        alt={review.patientInfo.fullName}
                                        className={styles.avatar}
                                    />
                                )}
                                <div className={styles.info}>
                                    <div className={styles.patientName}>
                                        {review.patientInfo?.fullName || 'Bệnh nhân'}
                                    </div>
                                    <div className={styles.metadata}>
                                        <span className={styles.date}>
                                            {formatDate(review.createdAt)}
                                        </span>
                                        <span className={styles.separator}>•</span>
                                        <button
                                            className={styles.targetTypeButton}
                                            onClick={() => onViewTargetDetail?.(review)}
                                            title="Xem chi tiết"
                                        >
                                            <span className={styles.targetType}>
                                                {showTargetDetailButton && getTargetType(review)}
                                            </span>
                                            {showTargetDetailButton && (
                                                <i className="ti ti-external-link"></i>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                            {renderStars(review.rating)}
                        </div>

                        <div className={styles.reviewContent}>{review.comment}</div>

                        {review.replies && review.replies.length > 0 && (
                            <div className={styles.repliesSection}>
                                <div className={styles.repliesHeader}>
                                    <i className="ti ti-message"></i>
                                    Phản hồi ({review.replies.length})
                                </div>
                                {review.replies.map((reply) => renderReply(review, reply))}
                            </div>
                        )}

                        <div className={styles.reviewFooter}>
                            {showTargetDetailButton && onViewTargetDetail && (
                                <button
                                    className={styles.viewDetailButton}
                                    onClick={() => onViewTargetDetail(review)}
                                >
                                    <i className="ti ti-info-circle"></i>
                                    Xem chi tiết {getTargetType(review).toLowerCase()}
                                </button>
                            )}
                            <button
                                className={styles.replyButton}
                                onClick={() => onAddReply(review)}
                            >
                                <i className="ti ti-message-plus"></i> Phản hồi
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {totalPages > 1 && (
                <div className={styles.paginationWrapper}>
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={onPageChange}
                    />
                </div>
            )}
        </div>
    );
};

export default ReviewList;
