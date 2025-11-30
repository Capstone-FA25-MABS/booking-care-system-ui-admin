import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Table, Badge } from 'react-bootstrap';
import { FiCalendar, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { useHospitalPayouts, usePendingHospitals } from '@/hooks/useHospitalPayouts';
import type { GeneratePayoutsRequest } from '@/types/hospitalPayout.types';

interface GeneratePayoutsModalProps {
    show: boolean;
    onHide: () => void;
    onSuccess: () => void;
}

const GeneratePayoutsModal: React.FC<GeneratePayoutsModalProps> = ({ show, onHide, onSuccess }) => {
    const { generatePayouts, loading } = useHospitalPayouts();
    const { pendingHospitals, fetchPendingHospitals } = usePendingHospitals();

    const [formData, setFormData] = useState<GeneratePayoutsRequest>({
        periodStartDate: '',
        periodEndDate: '',
        hospitalIds: undefined,
    });
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [selectedHospitals, setSelectedHospitals] = useState<Set<string>>(new Set());
    const [showPreview, setShowPreview] = useState(false);

    useEffect(() => {
        if (show) {
            // Reset form when modal opens
            setFormData({
                periodStartDate: '',
                periodEndDate: '',
                hospitalIds: undefined,
            });
            setSelectedHospitals(new Set());
            setError(null);
            setSuccess(null);
            setShowPreview(false);
        }
    }, [show]);

    const handlePreview = async () => {
        if (!formData.periodStartDate || !formData.periodEndDate) {
            setError('Please select both start and end dates');
            return;
        }

        setError(null);
        try {
            await fetchPendingHospitals(formData.periodStartDate, formData.periodEndDate);
            setShowPreview(true);
        } catch {
            setError('Failed to fetch pending hospitals');
        }
    };

    const handleToggleHospital = (hospitalId: string) => {
        setSelectedHospitals((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(hospitalId)) {
                newSet.delete(hospitalId);
            } else {
                newSet.add(hospitalId);
            }
            return newSet;
        });
    };

    const handleSelectAll = () => {
        if (selectedHospitals.size === pendingHospitals.filter((h) => h.hasBankAccount).length) {
            setSelectedHospitals(new Set());
        } else {
            setSelectedHospitals(
                new Set(pendingHospitals.filter((h) => h.hasBankAccount).map((h) => h.hospitalId))
            );
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (!formData.periodStartDate || !formData.periodEndDate) {
            setError('Please select both start and end dates');
            return;
        }

        try {
            const requestData: GeneratePayoutsRequest = {
                ...formData,
                hospitalIds: selectedHospitals.size > 0 ? Array.from(selectedHospitals) : undefined,
            };

            const result = await generatePayouts(requestData);

            const successMessage = `Successfully generated ${result?.length ?? 0} payout(s)`;

            setSuccess(successMessage);
            setTimeout(() => {
                onSuccess();
            }, 2000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to generate payouts');
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount);
    };

    const totalAmount = pendingHospitals
        .filter((h) => selectedHospitals.has(h.hospitalId))
        .reduce((sum, h) => sum + h.totalAmount, 0);

    return (
        <Modal show={show} onHide={onHide} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>
                    <FiCalendar className="me-2" />
                    Generate Hospital Payouts
                </Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    {error && <Alert variant="danger">{error}</Alert>}
                    {success && <Alert variant="success">{success}</Alert>}

                    <Form.Group className="mb-3">
                        <Form.Label>Period Start Date</Form.Label>
                        <Form.Control
                            type="date"
                            value={formData.periodStartDate}
                            onChange={(e) =>
                                setFormData({ ...formData, periodStartDate: e.target.value })
                            }
                            required
                            disabled={loading}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Period End Date</Form.Label>
                        <Form.Control
                            type="date"
                            value={formData.periodEndDate}
                            onChange={(e) =>
                                setFormData({ ...formData, periodEndDate: e.target.value })
                            }
                            required
                            disabled={loading}
                        />
                    </Form.Group>

                    {!showPreview ? (
                        <Button variant="info" onClick={handlePreview} className="w-100">
                            Preview Eligible Hospitals
                        </Button>
                    ) : (
                        <>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h6>Eligible Hospitals ({pendingHospitals.length})</h6>
                                <Button
                                    variant="outline-primary"
                                    size="sm"
                                    onClick={handleSelectAll}
                                >
                                    {selectedHospitals.size ===
                                    pendingHospitals.filter((h) => h.hasBankAccount).length
                                        ? 'Deselect All'
                                        : 'Select All'}
                                </Button>
                            </div>

                            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                <Table striped bordered hover size="sm">
                                    <thead>
                                        <tr>
                                            <th style={{ width: '50' }}>
                                                <Form.Check
                                                    type="checkbox"
                                                    checked={
                                                        selectedHospitals.size ===
                                                            pendingHospitals.filter(
                                                                (h) => h.hasBankAccount
                                                            ).length && pendingHospitals.length > 0
                                                    }
                                                    onChange={handleSelectAll}
                                                />
                                            </th>
                                            <th>Hospital</th>
                                            <th>Amount</th>
                                            <th>Appointments</th>
                                            <th>Bank Account</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pendingHospitals.map((hospital) => (
                                            <tr key={hospital.hospitalId}>
                                                <td>
                                                    <Form.Check
                                                        type="checkbox"
                                                        checked={selectedHospitals.has(
                                                            hospital.hospitalId
                                                        )}
                                                        onChange={() =>
                                                            handleToggleHospital(
                                                                hospital.hospitalId
                                                            )
                                                        }
                                                        disabled={!hospital.hasBankAccount}
                                                    />
                                                </td>
                                                <td>{hospital.hospitalName}</td>
                                                <td className="fw-bold text-success">
                                                    {formatCurrency(hospital.totalAmount)}
                                                </td>
                                                <td>{hospital.appointmentCount}</td>
                                                <td>
                                                    {hospital.hasBankAccount ? (
                                                        <Badge bg="success">
                                                            <FiCheckCircle className="me-1" />
                                                            Available
                                                        </Badge>
                                                    ) : (
                                                        <Badge bg="danger">
                                                            <FiAlertCircle className="me-1" />
                                                            Missing
                                                        </Badge>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>

                            {selectedHospitals.size > 0 && (
                                <Alert variant="info" className="mt-3">
                                    <strong>Selected:</strong> {selectedHospitals.size} hospital(s)
                                    | <strong>Total Amount:</strong> {formatCurrency(totalAmount)}
                                </Alert>
                            )}
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={onHide} disabled={loading}>
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        type="submit"
                        disabled={loading || !showPreview || selectedHospitals.size === 0}
                    >
                        {loading ? 'Generating...' : 'Generate Payouts'}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default GeneratePayoutsModal;
