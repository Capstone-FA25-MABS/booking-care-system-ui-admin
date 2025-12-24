import React, { useState, useEffect, useCallback } from 'react';
import { Button, Form, Table, Badge, Row, Col } from 'react-bootstrap';
import { FiRefreshCw, FiFilter } from 'react-icons/fi';
import { useHospitalPayouts, usePayoutStatistics } from '@/hooks/useHospitalPayouts';
import { PayoutStatus } from '@/types/hospitalPayout.types';
import type { PayoutQueryRequest } from '@/types/hospitalPayout.types';
import PayoutDetailsModal from './components/PayoutDetailsModal';
import StatisticsCards from './components/StatisticsCards';
import Calendar from '@/components/Calendar/Calendar';
import ConfirmDialog from '@/components/ConfirmDialog/ConfirmDialog';
import { formatDateToLocalString } from '@/utils/formatDate';

const HospitalPayouts: React.FC = () => {
    const { payouts, totalCount, loading, fetchPayouts, markPayoutCompleted } =
        useHospitalPayouts();
    const { statistics, fetchStatistics } = usePayoutStatistics();

    const [selectedPayoutId, setSelectedPayoutId] = useState<string | null>(null);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [payoutToMarkCompleted, setPayoutToMarkCompleted] = useState<string | null>(null);
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

    const handleMarkCompleted = useCallback((payoutId: string) => {
        setPayoutToMarkCompleted(payoutId);
        setConfirmDialogOpen(true);
    }, []);

    const handleConfirmMarkCompleted = useCallback(async () => {
        if (!payoutToMarkCompleted) return;

        try {
            await markPayoutCompleted(payoutToMarkCompleted);
            fetchStatistics();
        } catch (error) {
            console.error('Failed to mark payout as completed:', error);
        } finally {
            setPayoutToMarkCompleted(null);
        }
    }, [payoutToMarkCompleted, markPayoutCompleted, fetchStatistics]);

    const handleFilterChange = (key: keyof PayoutQueryRequest, value: string | undefined) => {
        setFilters((prev) => ({
            ...prev,
            [key]: value || undefined,
            pageNumber: 1, // Reset to first page on filter change
        }));
    };

    const handleStartDateChange = (date: Date | null) => {
        setStartDate(date);
        const dateStr = date ? formatDateToLocalString(date) : undefined;
        handleFilterChange('periodStartDate', dateStr);
    };

    const handleEndDateChange = (date: Date | null) => {
        setEndDate(date);
        const dateStr = date ? formatDateToLocalString(date) : undefined;
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
            <Badge bg="warning">Chờ thanh toán</Badge>
        ) : (
            <Badge bg="success">Đã thanh toán</Badge>
        );
    };

    return (
        <div className="content">
            <div className="d-flex align-items-sm-center flex-sm-row flex-column gap-2 mb-3 pb-3 border-bottom">
                <div className="flex-grow-1">
                    <h4 className="fw-bold mb-0">Quản lý thanh toán bệnh viện</h4>
                </div>
            </div>

            {statistics && <StatisticsCards statistics={statistics} />}

            <div className="bg-white rounded-3 shadow-sm border mb-3">
                <div className="p-3 border-bottom">
                    <div className="d-flex align-items-center">
                        <FiFilter className="me-2" />
                        <h5 className="mb-0">Bộ lọc</h5>
                    </div>
                </div>
                <div className="p-3">
                    <Row>
                        <Col md={3}>
                            <Form.Group className="mb-3">
                                <Form.Label>Ngày bắt đầu kỳ</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={startDate ? startDate.toLocaleDateString('vi-VN') : ''}
                                    onClick={(e) => setStartDateAnchor(e.currentTarget)}
                                    placeholder="Chọn ngày bắt đầu"
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
                                <Form.Label>Ngày kết thúc kỳ</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={endDate ? endDate.toLocaleDateString('vi-VN') : ''}
                                    onClick={(e) => setEndDateAnchor(e.currentTarget)}
                                    placeholder="Chọn ngày kết thúc"
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
                                <Form.Label>Trạng thái</Form.Label>
                                <Form.Select
                                    value={filters.status || ''}
                                    onChange={(e) => handleFilterChange('status', e.target.value)}
                                >
                                    <option value="">Tất cả</option>
                                    <option value={PayoutStatus.PENDING}>Chờ thanh toán</option>
                                    <option value={PayoutStatus.COMPLETED}>Đã thanh toán</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group className="mb-3">
                                <Form.Label>Tên bệnh viện</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Tìm kiếm theo tên bệnh viện"
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
                        Làm mới
                    </Button>
                </div>
            </div>

            <div className="table-responsive">
                <div className="bg-white rounded-3 shadow-sm border">
                    {loading ? (
                        <div className="text-center p-5">
                            <output className="spinner-border text-primary">
                                <span className="visually-hidden">Đang tải...</span>
                            </output>
                        </div>
                    ) : (
                        <>
                            <Table className="table table-centered mb-0" responsive hover>
                                <thead className="table-light">
                                    <tr>
                                        <th>Bệnh viện</th>
                                        <th>Kỳ thanh toán</th>
                                        <th>Số tiền</th>
                                        <th>Số lượt khám</th>
                                        <th>Trạng thái</th>
                                        <th>Ngày tạo</th>
                                        <th>Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {!payouts || payouts.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="text-center py-4">
                                                Không tìm thấy thanh toán nào
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
                                                        Xem chi tiết
                                                    </Button>
                                                    {payout.status === PayoutStatus.PENDING && (
                                                        <Button
                                                            variant="success"
                                                            size="sm"
                                                            onClick={() =>
                                                                handleMarkCompleted(payout.id)
                                                            }
                                                        >
                                                            Đánh dấu đã thanh toán
                                                        </Button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </Table>

                            {totalCount > (filters.pageSize || 10) && (
                                <div className="d-flex justify-content-between align-items-center p-3 border-top">
                                    <div>
                                        Hiển thị{' '}
                                        {((filters.pageNumber || 1) - 1) *
                                            (filters.pageSize || 10) +
                                            1}{' '}
                                        đến{' '}
                                        {Math.min(
                                            (filters.pageNumber || 1) * (filters.pageSize || 10),
                                            totalCount
                                        )}{' '}
                                        trong tổng số {totalCount} bản ghi
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
                                            Trước
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
                                            Sau
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {selectedPayoutId && (
                <PayoutDetailsModal
                    payoutId={selectedPayoutId}
                    onHide={() => setSelectedPayoutId(null)}
                    onMarkCompleted={handleMarkCompleted}
                />
            )}

            <ConfirmDialog
                isOpen={confirmDialogOpen}
                onClose={() => {
                    setConfirmDialogOpen(false);
                    setPayoutToMarkCompleted(null);
                }}
                onConfirm={handleConfirmMarkCompleted}
                title="Xác nhận hoàn tất thanh toán"
                message="Bạn có chắc chắn muốn đánh dấu thanh toán này là đã hoàn tất? Hành động này xác nhận rằng bạn đã chuyển tiền cho bệnh viện."
                confirmText="Xác nhận"
                cancelText="Hủy"
                type="warning"
                icon="fa-solid fa-check-circle"
            />
        </div>
    );
};

export default HospitalPayouts;
