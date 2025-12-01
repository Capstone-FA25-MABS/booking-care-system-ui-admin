import React, { useState, useEffect, useCallback } from 'react';
import { Button, Card, Form, Table, Badge, Row, Col } from 'react-bootstrap';
import { FiRefreshCw, FiCalendar, FiFilter } from 'react-icons/fi';
import { useHospitalPayouts, usePayoutStatistics } from '@/hooks/useHospitalPayouts';
import { PayoutStatus } from '@/types/hospitalPayout.types';
import type { PayoutQueryRequest } from '@/types/hospitalPayout.types';
import GeneratePayoutsModal from './components/GeneratePayoutsModal';
import PayoutDetailsModal from './components/PayoutDetailsModal';
import StatisticsCards from './components/StatisticsCards';
import Calendar from '@/components/Calendar/Calendar';

const HospitalPayouts: React.FC = () => {
    const { payouts, totalCount, loading, fetchPayouts, markPayoutCompleted } =
        useHospitalPayouts();
    const { statistics, fetchStatistics } = usePayoutStatistics();

    const [showGenerateModal, setShowGenerateModal] = useState(false);
    const [selectedPayoutId, setSelectedPayoutId] = useState<string | null>(null);
    const [filters, setFilters] = useState<PayoutQueryRequest>({
        pageNumber: 1,
        pageSize: 10,
    });

    // Calendar state
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [startDateAnchor, setStartDateAnchor] = useState<HTMLElement | null>(null);
    const [endDateAnchor, setEndDateAnchor] = useState<HTMLElement | null>(null);

    useEffect(() => {
        fetchPayouts(filters);
        fetchStatistics();
    }, [filters, fetchPayouts, fetchStatistics]);

    const handleGenerateSuccess = useCallback(() => {
        setShowGenerateModal(false);
        fetchPayouts(filters);
        fetchStatistics();
    }, [filters, fetchPayouts, fetchStatistics]);

    const handleMarkCompleted = useCallback(
        async (payoutId: string) => {
            if (globalThis.confirm('Are you sure you want to mark this payout as completed?')) {
                try {
                    await markPayoutCompleted(payoutId);
                    fetchStatistics();
                } catch (error) {
                    console.error('Failed to mark payout as completed:', error);
                }
            }
        },
        [markPayoutCompleted, fetchStatistics]
    );

    const handleFilterChange = (key: keyof PayoutQueryRequest, value: string | undefined) => {
        setFilters((prev) => ({
            ...prev,
            [key]: value || undefined,
            pageNumber: 1, // Reset to first page on filter change
        }));
    };

    const handleStartDateChange = (date: Date | null) => {
        setStartDate(date);
        const dateStr = date ? date.toISOString().split('T')[0] : undefined;
        handleFilterChange('periodStartDate', dateStr);
    };

    const handleEndDateChange = (date: Date | null) => {
        setEndDate(date);
        const dateStr = date ? date.toISOString().split('T')[0] : undefined;
        handleFilterChange('periodEndDate', dateStr);
    };

    const handlePageChange = (pageNumber: number) => {
        setFilters((prev) => ({ ...prev, pageNumber }));
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    const getStatusBadge = (status: PayoutStatus) => {
        return status === PayoutStatus.PENDING ? (
            <Badge bg="warning">Pending</Badge>
        ) : (
            <Badge bg="success">Completed</Badge>
        );
    };

    return (
        <div className="container-fluid p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Hospital Payouts Management</h2>
                <Button variant="primary" onClick={() => setShowGenerateModal(true)}>
                    <FiCalendar className="me-2" />
                    Generate Payouts
                </Button>
            </div>

            {statistics && <StatisticsCards statistics={statistics} />}

            <Card className="mb-4">
                <Card.Header>
                    <div className="d-flex align-items-center">
                        <FiFilter className="me-2" />
                        <h5 className="mb-0">Filters</h5>
                    </div>
                </Card.Header>
                <Card.Body>
                    <Row>
                        <Col md={3}>
                            <Form.Group className="mb-3">
                                <Form.Label>Period Start Date</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={startDate ? startDate.toLocaleDateString('vi-VN') : ''}
                                    onClick={(e) => setStartDateAnchor(e.currentTarget)}
                                    placeholder="Select start date"
                                    readOnly
                                    style={{ cursor: 'pointer' }}
                                />
                                <Calendar
                                    value={startDate}
                                    onChange={handleStartDateChange}
                                    anchorEl={startDateAnchor}
                                    open={Boolean(startDateAnchor)}
                                    onClose={() => setStartDateAnchor(null)}
                                    maxDate={endDate || undefined}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group className="mb-3">
                                <Form.Label>Period End Date</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={endDate ? endDate.toLocaleDateString('vi-VN') : ''}
                                    onClick={(e) => setEndDateAnchor(e.currentTarget)}
                                    placeholder="Select end date"
                                    readOnly
                                    style={{ cursor: 'pointer' }}
                                />
                                <Calendar
                                    value={endDate}
                                    onChange={handleEndDateChange}
                                    anchorEl={endDateAnchor}
                                    open={Boolean(endDateAnchor)}
                                    onClose={() => setEndDateAnchor(null)}
                                    minDate={startDate || undefined}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group className="mb-3">
                                <Form.Label>Status</Form.Label>
                                <Form.Select
                                    value={filters.status || ''}
                                    onChange={(e) => handleFilterChange('status', e.target.value)}
                                >
                                    <option value="">All</option>
                                    <option value={PayoutStatus.PENDING}>Pending</option>
                                    <option value={PayoutStatus.COMPLETED}>Completed</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group className="mb-3">
                                <Form.Label>Hospital Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Search by hospital name"
                                    value={filters.hospitalName || ''}
                                    onChange={(e) =>
                                        handleFilterChange('hospitalName', e.target.value)
                                    }
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                    <Button variant="secondary" size="sm" onClick={() => fetchPayouts(filters)}>
                        <FiRefreshCw className="me-2" />
                        Refresh
                    </Button>
                </Card.Body>
            </Card>

            <Card>
                <Card.Body>
                    {loading ? (
                        <div className="text-center p-5">
                            <output className="spinner-border text-primary">
                                <span className="visually-hidden">Loading...</span>
                            </output>
                        </div>
                    ) : (
                        <>
                            <Table responsive hover>
                                <thead>
                                    <tr>
                                        <th>Hospital</th>
                                        <th>Period</th>
                                        <th>Amount</th>
                                        <th>Appointments</th>
                                        <th>Status</th>
                                        <th>Generated Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {!payouts || payouts.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="text-center py-4">
                                                No payouts found
                                            </td>
                                        </tr>
                                    ) : (
                                        payouts.map((payout) => (
                                            <tr key={payout.id}>
                                                <td>{payout.hospitalName || 'N/A'}</td>
                                                <td>
                                                    {formatDate(payout.periodStart)} -{' '}
                                                    {formatDate(payout.periodEnd)}
                                                </td>
                                                <td className="fw-bold text-success">
                                                    {formatCurrency(payout.totalAmount)}
                                                </td>
                                                <td>{payout.appointmentCount}</td>
                                                <td>{getStatusBadge(payout.status)}</td>
                                                <td>{formatDate(payout.createdAt)}</td>
                                                <td>
                                                    <Button
                                                        variant="info"
                                                        size="sm"
                                                        className="me-2"
                                                        onClick={() =>
                                                            setSelectedPayoutId(payout.id)
                                                        }
                                                    >
                                                        View Details
                                                    </Button>
                                                    {payout.status === PayoutStatus.PENDING && (
                                                        <Button
                                                            variant="success"
                                                            size="sm"
                                                            onClick={() =>
                                                                handleMarkCompleted(payout.id)
                                                            }
                                                        >
                                                            Mark Paid
                                                        </Button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </Table>

                            {totalCount > (filters.pageSize || 10) && (
                                <div className="d-flex justify-content-between align-items-center mt-3">
                                    <div>
                                        Showing{' '}
                                        {((filters.pageNumber || 1) - 1) *
                                            (filters.pageSize || 10) +
                                            1}{' '}
                                        to{' '}
                                        {Math.min(
                                            (filters.pageNumber || 1) * (filters.pageSize || 10),
                                            totalCount
                                        )}{' '}
                                        of {totalCount} entries
                                    </div>
                                    <div className="btn-group">
                                        <Button
                                            variant="outline-primary"
                                            size="sm"
                                            disabled={(filters.pageNumber || 1) === 1}
                                            onClick={() =>
                                                handlePageChange((filters.pageNumber || 1) - 1)
                                            }
                                        >
                                            Previous
                                        </Button>
                                        <Button
                                            variant="outline-primary"
                                            size="sm"
                                            disabled={
                                                (filters.pageNumber || 1) *
                                                    (filters.pageSize || 10) >=
                                                totalCount
                                            }
                                            onClick={() =>
                                                handlePageChange((filters.pageNumber || 1) + 1)
                                            }
                                        >
                                            Next
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </Card.Body>
            </Card>

            <GeneratePayoutsModal
                show={showGenerateModal}
                onHide={() => setShowGenerateModal(false)}
                onSuccess={handleGenerateSuccess}
            />

            {selectedPayoutId && (
                <PayoutDetailsModal
                    payoutId={selectedPayoutId}
                    onHide={() => setSelectedPayoutId(null)}
                    onMarkCompleted={handleMarkCompleted}
                />
            )}
        </div>
    );
};

export default HospitalPayouts;
