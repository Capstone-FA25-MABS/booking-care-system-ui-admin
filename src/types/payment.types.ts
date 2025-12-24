/**
 * Payment Statistics Types
 * These types match the C# DTOs from the Payment Service
 */

export enum StatisticsPeriod {
    Daily = 'Daily',
    Weekly = 'Weekly',
    Monthly = 'Monthly',
    Quarterly = 'Quarterly',
    Yearly = 'Yearly',
}

/**
 * Request to get payment statistics (subscription revenue only)
 */
export interface GetPaymentStatisticsRequest {
    fromDate?: string; // ISO date string (YYYY-MM-DD)
    toDate?: string; // ISO date string (YYYY-MM-DD)
    period?: StatisticsPeriod;
    hospitalId?: string;
    patientId?: string;
    transactionType?: string;
    status?: string;
}

/**
 * Time series data point
 */
export interface PaymentTimeSeriesData {
    timeLabel: string; // e.g., "2024-01", "2024-Q1", "2024-01-15"
    periodStart: string; // ISO date string
    periodEnd: string; // ISO date string
    totalCount: number;
    totalAmount: number;
    completedCount: number;
    completedAmount: number;
    pendingCount: number;
    failedCount: number;
    refundedCount: number;
    averageAmount: number;
}

/**
 * Summary statistics
 */
export interface PaymentSummaryStatistics {
    totalPayments: number;
    totalAmount: number;
    totalCompletedAmount: number;
    successRate: number;
    averagePaymentAmount: number;
    maxPaymentAmount: number;
    minPaymentAmount: number;
    averagePaymentsPerDay: number;
    growthRate: number;
}

/**
 * Statistics by payment method
 */
export interface PaymentMethodStatistics {
    paymentMethodId: string;
    paymentMethodName: string;
    count: number;
    totalAmount: number;
    percentage: number;
    averageAmount: number;
}

/**
 * Statistics by payment status
 */
export interface PaymentStatusStatistics {
    status: string;
    count: number;
    totalAmount: number;
    percentage: number;
}

/**
 * Statistics by transaction type
 */
export interface TransactionTypeStatistics {
    transactionType: string;
    count: number;
    totalAmount: number;
    percentage: number;
    averageAmount: number;
}

/**
 * Complete payment statistics response
 */
export interface PaymentStatisticsResponse {
    timeSeries: PaymentTimeSeriesData[];
    summary: PaymentSummaryStatistics;
    paymentMethodBreakdown: PaymentMethodStatistics[];
    statusBreakdown: PaymentStatusStatistics[];
    transactionTypeBreakdown: TransactionTypeStatistics[];
    period: string;
    dateRange: string;
}
