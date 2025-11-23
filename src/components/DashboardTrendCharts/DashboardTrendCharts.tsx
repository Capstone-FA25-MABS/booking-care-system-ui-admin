import React from 'react';
import { ChartJsLine } from '@/components/ChartJsLine';
import { StatisticsPeriod } from '@/types/statistics.types';
import { periodOptions } from '@/utils/dashboard.utils';
import styles from './DashboardTrendCharts.module.scss';

type ChartPoint = { label: string; value: number };

interface DashboardTrendChartsProps {
    period: StatisticsPeriod;
    appointmentTrendPoints: ChartPoint[];
    newPatientPoints: ChartPoint[];
}

export const DashboardTrendCharts: React.FC<DashboardTrendChartsProps> = ({
    period,
    appointmentTrendPoints,
    newPatientPoints,
}) => {
    return (
        <>
            <div className={styles.trendCard}>
                <div className={styles.cardHeader}>
                    <h5>Xu hướng lịch hẹn</h5>
                    <span>
                        Số liệu theo: {periodOptions.find((p) => p.value === period)?.label}
                    </span>
                </div>
                <div className={styles.cardBody}>
                    <ChartJsLine
                        data={appointmentTrendPoints}
                        color="#36B6C5"
                        label="Xu hướng lịch hẹn"
                    />
                </div>
            </div>

            <div className={styles.trendCard}>
                <div className={styles.cardHeader}>
                    <h5>Bệnh nhân mới</h5>
                    <span>Theo dõi số lượt đặt lịch lần đầu</span>
                </div>
                <div className={styles.cardBody}>
                    <ChartJsLine data={newPatientPoints} color="#818CF8" label="Bệnh nhân mới" />
                </div>
            </div>
        </>
    );
};
