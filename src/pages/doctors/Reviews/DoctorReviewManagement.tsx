import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import { RootState } from '@/store';
import { ReviewService } from '@/services/review.service';
import { Review, Reply, ReviewFilters as ReviewFiltersType } from '@/types/review.types';
import ConfirmDialog from '@/components/ConfirmDialog/ConfirmDialog';

import {
    ReviewStatistics,
    ReviewFilters,
    ReviewList,
    ReplyModal,
} from '@/components/ReviewManagement';

import styles from './DoctorReviewManagement.module.scss';

const DoctorReviewManagement: React.FC = () => {
    const { doctorProfile } = useSelector((state: RootState) => state.user);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const pageSize = 10;

    // Filter states
    const [filters, setFilters] = useState<ReviewFiltersType>({
        searchTerm: '',
        minRating: undefined,
        maxRating: undefined,
        page: currentPage,
        pageSize: pageSize,
    });

    // Modal states
    const [showReplyModal, setShowReplyModal] = useState(false);
    const [selectedReview, setSelectedReview] = useState<Review | null>(null);
    const [replyToEdit, setReplyToEdit] = useState<Reply | null>(null);

    // Delete confirmation
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [replyToDelete, setReplyToDelete] = useState<{
        reviewId: string;
        replyId: string;
    } | null>(null);

    useEffect(() => {
        if (doctorProfile?.id) {
            fetchReviews();
        }
    }, [doctorProfile?.id, filters.page, filters.minRating, filters.maxRating]);

    const fetchReviews = async () => {
        if (!doctorProfile?.id) {
            toast.error('Không tìm thấy thông tin bác sĩ');
            return;
        }

        setLoading(true);
        try {
            const response = await ReviewService.getReviewsByDoctor(
                doctorProfile.id,
                filters.page,
                filters.pageSize,
                filters.minRating,
                filters.maxRating
            );

            if (response.success && response.data) {
                setReviews(response.data.reviews);
                setTotalPages(response.data.totalPages);
                setTotalItems(response.data.totalCount);
            }
        } catch (error: any) {
            toast.error(error.message || 'Không thể tải danh sách đánh giá');
        } finally {
            setLoading(false);
        }
    };

    const handleAddReply = (review: Review) => {
        setSelectedReview(review);
        setReplyToEdit(null);
        setShowReplyModal(true);
    };

    const handleEditReply = (review: Review, reply: Reply) => {
        setSelectedReview(review);
        setReplyToEdit(reply);
        setShowReplyModal(true);
    };

    const handleDeleteReply = (reviewId: string, replyId: string) => {
        setReplyToDelete({ reviewId, replyId });
        setShowDeleteConfirm(true);
    };

    const confirmDeleteReply = async () => {
        if (!replyToDelete) return;

        try {
            const response = await ReviewService.deleteReply(
                replyToDelete.reviewId,
                replyToDelete.replyId
            );

            if (response.success) {
                toast.success('Xóa phản hồi thành công');
                fetchReviews();
            }
        } catch (error: any) {
            toast.error(error.message || 'Không thể xóa phản hồi');
        } finally {
            setShowDeleteConfirm(false);
            setReplyToDelete(null);
        }
    };

    const handleReplySuccess = () => {
        setShowReplyModal(false);
        setSelectedReview(null);
        setReplyToEdit(null);
        fetchReviews();
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        setFilters((prev) => ({ ...prev, page }));
    };

    if (!doctorProfile?.id) {
        return (
            <div className={styles.container}>
                <div className={styles.error}>
                    <p>Không tìm thấy thông tin bác sĩ. Vui lòng đăng nhập lại.</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Quản lý đánh giá của tôi</h1>
                <p className={styles.subtitle}>Xem và phản hồi các đánh giá từ bệnh nhân</p>
            </div>

            {/* Statistics Section */}
            <ReviewStatistics entityType="doctor" entityId={doctorProfile.id} />

            {/* Filters Section */}
            <ReviewFilters
                filters={filters}
                onFilterChange={(newFilters) => setFilters((prev) => ({ ...prev, ...newFilters }))}
            />

            {/* Reviews List */}
            {loading ? (
                <div className={styles.loading}>
                    <div className={styles.spinner}></div>
                    <p>Đang tải danh sách đánh giá...</p>
                </div>
            ) : (
                <ReviewList
                    reviews={reviews}
                    totalCount={totalItems}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    pageSize={pageSize}
                    onPageChange={handlePageChange}
                    onAddReply={handleAddReply}
                    onEditReply={(review, replyId) =>
                        handleEditReply(review, review.replies.find((r) => r.id === replyId)!)
                    }
                    onDeleteReply={handleDeleteReply}
                    hospitalStaffId={doctorProfile.accountId || ''}
                    showTargetDetailButton={false}
                />
            )}

            {showReplyModal && selectedReview && (
                <ReplyModal
                    isOpen={showReplyModal}
                    review={selectedReview}
                    editingReplyId={replyToEdit?.id || null}
                    authorId={doctorProfile.accountId || ''}
                    onClose={() => {
                        setShowReplyModal(false);
                        setSelectedReview(null);
                        setReplyToEdit(null);
                    }}
                    onSuccess={handleReplySuccess}
                />
            )}

            <ConfirmDialog
                isOpen={showDeleteConfirm}
                title="Xác nhận xóa"
                message="Bạn có chắc chắn muốn xóa phản hồi này không?"
                onConfirm={confirmDeleteReply}
                onClose={() => {
                    setShowDeleteConfirm(false);
                    setReplyToDelete(null);
                }}
            />
        </div>
    );
};

export default DoctorReviewManagement;
