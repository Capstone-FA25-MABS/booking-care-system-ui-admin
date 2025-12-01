import { useState, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { EventClickArg, EventContentArg } from '@fullcalendar/core';
import { RootState } from '@/store';
import { AppointmentService } from '@/services/appointment.service';
import { AppointmentStatus } from '@/enums/appointment.enums';
import { format } from 'date-fns';
import { AppointmentDetailsOffcanvas } from '@/components/AppointmentDetailsOffcanvas';
import {
    AppointmentCardData,
    getAppointmentTimeText,
    isRelativeAppointment,
    getActualPatientName,
} from '@/types/appointment.types';

// Import custom SCSS (reuse from doctor calendar)
import '@/pages/doctors/Appointments/Calendar/AppointmentCalendar.scss';
import Spinner from '@/components/Spinner';

interface CalendarEvent {
    id: string;
    title: string;
    start: Date;
    end: Date;
    extendedProps: {
        appointmentData: AppointmentCardData;
        patientAvatar?: string;
    };
    backgroundColor: string;
    borderColor: string;
}

const HospitalAppointmentCalendar: React.FC = () => {
    const { hospitalProfile } = useSelector((state: RootState) => state.user);
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const lastFetchRef = useRef<string>(''); // Track last fetched range to prevent duplicates
    const [selectedAppointment, setSelectedAppointment] = useState<AppointmentCardData | null>(
        null
    );
    const [showOffcanvas, setShowOffcanvas] = useState(false);

    const fetchAppointments = useCallback(
        async (start: Date, end: Date) => {
            if (!hospitalProfile?.id) return;

            // Create unique key for this date range
            const rangeKey = `${format(start, 'yyyy-MM-dd')}_${format(end, 'yyyy-MM-dd')}`;

            // Prevent duplicate calls for the same range
            if (lastFetchRef.current === rangeKey) {
                return;
            }

            lastFetchRef.current = rangeKey;
            setIsLoading(true);

            try {
                const response = await AppointmentService.getAppointmentsForManagement({
                    hospitalId: hospitalProfile.id,
                    fromDate: format(start, 'yyyy-MM-dd'),
                    toDate: format(end, 'yyyy-MM-dd'),
                    pageNumber: 1,
                    pageSize: 1000, // Get all appointments in range
                    includeStatusCounts: false,
                    // Only show CONFIRMED and COMPLETED appointments in calendar
                    statuses: [AppointmentStatus.CONFIRMED, AppointmentStatus.COMPLETED],
                });

                if (response.success && response.data?.appointments) {
                    const calendarEvents: CalendarEvent[] = response.data.appointments.map(
                        (apt: any) => {
                            const date = new Date(apt.appointmentDate);
                            // Convert appointmentTimeId enum to string (e.g., "08:00 - 08:30")
                            const timeText = getAppointmentTimeText(apt.appointmentTimeId);
                            // Extract start time (e.g., "08:00" from "08:00 - 08:30")
                            const startTime = timeText.split(' - ')[0] || '08:00';
                            const [hours, minutes] = startTime.split(':');
                            date.setHours(Number.parseInt(hours, 10), Number.parseInt(minutes, 10));

                            // Set end time (default 30 minutes duration)
                            const endDate = new Date(date);
                            endDate.setMinutes(endDate.getMinutes() + 30);

                            // Status colors
                            const statusColors = {
                                [AppointmentStatus.PENDING]: { bg: '#FEF3C7', border: '#F59E0B' },
                                [AppointmentStatus.CONFIRMED]: { bg: '#DBEAFE', border: '#3B82F6' },
                                [AppointmentStatus.COMPLETED]: { bg: '#D1FAE5', border: '#10B981' },
                                [AppointmentStatus.CANCELLED]: { bg: '#FEE2E2', border: '#EF4444' },
                            };

                            const colors = statusColors[apt.status as AppointmentStatus] || {
                                bg: '#F3F4F6',
                                border: '#6B7280',
                            };

                            // Transform to AppointmentCardData
                            const appointmentData: AppointmentCardData = {
                                appointmentId: apt.id,
                                appointmentDate: apt.appointmentDate,
                                appointmentTime: timeText, // Full time string "08:00 - 08:30"
                                appointmentTimeId: apt.appointmentTimeId,
                                appointmentType: apt.appointmentType,
                                status: apt.status,
                                patientInfo: apt.patientInfo,
                                relativeInfo: apt.relativeInfo,
                                doctorInfo: apt.doctorInfo,
                                serviceInfo: apt.serviceInfo,
                                hospitalInfo: apt.hospitalInfo,
                                reason: apt.reason,
                                result: apt.result,
                                symptoms: apt.symptoms,
                                attachmentUrls: apt.attachmentUrls,
                            };

                            // Get actual patient name (relative or patient)
                            const hasRelative = isRelativeAppointment(appointmentData);
                            const patientName = hasRelative
                                ? getActualPatientName(appointmentData)
                                : `${apt.patientInfo?.firstName || ''} ${apt.patientInfo?.lastName || ''}`.trim();

                            return {
                                id: apt.id,
                                title: patientName,
                                start: date,
                                end: endDate,
                                extendedProps: {
                                    appointmentData,
                                    patientAvatar: apt.patientInfo?.avatarUrl,
                                },
                                backgroundColor: colors.bg,
                                borderColor: colors.border,
                            };
                        }
                    );

                    setEvents(calendarEvents);
                }
            } catch (error: any) {
                console.error('Error fetching appointments:', error);
                toast.error(error.message || 'Không thể tải lịch hẹn');
                // Reset lastFetchRef on error so user can retry
                lastFetchRef.current = '';
            } finally {
                setIsLoading(false);
            }
        },
        [hospitalProfile?.id]
    );

    const handleDateSet = (arg: any) => {
        // This is called automatically when calendar mounts and when view changes
        console.log('View changed:', arg.view.type, 'Date range:', arg.startStr, '-', arg.endStr);

        // Create unique key including view type to prevent unnecessary duplicate calls
        const rangeKey = `${arg.view.type}_${format(arg.start, 'yyyy-MM-dd')}_${format(arg.end, 'yyyy-MM-dd')}`;

        // Only fetch if this exact view+range combination hasn't been fetched yet
        if (lastFetchRef.current === rangeKey) {
            console.log('Skipping duplicate fetch for same view and range');
            return;
        }

        fetchAppointments(arg.start, arg.end);
    };

    const handleEventClick = (info: EventClickArg) => {
        const { extendedProps } = info.event;
        setSelectedAppointment(extendedProps.appointmentData as AppointmentCardData);
        setShowOffcanvas(true);
    };

    const handleCloseOffcanvas = () => {
        setShowOffcanvas(false);
        setSelectedAppointment(null);
    };

    const renderEventContent = (eventInfo: EventContentArg) => {
        const { extendedProps } = eventInfo.event;
        const avatarUrl = extendedProps.appointmentData.patientInfo?.avatarUrl;

        // Only show avatar, no text
        return (
            <div className="d-flex align-items-center justify-content-center p-1">
                {avatarUrl ? (
                    <img
                        src={avatarUrl}
                        alt={eventInfo.event.title}
                        title={`${eventInfo.timeText} - ${eventInfo.event.title}`}
                        className="rounded-circle"
                        style={{
                            width: '32px',
                            height: '32px',
                            objectFit: 'cover',
                            border: '2px solid white',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                            cursor: 'pointer',
                        }}
                    />
                ) : (
                    <div
                        className="rounded-circle d-flex align-items-center justify-content-center text-white fw-semibold"
                        title={`${eventInfo.timeText} - ${eventInfo.event.title}`}
                        style={{
                            width: '32px',
                            height: '32px',
                            backgroundColor: '#6366f1',
                            border: '2px solid white',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                        }}
                    >
                        {eventInfo.event.title
                            .split(' ')
                            .map((word) => word[0])
                            .join('')
                            .toUpperCase()
                            .slice(0, 2)}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="content">
            {/* Start Page Header */}
            <div className="d-flex align-items-sm-center flex-sm-row flex-column gap-2 pb-3 mb-3 border-1 border-bottom">
                <div className="flex-grow-1">
                    <h4 className="fw-semibold mb-0">Lịch hẹn</h4>
                    {hospitalProfile && <p className="text-muted mb-0">{hospitalProfile.name}</p>}
                </div>
            </div>
            {/* End Page Header */}

            {/* Start Card */}
            <div className="card mb-0">
                <div className="card-body">
                    {isLoading && (
                        <div
                            className="position-absolute top-50 start-50 translate-middle"
                            style={{ zIndex: 1000 }}
                        >
                            <div className="text-center">
                                <Spinner size="medium" variant="primary" />
                                <p className="mt-3 text-muted">Đang tải dữ liệu...</p>
                            </div>
                        </div>
                    )}

                    <div style={{ opacity: isLoading ? 0.5 : 1, position: 'relative' }}>
                        <FullCalendar
                            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                            initialView="dayGridMonth"
                            headerToolbar={{
                                left: 'prev,next today',
                                center: 'title',
                                right: 'dayGridMonth,timeGridWeek,timeGridDay',
                            }}
                            editable={false}
                            selectable={false}
                            dayMaxEvents={true}
                            weekends={true}
                            events={events}
                            eventClick={handleEventClick}
                            eventContent={renderEventContent}
                            datesSet={handleDateSet}
                            height="auto"
                            locale="vi"
                            buttonText={{
                                today: 'Hôm nay',
                                month: 'Tháng',
                                week: 'Tuần',
                                day: 'Ngày',
                            }}
                            slotMinTime="07:00:00"
                            slotMaxTime="22:00:00"
                            allDaySlot={false}
                            nowIndicator={true}
                            eventTimeFormat={{
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: false,
                            }}
                            views={{
                                dayGridMonth: {
                                    buttonText: 'Tháng',
                                },
                                timeGridWeek: {
                                    buttonText: 'Tuần',
                                },
                                timeGridDay: {
                                    buttonText: 'Ngày',
                                },
                            }}
                        />
                    </div>
                </div>
            </div>
            {/* End Card */}

            {/* Appointment Details Offcanvas */}
            {selectedAppointment && (
                <AppointmentDetailsOffcanvas
                    appointment={selectedAppointment}
                    show={showOffcanvas}
                    onClose={handleCloseOffcanvas}
                />
            )}
        </div>
    );
};

export default HospitalAppointmentCalendar;
