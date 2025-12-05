import React, { useState, useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import { AppointmentCardData } from '@/types/appointment.types';
import PaymentService, { PaymentInfo } from '@/services/payment.service';

interface InvoiceModalProps {
    show: boolean;
    onHide: () => void;
    appointment: AppointmentCardData | null;
}

const InvoiceModal: React.FC<InvoiceModalProps> = ({ show, onHide, appointment }) => {
    const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (show && appointment?.appointmentId) {
            fetchPaymentInfo();
        } else {
            setPaymentInfo(null);
            setError(null);
        }
    }, [show, appointment]);

    const fetchPaymentInfo = async () => {
        if (!appointment?.appointmentId) return;

        setLoading(true);
        setError(null);

        try {
            const response = await PaymentService.getPaymentByAppointmentId(
                appointment.appointmentId
            );

            if (response.success && response.data) {
                setPaymentInfo(response.data);
            } else {
                setError(response.message || 'Không thể tải thông tin thanh toán');
            }
        } catch (err: any) {
            console.error('Error fetching payment info:', err);
            setError(err.message || 'Không thể tải thông tin thanh toán');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('vi-VN');
    };

    const formatCurrency = (amount: number) => {
        return amount.toLocaleString('vi-VN') + ' ₫';
    };

    const handlePrint = () => {
        // Get the invoice content
        const invoiceContent = document.querySelector('.invoice-container');
        if (!invoiceContent) return;

        // Create a new window for printing
        const printWindow = window.open('', '_blank', 'width=800,height=600');
        if (!printWindow) return;

        // Write the HTML content to the new window
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>Hoá đơn thanh toán - ${appointment?.appointmentId.substring(0, 8).toUpperCase()}</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
                <style>
                    body {
                        padding: 20px;
                        font-family: Arial, sans-serif;
                    }
                    .print-header {
                        text-align: center;
                        margin-bottom: 30px;
                        border-bottom: 2px solid #0d6efd;
                        padding-bottom: 15px;
                    }
                    .print-header h2 {
                        color: #0d6efd;
                        margin-bottom: 5px;
                    }
                    .card {
                        border: 1px solid #dee2e6;
                        margin-bottom: 1rem;
                        break-inside: avoid;
                    }
                    .card-header {
                        padding: 0.5rem 1rem;
                        border-bottom: 1px solid #dee2e6;
                    }
                    .bg-light {
                        background-color: #f8f9fa !important;
                    }
                    .bg-primary {
                        background-color: #0d6efd !important;
                    }
                    .text-white {
                        color: #fff !important;
                    }
                    .text-primary {
                        color: #0d6efd !important;
                    }
                    .text-success {
                        color: #198754 !important;
                    }
                    .badge {
                        display: inline-block;
                        padding: 0.25em 0.6em;
                        font-size: 0.75em;
                        font-weight: 700;
                        line-height: 1;
                        color: #fff;
                        text-align: center;
                        white-space: nowrap;
                        vertical-align: baseline;
                        border-radius: 0.25rem;
                    }
                    .bg-success {
                        background-color: #198754 !important;
                    }
                    @media print {
                        body {
                            -webkit-print-color-adjust: exact;
                            print-color-adjust: exact;
                        }
                        .card {
                            page-break-inside: avoid;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="print-header">
                    <h2>HOÁ ĐƠN THANH TOÁN</h2>
                    <p class="text-muted mb-0">PreClinic - Hệ thống đặt lịch khám bệnh</p>
                </div>
                ${invoiceContent.innerHTML}
            </body>
            </html>
        `);

        printWindow.document.close();

        // Wait for content to load, then print
        printWindow.onload = () => {
            printWindow.focus();
            printWindow.print();
            printWindow.close();
        };

        // Fallback if onload doesn't trigger
        setTimeout(() => {
            printWindow.focus();
            printWindow.print();
            printWindow.close();
        }, 250);
    };

    return (
        <Modal show={show} onHide={onHide} centered size="lg">
            <Modal.Header closeButton>
                <Modal.Title>
                    <i className="ti ti-file-invoice me-2"></i>
                    Hoá đơn thanh toán
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {loading && (
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Đang tải...</span>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="alert alert-danger">
                        <i className="ti ti-alert-circle me-2"></i>
                        {error}
                    </div>
                )}

                {!loading && !error && appointment && (
                    <div className="invoice-container">
                        {/* Appointment Information */}
                        <div className="card mb-3">
                            <div className="card-header bg-light">
                                <h6 className="mb-0">Thông tin lịch hẹn</h6>
                            </div>
                            <div className="card-body">
                                <div className="row">
                                    <div className="col-md-6">
                                        <p className="mb-2">
                                            <strong>Mã lịch hẹn:</strong>{' '}
                                            {appointment.appointmentId
                                                .substring(0, 8)
                                                .toUpperCase()}
                                        </p>
                                        <p className="mb-2">
                                            <strong>Ngày khám:</strong>{' '}
                                            {new Date(
                                                appointment.appointmentDate
                                            ).toLocaleDateString('vi-VN')}
                                        </p>
                                        <p className="mb-0">
                                            <strong>Giờ khám:</strong> {appointment.appointmentTime}
                                        </p>
                                    </div>
                                    <div className="col-md-6">
                                        <p className="mb-2">
                                            <strong>Bệnh nhân:</strong>{' '}
                                            {appointment.relativeInfo
                                                ? appointment.relativeInfo.fullName
                                                : `${appointment.patientInfo?.firstName} ${appointment.patientInfo?.lastName}`}
                                        </p>
                                        <p className="mb-0">
                                            <strong>Bác sĩ/Dịch vụ:</strong>{' '}
                                            {appointment.doctorInfo?.fullName ||
                                                appointment.serviceInfo?.name ||
                                                'Chưa phân công'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payment Information */}
                        {paymentInfo && (
                            <div className="card mb-3">
                                <div className="card-header bg-light">
                                    <h6 className="mb-0">Thông tin thanh toán (Đặt cọc)</h6>
                                </div>
                                <div className="card-body">
                                    <div className="row">
                                        <div className="col-md-6">
                                            <p className="mb-2">
                                                <strong>Mã giao dịch:</strong>{' '}
                                                {paymentInfo.id.substring(0, 8).toUpperCase()}
                                            </p>
                                            <p className="mb-2">
                                                <strong>Phương thức:</strong>{' '}
                                                {paymentInfo.paymentMethodName}
                                            </p>
                                            <p className="mb-0">
                                                <strong>Ngày thanh toán:</strong>{' '}
                                                {formatDate(paymentInfo.createdAt)}
                                            </p>
                                        </div>
                                        <div className="col-md-6">
                                            <p className="mb-2">
                                                <strong>Số tiền đã đặt cọc:</strong>{' '}
                                                <span className="text-primary fw-semibold">
                                                    {formatCurrency(paymentInfo.amount)}
                                                </span>
                                            </p>
                                            <p className="mb-0">
                                                <strong>Trạng thái:</strong>{' '}
                                                <span className="badge bg-success">
                                                    {paymentInfo.status}
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Payment Summary */}
                        <div className="card">
                            <div className="card-header bg-primary text-white">
                                <h6 className="mb-0">Tổng kết thanh toán</h6>
                            </div>
                            <div className="card-body">
                                <div className="d-flex justify-content-between mb-2">
                                    <span>Tổng chi phí khám:</span>
                                    <strong>{formatCurrency(appointment.amount || 0)}</strong>
                                </div>
                                <div className="d-flex justify-content-between mb-2 text-success">
                                    <span>Đã đặt cọc:</span>
                                    <strong>
                                        -{' '}
                                        {formatCurrency(
                                            (appointment.amount || 0) -
                                                (appointment.consultationFees || 0)
                                        )}
                                    </strong>
                                </div>
                                <hr />
                                <div className="d-flex justify-content-between">
                                    <span className="fs-5 fw-semibold">Số tiền còn lại:</span>
                                    <span className="fs-4 fw-bold text-primary">
                                        {formatCurrency(appointment.consultationFees || 0)}
                                    </span>
                                </div>
                                {appointment.consultationFees &&
                                    appointment.consultationFees > 0 && (
                                        <div className="alert alert-info mt-3 mb-0">
                                            <i className="ti ti-info-circle me-2"></i>
                                            Bệnh nhân cần thanh toán số tiền còn lại khi đến khám.
                                        </div>
                                    )}
                            </div>
                        </div>
                    </div>
                )}
            </Modal.Body>
            <Modal.Footer>
                <button type="button" className="btn btn-secondary" onClick={onHide}>
                    Đóng
                </button>
                {!loading && !error && (
                    <button type="button" className="btn btn-primary" onClick={handlePrint}>
                        <i className="ti ti-printer me-2"></i>
                        In hoá đơn
                    </button>
                )}
            </Modal.Footer>
        </Modal>
    );
};

export default InvoiceModal;
