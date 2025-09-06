
if ($('#calendar').length > 0) {
    document.addEventListener('DOMContentLoaded', function () {
        var calendarEl = document.getElementById('calendar');
        var calendar = new FullCalendar.Calendar(calendarEl, {
            headerToolbar: {
                start: 'today prev,next',
                center: 'title',
                end: 'dayGridMonth,dayGridWeek,dayGridDay'
            },
            initialView: 'dayGridMonth',
            editable: true,
            droppable: true,
            events: [
                {
                    title: 'Team A',
                    start: '2025-05-04',
                    backgroundColor: 'transparent',
                    extendedProps: {
                        avatars: [
                            'assets/img/users/user-01.jpg',
                            'assets/img/users/user-02.jpg',
                            'assets/img/users/user-03.jpg',
                        ]
                    }
                    
                },
                {
                    title: 'Team B',
                    start: '2025-05-06',
                    backgroundColor: 'transparent',
                    extendedProps: {
                        avatars: [
                            'assets/img/users/user-04.jpg',
                            'assets/img/users/user-05.jpg',
                            'assets/img/users/user-06.jpg',
                        ]
                    }
                },
                {
                    title: 'Team C',
                    start: '2025-05-15',
                    backgroundColor: 'transparent',
                    extendedProps: {
                        avatars: [
                            'assets/img/users/user-07.jpg',
                            'assets/img/users/user-08.jpg',
                            'assets/img/users/user-09.jpg',
                        ]
                    }
                },
                {
                    title: 'Meeting',
                    start: '2025-05-18',
                    backgroundColor: 'transparent',
                    extendedProps: {
                        avatars: [
                            'assets/img/users/user-10.jpg',
                            'assets/img/users/user-11.jpg',
                        ]
                    }
                },
                {
                    title: 'Follow-up',
                    start: '2025-05-20',
                    backgroundColor: 'transparent',
                    extendedProps: {
                        avatars: [
                            'assets/img/users/user-12.jpg',
                            'assets/img/users/user-13.jpg',
                        ]
                    }
                },
                {
                    title: 'Review',
                    start: '2025-05-25',
                    backgroundColor: 'transparent',
                    extendedProps: {
                        avatars: [
                            'assets/img/users/user-14.jpg',
                        ]
                    }
                },
                {
                    title: 'Wrap-up',
                    start: '2025-05-30',
                    backgroundColor: 'transparent',
                    extendedProps: {
                        avatars: [
                            'assets/img/users/user-15.jpg',
                        ]
                    }
                }
            ],
            eventContent: function (arg) {
                const avatars = arg.event.extendedProps.avatars || [];
                let avatarHtml = '';

                avatars.slice(0, 4).forEach((src) => {
                    avatarHtml += `<img src="${src}" class="avatar" style="width: 24px; height: 24px; border-radius: 50%; margin-right: 2px;">`;
                });

                if (avatars.length > 4) {
                    avatarHtml += `<span style="font-size: 12px; background: #ccc; padding: 2px 6px; border-radius: 12px;">+${avatars.length - 4}</span>`;
                }

                return { html: `<div style="display:flex; align-items:center;">${avatarHtml}</div>` };
            },
            eventClick: function (info) {
                $('#event_modal').modal('show');
                document.getElementById('eventTitle').innerText = info.event.title;
            },
            drop: function (info) {
                console.log('Event dropped');
            },
            eventReceive: function (info) {
                console.log('Event added', info.event.title);
            }
        });
        calendar.render();
    });
}




if($('#calendar1').length > 0) {

    document.addEventListener('DOMContentLoaded', function() {
        var todayDate = moment().startOf('day');
        var YM = todayDate.format('YYYY-MM');
        var YESTERDAY = todayDate.clone().subtract(1, 'day').format('YYYY-MM-DD');
        var TODAY = todayDate.format('YYYY-MM-DD');
        var TOMORROW = todayDate.clone().add(1, 'day').format('YYYY-MM-DD');

        var calendarEl = document.getElementById('calendar');
        var calendar = new FullCalendar.Calendar(calendarEl, {
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
            },
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay,listMonth'
            },

            height: 500,
            contentHeight: 580,
            aspectRatio: 3,  // see: https://fullcalendar.io/docs/aspectRatio


            views: {
                dayGridMonth: { buttonText: 'month' },
                timeGridWeek: { buttonText: 'week' },
                timeGridDay: { buttonText: 'day' }
            },

            initialView: 'dayGridMonth',
            initialDate: TODAY,

            editable: true,
            dayMaxEvents: true, // allow "more" link when too many events
            navLinks: true,
            events: [
                {
                    title: 'All Day Event',
                    start: new Date($.now() - 168000000).toJSON().slice(0, 10),
                    backgroundColor: '#FDE9ED'
                },
                {
                    id: 1000,
                    title: 'Repeating Event',
                    start: new Date($.now() - 338000000).toJSON().slice(0, 10) 
                },
                {
                    title: 'Meeting',
                    start: new Date($.now() - 338000000).toJSON().slice(0, 10)
                },
                {
                    title: 'Click for Google',
                    start: new Date($.now() + 68000000).toJSON().slice(0, 10),
                    className: "bg-secondary text-white" 
                }
            ]
        });

        calendar.render();
    });
}
