export interface ReviewMetricDefinition<TStats> {
    label: string;
    getValue: (stats: TStats) => number;
    getSub?: (stats: TStats) => string;
    sub?: string;
    className: string;
    icon: string;
    formatDecimal?: boolean;
}

export const buildReviewMetrics = <TStats>(
    stats: TStats | null | undefined,
    definitions: Array<ReviewMetricDefinition<TStats>>
) => {
    if (!stats) return [];
    return definitions.map((definition) => ({
        label: definition.label,
        value: definition.getValue(stats),
        sub: definition.getSub ? definition.getSub(stats) : (definition.sub ?? ''),
        className: definition.className,
        icon: definition.icon,
        formatDecimal: definition.formatDecimal,
    }));
};

interface CompletionStats {
    completedAppointments: number;
    confirmedAppointments: number;
    cancelledAppointments: number;
    pendingAppointments: number;
}

export const buildCompletionVsCancellationData = (stats: CompletionStats | null | undefined) => {
    if (!stats) return [];
    return [
        {
            label: 'Trạng thái lịch hẹn',
            value1: stats.completedAppointments + stats.confirmedAppointments, // Hoàn thành/Xác nhận
            value2: stats.cancelledAppointments + stats.pendingAppointments, // Hủy/Chờ
        },
    ];
};
