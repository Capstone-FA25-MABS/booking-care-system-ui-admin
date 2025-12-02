import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Table, Badge } from 'react-bootstrap';
import { FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { useHospitalPayouts, usePendingHospitals } from '@/hooks/useHospitalPayouts';
import type { GeneratePayoutsRequest } from '@/types/hospitalPayout.types';
import Calendar from '@/components/Calendar/Calendar';

interface GeneratePayoutsModalProps {
    show: boolean;
    onHide: () => void;
    onSuccess: () => void;
}

const GeneratePayoutsModal: React.FC<GeneratePayoutsModalProps> = ({ show, onHide, onSuccess }) => {
    const { generatePayouts, loading } = useHospitalPayouts();
    const { pendingHospitals, fetchPendingHospitals } = usePendingHospitals();

    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [startDateAnchor, setStartDateAnchor] = useState<HTMLElement | null>(null);
    const [endDateAnchor, setEndDateAnchor] = useState<HTMLElement | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [selectedHospitals, setSelectedHospitals] = useState<Set<string>>(new Set());
    const [showPreview, setShowPreview] = useState(false);

    useEffect(() => {
        if (show) {
            // Reset form when modal opens
            setStartDate(null);
            setEndDate(null);
            setStartDateAnchor(null);
            setEndDateAnchor(null);
            setSelectedHospitals(new Set());
            setError(null);
            setSuccess(null);
            setShowPreview(false);
        }
    }, [show]);

    const handlePreview = async () => {
        if (!startDate || !endDate) {
            setError('Please select both start and end dates');
            return;
        }

        setError(null);
        try {
            const startDateStr = startDate.toISOString().split('T')[0];
            const endDateStr = endDate.toISOString().split('T')[0];
            await fetchPendingHospitals(startDateStr, endDateStr);
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

        if (!startDate || !endDate) {
            setError('Please select both start and end dates');
            return;
        }

        try {
            const requestData: GeneratePayoutsRequest = {
                periodStartDate: startDate.toISOString().split('T')[0],
                periodEndDate: endDate.toISOString().split('T')[0],
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
                <Modal.Title>Generate Hospital Payouts</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    {error && <Alert variant="danger">{error}</Alert>}
                    {success && <Alert variant="success">{success}</Alert>}

                    <Form.Group className="mb-3">
                        <Form.Label>Period Start Date</Form.Label>
                        <Form.Control
                            type="text"
                            value={startDate ? startDate.toLocaleDateString('vi-VN') : ''}
                            onClick={(e) => setStartDateAnchor(e.currentTarget)}
                            placeholder="Select start date"
                            readOnly
                            required
                            disabled={loading}
                            style={{ cursor: 'pointer' }}
                        />
                        <Calendar
                            value={startDate}
                            onChange={setStartDate}
                            anchorEl={startDateAnchor}
                            open={Boolean(startDateAnchor)}
                            onClose={() => setStartDateAnchor(null)}
                            maxDate={endDate || undefined}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Period End Date</Form.Label>
                        <Form.Control
                            type="text"
                            value={endDate ? endDate.toLocaleDateString('vi-VN') : ''}
                            onClick={(e) => setEndDateAnchor(e.currentTarget)}
                            placeholder="Select end date"
                            readOnly
                            required
                            disabled={loading}
                            style={{ cursor: 'pointer' }}
                        />
                        <Calendar
                            value={endDate}
                            onChange={setEndDate}
                            anchorEl={endDateAnchor}
                            open={Boolean(endDateAnchor)}
                            onClose={() => setEndDateAnchor(null)}
                            minDate={startDate || undefined}
                        />
                    </Form.Group>

                    {showPreview ? (
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
                    ) : (
                        <Button variant="info" onClick={handlePreview} className="w-100">
                            Preview Eligible Hospitals
                        </Button>
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
