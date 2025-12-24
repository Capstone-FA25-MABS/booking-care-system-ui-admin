import { useState, useCallback, useRef } from 'react';
import { toast } from 'react-toastify';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { EventClickArg, EventContentArg } from '@fullcalendar/core';
import { AppointmentService } from '@/services/appointment.service';
import { AppointmentStatus, AppointmentTime, AppointmentType } from '@/enums/appointment.enums';
import { format } from 'date-fns';
import { AppointmentDetailsOffcanvas } from '@/components/AppointmentDetailsOffcanvas';
import {
    AppointmentCardData,
    getAppointmentTimeText,
    isRelativeAppointment,
    getActualPatientName,
} from '@/types/appointment.types';
import Spinner from '@/components/Spinner';

// Import custom CSS Module
import styles from './AppointmentCalendar.module.scss';

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
        appointmentCount?: number;
        allAppointments?: any[];
        isMoreEvent?: boolean;
        remainingCount?: number;
        totalPatients?: number;
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
    const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
    const wrapperRef = useRef<HTMLDivElement>(null);

    const handleMouseEnter = () => {
        if (wrapperRef.current) {
            const rect = wrapperRef.current.getBoundingClientRect();

            // Find calendar container
            const calendarEl = wrapperRef.current.closest('.fc');
            if (!calendarEl) return;

            const calendarRect = calendarEl.getBoundingClientRect();

            // Find the day cell to determine row position
            const dayCell = wrapperRef.current.closest('.fc-daygrid-day');
            const isFirstRow = dayCell?.closest('tr')?.previousElementSibling === null;
            const isLastRow = dayCell?.closest('tr')?.nextElementSibling === null;

            const tooltipHeight = 65;
            const tooltipWidth = 240;
            const spacing = 12;
            const padding = 15;

            let top: number;
            let left: number;
            let transform = 'translateX(-50%)';

            // Calculate horizontal position (keep within calendar bounds)
            left = rect.left + rect.width / 2;

            // Adjust if tooltip goes beyond calendar right edge
            const maxLeft = calendarRect.right - tooltipWidth - padding;
            if (left + tooltipWidth / 2 > calendarRect.right - padding) {
                left = maxLeft;
                transform = 'translateX(0)';
            }

            // Adjust if tooltip goes beyond calendar left edge
            const minLeft = calendarRect.left + padding;
            if (left - tooltipWidth / 2 < minLeft) {
                left = minLeft;
                transform = 'translateX(0)';
            }

            // Calculate vertical position based on row position
            let arrowDirection = 'up'; // Default: arrow points up (tooltip above avatar)

            if (isFirstRow) {
                // First row: always show below with more spacing
                top = rect.bottom + spacing + 5;
                arrowDirection = 'down'; // Arrow points down (tooltip below avatar)
            } else if (isLastRow) {
                // Last row: always show above with more spacing
                top = rect.top - tooltipHeight - spacing - 5;
                arrowDirection = 'up';
            } else {
                // Middle rows: prefer above, but show below if not enough space
                const spaceAbove = rect.top - calendarRect.top;
                const spaceBelow = calendarRect.bottom - rect.bottom;

                if (spaceAbove >= tooltipHeight + spacing + 20) {
                    top = rect.top - tooltipHeight - spacing;
                    arrowDirection = 'up';
                } else if (spaceBelow >= tooltipHeight + spacing + 20) {
                    top = rect.bottom + spacing;
                    arrowDirection = 'down';
                } else {
                    // Default to below if both spaces are tight
                    top = rect.bottom + spacing;
                    arrowDirection = 'down';
                }
            }

            // Ensure tooltip doesn't go above calendar top
            const minTop = calendarRect.top + padding;
            if (top < minTop) {
                top = minTop;
            }

            // Ensure tooltip doesn't go below calendar bottom
            const maxTop = calendarRect.bottom - tooltipHeight - padding;
            if (top > maxTop) {
                top = maxTop;
            }

            setTooltipStyle({
                top: `${top}px`,
                left: `${left}px`,
                transform,
                // Add custom CSS variable for arrow position
                ['--arrow-left' as any]:
                    transform === 'translateX(0)'
                        ? `${rect.left + rect.width / 2 - left}px`
                        : '50%',
                ['--arrow-direction' as any]: arrowDirection,
            });
        }
    };

    // Check if this is a "+X more" event
    if (extendedProps.isMoreEvent) {
        const remainingCount = extendedProps.remainingCount || 0;
        const totalPatients = extendedProps.totalPatients || 0;

        return (
            <div
                ref={wrapperRef}
                className={styles.appointmentAvatarWrapper}
                onMouseEnter={handleMouseEnter}
            >
                <div
                    className={`rounded-circle d-flex align-items-center justify-content-center ${styles.appointmentMoreBadge}`}
                >
                    +{remainingCount}
                </div>
                <div className={styles.customTooltip} style={tooltipStyle}>
                    Còn {remainingCount} bệnh nhân khác
                    <br />
                    Tổng: {totalPatients} bệnh nhân
                </div>
            </div>
        );
    }

    const avatarUrl = extendedProps.appointmentData.patientInfo?.avatarUrl;
    const appointmentCount = extendedProps.appointmentCount || 1;

    return (
        <div
            ref={wrapperRef}
            className={styles.appointmentAvatarWrapper}
            onMouseEnter={handleMouseEnter}
        >
            {avatarUrl ? (
                <>
                    <img
                        src={avatarUrl}
                        alt={eventInfo.event.title}
                        className={`rounded-circle ${styles.appointmentAvatar}`}
                    />
                    {appointmentCount > 1 && (
                        <span
                            className={`badge rounded-pill bg-danger ${styles.appointmentCountBadge}`}
                        >
                            {appointmentCount}
                        </span>
                    )}
                    <div className={styles.customTooltip} style={tooltipStyle}>
                        {eventInfo.event.title}
                        <br />
                        {appointmentCount} cuộc hẹn trong ngày này
                    </div>
                </>
            ) : (
                <>
                    <div
                        className={`rounded-circle d-flex align-items-center justify-content-center text-white fw-semibold ${styles.appointmentAvatar}`}
                        style={{ backgroundColor: '#6366f1', fontSize: '0.7rem' }}
                    >
                        {eventInfo.event.title
                            .split(' ')
                            .map((word) => word[0])
                            .join('')
                            .toUpperCase()
                            .slice(0, 2)}
                    </div>
                    {appointmentCount > 1 && (
                        <span
                            className={`badge rounded-pill bg-danger ${styles.appointmentCountBadge}`}
                        >
                            {appointmentCount}
                        </span>
                    )}
                    <div className={styles.customTooltip} style={tooltipStyle}>
                        {eventInfo.event.title}
                        <br />
                        {appointmentCount} cuộc hẹn trong ngày này
                    </div>
                </>
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
                    // Group appointments by date and patient
                    const groupedByDateAndPatient = new Map<
                        string,
                        Map<string, { appointments: any[]; patientInfo: any }>
                    >();

                    response.data.appointments.forEach((apt: any) => {
                        const dateKey = apt.appointmentDate;
                        const patientId =
                            apt.patientInfo?.id || apt.patientInfo?.accountId || 'unknown';

                        if (!groupedByDateAndPatient.has(dateKey)) {
                            groupedByDateAndPatient.set(dateKey, new Map());
                        }

                        const dateGroup = groupedByDateAndPatient.get(dateKey)!;
                        if (!dateGroup.has(patientId)) {
                            dateGroup.set(patientId, {
                                appointments: [],
                                patientInfo: apt.patientInfo,
                            });
                        }

                        dateGroup.get(patientId)!.appointments.push(apt);
                    });

                    // Transform grouped appointments to calendar events
                    const calendarEvents: CalendarEvent[] = [];
                    const MAX_PATIENTS_PER_DAY = 5; // Giới hạn 5 bệnh nhân hiển thị theo yêu cầu

                    groupedByDateAndPatient.forEach((dateGroup, dateKey) => {
                        const patientsArray = Array.from(dateGroup.entries());
                        const totalPatients = patientsArray.length;

                        // Hiển thị tối đa MAX_PATIENTS_PER_DAY bệnh nhân
                        const visiblePatients = patientsArray.slice(0, MAX_PATIENTS_PER_DAY);
                        const remainingCount = totalPatients - MAX_PATIENTS_PER_DAY;

                        visiblePatients.forEach(([_patientId, patientData]) => {
                            const firstAppointment = patientData.appointments[0];
                            const appointmentCount = patientData.appointments.length;

                            // Create a single event for this patient on this date
                            const event = transformToCalendarEvent(
                                firstAppointment,
                                includeRelativeInfo
                            );

                            // Add appointment count to extendedProps
                            event.extendedProps.appointmentCount = appointmentCount;

                            // Store all appointments for this patient on this date
                            event.extendedProps.allAppointments = patientData.appointments;

                            calendarEvents.push(event);
                        });

                        // Nếu có nhiều hơn MAX_PATIENTS_PER_DAY bệnh nhân, thêm event "+X"
                        if (remainingCount > 0) {
                            const date = new Date(dateKey);
                            date.setHours(8, 0, 0, 0);
                            const endDate = new Date(date);
                            endDate.setMinutes(endDate.getMinutes() + 30);

                            // Tạo một appointment data giả cho "+X" event
                            const moreEvent: CalendarEvent = {
                                id: `more-${dateKey}`,
                                title: `+${remainingCount}`,
                                start: date,
                                end: endDate,
                                extendedProps: {
                                    appointmentData: {
                                        appointmentId: `more-${dateKey}`,
                                        appointmentDate: dateKey,
                                        appointmentTime: AppointmentTime.AT_08_00_08_30,
                                        appointmentTimeId: AppointmentTime.AT_08_00_08_30,
                                        appointmentType: AppointmentType.IN_PERSON,
                                        status: AppointmentStatus.CONFIRMED,
                                        patientInfo: null as any,
                                        relativeInfo: undefined,
                                        doctorInfo: undefined,
                                        serviceInfo: undefined,
                                        hospitalInfo: undefined,
                                        reason: '',
                                        result: undefined,
                                        symptoms: undefined,
                                        attachmentUrls: undefined,
                                    },
                                    isMoreEvent: true,
                                    remainingCount,
                                    totalPatients,
                                },
                                backgroundColor: '#f3f4f6',
                                borderColor: '#9ca3af',
                            };

                            calendarEvents.push(moreEvent);
                        }
                    });

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

        // Don't open offcanvas for "+X more" events
        if (extendedProps.isMoreEvent) {
            toast.info(`Có ${extendedProps.remainingCount} bệnh nhân khác trong ngày này`);
            return;
        }

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

                    <div
                        style={{ opacity: isLoading ? 0.5 : 1, position: 'relative' }}
                        className={styles.calendarWrapper}
                    >
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
