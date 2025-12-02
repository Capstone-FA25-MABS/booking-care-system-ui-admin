import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { AppointmentCalendar as SharedAppointmentCalendar } from '@/components/AppointmentCalendar';

// Keep importing SCSS for backward compatibility (other components may reference it)
import './AppointmentCalendar.scss';

/**
 * Doctor Appointment Calendar
 * Uses shared AppointmentCalendar component with doctor-specific configuration
 */
const DoctorAppointmentCalendar: React.FC = () => {
    const { doctorProfile } = useSelector((state: RootState) => state.user);

    return (
        <SharedAppointmentCalendar
            entityId={doctorProfile?.id}
            entityType="doctor"
            title="Lịch hẹn"
            includeRelativeInfo={false}
        />
    );
};

export default DoctorAppointmentCalendar;
