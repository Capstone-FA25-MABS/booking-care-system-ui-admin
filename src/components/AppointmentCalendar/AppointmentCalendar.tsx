import { useState, useCallback, useRef } from 'react';
import { toast } from 'react-toastify';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { EventClickArg, EventContentArg } from '@fullcalendar/core';
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
import Spinner from '@/components/Spinner';

// Import custom SCSS
import './AppointmentCalendar.scss';

// ============================================================================
// Types
// ============================================================================

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

export interface AppointmentCalendarProps {
    /** Entity ID (doctorId or hospitalId) */
    entityId: string | undefined;
    /** Type of entity for API call */
    entityType: 'doctor' | 'hospital';
    /** Page title */
    title: string;
    /** Optional subtitle (e.g., hospital name, doctor name) */
    subtitle?: string;
    /** Whether to include relative info in patient name calculation */
    includeRelativeInfo?: boolean;
}

// ============================================================================
// Constants
// ============================================================================

const STATUS_COLORS = {
    [AppointmentStatus.PENDING]: { bg: '#FEF3C7', border: '#F59E0B' },
    [AppointmentStatus.CONFIRMED]: { bg: '#DBEAFE', border: '#3B82F6' },
    [AppointmentStatus.COMPLETED]: { bg: '#D1FAE5', border: '#10B981' },
    [AppointmentStatus.CANCELLED]: { bg: '#FEE2E2', border: '#EF4444' },
};

const DEFAULT_COLOR = { bg: '#F3F4F6', border: '#6B7280' };

const CALENDAR_BUTTON_TEXT = {
    today: 'Hôm nay',
    month: 'Tháng',
    week: 'Tuần',
    day: 'Ngày',
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Transform appointment data to calendar event
 */
const transformToCalendarEvent = (apt: any, includeRelativeInfo: boolean): CalendarEvent => {
    const date = new Date(apt.appointmentDate);
    const timeText = getAppointmentTimeText(apt.appointmentTimeId);
    const startTime = timeText.split(' - ')[0] || '08:00';
    const [hours, minutes] = startTime.split(':');
    date.setHours(Number.parseInt(hours, 10), Number.parseInt(minutes, 10));

    const endDate = new Date(date);
    endDate.setMinutes(endDate.getMinutes() + 30);

    const colors = STATUS_COLORS[apt.status as AppointmentStatus] || DEFAULT_COLOR;

    const appointmentData: AppointmentCardData = {
        appointmentId: apt.id,
        appointmentDate: apt.appointmentDate,
        appointmentTime: timeText,
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

    // Get patient name based on whether to include relative info
    let patientName: string;
    if (includeRelativeInfo) {
        const hasRelative = isRelativeAppointment(appointmentData);
        patientName = hasRelative
            ? getActualPatientName(appointmentData)
            : `${apt.patientInfo?.firstName || ''} ${apt.patientInfo?.lastName || ''}`.trim();
    } else {
        patientName =
            `${apt.patientInfo?.firstName || ''} ${apt.patientInfo?.lastName || ''}`.trim();
    }

    return {
        id: apt.id,
        title: patientName,
        start: date,
        end: endDate,
        extendedProps: {
            appointmentData,
            patientAvatar: apt.patientInfo?.avatarUrl || apt.patientInfo?.avatar,
        },
        backgroundColor: colors.bg,
        borderColor: colors.border,
    };
};

// ============================================================================
// Sub-components
// ============================================================================

interface EventContentProps {
    eventInfo: EventContentArg;
}

const EventContent: React.FC<EventContentProps> = ({ eventInfo }) => {
    const { extendedProps } = eventInfo.event;
    const avatarUrl = extendedProps.appointmentData.patientInfo?.avatarUrl;

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

// ============================================================================
// Main Component
// ============================================================================

const AppointmentCalendar: React.FC<AppointmentCalendarProps> = ({
    entityId,
    entityType,
    title,
    subtitle,
    includeRelativeInfo = false,
}) => {
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const lastFetchRef = useRef<string>('');
    const [selectedAppointment, setSelectedAppointment] = useState<AppointmentCardData | null>(
        null
    );
    const [showOffcanvas, setShowOffcanvas] = useState(false);

    const fetchAppointments = useCallback(
        async (start: Date, end: Date) => {
            if (!entityId) return;

            const rangeKey = `${format(start, 'yyyy-MM-dd')}_${format(end, 'yyyy-MM-dd')}`;

            if (lastFetchRef.current === rangeKey) {
                return;
            }

            lastFetchRef.current = rangeKey;
            setIsLoading(true);

            try {
                const queryParams: Record<string, any> = {
                    fromDate: format(start, 'yyyy-MM-dd'),
                    toDate: format(end, 'yyyy-MM-dd'),
                    pageNumber: 1,
                    pageSize: 1000,
                    includeStatusCounts: false,
                    statuses: [AppointmentStatus.CONFIRMED, AppointmentStatus.COMPLETED],
                };

                // Set entity-specific ID
                if (entityType === 'doctor') {
                    queryParams.doctorId = entityId;
                } else {
                    queryParams.hospitalId = entityId;
                }

                const response = await AppointmentService.getAppointmentsForManagement(queryParams);

                if (response.success && response.data?.appointments) {
                    const calendarEvents = response.data.appointments.map((apt: any) =>
                        transformToCalendarEvent(apt, includeRelativeInfo)
                    );
                    setEvents(calendarEvents);
                }
            } catch (error: any) {
                console.error('Error fetching appointments:', error);
                toast.error(error.message || 'Không thể tải lịch hẹn');
                lastFetchRef.current = '';
            } finally {
                setIsLoading(false);
            }
        },
        [entityId, entityType, includeRelativeInfo]
    );

    const handleDateSet = (arg: any) => {
        const rangeKey = `${arg.view.type}_${format(arg.start, 'yyyy-MM-dd')}_${format(arg.end, 'yyyy-MM-dd')}`;

        if (lastFetchRef.current === rangeKey) {
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

    const renderEventContent = (eventInfo: EventContentArg) => (
        <EventContent eventInfo={eventInfo} />
    );

    return (
        <div className="content">
            {/* Page Header */}
            <div className="d-flex align-items-sm-center flex-sm-row flex-column gap-2 pb-3 mb-3 border-1 border-bottom">
                <div className="flex-grow-1">
                    <h4 className="fw-semibold mb-0">{title}</h4>
                    {subtitle && <p className="text-muted mb-0">{subtitle}</p>}
                </div>
            </div>

            {/* Calendar Card */}
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
                            buttonText={CALENDAR_BUTTON_TEXT}
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
                                dayGridMonth: { buttonText: 'Tháng' },
                                timeGridWeek: { buttonText: 'Tuần' },
                                timeGridDay: { buttonText: 'Ngày' },
                            }}
                        />
                    </div>
                </div>
            </div>

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

export default AppointmentCalendar;
