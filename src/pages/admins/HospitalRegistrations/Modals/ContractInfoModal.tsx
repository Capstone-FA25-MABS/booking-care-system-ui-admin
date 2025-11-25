import React, { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import type { GenerateContractResponse } from '@/types/contract.types';

interface ContractInfoModalProps {
    show: boolean;
    onHide: () => void;
    contractInfo: GenerateContractResponse | null;
}

const ContractInfoModal: React.FC<ContractInfoModalProps> = ({ show, onHide, contractInfo }) => {
    const [isCopying, setIsCopying] = useState(false);

    if (!contractInfo) return null;

    const handleCopyLink = async () => {
        try {
            setIsCopying(true);
            await navigator.clipboard.writeText(contractInfo.signingLink);
            toast.success('Đã copy link ký hợp đồng!');
        } catch {
            toast.error('Không thể copy link');
        } finally {
            setIsCopying(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getTimeRemaining = () => {
        const now = new Date();
        const expiry = new Date(contractInfo.linkExpiresAt);
        const diff = expiry.getTime() - now.getTime();

        if (diff <= 0) return 'Đã hết hạn';

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        if (days > 0) {
            return `Còn ${days} ngày ${hours} giờ`;
        }
        return `Còn ${hours} giờ`;
    };

    const isExpired = new Date(contractInfo.linkExpiresAt) < new Date();

    return (
        <Modal show={show} onHide={onHide} size="lg" centered>
            <Modal.Header closeButton className="bg-primary text-white">
                <Modal.Title>
                    <i className="ti ti-file-check me-2" aria-hidden="true" /> Thông Tin Hợp Đồng
                </Modal.Title>
            </Modal.Header>

            <Modal.Body>
                {/* Success Alert */}
                <div className="alert alert-success d-flex align-items-center mb-4">
                    <i className="ti ti-circle-check fs-4 me-3"></i>
                    <div>
                        <strong>Hợp đồng đã được tạo thành công!</strong>
                        <p className="mb-0 mt-1">
                            Email với link ký hợp đồng đã được gửi đến bệnh viện.
                        </p>
                    </div>
                </div>

                {/* Contract Details */}
                <div className="card mb-3">
                    <div className="card-header bg-light">
                        <h6 className="mb-0">
                            <i className="ti ti-file-text me-2" aria-hidden="true" /> Chi Tiết Hợp
                            Đồng
                        </h6>
                    </div>
                    <div className="card-body">
                        <div className="row g-3">
                            <div className="col-md-6">
                                <span className="text-muted small d-block">Số hợp đồng</span>
                                <div className="fw-semibold">{contractInfo.contractNumber}</div>
                            </div>
                            <div className="col-md-6">
                                <span className="text-muted small d-block">Trạng thái</span>
                                <div>
                                    <span className="badge bg-info">
                                        {contractInfo.status === 'CONTRACT_GENERATED'
                                            ? 'Chờ ký'
                                            : contractInfo.status}
                                    </span>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <span className="text-muted small d-block">Ngày tạo</span>
                                <div className="fw-semibold">
                                    {formatDate(contractInfo.generatedAt)}
                                </div>
                            </div>
                            <div className="col-md-6">
                                <span className="text-muted small d-block">Link hết hạn</span>
                                <div>
                                    <span
                                        className={`badge ${isExpired ? 'bg-danger' : 'bg-warning'}`}
                                    >
                                        {formatDate(contractInfo.linkExpiresAt)}
                                    </span>
                                    <div className="small text-muted mt-1">
                                        {getTimeRemaining()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contract File */}
                <div className="card mb-3">
                    <div className="card-header bg-light">
                        <h6 className="mb-0">
                            <i className="ti ti-file-download me-2" aria-hidden="true" /> File Hợp
                            Đồng
                        </h6>
                    </div>
                    <div className="card-body">
                        <div className="d-flex align-items-center justify-content-between">
                            <div className="d-flex align-items-center">
                                <i className="ti ti-file-type-pdf fs-1 text-danger me-3"></i>
                                <div>
                                    <div className="fw-semibold">
                                        Hợp đồng hợp tác - {contractInfo.contractNumber}.pdf
                                    </div>
                                    <div className="small text-muted">
                                        Hợp đồng chưa có chữ ký bệnh viện
                                    </div>
                                </div>
                            </div>
                            <a
                                href={contractInfo.contractFileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-sm btn-outline-primary"
                            >
                                <i className="ti ti-eye me-1" aria-hidden="true" /> Xem
                            </a>
                        </div>
                    </div>
                </div>

                {/* Signing Link */}
                <div className="card">
                    <div className="card-header bg-light">
                        <h6 className="mb-0">
                            <i className="ti ti-link me-2" aria-hidden="true" /> Link Ký Hợp Đồng
                        </h6>
                    </div>
                    <div className="card-body">
                        {isExpired ? (
                            <div className="alert alert-danger mb-0">
                                <i className="ti ti-alert-circle me-2"></i>
                                <strong>Link đã hết hạn!</strong> Vui lòng tạo lại hợp đồng để gửi
                                link mới cho bệnh viện.
                            </div>
                        ) : (
                            <>
                                <div className="input-group mb-3">
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={contractInfo.signingLink}
                                        readOnly
                                    />
                                    <button
                                        className="btn btn-primary"
                                        type="button"
                                        onClick={handleCopyLink}
                                        disabled={isCopying}
                                    >
                                        {isCopying ? (
                                            <>
                                                <output className="spinner-border spinner-border-sm me-1" />{' '}
                                                Đang copy...
                                            </>
                                        ) : (
                                            <>
                                                <i className="ti ti-copy me-1" aria-hidden="true" />{' '}
                                                Copy Link
                                            </>
                                        )}
                                    </button>
                                </div>

                                <div className="alert alert-info mb-0">
                                    <i className="ti ti-info-circle me-2"></i>
                                    <strong>Hướng dẫn:</strong>
                                    <ul className="mb-0 mt-2 ps-3">
                                        <li>
                                            Link này đã được gửi tự động qua email cho bệnh viện
                                        </li>
                                        <li>
                                            Bạn có thể copy link để gửi qua kênh khác nếu cần thiết
                                        </li>
                                        <li>
                                            Link chỉ có thể sử dụng một lần và có hiệu lực trong 7
                                            ngày
                                        </li>
                                        <li>
                                            Sau khi bệnh viện ký, bạn sẽ nhận được thông báo để phê
                                            duyệt
                                        </li>
                                    </ul>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </Modal.Body>

            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    <i className="ti ti-x me-1" aria-hidden="true" /> Đóng
                </Button>
                {!isExpired && (
                    <a
                        href={contractInfo.contractFileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-primary"
                    >
                        <i className="ti ti-file-download me-1" aria-hidden="true" /> Tải Hợp Đồng
                    </a>
                )}
            </Modal.Footer>
        </Modal>
    );
};

export default ContractInfoModal;
