import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import { RootState } from '@/store';
import { ReviewService } from '@/services/review.service';
import { Review, ReviewFilters as ReviewFiltersType } from '@/types/review.types';

import {
    ReviewList,
    ReviewFilters,
    ReviewStatistics,
    ReplyModal,
} from '@/components/ReviewManagement';
import ReviewTargetDetailModal from './components/ReviewTargetDetailModal';
import ConfirmDialog from '@/components/ConfirmDialog/ConfirmDialog';

import styles from './HospitalReviewManagement.module.scss';

const HospitalReviewManagement: React.FC = () => {
    const { hospitalProfile } = useSelector((state: RootState) => state.user);

    // State management
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(false);
    const [totalCount, setTotalCount] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    // Filter state
    const [filters, setFilters] = useState<ReviewFiltersType>({
        searchTerm: '',
        minRating: undefined,
        maxRating: undefined,
        page: 1,
        pageSize: 10,
    });

    // Modal state
    const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
    const [selectedReview, setSelectedReview] = useState<Review | null>(null);
    const [editingReplyId, setEditingReplyId] = useState<string | null>(null);

    // Target detail modal state
    const [isTargetDetailModalOpen, setIsTargetDetailModalOpen] = useState(false);
    const [targetDetailReview, setTargetDetailReview] = useState<Review | null>(null);

    // Delete confirmation state
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<{
        reviewId: string;
        replyId: string;
    } | null>(null);

    /**
     * Fetch reviews from API
     */
    const fetchReviews = useCallback(async () => {
        if (!hospitalProfile?.id) {
            toast.error('Không tìm thấy thông tin bệnh viện');
            return;
        }

        setLoading(true);
        try {
            const response = await ReviewService.getReviewsByHospital(
                hospitalProfile.id,
                filters.page,
                filters.pageSize,
                filters.minRating,
                filters.maxRating
            );

            if (response.success && response.data) {
                setReviews(response.data.reviews);
                setTotalCount(response.data.totalCount);
                setTotalPages(response.data.totalPages);
            }
        } catch (error: any) {
            toast.error(error?.message || 'Không thể tải danh sách đánh giá');
        } finally {
            setLoading(false);
        }
    }, [hospitalProfile?.id, filters.page, filters.pageSize, filters.minRating, filters.maxRating]);

    /**
     * Load reviews on mount and filter changes
     */
    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    /**
     * Handle filter changes
     */
    const handleFilterChange = (newFilters: Partial<ReviewFiltersType>) => {
        setFilters((prev: ReviewFiltersType) => ({
            ...prev,
            ...newFilters,
            page: newFilters.page !== undefined ? newFilters.page : 1, // Reset to page 1 on filter change
        }));
    };

    /**
     * Handle page change
     */
    const handlePageChange = (page: number) => {
        setFilters((prev: ReviewFiltersType) => ({ ...prev, page }));
    };

    /**
     * Open reply modal for adding new reply
     */
    const handleAddReply = (review: Review) => {
        setSelectedReview(review);
        setEditingReplyId(null);
        setIsReplyModalOpen(true);
    };

    /**
     * Open reply modal for editing existing reply
     */
    const handleEditReply = (review: Review, replyId: string) => {
        setSelectedReview(review);
        setEditingReplyId(replyId);
        setIsReplyModalOpen(true);
    };

    /**
     * Open target detail modal
     */
    const handleViewTargetDetail = (review: Review) => {
        setTargetDetailReview(review);
        setIsTargetDetailModalOpen(true);
    };

    /**
     * Open delete confirmation dialog
     */
    const handleDeleteReplyClick = (reviewId: string, replyId: string) => {
        setDeleteTarget({ reviewId, replyId });
        setIsDeleteDialogOpen(true);
    };

    /**
     * Confirm and execute reply deletion
     */
    const handleConfirmDelete = async () => {
        if (!deleteTarget) return;

        try {
            const response = await ReviewService.deleteReply(
                deleteTarget.reviewId,
                deleteTarget.replyId
            );

            if (response.success) {
                toast.success('Xóa phản hồi thành công');
                fetchReviews(); // Refresh the list
            }
        } catch (error: any) {
            toast.error(error?.message || 'Không thể xóa phản hồi');
        } finally {
            setIsDeleteDialogOpen(false);
            setDeleteTarget(null);
        }
    };

    /**
     * Handle successful reply submission (add or edit)
     */
    const handleReplySuccess = () => {
        setIsReplyModalOpen(false);
        setSelectedReview(null);
        setEditingReplyId(null);
        fetchReviews(); // Refresh the list
    };

    if (!hospitalProfile?.id) {
        return (
            <div className={styles.container}>
                <div className={styles.error}>
                    <p>Không tìm thấy thông tin bệnh viện. Vui lòng đăng nhập lại.</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Quản lý đánh giá</h1>
                <p className={styles.subtitle}>
                    Xem và phản hồi đánh giá từ bệnh nhân về bác sĩ và dịch vụ của bệnh viện
                </p>
            </div>

            {/* Statistics Section */}
            <ReviewStatistics entityType="hospital" entityId={hospitalProfile.id} />

            {/* Filters Section */}
            <ReviewFilters filters={filters} onFilterChange={handleFilterChange} />

            {/* Reviews List */}
            {loading ? (
                <div className={styles.loading}>
                    <div className={styles.spinner}></div>
                    <p>Đang tải danh sách đánh giá...</p>
                </div>
            ) : (
                <ReviewList
                    reviews={reviews}
                    totalCount={totalCount}
                    currentPage={filters.page}
                    totalPages={totalPages}
                    pageSize={filters.pageSize}
                    onPageChange={handlePageChange}
                    onAddReply={handleAddReply}
                    onEditReply={handleEditReply}
                    onDeleteReply={handleDeleteReplyClick}
                    onViewTargetDetail={handleViewTargetDetail}
                    hospitalStaffId={hospitalProfile.accountId}
                />
            )}

            {/* Reply Modal */}
            {isReplyModalOpen && selectedReview && (
                <ReplyModal
                    isOpen={isReplyModalOpen}
                    review={selectedReview}
                    editingReplyId={editingReplyId}
                    authorId={hospitalProfile.accountId}
                    onClose={() => {
                        setIsReplyModalOpen(false);
                        setSelectedReview(null);
                        setEditingReplyId(null);
                    }}
                    onSuccess={handleReplySuccess}
                />
            )}

            {/* Target Detail Modal */}
            {isTargetDetailModalOpen && targetDetailReview && (
                <ReviewTargetDetailModal
                    isOpen={isTargetDetailModalOpen}
                    review={targetDetailReview}
                    onClose={() => {
                        setIsTargetDetailModalOpen(false);
                        setTargetDetailReview(null);
                    }}
                />
            )}

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={isDeleteDialogOpen}
                title="Xác nhận xóa phản hồi"
                message="Bạn có chắc chắn muốn xóa phản hồi này? Hành động này không thể hoàn tác."
                type="danger"
                onClose={() => {
                    setIsDeleteDialogOpen(false);
                    setDeleteTarget(null);
                }}
                onConfirm={handleConfirmDelete}
            />
        </div>
    );
};

export default HospitalReviewManagement;
