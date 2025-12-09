// src/pages/hospitals/Discounts/components/DiscountStatistics.tsx
import React from 'react';
import styles from '../HospitalDiscountManagement.module.scss';

interface DiscountStatisticsProps {
    statistics: {
        total: number;
        active: number;
        expired: number;
        totalUsage: number;
    };
}

const DiscountStatistics: React.FC<DiscountStatisticsProps> = ({ statistics }) => {
    return (
        <div className={styles.statsGrid}>
            <div className={styles.statCard}>
                <div className={styles.statIcon} style={{ background: '#e3f2fd' }}>
                    <i className="fas fa-ticket-alt" style={{ color: '#3498db' }}></i>
                </div>
                <div className={styles.statContent}>
                    <div className={styles.statLabel}>Tổng Mã Giảm Giá</div>
                    <div className={styles.statValue}>{statistics.total}</div>
                </div>
            </div>

            <div className={styles.statCard}>
                <div className={styles.statIcon} style={{ background: '#e8f5e9' }}>
                    <i className="fas fa-check-circle" style={{ color: '#4caf50' }}></i>
                </div>
                <div className={styles.statContent}>
                    <div className={styles.statLabel}>Đang Hoạt Động</div>
                    <div className={styles.statValue}>{statistics.active}</div>
                </div>
            </div>

            <div className={styles.statCard}>
                <div className={styles.statIcon} style={{ background: '#ffebee' }}>
                    <i className="fas fa-times-circle" style={{ color: '#f44336' }}></i>
                </div>
                <div className={styles.statContent}>
                    <div className={styles.statLabel}>Hết Hạn</div>
                    <div className={styles.statValue}>{statistics.expired}</div>
                </div>
            </div>

            <div className={styles.statCard}>
                <div className={styles.statIcon} style={{ background: '#fff3e0' }}>
                    <i className="fas fa-chart-line" style={{ color: '#ff9800' }}></i>
                </div>
                <div className={styles.statContent}>
                    <div className={styles.statLabel}>Lượt Sử Dụng</div>
                    <div className={styles.statValue}>{statistics.totalUsage}</div>
                </div>
            </div>
        </div>
    );
};

export default DiscountStatistics;
