import React from 'react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { vi } from 'date-fns/locale';
import { format } from 'date-fns';

import { RevenueFilterButtons, RevenueViewPeriod } from '@/components/RevenueFilterButtons';
import { ChartJsMultiBar, ChartJsTripleBar, ChartJsSingleBar } from '@/components/ChartJsLine';
import { ChartJsPie } from '@/components/ChartJsLine/ChartJsPie';
import { ChartJsArea } from '@/components/ChartJsLine/ChartJsArea';
import { ChartJsLine } from '@/components/ChartJsLine/ChartJsLine';
import { numberFormatter, formatDateDisplay, periodOptions } from '@/utils/dashboard.utils';
import { ChartPoint } from '@/utils/dashboardChartData';
import { AiInsightResponse } from '@/services/aiService';

import pageStyles from './Dashboard.module.scss';
import styles from './DashboardAIInsight.module.scss';

// Day of week formatter - hiển thị đầy đủ "Thứ 2" - "Chủ nhật"
const dayOfWeekFormatter = (day: Date | string): string => {
    if (day instanceof Date) {
        const dayIndex = day.getDay();
        const dayNames = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
        return dayNames[dayIndex] || format(day, 'EEEE', { locale: vi });
    }
    const dayStr = String(day);
    const dayMap: Record<string, string> = {
        Mon: 'Thứ 2',
        Tue: 'Thứ 3',
        Wed: 'Thứ 4',
        Thu: 'Thứ 5',
        Fri: 'Thứ 6',
        Sat: 'Thứ 7',
        Sun: 'Chủ nhật',
    };
    return dayMap[dayStr] || dayStr;
};

interface DashboardAIInsightProps {
    aiDateRange: { from: Date | null; to: Date | null };
    setAiDateRange: React.Dispatch<React.SetStateAction<{ from: Date | null; to: Date | null }>>;
    aiInsights: AiInsightResponse | null;
    aiError: string | null;
    isLoadingAi: boolean;
    aiLoadingStep: number;
    loadAiInsights: () => Promise<void>;

    // Trend & chart data
    period: any;
    appointmentTrendPoints: ChartPoint[];
    newPatientTrendPoints: ChartPoint[];
    completedVsCancelledData: any[];
    peakHoursChartData: ChartPoint[];
    appointmentTypeChartData: ChartPoint[];
    subscriptionChartData: {
        label: string;
        value1: number;
        value2: number;
        value3: number;
    }[];

    revenueChartData: { label: string; value: number }[];
    revenuePeriod: RevenueViewPeriod;
    setRevenuePeriod: React.Dispatch<React.SetStateAction<RevenueViewPeriod>>;
    isLoadingRevenueChart: boolean;

    predictions: {
        nextWeekAppointments: number;
        nextMonthAppointments: number;
        predictedCancellationRate: number;
        predictedRevenue: number;
        specialtyTrend: string;
        specialtyGrowth: string;
    } | null;
    specialtyChartData: { label: string; value: number }[];
    statusChartData: { label: string; value: number }[];
}

