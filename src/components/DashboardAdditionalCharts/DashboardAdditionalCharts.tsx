import React from 'react';
import { ChartJsSingleBar, ChartJsMultiBar } from '@/components/ChartJsLine';

interface DualValuePoint {
    label: string;
    value1: number;
    value2: number;
}

interface ChartPoint {
    label: string;
    value: number;
}

interface DashboardAdditionalChartsProps {
    completedVsCancelledData?: DualValuePoint[];
    peakHoursChartData?: ChartPoint[];
    appointmentTypeChartData?: ChartPoint[];
    trendCardClassName: string;
    cardHeaderClassName: string;
    cardBodyClassName: string;
}

const DashboardAdditionalCharts: React.FC<DashboardAdditionalChartsProps> = ({
    completedVsCancelledData = [],
    peakHoursChartData = [],
    appointmentTypeChartData = [],
    trendCardClassName,
    cardHeaderClassName,
    cardBodyClassName,
}) => {
    const showCompletedVsCancelled = completedVsCancelledData.length > 0;
    const showPeakHours = peakHoursChartData.length > 0;
    const showAppointmentType = appointmentTypeChartData.length > 0;

    if (!showCompletedVsCancelled && !showPeakHours && !showAppointmentType) {
        return null;
    }

    return (
        <>
            {showCompletedVsCancelled && (
                <div className={trendCardClassName}>
                    <div className={cardHeaderClassName}>
                        <h5>Thống kê cuộc hẹn hoàn thành và hủy</h5>
                        <span>Thống kê trạng thái lịch hẹn</span>
                    </div>
                    <div className={cardBodyClassName}>
                        <ChartJsMultiBar
                            data={completedVsCancelledData}
                            color1="#10b981"
                            color2="#ef4444"
                            label1="Hoàn thành/Xác nhận"
                            label2="Hủy/Chờ"
                        />
                    </div>
                </div>
            )}

            {showPeakHours && (
                <div className={trendCardClassName}>
                    <div className={cardHeaderClassName}>
                        <h5>Thống kê theo giờ trong ngày</h5>
                        <span>Giờ cao điểm và giờ ít khách</span>
                    </div>
                    <div className={cardBodyClassName}>
                        <ChartJsSingleBar
                            data={peakHoursChartData}
                            color="#f59e0b"
                            label="Số lịch hẹn"
                        />
                    </div>
                </div>
            )}

            {showAppointmentType && (
                <div className={trendCardClassName}>
                    <div className={cardHeaderClassName}>
                        <h5>Thống kê theo loại khám</h5>
                        <span>So sánh tư vấn trực tiếp vs khám trực tiếp</span>
                    </div>
                    <div className={cardBodyClassName}>
                        <ChartJsSingleBar
                            data={appointmentTypeChartData}
                            color="#06b6d4"
                            label="Số lịch hẹn"
                        />
                    </div>
                </div>
            )}
        </>
    );
};

export default DashboardAdditionalCharts;
