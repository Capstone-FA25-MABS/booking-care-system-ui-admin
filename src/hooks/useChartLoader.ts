import { useEffect, useRef, RefObject } from 'react';

/**
 * Custom hook to load Chart.js library dynamically
 * @returns Object containing canvasRef, chartRef, and isMounted flag
 */
export const useChartLoader = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const chartRef = useRef<any>(null);
    const isMountedRef = useRef(true);

    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
            if (chartRef.current) {
                chartRef.current.destroy();
                chartRef.current = null;
            }
        };
    }, []);

    return { canvasRef, chartRef, isMountedRef };
};

/**
 * Load Chart.js library dynamically
 * @returns Promise resolving to Chart constructor
 */
export const loadChartLibrary = async (): Promise<any> => {
    const module = await import('@/assets/plugins/chartjs/chart.min.js');
    return (module as any)?.default ?? (window as any).Chart;
};

/**
 * Initialize chart with common setup
 * @param canvasRef - Reference to canvas element
 * @param chartRef - Reference to store chart instance
 * @param isMountedRef - Reference to track if component is mounted
 * @param config - Chart configuration
 */
export const initializeChart = async (
    canvasRef: RefObject<HTMLCanvasElement | null>,
    chartRef: React.MutableRefObject<any>,
    isMountedRef: React.MutableRefObject<boolean>,
    config: any
): Promise<void> => {
    if (!canvasRef.current || !isMountedRef.current) return;

    const ChartCtor = await loadChartLibrary();
    if (!ChartCtor || !canvasRef.current || !isMountedRef.current) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    if (chartRef.current) {
        chartRef.current.destroy();
    }

    if (!isMountedRef.current) return;

    chartRef.current = new ChartCtor(ctx, config);
};
