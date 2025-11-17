import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { Role } from '@/enums/common.enums';
import { buildPath, PATHS } from '@/routes/paths';

const STAFF_TOUR_STORAGE_KEY = 'staff_tour_completed';
const STAFF_TOUR_CURRENT_STEP_KEY = 'staff_tour_current_step';
const STAFF_TOUR_CURRENT_PAGE_STEP_KEY = 'staff_tour_current_page_step';
const STAFF_TOUR_USER_CLOSED_KEY = 'staff_tour_user_closed';

// Define types for tour steps
interface PageStep {
    selector: string;
    title: string;
    description: string;
    waitForAction?: 'input' | 'click' | 'view' | 'optional';
}

interface TourStep {
    menuSelector: string;
    path: string;
    title: string;
    description: string;
    pageSteps?: PageStep[];
    pageSelector?: string;
    pageTitle?: string;
    pageDescription?: string;
}

/**
 * Hook to manage staff tour guide using driver.js
 * Shows tour only once when staff user first logs in
 * Navigates to each page and continues guide on that page
 */
export const useStaffTour = (role: Role | null, isAuthenticated: boolean) => {
    const driverObjRef = useRef<any>(null);
    const navigate = useNavigate();
    const location = useLocation();
    const currentStepRef = useRef<number>(0);
    const currentPageStepRef = useRef<number>(0);
    const isNavigatingRef = useRef<boolean>(false);
    const userClosedRef = useRef<boolean>(false);

    // Inject custom CSS for yellow theme
    useEffect(() => {
        const styleId = 'driver-tour-custom-style';
        if (document.getElementById(styleId)) return;

        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .driver-popover {
                background-color: #ffc107 !important;
                border-radius: 8px !important;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
            }
            .driver-popover-title {
                font-weight: 600 !important;
                font-size: 18px !important;
                color: #000 !important;
                margin-bottom: 8px !important;
            }
            .driver-popover-description {
                color: #333 !important;
                font-size: 14px !important;
                line-height: 1.5 !important;
            }
            .driver-popover-footer {
                margin-top: 16px !important;
                display: flex !important;
                gap: 8px !important;
                justify-content: flex-end !important;
            }
            .driver-popover-btn {
                border-radius: 6px !important;
                padding: 8px 16px !important;
                font-weight: 500 !important;
                font-size: 14px !important;
                transition: all 0.2s !important;
            }
            .driver-popover-btn:hover {
                opacity: 0.9 !important;
                transform: translateY(-1px) !important;
            }
            .driver-popover-btn.driver-popover-btn-primary {
                background-color: #556b2f !important;
                color: #fff !important;
                border: none !important;
            }
            .driver-popover-btn.driver-popover-btn-secondary {
                background-color: #556b2f !important;
                color: #fff !important;
                border: none !important;
            }
            .driver-popover-btn.driver-popover-btn-close {
                background-color: transparent !important;
                color: #666 !important;
                border: 1px solid #ddd !important;
            }
            .driver-popover-btn.driver-popover-btn-close:hover {
                background-color: #f5f5f5 !important;
            }
            .driver-overlay {
                background-color: rgba(0, 0, 0, 0.3) !important;
            }
            .driver-popover-progress-text {
                color: #666 !important;
                font-size: 12px !important;
            }
        `;
        document.head.appendChild(style);
    }, []);

    useEffect(() => {
        // Only show tour for STAFF role
        if (role !== Role.STAFF || !isAuthenticated) {
            return;
        }

        // Check if tour has already been completed or user closed it (check every time)
        const tourCompleted = localStorage.getItem(STAFF_TOUR_STORAGE_KEY);
        const userClosed = localStorage.getItem(STAFF_TOUR_USER_CLOSED_KEY);

        // If user closed or completed, stop everything
        if (tourCompleted === 'true' || userClosed === 'true') {
            userClosedRef.current = true;
            if (driverObjRef.current) {
                driverObjRef.current.destroy();
                driverObjRef.current = null;
            }
            isNavigatingRef.current = false;
            return;
        }

        // Update ref from localStorage
        if (userClosed === 'true') {
            userClosedRef.current = true;
        }

        // Load saved tour state
        const savedStep = localStorage.getItem(STAFF_TOUR_CURRENT_STEP_KEY);
        const savedPageStep = localStorage.getItem(STAFF_TOUR_CURRENT_PAGE_STEP_KEY);
        if (savedStep !== null) {
            currentStepRef.current = parseInt(savedStep, 10);
        }
        if (savedPageStep !== null) {
            currentPageStepRef.current = parseInt(savedPageStep, 10);
        }

        // Wait for DOM to be ready and check if elements exist
        const checkAndStartTour = () => {
            // Double-check if user closed tour
            const currentTourCompleted = localStorage.getItem(STAFF_TOUR_STORAGE_KEY);
            const currentUserClosed = localStorage.getItem(STAFF_TOUR_USER_CLOSED_KEY);
            if (currentTourCompleted === 'true' || currentUserClosed === 'true') {
                userClosedRef.current = true;
                return;
            }

            // Check if at least the first element exists
            const firstElement = document.querySelector(
                '[data-tour-id="menu-item-cài-đặt-tài-khoản"]'
            );
            if (firstElement && !isNavigatingRef.current && !userClosedRef.current) {
                // If we have a saved state, resume from there
                if (savedStep !== null && savedPageStep !== null) {
                    const stepIdx = parseInt(savedStep, 10);
                    const pageStepIdx = parseInt(savedPageStep, 10);
                    const step = tourSteps[stepIdx];
                    // Check if we're already on the correct page
                    if (step && location.pathname === step.path) {
                        showPageGuide(stepIdx, pageStepIdx);
                    } else {
                        navigateToStep(stepIdx);
                    }
                } else {
                    initializeTour();
                }
            } else if (!isNavigatingRef.current && !userClosedRef.current) {
                // Retry after a short delay if element not found
                setTimeout(checkAndStartTour, 500);
            }
        };

        // Initial delay to allow DOM to render
        const timeoutId = setTimeout(checkAndStartTour, 1500);

        return () => {
            clearTimeout(timeoutId);
            if (driverObjRef.current && !isNavigatingRef.current) {
                driverObjRef.current.destroy();
            }
        };
    }, [role, isAuthenticated, location.pathname]);

    // Define tour steps with navigation paths and detailed page steps
    const tourSteps: TourStep[] = [
        {
            menuSelector: '[data-tour-id="menu-item-cài-đặt-tài-khoản"]',
            path: buildPath(
                PATHS.HOSPITAL.ROOT,
                PATHS.HOSPITAL.SETTINGS.ROOT,
                PATHS.HOSPITAL.SETTINGS.PROFILE
            ),
            title: 'Bước 1: Cập nhật tài khoản',
            description:
                'Đầu tiên, bạn cần cập nhật thông tin tài khoản bệnh viện của mình. Nhấp vào "Cài đặt tài khoản" để bắt đầu.',
            pageSteps: [
                {
                    selector: 'input[name="name"]',
                    title: 'Nhập tên bệnh viện',
                    description:
                        'Bắt đầu bằng việc nhập tên bệnh viện của bạn vào trường này. Hãy click vào ô nhập liệu và nhập tên bệnh viện.',
                    waitForAction: 'input', // Đợi người dùng nhập liệu
                },
                {
                    selector: 'input[name="email"]',
                    title: 'Email bệnh viện',
                    description:
                        'Kiểm tra email của bệnh viện. Email này sẽ được sử dụng cho các thông báo quan trọng.',
                    waitForAction: 'view', // Chỉ xem, không cần nhập
                },
                {
                    selector: 'input[name="phone"]',
                    title: 'Số điện thoại',
                    description: 'Kiểm tra số điện thoại liên hệ của bệnh viện.',
                    waitForAction: 'view',
                },
                {
                    selector: 'input[name="address"]',
                    title: 'Địa chỉ',
                    description: 'Kiểm tra địa chỉ đầy đủ của bệnh viện.',
                    waitForAction: 'view',
                },
                {
                    selector: 'textarea[name="description"], .ck-editor, [class*="ck-editor"]',
                    title: 'Mô tả bệnh viện',
                    description:
                        'Nhập mô tả về bệnh viện của bạn. Đây là thông tin quan trọng để bệnh nhân hiểu về bệnh viện.',
                    waitForAction: 'input',
                },
                {
                    selector:
                        'button[type="submit"], button:contains("Lưu"), button:contains("Cập nhật")',
                    title: 'Lưu thông tin',
                    description:
                        'Sau khi hoàn tất, nhấp vào nút "Lưu" hoặc "Cập nhật" để lưu thông tin cập nhật.',
                    waitForAction: 'click',
                },
            ],
        },
        {
            menuSelector: '[data-tour-id="menu-item-quản-lí-chuyên-khoa"]',
            path: buildPath(PATHS.HOSPITAL.ROOT, PATHS.HOSPITAL.SPECIALTIES.ROOT),
            title: 'Bước 2: Quản lí chuyên khoa',
            description:
                'Quản lý các chuyên khoa mà bệnh viện của bạn cung cấp. Đây là bước đầu tiên trong việc thiết lập dịch vụ.',
            pageSteps: [
                {
                    selector: 'input[type="search"]',
                    title: 'Tìm kiếm chuyên khoa',
                    description:
                        'Sử dụng thanh tìm kiếm để tìm nhanh chuyên khoa bạn muốn chọn. Bạn có thể nhập tên chuyên khoa vào đây.',
                    waitForAction: 'optional', // Tùy chọn
                },
                {
                    selector:
                        '.specialties-grid, [class*="specialtiesGrid"], [class*="specialties-grid"]',
                    title: 'Danh sách chuyên khoa',
                    description:
                        'Đây là danh sách tất cả các chuyên khoa có sẵn. Hãy xem qua danh sách này.',
                    waitForAction: 'view',
                },
                {
                    selector: 'input[type="checkbox"]',
                    title: 'Chọn chuyên khoa',
                    description:
                        'Click vào checkbox bên cạnh các chuyên khoa mà bệnh viện của bạn cung cấp để chọn. Hãy chọn ít nhất một chuyên khoa.',
                    waitForAction: 'click',
                },
                {
                    selector: 'button:contains("Lưu"), button[type="button"]:has-text("Lưu")',
                    title: 'Lưu lựa chọn',
                    description:
                        'Sau khi đã chọn các chuyên khoa, nhấp vào nút "Lưu" để lưu lại lựa chọn của bạn.',
                    waitForAction: 'click',
                },
            ],
        },
        {
            menuSelector: '[data-tour-id="menu-item-quản-lý-dịch-vụ-bác-sĩ"]',
            path: buildPath(PATHS.HOSPITAL.ROOT, PATHS.HOSPITAL.SERVICE_TYPES.ROOT),
            title: 'Bước 3: Quản lý dịch vụ bác sĩ',
            description:
                'Thiết lập các loại dịch vụ mà bác sĩ trong bệnh viện có thể cung cấp cho bệnh nhân.',
            pageSteps: [
                {
                    selector: 'input[type="search"]',
                    title: 'Tìm kiếm loại dịch vụ',
                    description: 'Sử dụng thanh tìm kiếm để tìm nhanh loại dịch vụ bạn muốn chọn.',
                    waitForAction: 'optional',
                },
                {
                    selector: '[class*="serviceTypesGrid"], [class*="service-types-grid"], .grid',
                    title: 'Danh sách loại dịch vụ',
                    description:
                        'Đây là danh sách tất cả các loại dịch vụ có sẵn. Hãy xem qua danh sách này.',
                    waitForAction: 'view',
                },
                {
                    selector: 'input[type="checkbox"]',
                    title: 'Chọn loại dịch vụ',
                    description:
                        'Click vào checkbox để chọn các loại dịch vụ mà bác sĩ có thể cung cấp. Hãy chọn ít nhất một loại dịch vụ.',
                    waitForAction: 'click',
                },
                {
                    selector: 'button:contains("Lưu"), button[type="button"]:has-text("Lưu")',
                    title: 'Lưu cài đặt',
                    description:
                        'Sau khi đã chọn các loại dịch vụ, nhấp vào nút "Lưu" để lưu lại lựa chọn của bạn.',
                    waitForAction: 'click',
                },
            ],
        },
        {
            menuSelector: '[data-tour-id="menu-item-quản-lý-bác-sĩ"]',
            path: buildPath(PATHS.HOSPITAL.ROOT, PATHS.HOSPITAL.DOCTORS.ROOT),
            title: 'Bước 4: Quản lý bác sĩ',
            description: 'Thêm và quản lý thông tin các bác sĩ làm việc tại bệnh viện của bạn.',
            pageSteps: [
                {
                    selector:
                        'a[href*="add"], button:contains("Thêm"), button:contains("thêm"), a[href*="/doctors/add"]',
                    title: 'Thêm bác sĩ mới',
                    description:
                        'Nhấp vào nút "Thêm bác sĩ" hoặc "Thêm mới" để bắt đầu thêm bác sĩ vào hệ thống.',
                    waitForAction: 'click',
                },
                {
                    selector: 'table, .table, [class*="table"]',
                    title: 'Danh sách bác sĩ',
                    description:
                        'Xem danh sách tất cả các bác sĩ đã được thêm vào hệ thống. Bạn có thể chỉnh sửa hoặc xóa thông tin ở đây.',
                    waitForAction: 'view',
                },
            ],
        },
        {
            menuSelector: '[data-tour-id="menu-item-quản-lý-dịch-vụ-bệnh-viện"]',
            path: buildPath(PATHS.HOSPITAL.ROOT, PATHS.HOSPITAL.SERVICE_MEDICALS.ROOT),
            title: 'Bước 5: Quản lý dịch vụ bệnh viện',
            description: 'Thiết lập các dịch vụ y tế mà bệnh viện cung cấp cho bệnh nhân.',
            pageSteps: [
                {
                    selector: 'input[type="search"]',
                    title: 'Tìm kiếm dịch vụ',
                    description: 'Sử dụng thanh tìm kiếm để tìm nhanh dịch vụ bạn muốn chọn.',
                    waitForAction: 'optional',
                },
                {
                    selector: '[class*="serviceMedicalsGrid"], [class*="grid"], .grid',
                    title: 'Danh sách dịch vụ bệnh viện',
                    description:
                        'Đây là danh sách tất cả các dịch vụ bệnh viện có sẵn. Hãy xem qua danh sách này.',
                    waitForAction: 'view',
                },
                {
                    selector: 'input[type="checkbox"]',
                    title: 'Chọn dịch vụ bệnh viện',
                    description:
                        'Click vào checkbox để chọn các dịch vụ mà bệnh viện cung cấp. Hãy chọn ít nhất một dịch vụ.',
                    waitForAction: 'click',
                },
                {
                    selector: 'button:contains("Lưu"), button[type="button"]:has-text("Lưu")',
                    title: 'Lưu lựa chọn',
                    description:
                        'Sau khi đã chọn các dịch vụ, nhấp vào nút "Lưu" để lưu lại lựa chọn của bạn.',
                    waitForAction: 'click',
                },
            ],
        },
        {
            menuSelector: '[data-tour-id="menu-item-quản-lí-dịch-vụ-y-tế"]',
            path: buildPath(PATHS.HOSPITAL.ROOT, PATHS.HOSPITAL.SERVICES.ROOT),
            title: 'Bước 6: Quản lí dịch vụ y tế',
            description: 'Quản lý danh sách các dịch vụ y tế chi tiết mà bệnh viện cung cấp.',
            pageSteps: [
                {
                    selector: 'a[href*="add"], button:contains("Thêm"), button:contains("thêm")',
                    title: 'Thêm dịch vụ mới',
                    description:
                        'Nhấp vào nút "Thêm dịch vụ" hoặc "Thêm mới" để bắt đầu thêm dịch vụ y tế vào hệ thống.',
                    waitForAction: 'click',
                },
                {
                    selector: 'table, .table, [class*="table"]',
                    title: 'Danh sách dịch vụ y tế',
                    description:
                        'Xem danh sách tất cả các dịch vụ y tế đã được thêm vào hệ thống. Bạn có thể chỉnh sửa hoặc xóa thông tin ở đây.',
                    waitForAction: 'view',
                },
            ],
        },
        {
            menuSelector: '[data-tour-id="menu-item-quản-lý-lịch-hẹn"]',
            path: buildPath(PATHS.HOSPITAL.ROOT, PATHS.HOSPITAL.APPOINTMENTS.ROOT),
            title: 'Bước 7: Quản lý lịch hẹn',
            description:
                'Theo dõi và quản lý tất cả các lịch hẹn khám của bệnh nhân tại bệnh viện.',
            pageSteps: [
                {
                    selector:
                        'a[href*="new"], button:contains("Thêm"), button:contains("thêm lịch")',
                    title: 'Thêm lịch hẹn mới',
                    description:
                        'Nhấp vào nút "Thêm lịch hẹn" hoặc "Thêm mới" để tạo lịch hẹn khám cho bệnh nhân.',
                    waitForAction: 'click',
                },
                {
                    selector:
                        'a[href*="calendar"], button:contains("Calendar"), button:contains("Lịch")',
                    title: 'Xem lịch',
                    description:
                        'Nhấp vào nút "Calendar" hoặc "Lịch" để xem lịch hẹn dưới dạng lịch.',
                    waitForAction: 'view',
                },
                {
                    selector: 'table, .table, [class*="table"]',
                    title: 'Danh sách lịch hẹn',
                    description:
                        'Xem danh sách tất cả các lịch hẹn khám của bệnh nhân. Bạn có thể xem chi tiết, chỉnh sửa hoặc hủy lịch hẹn ở đây.',
                    waitForAction: 'view',
                },
            ],
        },
        {
            menuSelector: '[data-tour-id="menu-item-quản-lý-tài-khoản"]',
            path: buildPath(PATHS.HOSPITAL.ROOT, PATHS.HOSPITAL.DOCTOR_MANAGEMENT.ROOT),
            title: 'Bước 8: Quản lý tài khoản',
            description: 'Quản lý tài khoản của các bác sĩ và nhân viên trong bệnh viện.',
            pageSteps: [
                {
                    selector: 'input[type="search"], input[placeholder*="Tìm kiếm"]',
                    title: 'Tìm kiếm tài khoản',
                    description:
                        'Sử dụng thanh tìm kiếm để tìm nhanh tài khoản bác sĩ hoặc nhân viên.',
                    waitForAction: 'optional',
                },
                {
                    selector: 'table, .table, [class*="table"]',
                    title: 'Danh sách tài khoản',
                    description:
                        'Xem danh sách tất cả các tài khoản bác sĩ và nhân viên. Bạn có thể khóa, mở khóa hoặc quản lý tài khoản ở đây.',
                    waitForAction: 'view',
                },
            ],
        },
        {
            menuSelector: '[data-tour-id="menu-item-quản-lí-gói-dịch-vụ"]',
            path: buildPath(PATHS.HOSPITAL.ROOT, PATHS.HOSPITAL.SUBSCRIPTION_INFO),
            title: 'Bước 9: Quản lí gói dịch vụ',
            description:
                'Xem thông tin gói dịch vụ đăng ký và quản lý các gói dịch vụ của bệnh viện.',
            pageSteps: [
                {
                    selector: '.card, [class*="subscription"], [class*="plan"]',
                    title: 'Thông tin gói dịch vụ',
                    description:
                        'Xem thông tin chi tiết về gói dịch vụ hiện tại mà bệnh viện đang sử dụng.',
                    waitForAction: 'view',
                },
                {
                    selector: 'a[href*="subscription-plan"], button:contains("Gói dịch vụ")',
                    title: 'Xem các gói dịch vụ',
                    description:
                        'Nhấp vào đây để xem danh sách các gói dịch vụ có sẵn và nâng cấp gói nếu cần.',
                    waitForAction: 'view',
                },
            ],
        },
        {
            menuSelector: '[data-tour-id="menu-item-messages"]',
            path: buildPath(PATHS.HOSPITAL.ROOT, PATHS.HOSPITAL.MESSAGES),
            title: 'Bước 10: Tin nhắn',
            description:
                'Gửi và nhận tin nhắn với bệnh nhân và các thành viên khác trong hệ thống.',
            pageSteps: [
                {
                    selector: '[class*="chat"], [class*="message"], .chat-list, .conversation-list',
                    title: 'Danh sách cuộc trò chuyện',
                    description:
                        'Xem danh sách tất cả các cuộc trò chuyện với bệnh nhân và các thành viên khác.',
                    waitForAction: 'view',
                },
                {
                    selector:
                        'input[type="text"], textarea, [class*="message-input"], [placeholder*="Nhập tin nhắn"]',
                    title: 'Nhập tin nhắn',
                    description:
                        'Nhập tin nhắn vào đây để gửi cho bệnh nhân hoặc các thành viên khác.',
                    waitForAction: 'input',
                },
                {
                    selector:
                        'button[type="submit"], button:contains("Gửi"), [class*="send-button"]',
                    title: 'Gửi tin nhắn',
                    description: 'Nhấp vào nút "Gửi" để gửi tin nhắn sau khi đã nhập nội dung.',
                    waitForAction: 'click',
                },
            ],
        },
    ];

    const navigateToStep = (stepIndex: number) => {
        // Check multiple sources to ensure tour wasn't closed
        const checkUserClosed = localStorage.getItem(STAFF_TOUR_USER_CLOSED_KEY);
        const checkTourCompleted = localStorage.getItem(STAFF_TOUR_STORAGE_KEY);

        console.log('🧭 [NAVIGATE TO STEP] Called', {
            stepIndex,
            userClosedRef: userClosedRef.current,
            localStorage_userClosed: checkUserClosed,
            localStorage_completed: checkTourCompleted,
        });

        if (userClosedRef.current || checkUserClosed === 'true' || checkTourCompleted === 'true') {
            console.log('❌ [NAVIGATE TO STEP] Tour was closed, stopping');
            return;
        }

        if (stepIndex >= tourSteps.length) {
            // Tour completed
            localStorage.setItem(STAFF_TOUR_STORAGE_KEY, 'true');
            localStorage.removeItem(STAFF_TOUR_CURRENT_STEP_KEY);
            localStorage.removeItem(STAFF_TOUR_CURRENT_PAGE_STEP_KEY);
            if (driverObjRef.current) {
                driverObjRef.current.destroy();
            }
            isNavigatingRef.current = false;
            return;
        }

        const step = tourSteps[stepIndex];
        isNavigatingRef.current = true;
        currentStepRef.current = stepIndex;
        currentPageStepRef.current = 0;
        // Save current state
        localStorage.setItem(STAFF_TOUR_CURRENT_STEP_KEY, stepIndex.toString());
        localStorage.setItem(STAFF_TOUR_CURRENT_PAGE_STEP_KEY, '0');

        // Destroy current driver instance if exists
        if (driverObjRef.current) {
            driverObjRef.current.destroy();
            driverObjRef.current = null;
        }

        // First, highlight the menu item
        const menuElement = document.querySelector(step.menuSelector);
        if (menuElement) {
            const menuDriver = driver({
                showProgress: true,
                showButtons: ['next', 'previous', 'close'],
                popoverClass: 'driver-popover-custom',
                progressText: `Bước ${stepIndex + 1} trên ${tourSteps.length}`,
                nextBtnText: 'Tiếp theo →',
                prevBtnText: '← Trước',
                doneBtnText: 'Hoàn thành',
                steps: [
                    {
                        element: step.menuSelector,
                        popover: {
                            title: step.title,
                            description:
                                step.description + ' Nhấp "Tiếp theo" để điều hướng đến trang.',
                            side: 'right' as const,
                            align: 'start' as const,
                            nextBtnText: 'Tiếp theo →',
                            prevBtnText: '← Trước',
                            onNextClick: () => {
                                // When user clicks next, navigate to page
                                menuDriver.destroy();
                                // Navigate to the page
                                if (location.pathname !== step.path) {
                                    navigate(step.path);
                                }
                                // Wait for page to load, then show page guide
                                setTimeout(() => {
                                    if (!userClosedRef.current) {
                                        showPageGuide(stepIndex);
                                    }
                                }, 1000);
                            },
                        },
                    },
                ],
                onDestroyStarted: (_element: any, _step: any, options: any) => {
                    // Check if it's close button
                    if (options && options.isCloseClick) {
                        // User clicked close button - mark tour as completed and stop immediately
                        userClosedRef.current = true;
                        localStorage.setItem(STAFF_TOUR_USER_CLOSED_KEY, 'true');
                        localStorage.setItem(STAFF_TOUR_STORAGE_KEY, 'true');
                        localStorage.removeItem(STAFF_TOUR_CURRENT_STEP_KEY);
                        localStorage.removeItem(STAFF_TOUR_CURRENT_PAGE_STEP_KEY);
                        isNavigatingRef.current = false;

                        // Destroy driver instance immediately
                        menuDriver.destroy();
                        if (driverObjRef.current) {
                            driverObjRef.current.destroy();
                            driverObjRef.current = null;
                        }
                        return;
                    }
                    // Navigate to page if not already there (when clicking Next button)
                    if (!userClosedRef.current) {
                        if (location.pathname !== step.path) {
                            navigate(step.path);
                            setTimeout(() => {
                                if (!userClosedRef.current) {
                                    showPageGuide(stepIndex, 0);
                                }
                            }, 1000);
                        } else {
                            if (!userClosedRef.current) {
                                showPageGuide(stepIndex, 0);
                            }
                        }
                    }
                },
                onDestroyed: () => {
                    menuObserver.disconnect();
                    if (!menuWasClosedByUser) {
                        // If not closed by user, continue normally
                        isNavigatingRef.current = false;
                    }
                },
            });

            driverObjRef.current = menuDriver;

            // Override close button for menu step
            let menuWasClosedByUser = false;
            const overrideMenuCloseButton = () => {
                const popover = document.querySelector('.driver-popover') as HTMLElement;
                if (!popover) return;

                const closeButton =
                    (popover.querySelector('.driver-popover-btn-close') as HTMLElement) ||
                    (popover.querySelector('[aria-label="Close"]') as HTMLElement) ||
                    (popover.querySelector('button[class*="close"]') as HTMLElement);

                if (closeButton) {
                    const newCloseButton = closeButton.cloneNode(true) as HTMLElement;
                    closeButton.parentNode?.replaceChild(newCloseButton, closeButton);

                    const handleCloseClick = (e: MouseEvent) => {
                        e.stopImmediatePropagation();
                        e.preventDefault();

                        menuWasClosedByUser = true;
                        userClosedRef.current = true;
                        localStorage.setItem(STAFF_TOUR_USER_CLOSED_KEY, 'true');
                        localStorage.setItem(STAFF_TOUR_STORAGE_KEY, 'true');
                        localStorage.removeItem(STAFF_TOUR_CURRENT_STEP_KEY);
                        localStorage.removeItem(STAFF_TOUR_CURRENT_PAGE_STEP_KEY);
                        menuDriver.destroy();
                        if (driverObjRef.current) {
                            driverObjRef.current.destroy();
                            driverObjRef.current = null;
                        }
                        isNavigatingRef.current = false;
                        console.log('Tour closed by user from menu step');
                    };

                    newCloseButton.addEventListener('click', handleCloseClick, { capture: true });
                    newCloseButton.addEventListener('mousedown', handleCloseClick, {
                        capture: true,
                    });
                    newCloseButton.onclick = handleCloseClick as any;
                }
            };

            const menuObserver = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === 1) {
                            const element = node as HTMLElement;
                            if (
                                element.classList?.contains('driver-popover') ||
                                element.querySelector?.('.driver-popover')
                            ) {
                                setTimeout(() => {
                                    overrideMenuCloseButton();
                                }, 10);
                            }
                        }
                    });
                });
            });

            menuObserver.observe(document.body, {
                childList: true,
                subtree: true,
            });

            setTimeout(() => {
                overrideMenuCloseButton();
            }, 100);

            menuDriver.drive();
        } else {
            // Menu item not found, directly navigate and show page guide
            if (location.pathname !== step.path) {
                navigate(step.path);
            }
            setTimeout(() => {
                showPageGuide(stepIndex);
            }, 1000);
        }
    };

    // Helper function to find element by text content
    const findElementByText = (selector: string, textContent: string): HTMLElement | null => {
        const elements = Array.from(document.querySelectorAll(selector));
        return (
            (elements.find((el) => {
                const text = el.textContent?.trim().toLowerCase() || '';
                return text.includes(textContent.toLowerCase());
            }) as HTMLElement | null) || null
        );
    };

    // Helper function to find element using multiple selectors (including text-based)
    const findElement = (selectorString: string): HTMLElement | null => {
        // Split by comma to handle multiple selectors
        const selectors = selectorString.split(',').map((s) => s.trim());

        for (const selector of selectors) {
            // Check if it's a text-based selector (contains :contains or :has-text)
            if (selector.includes(':contains(') || selector.includes(':has-text(')) {
                // Extract base selector and text
                const match = selector.match(/([\w[\]="\s*-]+):(?:contains|has-text)\("([^"]+)"\)/);
                if (match) {
                    const baseSelector = match[1].trim();
                    const text = match[2];
                    const found = findElementByText(baseSelector, text);
                    if (found) return found;
                }
            } else {
                // Regular CSS selector
                const element = document.querySelector(selector);
                if (element) return element as HTMLElement;
            }
        }

        return null;
    };

    const showPageGuide = (stepIndex: number, pageStepIndex: number = 0) => {
        // Check multiple sources to ensure tour wasn't closed
        const checkUserClosed = localStorage.getItem(STAFF_TOUR_USER_CLOSED_KEY);
        const checkTourCompleted = localStorage.getItem(STAFF_TOUR_STORAGE_KEY);

        console.log('📖 [SHOW PAGE GUIDE] Called', {
            stepIndex,
            pageStepIndex,
            userClosedRef: userClosedRef.current,
            localStorage_userClosed: checkUserClosed,
            localStorage_completed: checkTourCompleted,
        });

        if (userClosedRef.current || checkUserClosed === 'true' || checkTourCompleted === 'true') {
            console.log('❌ [SHOW PAGE GUIDE] Tour was closed, stopping');
            return;
        }

        if (stepIndex >= tourSteps.length) {
            // Tour completed
            localStorage.setItem(STAFF_TOUR_STORAGE_KEY, 'true');
            localStorage.removeItem(STAFF_TOUR_CURRENT_STEP_KEY);
            localStorage.removeItem(STAFF_TOUR_CURRENT_PAGE_STEP_KEY);
            if (driverObjRef.current) {
                driverObjRef.current.destroy();
            }
            isNavigatingRef.current = false;
            return;
        }

        const step = tourSteps[stepIndex];

        // Save current state
        currentStepRef.current = stepIndex;
        currentPageStepRef.current = pageStepIndex;
        localStorage.setItem(STAFF_TOUR_CURRENT_STEP_KEY, stepIndex.toString());
        localStorage.setItem(STAFF_TOUR_CURRENT_PAGE_STEP_KEY, pageStepIndex.toString());

        // Check if this page has detailed steps
        if (step.pageSteps && step.pageSteps.length > 0) {
            // Show detailed page steps
            if (pageStepIndex >= step.pageSteps.length) {
                // All page steps completed, move to next page
                setTimeout(() => {
                    // Double-check before continuing - check multiple sources
                    const checkUserClosed = localStorage.getItem(STAFF_TOUR_USER_CLOSED_KEY);
                    const checkTourCompleted = localStorage.getItem(STAFF_TOUR_STORAGE_KEY);
                    if (
                        !userClosedRef.current &&
                        checkUserClosed !== 'true' &&
                        checkTourCompleted !== 'true'
                    ) {
                        navigateToStep(stepIndex + 1);
                    }
                }, 300);
                return;
            }

            const pageStep = step.pageSteps[pageStepIndex];

            // Track if tour was closed by user (declare outside for access in callbacks)
            let wasClosedByUser = false;

            // Global click handler for close button - simple and reliable approach
            const handleGlobalClick = (e: MouseEvent) => {
                const target = e.target as HTMLElement;

                // Check if clicked element is a close button of driver.js popover
                const isCloseButton =
                    target.closest('.driver-popover-btn-close') ||
                    target.closest('[aria-label="Close"]') ||
                    target.classList.contains('driver-popover-btn-close') ||
                    (target.closest('.driver-popover') &&
                        target.closest('button')?.classList.contains('driver-popover-btn-close'));

                if (isCloseButton) {
                    console.log('🚫 [TOUR CLOSE] Close button clicked via global listener!');

                    // Mark tour as completed IMMEDIATELY
                    userClosedRef.current = true;
                    wasClosedByUser = true;
                    localStorage.setItem(STAFF_TOUR_USER_CLOSED_KEY, 'true');
                    localStorage.setItem(STAFF_TOUR_STORAGE_KEY, 'true');
                    localStorage.removeItem(STAFF_TOUR_CURRENT_STEP_KEY);
                    localStorage.removeItem(STAFF_TOUR_CURRENT_PAGE_STEP_KEY);

                    // Stop all navigation
                    isNavigatingRef.current = false;

                    // Destroy driver instance
                    if (driverObjRef.current) {
                        try {
                            driverObjRef.current.destroy();
                            driverObjRef.current = null;
                        } catch (err) {
                            console.error('Error destroying driver:', err);
                        }
                    }

                    // Remove global listener
                    document.removeEventListener('click', handleGlobalClick, true);

                    console.log('✅ [TOUR CLOSE] Tour stopped - marked as completed');
                }
            };

            // Wait for element to load
            const checkElement = (retries = 1) => {
                const element = findElement(pageStep.selector);

                if (element) {
                    // Element found, show guide
                    // Add global click listener BEFORE creating driver
                    document.addEventListener('click', handleGlobalClick, true);

                    const driverObj = driver({
                        showProgress: true,
                        showButtons: ['next', 'previous', 'close'],
                        popoverClass: 'driver-popover-custom',
                        progressText: `Bước ${stepIndex + 1}.${pageStepIndex + 1} - Trang ${stepIndex + 1}`,
                        nextBtnText: 'Bỏ qua →',
                        prevBtnText: '← Trước',
                        doneBtnText: 'Hoàn thành',
                        steps: [
                            {
                                element: element,
                                popover: {
                                    title: pageStep.title,
                                    description:
                                        pageStep.description +
                                        ' Sau khi đã làm theo hướng dẫn hoặc muốn bỏ qua, nhấp "Bỏ qua" để chuyển sang bước tiếp theo.',
                                    side: 'top' as const,
                                    align: 'start' as const,
                                    nextBtnText: 'Bỏ qua →',
                                    prevBtnText: '← Trước',
                                    onNextClick: () => {
                                        // Check if tour was closed
                                        const currentUserClosed = localStorage.getItem(
                                            STAFF_TOUR_USER_CLOSED_KEY
                                        );

                                        if (
                                            currentUserClosed === 'true' ||
                                            userClosedRef.current ||
                                            wasClosedByUser
                                        ) {
                                            return;
                                        }

                                        // Remove listener before navigation
                                        document.removeEventListener(
                                            'click',
                                            handleGlobalClick,
                                            true
                                        );

                                        // User clicked "Bỏ qua" button, move to next page step
                                        driverObj.destroy();
                                        setTimeout(() => {
                                            // Double-check before continuing
                                            const checkUserClosed = localStorage.getItem(
                                                STAFF_TOUR_USER_CLOSED_KEY
                                            );

                                            if (
                                                checkUserClosed !== 'true' &&
                                                !userClosedRef.current &&
                                                !wasClosedByUser
                                            ) {
                                                showPageGuide(stepIndex, pageStepIndex + 1);
                                            }
                                        }, 300);
                                    },
                                },
                            },
                        ],
                        onDestroyStarted: () => {
                            // Check if tour was closed by user
                            const currentUserClosed = localStorage.getItem(
                                STAFF_TOUR_USER_CLOSED_KEY
                            );
                            if (
                                currentUserClosed === 'true' ||
                                userClosedRef.current ||
                                wasClosedByUser
                            ) {
                                // Remove global listener if tour was closed
                                document.removeEventListener('click', handleGlobalClick, true);
                            }
                        },
                        onDestroyed: () => {
                            // Check if tour was closed by user
                            const currentUserClosed = localStorage.getItem(
                                STAFF_TOUR_USER_CLOSED_KEY
                            );
                            const currentTourCompleted =
                                localStorage.getItem(STAFF_TOUR_STORAGE_KEY);

                            // Remove global listener
                            document.removeEventListener('click', handleGlobalClick, true);

                            if (
                                currentUserClosed === 'true' ||
                                currentTourCompleted === 'true' ||
                                wasClosedByUser ||
                                userClosedRef.current
                            ) {
                                // Tour was closed by user - do NOT continue
                                isNavigatingRef.current = false;
                                return;
                            }

                            // If not closed by user, continue normally
                            isNavigatingRef.current = false;
                        },
                    });

                    driverObjRef.current = driverObj;
                    driverObj.drive();
                } else if (retries > 0) {
                    // Element not found, retry
                    setTimeout(() => checkElement(retries - 1), 500);
                } else {
                    // Element not found after max retries - skip this step and continue
                    // This handles cases where buttons don't appear when data hasn't changed
                    console.warn(
                        `Tour: Element not found for selector "${pageStep.selector}", skipping step: ${pageStep.title}`
                    );

                    // Automatically move to next step after a short delay
                    setTimeout(() => {
                        // Double-check before continuing
                        const checkUserClosed = localStorage.getItem(STAFF_TOUR_USER_CLOSED_KEY);
                        if (checkUserClosed !== 'true' && !userClosedRef.current) {
                            showPageGuide(stepIndex, pageStepIndex + 1);
                        }
                    }, 500);
                }
            };

            checkElement();
        } else {
            // No detailed steps, show generic page guide
            const checkPageContent = (retries = 10) => {
                const pageElement =
                    document.querySelector(
                        step.pageSelector || '.content, main, [class*="content"]'
                    ) ||
                    document.querySelector('main') ||
                    document.querySelector('.content') ||
                    document.querySelector('.page-wrapper');

                if (pageElement || retries === 0) {
                    // Global click handler for close button
                    const handleGlobalClickGeneric = (e: MouseEvent) => {
                        const target = e.target as HTMLElement;

                        const isCloseButton =
                            target.closest('.driver-popover-btn-close') ||
                            target.closest('[aria-label="Close"]') ||
                            target.classList.contains('driver-popover-btn-close') ||
                            (target.closest('.driver-popover') &&
                                target
                                    .closest('button')
                                    ?.classList.contains('driver-popover-btn-close'));

                        if (isCloseButton) {
                            // Mark tour as completed
                            userClosedRef.current = true;
                            localStorage.setItem(STAFF_TOUR_USER_CLOSED_KEY, 'true');
                            localStorage.setItem(STAFF_TOUR_STORAGE_KEY, 'true');
                            localStorage.removeItem(STAFF_TOUR_CURRENT_STEP_KEY);
                            localStorage.removeItem(STAFF_TOUR_CURRENT_PAGE_STEP_KEY);
                            isNavigatingRef.current = false;

                            // Destroy driver
                            if (driverObjRef.current) {
                                try {
                                    driverObjRef.current.destroy();
                                    driverObjRef.current = null;
                                } catch (err) {
                                    console.error('Error destroying driver:', err);
                                }
                            }

                            // Remove listener
                            document.removeEventListener('click', handleGlobalClickGeneric, true);
                        }
                    };

                    // Add global click listener
                    document.addEventListener('click', handleGlobalClickGeneric, true);

                    const driverObj = driver({
                        showProgress: true,
                        showButtons: ['next', 'previous', 'close'],
                        popoverClass: 'driver-popover-custom',
                        progressText: `Bước ${stepIndex + 1} trên ${tourSteps.length}`,
                        nextBtnText: 'Tiếp theo →',
                        prevBtnText: '← Trước',
                        doneBtnText: 'Hoàn thành',
                        steps: [
                            {
                                element: pageElement || 'body',
                                popover: {
                                    title: step.pageTitle || step.title,
                                    description: step.pageDescription || step.description,
                                    side: 'top' as const,
                                    align: 'start' as const,
                                    nextBtnText:
                                        stepIndex === tourSteps.length - 1
                                            ? 'Hoàn thành'
                                            : 'Tiếp theo →',
                                    prevBtnText: '← Trước',
                                    onNextClick: () => {
                                        // Remove listener before navigation
                                        document.removeEventListener(
                                            'click',
                                            handleGlobalClickGeneric,
                                            true
                                        );

                                        isNavigatingRef.current = true;
                                        driverObj.destroy();
                                        setTimeout(() => {
                                            navigateToStep(stepIndex + 1);
                                        }, 300);
                                    },
                                },
                            },
                        ],
                        onDestroyStarted: () => {
                            const currentUserClosed = localStorage.getItem(
                                STAFF_TOUR_USER_CLOSED_KEY
                            );
                            if (currentUserClosed === 'true' || userClosedRef.current) {
                                document.removeEventListener(
                                    'click',
                                    handleGlobalClickGeneric,
                                    true
                                );
                            }
                        },
                        onDestroyed: () => {
                            // Remove listener
                            document.removeEventListener('click', handleGlobalClickGeneric, true);
                            isNavigatingRef.current = false;
                        },
                    });

                    driverObjRef.current = driverObj;
                    driverObj.drive();
                } else {
                    setTimeout(() => checkPageContent(retries - 1), 500);
                }
            };

            checkPageContent();
        }
    };

    const initializeTour = () => {
        // Start with first step
        navigateToStep(0);
    };

    return {
        startTour: initializeTour,
        isTourCompleted: () => localStorage.getItem(STAFF_TOUR_STORAGE_KEY) === 'true',
        resetTour: () => {
            localStorage.removeItem(STAFF_TOUR_STORAGE_KEY);
            if (driverObjRef.current) {
                driverObjRef.current.destroy();
            }
        },
    };
};
