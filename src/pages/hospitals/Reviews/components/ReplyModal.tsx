import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

import { Review } from '@/types/review.types';
import { ReviewService } from '@/services/review.service';
import BaseModal from '@/components/Modal/BaseModal';

import styles from './ReplyModal.module.scss';

interface ReplyModalProps {
    isOpen: boolean;
    review: Review;
    editingReplyId: string | null;
    authorId: string;
    onClose: () => void;
    onSuccess: () => void;
}

const ReplyModal: React.FC<ReplyModalProps> = ({
    isOpen,
    review,
    editingReplyId,
    authorId,
    onClose,
    onSuccess,
}) => {
    const [content, setContent] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const isEditing = editingReplyId !== null;

    // Load existing content when editing
    useEffect(() => {
        if (isEditing && editingReplyId) {
            const existingReply = review.replies.find((r) => r.id === editingReplyId);
            if (existingReply) {
                setContent(existingReply.content);
            }
        } else {
            setContent('');
        }
    }, [isEditing, editingReplyId, review.replies]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!content.trim()) {
            toast.error('Vui lòng nhập nội dung phản hồi');
            return;
        }

        if (content.trim().length < 10) {
            toast.error('Nội dung phản hồi phải có ít nhất 10 ký tự');
            return;
        }

        if (content.trim().length > 1000) {
            toast.error('Nội dung phản hồi không được vượt quá 1000 ký tự');
            return;
        }

        setSubmitting(true);

        try {
            if (isEditing && editingReplyId) {
                // Update existing reply
                const response = await ReviewService.updateReply({
                    reviewId: review.id,
                    replyId: editingReplyId,
                    content: content.trim(),
                });

                if (response.success) {
                    toast.success('Cập nhật phản hồi thành công');
                    onSuccess();
                }
            } else {
                // Add new reply
                const response = await ReviewService.addReply({
                    reviewId: review.id,
                    authorId: authorId,
                    content: content.trim(),
                });

                if (response.success) {
                    toast.success('Thêm phản hồi thành công');
                    onSuccess();
                }
            }
        } catch (error: any) {
            toast.error(error?.message || 'Có lỗi xảy ra khi xử lý phản hồi');
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!submitting) {
            setContent('');
            onClose();
        }
    };

    return (
        <BaseModal
            isOpen={isOpen}
            title={isEditing ? 'Chỉnh sửa phản hồi' : 'Thêm phản hồi'}
            titleId="reply-modal-title"
            onClose={handleClose}
            size="md"
        >
            <form onSubmit={handleSubmit}>
                <div className="modal-body">
                    <div className={styles.reviewPreview}>
                        <div className={styles.reviewHeader}>
                            <div className={styles.patientName}>
                                {review.patientInfo?.fullName || 'Bệnh nhân'}
                            </div>
                            <div className={styles.rating}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <i
                                        key={star}
                                        className={`ti ti-star-filled ${
                                            star <= review.rating ? styles.filled : styles.empty
                                        }`}
                                    ></i>
                                ))}
                            </div>
                        </div>
                        <div className={styles.reviewComment}>{review.comment}</div>
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="reply-content" className={styles.label}>
                            Nội dung phản hồi <span className={styles.required}>*</span>
                        </label>
                        <textarea
                            id="reply-content"
                            className={styles.textarea}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Nhập nội dung phản hồi của bạn..."
                            rows={6}
                            maxLength={1000}
                            disabled={submitting}
                        />
                        <div className={styles.charCount}>{content.length} / 1000 ký tự</div>
                    </div>
                </div>

                <div className="modal-footer">
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={handleClose}
                        disabled={submitting}
                    >
                        Hủy
                    </button>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={submitting || !content.trim()}
                    >
                        {submitting ? (
                            <>
                                <span
                                    className="spinner-border spinner-border-sm me-2"
                                    role="status"
                                    aria-hidden="true"
                                ></span>
                                Đang xử lý...
                            </>
                        ) : isEditing ? (
                            'Cập nhật'
                        ) : (
                            'Gửi phản hồi'
                        )}
                    </button>
                </div>
            </form>
        </BaseModal>
    );
};

export default ReplyModal;
