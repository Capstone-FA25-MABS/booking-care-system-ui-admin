import React, { useEffect, useState } from 'react';
import { Modal, Button, Alert, Row, Col, Card, Badge, Table } from 'react-bootstrap';
import { FiCalendar, FiUser, FiCreditCard, FiCheckCircle } from 'react-icons/fi';
import { useHospitalPayouts } from '@/hooks/useHospitalPayouts';
import type { HospitalPayoutResponse, PayoutAppointmentDetail } from '@/types/hospitalPayout.types';
import { PayoutStatus } from '@/types/hospitalPayout.types';

interface PayoutDetailsModalProps {
    payoutId: string;
    onHide: () => void;
    onMarkCompleted: (payoutId: string) => void;
}

const PayoutDetailsModal: React.FC<PayoutDetailsModalProps> = ({
    payoutId,
    onHide,
    onMarkCompleted,
}) => {
    const { fetchPayoutById, loading } = useHospitalPayouts();
    const [payout, setPayout] = useState<HospitalPayoutResponse | null>(null);
    const [appointments, setAppointments] = useState<PayoutAppointmentDetail[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadPayoutDetails = async () => {
            try {
                const data = await fetchPayoutById(payoutId);
                setPayout(data.payout);
                setAppointments(data.appointments || []);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load payout details');
            }
        };

        if (payoutId) {
            loadPayoutDetails();
        }
    }, [payoutId, fetchPayoutById]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString('vi-VN');
    };

    const handleMarkCompleted = () => {
        onMarkCompleted(payoutId);
        onHide();
    };

    const generateVietQRUrl = () => {
        if (!payout || !payout.bankAccount) return '';

        const bankInfo = payout.bankAccount;
        const amount = payout.totalAmount;
        const description = `Payout for ${payout.hospitalName || 'Hospital'} - Period ${formatDate(payout.periodStart)} to ${formatDate(payout.periodEnd)}`;

        // VietQR format: https://img.vietqr.io/image/{BANK_BIN}-{ACCOUNT_NUMBER}-{TEMPLATE}.png?amount={AMOUNT}&addInfo={DESCRIPTION}
        // Note: You need to get the actual bank BIN code from a mapping
        return `https://img.vietqr.io/image/${bankInfo.bankCode}-${bankInfo.accountNumber}-compact.png?amount=${amount}&addInfo=${encodeURIComponent(description)}`;
    };

    return (
        <Modal show={!!payoutId} onHide={onHide} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Payout Details</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && <Alert variant="danger">{error}</Alert>}

                {loading ? (
                    <div className="text-center p-5">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                ) : payout ? (
                    <>
                        {/* Status Badge */}
                        <div className="text-center mb-4">
                            {payout.status === PayoutStatus.PENDING ? (
                                <Badge bg="warning" className="fs-5 px-4 py-2">
                                    Pending Payment
                                </Badge>
                            ) : (
                                <Badge bg="success" className="fs-5 px-4 py-2">
                                    <FiCheckCircle className="me-2" />
                                    Payment Completed
                                </Badge>
                            )}
                        </div>

                        {/* Payout Summary */}
                        <Card className="mb-3 shadow-sm">
                            <Card.Header className="bg-primary text-white">
                                <h5 className="mb-0">Payout Summary</h5>
                            </Card.Header>
                            <Card.Body>
                                <Row>
                                    <Col md={6}>
                                        <div className="mb-3">
                                            <small className="text-muted">Hospital</small>
                                            <div className="fw-bold">
                                                {payout.hospitalName || 'N/A'}
                                            </div>
                                        </div>
                                    </Col>
                                    <Col md={6}>
                                        <div className="mb-3">
                                            <small className="text-muted">Period</small>
                                            <div className="fw-bold">
                                                <FiCalendar className="me-2" />
                                                {formatDate(payout.periodStart)} -{' '}
                                                {formatDate(payout.periodEnd)}
                                            </div>
                                        </div>
                                    </Col>
                                    <Col md={6}>
                                        <div className="mb-3">
                                            <small className="text-muted">Total Amount</small>
                                            <div className="fw-bold text-success fs-4">
                                                {formatCurrency(payout.totalAmount)}
                                            </div>
                                        </div>
                                    </Col>
                                    <Col md={6}>
                                        <div className="mb-3">
                                            <small className="text-muted">
                                                Number of Appointments
                                            </small>
                                            <div className="fw-bold fs-4">
                                                {payout.appointmentCount}
                                            </div>
                                        </div>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>

                        {/* Bank Account Information */}
                        <Card className="mb-3 shadow-sm">
                            <Card.Header className="bg-info text-white">
                                <h5 className="mb-0">
                                    <FiCreditCard className="me-2" />
                                    Bank Account Information
                                </h5>
                            </Card.Header>
                            <Card.Body>
                                <Row>
                                    <Col md={6}>
                                        <Table borderless size="sm">
                                            <tbody>
                                                <tr>
                                                    <td className="text-muted">Bank Code:</td>
                                                    <td className="fw-bold">
                                                        {payout.bankAccount.bankCode}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className="text-muted">Bank Name:</td>
                                                    <td className="fw-bold">
                                                        {payout.bankAccount.bankName}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className="text-muted">Account Number:</td>
                                                    <td className="fw-bold">
                                                        {payout.bankAccount.accountNumber}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className="text-muted">Account Name:</td>
                                                    <td className="fw-bold">
                                                        {payout.bankAccount.accountName}
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </Table>
                                    </Col>
                                    <Col md={6} className="text-center">
                                        <small className="text-muted d-block mb-2">
                                            VietQR Code
                                        </small>
                                        <img
                                            src={generateVietQRUrl()}
                                            alt="VietQR Code"
                                            className="img-fluid border rounded"
                                            style={{ maxHeight: '200px' }}
                                            onError={(e) => {
                                                e.currentTarget.src =
                                                    'https://via.placeholder.com/200x200?text=QR+Code+Not+Available';
                                            }}
                                        />
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>

                        {/* Appointments Breakdown */}
                        {appointments && appointments.length > 0 && (
                            <Card className="mb-3 shadow-sm">
                                <Card.Header className="bg-secondary text-white">
                                    <h5 className="mb-0">
                                        <FiUser className="me-2" />
                                        Appointments Breakdown ({appointments.length})
                                    </h5>
                                </Card.Header>
                                <Card.Body>
                                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                        <Table striped bordered hover size="sm">
                                            <thead>
                                                <tr>
                                                    <th>Patient</th>
                                                    <th>Doctor</th>
                                                    <th>Date</th>
                                                    <th>Amount</th>
                                                    <th>Paid At</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {appointments.map((apt) => (
                                                    <tr key={apt.appointmentId}>
                                                        <td>{apt.patientName}</td>
                                                        <td>{apt.doctorName}</td>
                                                        <td>{formatDate(apt.appointmentDate)}</td>
                                                        <td className="text-success">
                                                            {formatCurrency(apt.amount)}
                                                        </td>
                                                        <td>
                                                            {formatDateTime(apt.paymentCompletedAt)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    </div>
                                </Card.Body>
                            </Card>
                        )}

                        {/* Tracking Information */}
                        <Card className="shadow-sm">
                            <Card.Header>
                                <h5 className="mb-0">Tracking Information</h5>
                            </Card.Header>
                            <Card.Body>
                                <Row>
                                    <Col md={6}>
                                        <div className="mb-3">
                                            <small className="text-muted">Generated Date</small>
                                            <div>{formatDateTime(payout.createdAt)}</div>
                                        </div>
                                        <div className="mb-3">
                                            <small className="text-muted">
                                                Generated By Admin ID
                                            </small>
                                            <div className="font-monospace">
                                                {payout.processedByAdminName || 'N/A'}
                                            </div>
                                        </div>
                                    </Col>
                                    <Col md={6}>
                                        {payout.processedAt && (
                                            <>
                                                <div className="mb-3">
                                                    <small className="text-muted">
                                                        Completed Date
                                                    </small>
                                                    <div>{formatDateTime(payout.processedAt)}</div>
                                                </div>
                                                <div className="mb-3">
                                                    <small className="text-muted">
                                                        Completed By Admin ID
                                                    </small>
                                                    <div className="font-monospace">
                                                        {payout.processedByAdminId || 'N/A'}
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                    </>
                ) : (
                    <Alert variant="info">No payout data available</Alert>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    Close
                </Button>
                {payout && payout.status === PayoutStatus.PENDING && (
                    <Button variant="success" onClick={handleMarkCompleted}>
                        <FiCheckCircle className="me-2" />
                        Mark as Paid
                    </Button>
                )}
            </Modal.Footer>
        </Modal>
    );
};

export default PayoutDetailsModal;
