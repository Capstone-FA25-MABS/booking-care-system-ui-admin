import React, { useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { approveRegistration } from '@/services/hospital-registration.service';
import { toast } from 'react-toastify';

interface ApprovalConfirmModalProps {
    isOpen: boolean;
    hospitalName: string;
    registrationId: string;
    contractUrl?: string;
    onClose: () => void;
    onSuccess: () => void;
}

const ApprovalConfirmModal: React.FC<ApprovalConfirmModalProps> = ({
    isOpen,
    hospitalName,
    registrationId,
    contractUrl,
    onClose,
    onSuccess,
}) => {
    const [approvalNotes, setApprovalNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setIsSubmitting(true);

            const response = await approveRegistration(
                registrationId,
                approvalNotes.trim() || undefined
            );

            if (response.success) {
                toast.success(response.message || 'Đơn đăng ký đã được phê duyệt thành công!');
                onSuccess();
                handleClose();
            } else {
                toast.error(response.message || 'Có lỗi xảy ra khi phê duyệt đơn đăng ký');
            }
        } catch (error: any) {
            console.error('Error approving registration:', error);
            toast.error(error.message || 'Có lỗi xảy ra khi phê duyệt đơn đăng ký');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setApprovalNotes('');
        setIsSubmitting(false);
        onClose();
    };

    const handleViewContract = () => {
        if (contractUrl) {
            window.open(contractUrl, '_blank');
        }
    };

    return (
        <Modal show={isOpen} onHide={handleClose} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>
                    <i className="ti ti-check-circle me-2 text-success"></i>
                    Phê duyệt đơn đăng ký
                </Modal.Title>
            </Modal.Header>

            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    <div className="mb-4">
                        <h6 className="fw-semibold mb-3">
                            <i className="ti ti-building-hospital me-2 text-primary"></i>
                            Thông tin bệnh viện
                        </h6>
                        <div className="bg-light p-3 rounded">
                            <strong>{hospitalName}</strong>
                        </div>
                    </div>

                    {contractUrl && (
                        <div className="mb-4">
                            <h6 className="fw-semibold mb-3">
                                <i className="ti ti-file-text me-2 text-info"></i>
                                Hợp đồng đã ký
                            </h6>
                            <div className="d-flex align-items-center gap-3">
                                <Button
                                    variant="outline-primary"
                                    size="sm"
                                    onClick={handleViewContract}
                                >
                                    <i className="ti ti-eye me-1"></i>
                                    Xem hợp đồng
                                </Button>
                                <small className="text-muted">
                                    Vui lòng xem xét hợp đồng trước khi phê duyệt
                                </small>
                            </div>
                        </div>
                    )}

                    <div className="mb-4">
                        <Form.Group>
                            <Form.Label className="fw-semibold">
                                <i className="ti ti-note me-2"></i>
                                Ghi chú phê duyệt (tùy chọn)
                            </Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={approvalNotes}
                                onChange={(e) => setApprovalNotes(e.target.value)}
                                placeholder="Nhập ghi chú về việc phê duyệt (nếu có)..."
                                maxLength={500}
                            />
                            <Form.Text className="text-muted">
                                {approvalNotes.length}/500 ký tự
                            </Form.Text>
                        </Form.Group>
                    </div>

                    <Alert variant="info" className="mb-0">
                        <i className="ti ti-info-circle me-2"></i>
                        <strong>Lưu ý:</strong> Sau khi phê duyệt, hệ thống sẽ tự động tạo tài khoản
                        cho bệnh viện và gửi thông tin đăng nhập qua email.
                    </Alert>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose} disabled={isSubmitting}>
                        Hủy
                    </Button>
                    <Button variant="success" type="submit" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <span
                                    className="spinner-border spinner-border-sm me-2"
                                    role="status"
                                ></span>
                                Đang xử lý...
                            </>
                        ) : (
                            <>
                                <i className="ti ti-check me-2"></i>
                                Phê duyệt
                            </>
                        )}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default ApprovalConfirmModal;
