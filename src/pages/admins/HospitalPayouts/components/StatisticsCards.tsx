import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { FiDollarSign, FiCheckCircle, FiClock, FiUsers } from 'react-icons/fi';
import type { PayoutStatistics } from '@/types/hospitalPayout.types';

interface StatisticsCardsProps {
    statistics: PayoutStatistics;
}

const StatisticsCards: React.FC<StatisticsCardsProps> = ({ statistics }) => {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount);
    };

    const statsData = [
        {
            title: 'Total Pending',
            value: formatCurrency((statistics.totalPendingAmount ?? 0) as number),
            count: `${statistics.pendingPayoutsCount ?? 0} payouts`,
            icon: FiClock,
            bgColor: 'bg-warning',
            textColor: 'text-warning',
        },
        {
            title: 'Total Completed',
            value: formatCurrency((statistics.totalCompletedAmount ?? 0) as number),
            count: `${statistics.completedPayoutsCount ?? 0} payouts`,
            icon: FiCheckCircle,
            bgColor: 'bg-success',
            textColor: 'text-success',
        },
        {
            title: 'Hospitals with Pending',
            value: `${statistics.hospitalsWithPendingPayouts ?? 0}`,
            count: 'hospitals',
            icon: FiUsers,
            bgColor: 'bg-info',
            textColor: 'text-info',
        },
        {
            title: 'Total Outstanding',
            value: formatCurrency(
                ((statistics.totalPendingAmount ?? 0) as number) +
                    ((statistics.totalCompletedAmount ?? 0) as number)
            ),
            count: `${(statistics.pendingPayoutsCount ?? 0) + (statistics.completedPayoutsCount ?? 0)} total`,
            icon: FiDollarSign,
            bgColor: 'bg-primary',
            textColor: 'text-primary',
        },
    ];

    return (
        <Row className="mb-4">
            {statsData.map((stat, index) => (
                <Col key={index} md={6} lg={3} className="mb-3">
                    <Card className="h-100 shadow-sm">
                        <Card.Body>
                            <div className="d-flex align-items-center mb-2">
                                <div
                                    className={`rounded-circle p-3 ${stat.bgColor} bg-opacity-10 me-3`}
                                >
                                    <stat.icon className={`fs-4 ${stat.textColor}`} />
                                </div>
                                <div className="flex-grow-1">
                                    <h6 className="text-muted mb-0 small">{stat.title}</h6>
                                </div>
                            </div>
                            <h4 className="mb-1 fw-bold">{stat.value}</h4>
                            <small className="text-muted">{stat.count}</small>
                        </Card.Body>
                    </Card>
                </Col>
            ))}
        </Row>
    );
};

export default StatisticsCards;
