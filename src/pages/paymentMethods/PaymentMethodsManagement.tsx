import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Spinner, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import PaymentMethodService from '@/services/paymentMethod.service';
import type { PaymentMethod } from '@/types/paymentMethod.types';
import StatusBadge from '@/components/StatusBadge';
import TableSkeleton from '@/components/TableSkeleton';
import { paymentMethodTableColumns } from '@/components/TableSkeleton/skeletonConfigs';

const PaymentMethodsManagement: React.FC = () => {
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [loading, setLoading] = useState(true);
    const [togglingId, setTogglingId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Fetch payment methods on component mount
    useEffect(() => {
        fetchPaymentMethods();
    }, []);

    const fetchPaymentMethods = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await PaymentMethodService.getAllPaymentMethods();
            if (response.success) {
                setPaymentMethods(response.data);
            } else {
                setError('Không thể tải danh sách phương thức thanh toán');
            }
        } catch (error) {
            console.error('Error fetching payment methods:', error);
            setError('Có lỗi xảy ra khi tải danh sách phương thức thanh toán');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (paymentMethod: PaymentMethod) => {
        try {
            setTogglingId(paymentMethod.id);
            const response = await PaymentMethodService.togglePaymentMethodStatus({
                id: paymentMethod.id,
            });

            if (response.success) {
                // Update the payment method in the list
                setPaymentMethods((prev) =>
                    prev.map((pm) =>
                        pm.id === paymentMethod.id ? { ...pm, status: response.data.status } : pm
                    )
                );

                const statusText = response.data.status === 'ACTIVE' ? 'kích hoạt' : 'vô hiệu hóa';
                toast.success(
                    `Đã ${statusText} phương thức thanh toán ${paymentMethod.description}`
                );
            } else {
                toast.error('Không thể thay đổi trạng thái phương thức thanh toán');
            }
        } catch (error) {
            console.error('Error toggling payment method status:', error);
            toast.error('Có lỗi xảy ra khi thay đổi trạng thái');
        } finally {
            setTogglingId(null);
        }
    };

    const getStatusVariant = (status: string) => {
        return status === 'ACTIVE' ? 'success' : 'secondary';
    };

    const getStatusText = (status: string) => {
        return status === 'ACTIVE' ? 'Hoạt động' : 'Không hoạt động';
    };

    const getToggleButtonText = (status: string) => {
        return status === 'ACTIVE' ? 'Tắt' : 'Bật';
    };

    const getToggleButtonVariant = (status: string) => {
        return status === 'ACTIVE' ? 'outline-danger' : 'outline-success';
    };

    if (loading) {
        return (
            <div className="container-fluid">
                <div className="row">
                    <div className="col-12">
                        <Card>
                            <Card.Header>
                                <h5 className="card-title mb-0">
                                    Danh sách phương thức thanh toán
                                </h5>
                            </Card.Header>
                            <Card.Body>
                                <div className="table-responsive">
                                    <Table className="table table-centered mb-0">
                                        <thead className="table-light">
                                            <tr>
                                                <th>STT</th>
                                                <th>Tên</th>
                                                <th>Mô tả</th>
                                                <th>Hình ảnh</th>
                                                <th>Trạng thái</th>
                                                <th>Thao tác</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <TableSkeleton
                                                rows={5}
                                                columns={paymentMethodTableColumns}
                                            />
                                        </tbody>
                                    </Table>
                                </div>
                            </Card.Body>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container-fluid">
                <Alert variant="danger" className="mt-3">
                    <Alert.Heading>Lỗi!</Alert.Heading>
                    <p>{error}</p>
                    <Button variant="outline-danger" onClick={fetchPaymentMethods}>
                        Thử lại
                    </Button>
                </Alert>
            </div>
        );
    }

    return (
        <div className="container-fluid">
            <div className="row">
                <div className="col-12">
                    <Card>
                        <Card.Header>
                            <h5 className="card-title mb-0">Danh sách phương thức thanh toán</h5>
                        </Card.Header>
                        <Card.Body>
                            <div className="table-responsive">
                                <Table className="table table-centered mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th>STT</th>
                                            <th>Tên</th>
                                            <th>Mô tả</th>
                                            <th>Hình ảnh</th>
                                            <th>Trạng thái</th>
                                            <th>Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paymentMethods.map((paymentMethod, index) => (
                                            <tr key={paymentMethod.id}>
                                                <td>{index + 1}</td>
                                                <td>
                                                    <span className="fw-semibold">
                                                        {paymentMethod.name}
                                                    </span>
                                                </td>
                                                <td>{paymentMethod.description}</td>
                                                <td>
                                                    {paymentMethod.imageUrl ? (
                                                        <img
                                                            src={paymentMethod.imageUrl}
                                                            alt={paymentMethod.name}
                                                            style={{
                                                                width: '40px',
                                                                height: '40px',
                                                                objectFit: 'contain',
                                                            }}
                                                            className="rounded"
                                                        />
                                                    ) : (
                                                        <div
                                                            className="bg-light rounded d-flex align-items-center justify-content-center"
                                                            style={{
                                                                width: '40px',
                                                                height: '40px',
                                                            }}
                                                        >
                                                            <i className="ti ti-credit-card text-muted"></i>
                                                        </div>
                                                    )}
                                                </td>
                                                <td>
                                                    <StatusBadge
                                                        status={paymentMethod.status}
                                                        variant={getStatusVariant(
                                                            paymentMethod.status
                                                        )}
                                                        customText={getStatusText(
                                                            paymentMethod.status
                                                        )}
                                                    />
                                                </td>
                                                <td>
                                                    <Button
                                                        variant={getToggleButtonVariant(
                                                            paymentMethod.status
                                                        )}
                                                        size="sm"
                                                        onClick={() =>
                                                            handleToggleStatus(paymentMethod)
                                                        }
                                                        disabled={togglingId === paymentMethod.id}
                                                    >
                                                        {togglingId === paymentMethod.id ? (
                                                            <Spinner size="sm" animation="border" />
                                                        ) : (
                                                            <>
                                                                <i
                                                                    className={`ti ti-${paymentMethod.status === 'ACTIVE' ? 'toggle-right' : 'toggle-left'}`}
                                                                ></i>{' '}
                                                                {getToggleButtonText(
                                                                    paymentMethod.status
                                                                )}
                                                            </>
                                                        )}
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>
                        </Card.Body>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default PaymentMethodsManagement;