const DashboardAIInsight: React.FC<DashboardAIInsightProps> = ({
    aiDateRange,
    setAiDateRange,
    aiInsights,
    aiError,
    isLoadingAi,
    aiLoadingStep,
    loadAiInsights,
    period,
    appointmentTrendPoints,
    newPatientTrendPoints,
    completedVsCancelledData,
    peakHoursChartData,
    appointmentTypeChartData,
    subscriptionChartData,
    revenueChartData,
    revenuePeriod,
    setRevenuePeriod,
    isLoadingRevenueChart,
    predictions,
    specialtyChartData,
    statusChartData,
}) => {
    return (
        <>
            <div className={`content ${pageStyles.trendCard}`}>
                <div className={pageStyles.cardHeader}>
                    <h5>AI phân tích hệ thống, dự đoán tương lai</h5>
                </div>

                {/* Date Range Picker - Improved Design */}
                <div className={styles.aiDateRangePicker}>
                    <div className={styles.dateRangeHeader}>
                        <span>Chọn khoảng thời gian phân tích</span>
                    </div>
                    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={vi}>
                        <div className={styles.dateRangeRow}>
                            <div className={styles.dateRangeGroup}>
                                <label htmlFor="aiFromDate" className={styles.dateLabel}>
                                    Từ ngày
                                </label>
                                <DatePicker
                                    value={aiDateRange.from}
                                    onChange={(newValue) =>
                                        setAiDateRange((prev) => ({
                                            ...prev,
                                            from: newValue,
                                        }))
                                    }
                                    disabled={isLoadingAi}
                                    maxDate={aiDateRange.to || undefined}
                                    format="dd/MM/yyyy"
                                    dayOfWeekFormatter={dayOfWeekFormatter}
                                    slotProps={{
                                        textField: {
                                            id: 'aiFromDate',
                                            size: 'small',
                                            placeholder: 'dd/mm/yyyy',
                                            className: styles.muiDateInput,
                                        },
                                        day: {
                                            sx: {
                                                '&.Mui-selected': {
                                                    backgroundColor: '#2E37A4 !important',
                                                    color: 'white',
                                                    '&:hover': {
                                                        backgroundColor: '#252d8a !important',
                                                    },
                                                },
                                                '&.MuiPickersDay-today': {
                                                    border: '1px solid #2E37A4',
                                                },
                                            },
                                        },
                                        popper: {
                                            sx: {
                                                zIndex: 1300,
                                                '& .MuiPaper-root': {
                                                    borderRadius: '12px',
                                                    boxShadow: '0 10px 40px rgba(15, 23, 42, 0.15)',
                                                    border: '1px solid #e2e8f0',
                                                },
                                            },
                                        },
                                        calendarHeader: {
                                            sx: {
                                                padding: '16px',
                                                '& .MuiPickersCalendarHeader-label': {
                                                    fontWeight: 600,
                                                    fontSize: '1rem',
                                                    color: '#1e293b',
                                                },
                                                '& .MuiIconButton-root': {
                                                    color: '#2E37A4',
                                                    '&:hover': {
                                                        backgroundColor: 'rgba(46, 55, 164, 0.08)',
                                                    },
                                                },
                                            },
                                        },
                                    }}
                                    sx={{
                                        width: '100%',
                                        '& .MuiInputBase-root': {
                                            height: '38px',
                                            fontSize: '0.95rem',
                                            borderRadius: '10px',
                                            border: '1.5px solid #cbd5e1',
                                            background: 'white',
                                            boxShadow: '0 1px 3px rgba(15, 23, 42, 0.05)',
                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                            '&:hover': {
                                                borderColor: '#94a3b8',
                                                boxShadow: '0 2px 6px rgba(15, 23, 42, 0.08)',
                                            },
                                            '&.Mui-focused': {
                                                borderColor: '#2E37A4',
                                                boxShadow:
                                                    '0 0 0 4px rgba(46, 55, 164, 0.12), 0 4px 12px rgba(46, 55, 164, 0.15)',
                                            },
                                        },
                                        '& .MuiInputBase-input': {
                                            padding: '11px 14px',
                                            fontWeight: 500,
                                            color: '#1e293b',
                                            cursor: 'pointer',
                                        },
                                        '& .MuiOutlinedInput-notchedOutline': {
                                            border: 'none',
                                        },
                                        '& .MuiInputAdornment-root': {
                                            marginRight: '8px',
                                            '& .MuiIconButton-root': {
                                                color: '#000000',
                                                padding: '4px',
                                                '&:hover': {
                                                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                                                },
                                            },
                                        },
                                    }}
                                />
                            </div>
                            <div className={styles.dateRangeGroup}>
                                <label htmlFor="aiToDate" className={styles.dateLabel}>
                                    Đến ngày
                                </label>
                                <DatePicker
                                    value={aiDateRange.to}
                                    onChange={(newValue) =>
                                        setAiDateRange((prev) => ({
                                            ...prev,
                                            to: newValue,
                                        }))
                                    }
                                    disabled={isLoadingAi}
                                    minDate={aiDateRange.from || undefined}
                                    format="dd/MM/yyyy"
                                    dayOfWeekFormatter={dayOfWeekFormatter}
                                    slotProps={{
                                        textField: {
                                            id: 'aiToDate',
                                            size: 'small',
                                            placeholder: 'dd/mm/yyyy',
                                            className: styles.muiDateInput,
                                        },
                                        day: {
                                            sx: {
                                                '&.Mui-selected': {
                                                    backgroundColor: '#2E37A4 !important',
                                                    color: 'white',
                                                    '&:hover': {
                                                        backgroundColor: '#252d8a !important',
                                                    },
                                                },
                                                '&.MuiPickersDay-today': {
                                                    border: '1px solid #2E37A4',
                                                },
                                            },
                                        },
                                        popper: {
                                            sx: {
                                                zIndex: 1300,
                                                '& .MuiPaper-root': {
                                                    borderRadius: '12px',
                                                    boxShadow: '0 10px 40px rgba(15, 23, 42, 0.15)',
                                                    border: '1px solid #e2e8f0',
                                                },
                                            },
                                        },
                                        calendarHeader: {
                                            sx: {
                                                padding: '16px',
                                                '& .MuiPickersCalendarHeader-label': {
                                                    fontWeight: 600,
                                                    fontSize: '1rem',
                                                    color: '#1e293b',
                                                },
                                                '& .MuiIconButton-root': {
                                                    color: '#2E37A4',
                                                    '&:hover': {
                                                        backgroundColor: 'rgba(46, 55, 164, 0.08)',
                                                    },
                                                },
                                            },
                                        },
                                    }}
                                    sx={{
                                        width: '100%',
                                        '& .MuiInputBase-root': {
                                            height: '38px',
                                            fontSize: '0.95rem',
                                            borderRadius: '10px',
                                            border: '1.5px solid #cbd5e1',
                                            background: 'white',
                                            boxShadow: '0 1px 3px rgba(15, 23, 42, 0.05)',
                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                            '&:hover': {
                                                borderColor: '#94a3b8',
                                                boxShadow: '0 2px 6px rgba(15, 23, 42, 0.08)',
                                            },
                                            '&.Mui-focused': {
                                                borderColor: '#2E37A4',
                                                boxShadow:
                                                    '0 0 0 4px rgba(46, 55, 164, 0.12), 0 4px 12px rgba(46, 55, 164, 0.15)',
                                            },
                                        },
                                        '& .MuiInputBase-input': {
                                            padding: '11px 14px',
                                            fontWeight: 500,
                                            color: '#1e293b',
                                            cursor: 'pointer',
                                        },
                                        '& .MuiOutlinedInput-notchedOutline': {
                                            border: 'none',
                                        },
                                        '& .MuiInputAdornment-root': {
                                            marginRight: '8px',
                                            '& .MuiIconButton-root': {
                                                color: '#000000',
                                                padding: '4px',
                                                '&:hover': {
                                                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                                                },
                                            },
                                        },
                                    }}
                                />
                            </div>
                            <div className={styles.dateRangeButton}>
                                <button
                                    className={`btn btn-primary ${styles.aiGenerateBtn}`}
                                    onClick={loadAiInsights}
                                    disabled={isLoadingAi}
                                >
                                    <i className="ti ti-sparkles"></i>
                                    <span>{isLoadingAi ? 'Đang tạo...' : 'Tạo AI Insights'}</span>
                                </button>
                            </div>
                        </div>
                    </LocalizationProvider>
                    <div className={styles.dateRangeInfo}>
                        <i className="ti ti-info-circle"></i>
                        <span>
                            {aiDateRange.from && aiDateRange.to
                                ? `Phân tích từ ${formatDateDisplay(aiDateRange.from)} đến ${formatDateDisplay(aiDateRange.to)}`
                                : 'Để trống để sử dụng mặc định (tuần gần nhất)'}
                        </span>
                    </div>
                </div>

                {aiError && (
                    <div className={`${styles.aiError} alert alert-danger`} role="alert">
                        <i className="ti ti-alert-circle me-2"></i>
                        {aiError}
                    </div>
                )}

                <div className={styles.aiBody}>
                    {isLoadingAi ? (
                        <div className={styles.aiLoadingState}>
                            <div className={styles.aiLoadingSpinner}>
                                <div className={styles.spinner}></div>
                            </div>
                            <div className={styles.aiLoadingContent}>
                                <h6>Đang tạo AI Insights...</h6>
                                <p className={styles.aiLoadingDescription}>
                                    Đang phân tích dữ liệu và tạo báo cáo. Vui lòng đợi trong giây
                                    lát.
                                </p>
                                <div className={styles.loadingSteps}>
                                    <div
                                        className={`${styles.loadingStep} ${aiLoadingStep >= 1 ? styles.loadingStepActive : ''}`}
                                    >
                                        <div className={styles.loadingStepIcon}>
                                            {aiLoadingStep > 1 ? (
                                                <i className="ti ti-check"></i>
                                            ) : aiLoadingStep === 1 ? (
                                                <div className={styles.loadingStepSpinner}></div>
                                            ) : (
                                                <div className={styles.loadingStepDot}></div>
                                            )}
                                        </div>
                                        <span>Bước 1: Thu thập dữ liệu</span>
                                    </div>
                                    <div
                                        className={`${styles.loadingStep} ${aiLoadingStep >= 2 ? styles.loadingStepActive : ''}`}
                                    >
                                        <div className={styles.loadingStepIcon}>
                                            {aiLoadingStep > 2 ? (
                                                <i className="ti ti-check"></i>
                                            ) : aiLoadingStep === 2 ? (
                                                <div className={styles.loadingStepSpinner}></div>
                                            ) : (
                                                <div className={styles.loadingStepDot}></div>
                                            )}
                                        </div>
                                        <span>Bước 2: Phân tích AI</span>
                                    </div>
                                    <div
                                        className={`${styles.loadingStep} ${aiLoadingStep >= 3 ? styles.loadingStepActive : ''}`}
                                    >
                                        <div className={styles.loadingStepIcon}>
                                            {aiLoadingStep >= 3 ? (
                                                aiLoadingStep > 3 ? (
                                                    <i className="ti ti-check"></i>
                                                ) : (
                                                    <div
                                                        className={styles.loadingStepSpinner}
                                                    ></div>
                                                )
                                            ) : (
                                                <div className={styles.loadingStepDot}></div>
                                            )}
                                        </div>
                                        <span>Bước 3: Tạo báo cáo</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : !aiInsights ? (
                        <div className={styles.aiEmptyState}></div>
                    ) : (
                        <>
                            <div className={styles.aiSummaryRow}>
                                <div className={styles.aiBadge}>
                                    <span className={styles.aiBadgeLabel}>Đang lọc từ:</span>
                                    <span className={styles.aiBadgeDateRange}>
                                        {aiInsights.periodStart
                                            ? new Date(aiInsights.periodStart)
                                                  .toLocaleDateString('vi-VN', {
                                                      day: '2-digit',
                                                      month: '2-digit',
                                                      year: 'numeric',
                                                  })
                                                  .replace(/\//g, '-')
                                            : '--'}
                                        {' đến '}
                                        {aiInsights.periodEnd
                                            ? new Date(aiInsights.periodEnd)
                                                  .toLocaleDateString('vi-VN', {
                                                      day: '2-digit',
                                                      month: '2-digit',
                                                      year: 'numeric',
                                                  })
                                                  .replace(/\//g, '-')
                                            : '--'}
                                    </span>
                                </div>
                                <span className={styles.aiMeta}>
                                    <i className="ti ti-clock me-1"></i>
                                    <span className={styles.aiMetaLabel}>Cập nhật:</span>
                                    <span className={styles.aiMetaTime}>
                                        {new Date(aiInsights.generatedAt).toLocaleString('vi-VN')}
                                    </span>
                                </span>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Kết luận phân tích và Kết luận dự đoán - 2 Card - Style giống alertCard - Cả hai đều màu xanh */}
            {aiInsights && (aiInsights.analysisConclusion || aiInsights.predictionConclusion) && (
                <div className={styles.aiConclusionCardsWrapper}>
                    {/* Card 1: Kết luận phân tích hệ thống */}
                    {aiInsights.analysisConclusion && (
                        <div className={`${styles.aiConclusionCard} ${styles.alertInfo}`}>
                            <div className={styles.alertHeader}>
                                <div className={styles.alertIcon}>
                                    <i className="ti ti-chart-line"></i>
                                </div>
                                <div className={styles.alertTitleSection}>
                                    <h6 className={styles.alertTitle}>
                                        Kết luận phân tích hệ thống
                                    </h6>
                                    <span className={styles.alertMetric}>Phân tích hệ thống</span>
                                </div>
                            </div>
                            <p className={styles.alertMessage}>{aiInsights.analysisConclusion}</p>
                        </div>
                    )}

                    {/* Card 2: Kết luận dự đoán tương lai */}
                    {aiInsights.predictionConclusion && (
                        <div className={`${styles.aiConclusionCard} ${styles.alertInfo}`}>
                            <div className={styles.alertHeader}>
                                <div className={styles.alertIcon}>
                                    <i className="ti ti-trending-up"></i>
                                </div>
                                <div className={styles.alertTitleSection}>
                                    <h6 className={styles.alertTitle}>
                                        Kết luận dự đoán tương lai
                                    </h6>
                                    <span className={styles.alertMetric}>Dự đoán tương lai</span>
                                </div>
                            </div>
                            <p className={styles.alertMessage}>{aiInsights.predictionConclusion}</p>
                        </div>
                    )}
                </div>
            )}

            {/* Alerts, Root Cause, Predictions - Nằm trên 1 hàng */}
            {aiInsights && (
                <div className={styles.aiInsightsRow}>
                    {/* Alerts Section */}
                    {aiInsights.alerts && aiInsights.alerts.length > 0 && (
                        <div className={pageStyles.trendCard}>
                            <div className={pageStyles.cardHeader}>
                                <h5>
                                    <i className="ti ti-alert-circle me-2"></i>
                                    Cảnh báo & Thông báo
                                </h5>
                                <span>Phát hiện các chỉ số bất thường cần chú ý</span>
                            </div>
                            <div className={pageStyles.cardBody}>
                                <div className={styles.alertsGrid}>
                                    {aiInsights.alerts.map((alert: any, index: number) => {
                                        // Tất cả alerts đều màu đỏ (alertCritical)
                                        const alertTypeClass = styles.alertCritical;

                                        const severityIconMap: Record<string, string> = {
                                            high: 'ti ti-alert-triangle',
                                            medium: 'ti ti-alert-triangle',
                                            low: 'ti ti-alert-triangle',
                                        };
                                        const severityIcon =
                                            severityIconMap[alert.severity] ||
                                            'ti ti-alert-triangle';

                                        return (
                                            <div
                                                key={index}
                                                className={`${styles.alertCard} ${alertTypeClass}`}
                                            >
                                                <div className={styles.alertHeader}>
                                                    <div className={styles.alertIcon}>
                                                        <i className={severityIcon}></i>
                                                    </div>
                                                    <div className={styles.alertTitleSection}>
                                                        <h6 className={styles.alertTitle}>
                                                            {alert.title}
                                                        </h6>
                                                        {alert.metric && (
                                                            <span className={styles.alertMetric}>
                                                                {alert.metric}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span
                                                        className={styles.alertBadge}
                                                        data-severity={alert.severity}
                                                    >
                                                        {alert.severity === 'high'
                                                            ? 'Cao'
                                                            : alert.severity === 'medium'
                                                              ? 'Trung bình'
                                                              : 'Thấp'}
                                                    </span>
                                                </div>
                                                <p className={styles.alertMessage}>
                                                    {alert.message}
                                                </p>
                                                {(alert.currentValue !== undefined ||
                                                    alert.thresholdValue !== undefined) && (
                                                    <div className={styles.alertValues}>
                                                        {alert.currentValue !== undefined && (
                                                            <span>
                                                                Giá trị hiện tại:{' '}
                                                                <strong>
                                                                    {alert.currentValue}
                                                                </strong>
                                                            </span>
                                                        )}
                                                        {alert.thresholdValue !== undefined && (
                                                            <span>
                                                                Ngưỡng:{' '}
                                                                <strong>
                                                                    {alert.thresholdValue}
                                                                </strong>
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                                {alert.recommendedAction && (
                                                    <div className={styles.alertAction}>
                                                        <i className="ti ti-lightbulb me-2"></i>
                                                        <strong>Khuyến nghị:</strong>{' '}
                                                        {alert.recommendedAction}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Root Cause Analysis Section */}
                    {aiInsights.rootCauseAnalyses && aiInsights.rootCauseAnalyses.length > 0 && (
                        <div className={pageStyles.trendCard}>
                            <div className={pageStyles.cardHeader}>
                                <h5>
                                    <i className="ti ti-search me-2"></i>
                                    Phân tích nguyên nhân gốc rễ
                                </h5>
                                <span>Phân tích sâu các chỉ số bất thường để tìm nguyên nhân</span>
                            </div>
                            <div className={pageStyles.cardBody}>
                                <div className={styles.alertsGrid}>
                                    {aiInsights.rootCauseAnalyses.map((rca: any, index: number) => (
                                        <div
                                            key={index}
                                            className={`${styles.alertCard} ${styles.alertWarning}`}
                                        >
                                            <div className={styles.alertHeader}>
                                                <div className={styles.alertIcon}>
                                                    <i className="ti ti-chart-line"></i>
                                                </div>
                                                <div className={styles.alertTitleSection}>
                                                    <h6 className={styles.alertTitle}>
                                                        {rca.metric}
                                                    </h6>
                                                    <span className={styles.alertMetric}>
                                                        Phân tích nguyên nhân
                                                    </span>
                                                </div>
                                                <span
                                                    className={styles.alertBadge}
                                                    data-severity={
                                                        rca.impactScore >= 70
                                                            ? 'high'
                                                            : rca.impactScore >= 40
                                                              ? 'medium'
                                                              : 'low'
                                                    }
                                                >
                                                    Tác động: {rca.impactScore.toFixed(0)}%
                                                </span>
                                            </div>
                                            <p className={styles.alertMessage}>
                                                <strong>Vấn đề:</strong> {rca.issue}
                                            </p>
                                            {rca.potentialCauses &&
                                                rca.potentialCauses.length > 0 && (
                                                    <div className={styles.alertValues}>
                                                        <strong>Nguyên nhân tiềm năng:</strong>
                                                        <ul
                                                            style={{
                                                                margin: '0.5rem 0 0 0',
                                                                paddingLeft: '1.25rem',
                                                            }}
                                                        >
                                                            {rca.potentialCauses.map(
                                                                (
                                                                    cause: string,
                                                                    causeIndex: number
                                                                ) => (
                                                                    <li
                                                                        key={causeIndex}
                                                                        style={{
                                                                            marginBottom: '0.5rem',
                                                                        }}
                                                                    >
                                                                        {cause}
                                                                    </li>
                                                                )
                                                            )}
                                                        </ul>
                                                    </div>
                                                )}
                                            {rca.mostLikelyCause && (
                                                <div className={styles.alertAction}>
                                                    <i className="ti ti-target me-2"></i>
                                                    <strong>
                                                        Nguyên nhân có khả năng cao nhất:
                                                    </strong>{' '}
                                                    {rca.mostLikelyCause}
                                                </div>
                                            )}
                                            {rca.analysis && (
                                                <div className={styles.alertAction}>
                                                    <i className="ti ti-file-analytics me-2"></i>
                                                    <strong>Phân tích chi tiết:</strong>{' '}
                                                    {rca.analysis}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Enhanced Predictions Section - Hiển thị như text card giống alert card */}
                    {aiInsights.predictions && aiInsights.predictions.length > 0 && (
                        <div className={pageStyles.trendCard}>
                            <div className={pageStyles.cardHeader}>
                                <h5>
                                    <i className="ti ti-chart-line me-2"></i>
                                    Dự đoán tương lai chi tiết
                                </h5>
                                <span>Dự báo dựa trên xu hướng và mô hình phân tích</span>
                            </div>
                            <div className={pageStyles.cardBody}>
                                <div className={styles.alertsGrid}>
                                    {aiInsights.predictions.map(
                                        (prediction: any, index: number) => {
                                            const periodLabelMap: Record<string, string> = {
                                                next_week: 'Tuần tới',
                                                next_month: 'Tháng tới',
                                                next_quarter: 'Quý tới',
                                            };
                                            const periodLabel =
                                                periodLabelMap[prediction.period] ||
                                                prediction.period;

                                            // Tất cả predictions đều màu xanh lá cây (alertSuccess)
                                            const alertTypeClass = styles.alertSuccess;

                                            // Severity vẫn giữ nguyên từ confidence
                                            const severityMap: Record<string, string> = {
                                                high: 'low',
                                                medium: 'medium',
                                                low: 'high',
                                            };
                                            const severity =
                                                severityMap[prediction.confidence] || 'medium';

                                            const severityIconMap: Record<string, string> = {
                                                high: 'ti ti-circle-check',
                                                medium: 'ti ti-circle-check',
                                                low: 'ti ti-circle-check',
                                            };
                                            const severityIcon =
                                                severityIconMap[severity] || 'ti ti-check-circle';

                                            // Tạo message từ prediction data
                                            const predictionMessage = `Dự đoán cho ${periodLabel}: Lượt đặt dự đoán là ${numberFormatter.format(prediction.predictedAppointments)}${
                                                prediction.predictedGrowthPercent !== 0
                                                    ? ` (${prediction.predictedGrowthPercent > 0 ? '+' : ''}${prediction.predictedGrowthPercent.toFixed(1)}% so với kỳ hiện tại)`
                                                    : ''
                                            }. Tỉ lệ hủy dự đoán: ${prediction.predictedCancellationRate.toFixed(
                                                1
                                            )}%.${prediction.topSpecialtyPrediction ? ` Chuyên khoa phổ biến dự kiến: ${prediction.topSpecialtyPrediction}.` : ''}${
                                                prediction.reasoning
                                                    ? ` ${prediction.reasoning}`
                                                    : ''
                                            }`;

                                            return (
                                                <div
                                                    key={index}
                                                    className={`${styles.alertCard} ${alertTypeClass}`}
                                                >
                                                    <div className={styles.alertHeader}>
                                                        <div className={styles.alertIcon}>
                                                            <i className={severityIcon}></i>
                                                        </div>
                                                        <div className={styles.alertTitleSection}>
                                                            <h6 className={styles.alertTitle}>
                                                                Dự đoán {periodLabel}
                                                            </h6>
                                                            <span className={styles.alertMetric}>
                                                                Dự báo tương lai
                                                            </span>
                                                        </div>
                                                        <span
                                                            className={styles.alertBadge}
                                                            data-severity={severity}
                                                        >
                                                            {severity === 'high'
                                                                ? 'Cao'
                                                                : severity === 'medium'
                                                                  ? 'Trung bình'
                                                                  : 'Thấp'}
                                                        </span>
                                                    </div>
                                                    <p className={styles.alertMessage}>
                                                        {predictionMessage}
                                                    </p>
                                                    {(prediction.predictedAppointments !==
                                                        undefined ||
                                                        prediction.predictedCancellationRate !==
                                                            undefined) && (
                                                        <div className={styles.alertValues}>
                                                            {prediction.predictedAppointments !==
                                                                undefined && (
                                                                <span>
                                                                    Lượt đặt dự đoán:{' '}
                                                                    <strong>
                                                                        {numberFormatter.format(
                                                                            prediction.predictedAppointments
                                                                        )}
                                                                    </strong>
                                                                </span>
                                                            )}
                                                            {prediction.predictedCancellationRate !==
                                                                undefined && (
                                                                <span>
                                                                    Tỉ lệ hủy dự đoán:{' '}
                                                                    <strong>
                                                                        {prediction.predictedCancellationRate.toFixed(
                                                                            1
                                                                        )}
                                                                        %
                                                                    </strong>
                                                                </span>
                                                            )}
                                                            {prediction.predictedGrowthPercent !==
                                                                undefined &&
                                                                prediction.predictedGrowthPercent !==
                                                                    0 && (
                                                                    <span>
                                                                        Thay đổi:{' '}
                                                                        <strong>
                                                                            {prediction.predictedGrowthPercent >
                                                                            0
                                                                                ? '+'
                                                                                : ''}
                                                                            {prediction.predictedGrowthPercent.toFixed(
                                                                                1
                                                                            )}
                                                                            %
                                                                        </strong>
                                                                    </span>
                                                                )}
                                                        </div>
                                                    )}
                                                    {prediction.reasoning && (
                                                        <div className={styles.alertAction}>
                                                            <i className="ti ti-lightbulb me-2"></i>
                                                            <strong>Phân tích:</strong>{' '}
                                                            {prediction.reasoning}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        }
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Biểu đồ phân tích chi tiết trong AI Insights */}
            {aiInsights && (
                <div className={styles.aiChartsSection}>
                    <div className={styles.chartsRow}>
                        {/* Xu hướng lịch hẹn */}
                        {appointmentTrendPoints.length > 0 && (
                            <div className={pageStyles.trendCard}>
                                <div className={pageStyles.cardHeader}>
                                    <h5>Xu hướng lịch hẹn</h5>
                                    <span>
                                        Số liệu theo:{' '}
                                        {periodOptions.find((p) => p.value === period)?.label}
                                    </span>
                                </div>
                                <div className={pageStyles.cardBody}>
                                    <ChartJsLine
                                        data={appointmentTrendPoints}
                                        color="#36B6C5"
                                        label="Xu hướng lịch hẹn"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Bệnh nhân mới */}
                        {newPatientTrendPoints.length > 0 && (
                            <div className={pageStyles.trendCard}>
                                <div className={pageStyles.cardHeader}>
                                    <h5>Bệnh nhân mới</h5>
                                    <span>Theo dõi số lượt đặt lịch lần đầu</span>
                                </div>
                                <div className={pageStyles.cardBody}>
                                    <ChartJsLine
                                        data={newPatientTrendPoints}
                                        color="#818CF8"
                                        label="Bệnh nhân mới"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className={styles.chartsRow}>
                        {/* Thống kê cuộc hẹn hoàn thành và hủy */}
                        {completedVsCancelledData.length > 0 && (
                            <div className={pageStyles.trendCard}>
                                <div className={pageStyles.cardHeader}>
                                    <h5>Thống kê cuộc hẹn hoàn thành và hủy</h5>
                                    <span>Thống kê trạng thái lịch hẹn</span>
                                </div>
                                <div className={pageStyles.cardBody}>
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

                        {/* Thống kê theo giờ trong ngày */}
                        {peakHoursChartData.length > 0 && (
                            <div className={pageStyles.trendCard}>
                                <div className={pageStyles.cardHeader}>
                                    <h5>Thống kê theo giờ trong ngày</h5>
                                    <span>Phân tích giờ cao điểm đặt lịch</span>
                                </div>
                                <div className={pageStyles.cardBody}>
                                    <ChartJsSingleBar
                                        data={peakHoursChartData}
                                        color="#f59e0b"
                                        label="Số lịch hẹn"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className={styles.chartsRow}>
                        {/* Thống kê theo loại khám */}
                        {appointmentTypeChartData.length > 0 && (
                            <div className={pageStyles.trendCard}>
                                <div className={pageStyles.cardHeader}>
                                    <h5>Thống kê theo loại khám</h5>
                                    <span>Phân bổ lượt đặt theo hình thức khám</span>
                                </div>
                                <div className={pageStyles.cardBody}>
                                    <ChartJsSingleBar
                                        data={appointmentTypeChartData}
                                        color="#06b6d4"
                                        label="Số lịch hẹn"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Phân bổ gói đăng ký */}
                        {subscriptionChartData.length > 0 && (
                            <div className={pageStyles.trendCard}>
                                <div className={pageStyles.cardHeader}>
                                    <h5>Phân bổ gói đăng ký</h5>
                                    <span>
                                        Thống kê hủy, nâng cấp và tổng số đăng ký theo từng gói
                                    </span>
                                </div>
                                <div className={pageStyles.cardBody}>
                                    <ChartJsTripleBar
                                        data={subscriptionChartData}
                                        color1="#ef4444"
                                        color2="#10b981"
                                        color3="#8b5cf6"
                                        label1="Hủy"
                                        label2="Nâng cấp"
                                        label3="Tổng"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Doanh thu từ đăng ký gói và Xu hướng tỉ lệ hủy - Cùng 1 hàng */}
                    <div className={styles.chartsRow}>
                        {/* Doanh thu từ đăng ký gói */}
                        {revenueChartData.length > 0 && (
                            <div className={pageStyles.trendCard}>
                                <div className={pageStyles.cardHeader}>
                                    <div>
                                        <h5>Doanh thu từ đăng ký gói</h5>
                                        <span>
                                            Biểu đồ thống kê doanh thu từ các gói đăng ký (không bao
                                            gồm thanh toán lịch hẹn)
                                        </span>
                                    </div>
                                    <RevenueFilterButtons
                                        selectedPeriod={revenuePeriod}
                                        onPeriodChange={setRevenuePeriod}
                                        isLoading={isLoadingRevenueChart}
                                    />
                                </div>
                                <div className={pageStyles.cardBody}>
                                    <ChartJsSingleBar
                                        data={revenueChartData}
                                        color="#10b981"
                                        label="Tổng doanh thu"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Xu hướng tỉ lệ hủy */}
                        {predictions && aiInsights && (
                            <div className={pageStyles.trendCard}>
                                <div className={pageStyles.cardHeader}>
                                    <h5>Xu hướng tỉ lệ hủy</h5>
                                    <span>Biểu đồ vùng thể hiện tỉ lệ hủy qua các kỳ</span>
                                </div>
                                <div className={pageStyles.cardBody}>
                                    <ChartJsArea
                                        data={[
                                            {
                                                label: 'Kỳ trước',
                                                value: Math.max(
                                                    0,
                                                    Math.min(
                                                        100,
                                                        aiInsights.metrics.cancellationRate -
                                                            (aiInsights.metrics
                                                                .cancellationDeltaPercent /
                                                                100) *
                                                                aiInsights.metrics.cancellationRate
                                                    )
                                                ),
                                            },
                                            {
                                                label: 'Kỳ này',
                                                value: aiInsights.metrics.cancellationRate,
                                            },
                                            {
                                                label: 'Dự đoán kỳ tới',
                                                value: predictions.predictedCancellationRate,
                                            },
                                        ]}
                                        color="#f59e0b"
                                        label="Tỉ lệ hủy (%)"
                                        fillOpacity={0.3}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Phân bổ chuyên khoa và Phân bổ trạng thái - 2 biểu đồ tròn */}
                    <div className={styles.chartsRow}>
                        {/* Phân bổ chuyên khoa */}
                        {specialtyChartData.length > 0 && specialtyChartData[0].value > 0 && (
                            <div className={pageStyles.trendCard}>
                                <div className={pageStyles.cardHeader}>
                                    <h5>Phân bổ chuyên khoa</h5>
                                    <span>Tỷ lệ lượt đặt theo từng chuyên khoa</span>
                                </div>
                                <div className={pageStyles.cardBody}>
                                    <ChartJsPie data={specialtyChartData} />
                                </div>
                            </div>
                        )}

                        {/* Phân bổ trạng thái lịch hẹn */}
                        {statusChartData.length > 0 && (
                            <div className={pageStyles.trendCard}>
                                <div className={pageStyles.cardHeader}>
                                    <h5>Phân bổ trạng thái lịch hẹn</h5>
                                    <span>Tỷ lệ các trạng thái trong kỳ hiện tại</span>
                                </div>
                                <div className={pageStyles.cardBody}>
                                    <ChartJsPie data={statusChartData} />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default DashboardAIInsight;
