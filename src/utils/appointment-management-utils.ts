import { AppointmentService } from '../services/appointment.service';
import { toast } from 'react-toastify';

/**
 * Transform and fetch appointments with error handling
 */
export const fetchAndTransformAppointments = async (
    query: any,
    transformToCardData: (apt: any) => any,
    isNewAppointment: (createdAt: string) => boolean,
    setters: {
        setAppointments: (appointments: any[]) => void;
        setTotalCount: (count: number) => void;
        setTabCounts?: (counts: {
            waiting: number;
            upcoming: number;
            cancelled: number;
            completed: number;
        }) => void;
        setApiError: (error: string) => void;
        setIsLoading: (loading: boolean) => void;
    }
) => {
    try {
        const response = await AppointmentService.getAppointmentsForManagement(query);

        if (response.success && response.data) {
            // Transform API responses to UI-friendly format
            const transformedAppointments = response.data.appointments.map((apt) => {
                const cardData = transformToCardData(apt);
                cardData.isNew = isNewAppointment(apt.createdAt);
                return cardData;
            });

            setters.setAppointments(transformedAppointments);
            setters.setTotalCount(response.data.totalCount || 0);

            // Update counts from statusCounts if available
            if (response.data.statusCounts && setters.setTabCounts) {
                setters.setTabCounts({
                    waiting: response.data.statusCounts.pending || 0,
                    upcoming: response.data.statusCounts.confirmed || 0,
                    cancelled: response.data.statusCounts.cancelled || 0,
                    completed: response.data.statusCounts.completed || 0,
                });
            }
        } else {
            throw new Error(response.message || 'Không thể tải danh sách lịch hẹn');
        }
    } catch (error: any) {
        console.error('Error fetching appointments:', error);
        const errorMessage = error.message || 'Không thể tải danh sách lịch hẹn';
        setters.setApiError(errorMessage);
        setters.setAppointments([]);
        setters.setTotalCount(0);
        toast.error(errorMessage);
    } finally {
        setters.setIsLoading(false);
    }
};
