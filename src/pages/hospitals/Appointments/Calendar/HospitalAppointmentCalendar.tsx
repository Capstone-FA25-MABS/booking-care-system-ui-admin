import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { AppointmentCalendar } from '@/components/AppointmentCalendar';

/**
 * Hospital Appointment Calendar
 * Uses shared AppointmentCalendar component with hospital-specific configuration
 */
const HospitalAppointmentCalendar: React.FC = () => {
    const { hospitalProfile } = useSelector((state: RootState) => state.user);

    return (
        <AppointmentCalendar
            entityId={hospitalProfile?.id}
            entityType="hospital"
            title="Lịch hẹn"
            subtitle={hospitalProfile?.name}
            includeRelativeInfo={true}
        />
    );
};

export default HospitalAppointmentCalendar;
