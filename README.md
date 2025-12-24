# 🛠️ BookingCare - Hệ Thống Admin Portal

## 📋 Mục Lục

- [Giới Thiệu](#giới-thiệu)
- [Mô Tả Dự Án](#mô-tả-dự-án)
- [Tính Năng Chính](#tính-năng-chính)
- [Công Nghệ Sử Dụng](#công-nghệ-sử-dụng)
- [Yêu Cầu Hệ Thống](#yêu-cầu-hệ-thống)
- [Hướng Dẫn Cài Đặt](#hướng-dẫn-cài-đặt)
- [Hướng Dẫn Sử Dụng](#hướng-dẫn-sử-dụng)
- [Cấu Trúc Dự Án](#cấu-trúc-dự-án)
- [API Integration](#api-integration)
- [Troubleshooting](#troubleshooting)

## 🎯 Giới Thiệu

**BookingCare Admin Portal** là một nền tảng quản lý toàn diện dành cho các quản trị viên hệ thống. Giao diện này cho phép quản lý tất cả các khía cạnh của hệ thống BookingCare từ quản lý người dùng, bác sĩ, lịch khám, thanh toán đến báo cáo chi tiết.

### Lợi Ích Cho Quản Trị Viên

- 👥 Quản lý toàn bộ người dùng hệ thống
- 🏥 Quản lý bác sĩ, bệnh viện, phòng khám
- 📅 Quản lý lịch khám và scheduling
- 💳 Giám sát thanh toán và giao dịch
- 📊 Xem báo cáo chi tiết và thống kê
- 🎁 Quản lý khuyến mại và voucher
- ⚙️ Cấu hình hệ thống
- 📱 Responsive trên tất cả thiết bị

## 📖 Mô Tả Dự Án

### Tổng Quan

Admin Portal của BookingCare cung cấp một bảng điều khiển mạnh mẽ và linh hoạt để quản lý toàn bộ hệ thống. Nó bao gồm:

1. **Dashboard** - Tổng quan hệ thống với metrics chính
2. **User Management** - Quản lý tài khoản người dùng, role, permission
3. **Doctor Management** - Quản lý bác sĩ, chuyên khoa, rating
4. **Hospital Management** - Quản lý bệnh viện, phòng khám, cơ sở vật chất
5. **Appointment Management** - Xem, xác nhận, hủy các lịch khám
6. **Schedule Management** - Quản lý lịch làm việc bác sĩ
7. **Payment Management** - Giám sát thanh toán, hoàn tiền, giao dịch
8. **Report & Analytics** - Báo cáo doanh thu, sử dụng dịch vụ, phân tích dữ liệu
9. **Promotion Management** - Quản lý mã khuyến mại, chương trình khuyến mại
10. **System Settings** - Cấu hình hệ thống, email, SMS, payment gateway
11. **Audit Logs** - Theo dõi hoạt động quản trị viên
12. **Support Tickets** - Quản lý các yêu cầu hỗ trợ từ người dùng

### Kiến Trúc Ứng Dụng

```
Admin Portal
├── Authentication & Authorization
│   ├── Login/Logout
│   ├── Role-Based Access Control (RBAC)
│   ├── Permission Management
│   └── Session Management
├── Dashboard & Analytics
│   ├── KPI Metrics
│   ├── Charts & Graphs
│   ├── Real-time Notifications
│   └── Export Reports
├── Resource Management
│   ├── Users Management
│   ├── Doctors Management
│   ├── Hospitals Management
│   ├── Appointments Management
│   ├── Schedules Management
│   ├── Payments Management
│   └── Promotions Management
├── System Configuration
│   ├── General Settings
│   ├── Email Configuration
│   ├── SMS Configuration
│   ├── Payment Gateway
│   └── Integration Settings
└── Monitoring & Support
    ├── Audit Logs
    ├── System Logs
    ├── Support Tickets
    └── User Activity Tracking
```

## ✨ Tính Năng Chính

### 1. 🔐 Xác Thực & Phân Quyền

- Đăng nhập admin với email/password
- Multi-factor authentication (MFA)
- Role-based access control (Admin, Manager, Staff, Supervisor)
- Permission management chi tiết
- Session management & timeout
- Audit log cho tất cả đăng nhập/đăng xuất

### 2. 📊 Dashboard & Analytics

- **KPI Metrics**:
    - Tổng doanh thu (hôm nay, tuần, tháng, năm)
    - Số appointment (hoàn thành, hủy, pending)
    - Số user mới
    - Tỷ lệ completion
    - User activity
- **Charts & Visualizations**:
    - Revenue trend chart
    - Appointment status pie chart
    - Doctor performance chart
    - User growth chart
    - Payment method distribution
- **Export Options**:
    - Export PDF reports
    - Export Excel spreadsheets
    - Schedule automatic reports

### 3. 👥 Quản Lý Người Dùng

- **User List**:
    - Danh sách tất cả users
    - Filter/Sort by: name, email, status, role, registration date
    - Search users
    - Pagination
- **User Details**:
    - Xem thông tin cá nhân
    - Xem lịch sử appointment
    - Xem lịch sử thanh toán
    - View user activity logs
- **User Actions**:
    - Tạo user mới
    - Chỉnh sửa thông tin user
    - Deactivate/Activate user
    - Reset password
    - Assign role
    - View audit trail

- **User Roles**:
    - Patient
    - Doctor
    - Hospital Manager
    - Admin

### 4. 👨‍⚕️ Quản Lý Bác Sĩ

- **Doctor List**:
    - Danh sách bác sĩ
    - Filter by: specialty, hospital, rating, status
    - Search doctors
    - View doctor performance metrics
- **Doctor Details**:
    - Thông tin cá nhân
    - Chuyên khoa
    - Giáng/xếp loại
    - Giờ làm việc
    - Lịch sử appointment
    - Đánh giá và rating
- **Doctor Management**:
    - Thêm bác sĩ mới
    - Chỉnh sửa thông tin
    - Approve/Reject doctor registration
    - Assign hospitals/specialties
    - Deactivate/Activate
    - View performance report

### 5. 🏥 Quản Lý Bệnh Viện

- **Hospital List**:
    - Danh sách bệnh viện/phòng khám
    - Filter by: city, type, status
    - Search hospitals
- **Hospital Details**:
    - Thông tin chi tiết
    - Địa chỉ, điện thoại, website
    - Danh sách bác sĩ
    - Số appointment
    - Rating trung bình
- **Hospital Management**:
    - Thêm bệnh viện
    - Chỉnh sửa thông tin
    - Manage branches
    - Manage departments
    - Deactivate/Activate

### 6. 📅 Quản Lý Lịch Khám

- **Appointment Dashboard**:
    - Danh sách appointments với status
    - Filter: date, doctor, hospital, status, payment
    - Search appointments
- **Appointment Details**:
    - Patient info
    - Doctor info
    - Appointment date/time
    - Service details
    - Payment info
    - Notes & history
- **Appointment Actions**:
    - Xem chi tiết
    - Xác nhận appointment
    - Hủy appointment
    - Reschedule
    - Add notes
    - View communication logs

### 7. 📆 Quản Lý Lịch Làm Việc

- **Schedule Management**:
    - Xem lịch làm việc bác sĩ
    - Thêm/Xóa giờ khám
    - Quản lý ngày lễ
    - Bulk schedule management
    - Validate availability
- **Schedule Conflicts**:
    - Phát hiện xung đột
    - Thông báo lỗi
    - Gợi ý giải pháp

### 8. 💳 Quản Lý Thanh Toán

- **Payment Dashboard**:
    - Danh sách thanh toán
    - Filter: status, date, amount, method
    - Total revenue metrics
- **Payment Details**:
    - Giao dịch thông tin
    - Patient & appointment info
    - Payment method
    - Amount & fee
    - Status & timestamp
- **Payment Actions**:
    - Xem chi tiết
    - Confirm payment
    - Process refund
    - View invoice
    - Download receipt
- **Revenue Reports**:
    - Daily/Monthly/Yearly revenue
    - Revenue by doctor
    - Revenue by hospital
    - Revenue by service
    - Payment method breakdown

### 9. 📈 Báo Cáo & Thống Kê

- **Report Types**:
    - Revenue reports
    - Appointment statistics
    - Doctor performance
    - User activity
    - System health
- **Report Features**:
    - Custom date range
    - Multiple export formats (PDF, Excel, CSV)
    - Scheduled reports
    - Email delivery
    - Data visualization
- **Metrics Tracked**:
    - Total revenue
    - Number of appointments
    - Average rating
    - User registration
    - Payment success rate
    - System uptime

### 10. 🎁 Quản Lý Khuyến Mại

- **Promotion List**:
    - Danh sách voucher/promotion
    - Filter: status, type, date, usage count
- **Promotion Details**:
    - Code, discount amount/percentage
    - Valid date range
    - Usage count & limit
    - Applicable services/doctors
- **Promotion Actions**:
    - Tạo promotion
    - Chỉnh sửa
    - Deactivate
    - View usage analytics
    - Export used codes

### 11. ⚙️ Quản Lý Hệ Thống

- **General Settings**:
    - App name, logo, theme
    - Default language
    - Currency settings
- **Email Configuration**:
    - SMTP settings
    - Email templates
    - Test send email
- **SMS Configuration**:
    - Provider (Twilio, AWS SNS, ...)
    - Phone settings
    - SMS templates
- **Payment Gateway**:
    - Stripe/Paypal settings
    - Bank transfer info
    - E-wallet integration
- **Notification Settings**:
    - Email notifications
    - SMS alerts
    - Push notification

### 12. 📋 Audit & Logs

- **Audit Log**:
    - Tất cả admin actions
    - User activity logs
    - System events
    - Filter by: user, action, date, resource
    - Export logs
- **System Logs**:
    - Error logs
    - Performance logs
    - Integration logs
    - View & filter logs

## 🛠 Công Nghệ Sử Dụng

### Frontend Framework

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **TailwindCSS** - Styling

### State Management & Data Fetching

- **Redux Toolkit (RTK)** - State management
- **RTK Query** - Data fetching & caching
- **Axios** - HTTP client

### UI Components & Visualization

- **Material-UI (MUI)** - UI component library
- **TanStack Table (React Table)** - Advanced tables
- **Chart.js / Recharts** - Data visualization
- **React Hot Toast** - Notifications

### Routing & Navigation

- **React Router v6** - Client-side routing
- **Dynamic routes** - Protected routes with RBAC

### Form & Validation

- **React Hook Form** - Form handling
- **Zod / Yup** - Schema validation
- **Date Picker** - Date/time selection

### Development Tools

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Husky** - Git hooks
- **Jest/Vitest** - Testing

### Performance & Monitoring

- **React DevTools** - Component inspection
- **Sentry** - Error tracking
- **Google Analytics** - Usage analytics
- **Lighthouse** - Performance audit

## ✅ Yêu Cầu Hệ Thống

### Tối Thiểu

- **OS**: Windows 10+, macOS 10.14+, Linux
- **RAM**: 4GB
- **CPU**: 2 cores
- **Disk**: 500MB free space
- **Browser**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

### Khuyến Nghị

- **OS**: Windows 11, macOS 12+, Ubuntu 20.04+
- **RAM**: 8GB+
- **CPU**: 4+ cores
- **Disk**: 2GB SSD
- **Browser**: Latest Chrome/Firefox/Safari/Edge

### Phần Mềm Cần Thiết

- **Node.js**: v18.0.0 or higher
- **npm** hoặc **yarn**
- **Git**
- **Docker** (cho development)

## 🚀 Hướng Dẫn Cài Đặt

### 1. Clone Repository

```bash
# Clone the repository
git clone https://github.com/Capstone-FA25-MABS/booking-care-system-ui-admin.git
cd booking-care-system-ui-admin

# Hoặc nếu đã clone
git checkout develop
git pull origin develop
```

### 2. Cài Đặt Dependencies

```bash
# Using npm
npm install

# Using yarn
yarn install

# Using pnpm
pnpm install
```

### 3. Thiết Lập Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env file
nano .env
```

**Cấu hình .env:**

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:5001/api
VITE_API_GATEWAY_URL=http://localhost:5001

# Service URLs
VITE_AUTH_SERVICE_URL=http://localhost:6003
VITE_USER_SERVICE_URL=http://localhost:6016

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_SENTRY=false

# Admin Panel Config
VITE_APP_NAME=BookingCare Admin
VITE_APP_VERSION=1.0.0
VITE_DEBUG_MODE=false
VITE_ITEMS_PER_PAGE=10
```

### 4. Khởi Động Development Server

```bash
# Start dev server
npm run dev

# Server chạy tại http://localhost:3001
```

### 5. Kiểm Tra Ứng Dụng

Mở browser truy cập:

```
http://localhost:3001
```

Đăng nhập với admin account:

- Email: admin@bookingcare.com
- Password: (set up từ backend)

## 📖 Hướng Dẫn Sử Dụng

### Cho Administrators

#### 1. Đăng Nhập

```
1. Truy cập http://localhost:3001
2. Nhập email admin
3. Nhập mật khẩu
4. Click "Đăng Nhập"
5. (Optional) Nhập OTP nếu enabled MFA
```

#### 2. Dashboard Overview

```
1. Sau khi đăng nhập, bạn sẽ thấy Dashboard
2. Metrics chính:
   - Total Revenue (hôm nay, tuần, tháng)
   - Total Appointments
   - New Users
   - Completion Rate
3. Các biểu đồ:
   - Revenue Trend
   - Appointment Status
   - Doctor Performance
4. Recent Activities
```

#### 3. Quản Lý Người Dùng

```
Trong Menu > Users:

1. Xem Danh Sách
   - Click "Users" từ sidebar
   - Xem tất cả users
   - Search/Filter users
   - Xem user details

2. Thêm User
   - Click "Add User" button
   - Nhập thông tin:
     - Email
     - Full Name
     - Phone
     - Role
   - Click "Create"

3. Chỉnh Sửa User
   - Click user từ danh sách
   - Edit thông tin
   - Click "Save"

4. Deactivate/Activate
   - Chọn user
   - Click "Deactivate" hoặc "Activate"
```

#### 4. Quản Lý Bác Sĩ

```
Trong Menu > Doctors:

1. Xem Danh Sách
   - Click "Doctors"
   - Filter by specialty, hospital, status
   - Search doctor

2. Chi Tiết Bác Sĩ
   - Click doctor name
   - Xem:
     - Personal info
     - Specialties
     - Hospital assignments
     - Appointment count
     - Rating & reviews
     - Performance metrics

3. Thêm/Chỉnh Sửa
   - Click "Add Doctor"
   - Nhập thông tin
   - Assign specialties/hospitals
   - Set working hours
   - Click "Save"

4. Quản Lý Schedules
   - Click doctor
   - Go to "Schedules"
   - Add/Remove time slots
   - Set holidays
   - Save changes
```

#### 5. Quản Lý Lịch Khám

```
Trong Menu > Appointments:

1. Xem Danh Sách
   - Click "Appointments"
   - Filter: status, date, doctor, hospital
   - View pending/completed/cancelled

2. Xác Nhận Appointment
   - Click appointment
   - Review details:
     - Patient info
     - Doctor info
     - Date/Time
     - Service & Price
   - Click "Confirm"

3. Hủy Appointment
   - Click appointment
   - Click "Cancel"
   - Nhập lý do
   - Click "Confirm Cancel"

4. Xem Chi Tiết
   - View patient notes
   - View doctor notes (after appointment)
   - View payment info
   - View communication logs
```

#### 6. Quản Lý Thanh Toán

```
Trong Menu > Payments:

1. Xem Danh Sách Thanh Toán
   - Click "Payments"
   - Filter: status, date, amount, method
   - Search by transaction ID

2. Chi Tiết Thanh Toán
   - Click payment
   - View:
     - Transaction ID
     - Patient info
     - Amount
     - Payment method
     - Status
     - Timestamp

3. Xử Lý Hoàn Tiền
   - Click payment
   - Click "Refund"
   - Nhập reason
   - Click "Process Refund"

4. Revenue Report
   - Go to "Reports" > "Revenue"
   - Choose date range
   - View:
     - Daily/Monthly revenue
     - Revenue by doctor
     - Revenue by hospital
     - Revenue by service
     - Payment method breakdown
   - Export report (PDF/Excel)
```

#### 7. Quản Lý Khuyến Mại

```
Trong Menu > Promotions:

1. Xem Danh Sách Promotions
   - Click "Promotions"
   - Filter: status, type, date
   - Search codes

2. Thêm Promotion
   - Click "Add Promotion"
   - Nhập:
     - Code
     - Discount (amount or %)
     - Valid from/to date
     - Usage limit
     - Applicable services/doctors
   - Click "Create"

3. Chỉnh Sửa/Deactivate
   - Click promotion
   - Edit details
   - Click "Save" hoặc "Deactivate"

4. View Analytics
   - Click promotion
   - View:
     - Times used
     - Total discount given
     - Effectiveness
```

#### 8. Cấu Hình Hệ Thống

```
Trong Menu > Settings:

1. General Settings
   - App name
   - Logo/Favicon
   - Theme (light/dark)
   - Default language
   - Currency

2. Email Configuration
   - SMTP server
   - Port, username, password
   - Test send
   - Email templates

3. SMS Configuration
   - Provider (Twilio, etc.)
   - API credentials
   - Test send

4. Payment Gateway
   - Stripe/Paypal keys
   - Bank transfer info
   - Payment methods enable/disable

5. Save Changes
   - Click "Save Settings"
```

#### 9. Xem Báo Cáo

```
Trong Menu > Reports:

1. Revenue Report
   - Choose date range
   - View graphs & metrics
   - Export PDF/Excel

2. Appointment Analytics
   - View appointment count
   - Status breakdown
   - Doctor performance
   - Hospital comparison

3. User Analytics
   - User growth
   - Active users
   - New registrations
   - User retention

4. System Health
   - System uptime
   - API response time
   - Error rate
   - Database metrics
```

#### 10. Audit Logs

```
Dalam Menu > Audit Logs:

1. View All Logs
   - Click "Audit Logs"
   - Filter: user, action, date, resource
   - Search logs

2. Log Details
   - Click log entry
   - View:
     - User who performed action
     - Action type
     - Resource modified
     - Changes made
     - Timestamp
     - IP address

3. Export Logs
   - Click "Export"
   - Choose format (PDF/Excel)
   - Download report
```

### Untuk Developers

#### Development Workflow

```bash
# 1. Create feature branch
git checkout -b feature/amazing-admin-feature

# 2. Make changes
# Edit files

# 3. Run linter
npm run lint

# 4. Fix linter issues
npm run lint:fix

# 5. Run tests
npm run test

# 6. Run tests with coverage
npm run test:coverage

# 7. Build
npm run build

# 8. Preview build
npm run preview

# 9. Commit
git add .
git commit -m "feat: add amazing feature"

# 10. Push
git push origin feature/amazing-admin-feature

# 11. Create Pull Request
```

#### Available Scripts

```bash
# Development
npm run dev                 # Start dev server (port 3001)

# Building
npm run build              # Build for production
npm run build:analyze      # Analyze bundle size
npm run preview            # Preview production build

# Testing
npm run test               # Run unit tests
npm run test:watch        # Run tests in watch mode
npm run test:coverage     # Run tests with coverage
npm run test:ui           # Run tests with UI

# Code Quality
npm run lint              # Run ESLint
npm run lint:fix          # Fix linting errors
npm run format            # Format with Prettier
npm run format:check      # Check formatting
npm run typecheck         # TypeScript type checking

# Docker
npm run docker:build      # Build Docker image
npm run docker:run        # Run Docker container
npm run docker:stop       # Stop Docker container
```

## 📁 Cấu Trúc Dự Án

```
booking-care-system-ui-admin/
├── src/
│   ├── App.tsx                         # Root component
│   ├── main.tsx                        # Entry point
│   │
│   ├── assets/                         # Static assets
│   │   ├── images/
│   │   ├── styles/
│   │   └── icons/
│   │
│   ├── components/                     # Reusable components
│   │   ├── Common/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── TopNavbar.tsx
│   │   ├── Layout/
│   │   │   ├── AdminLayout.tsx
│   │   │   └── AuthLayout.tsx
│   │   ├── Dashboard/
│   │   │   ├── StatCard.tsx
│   │   │   ├── RevenueChart.tsx
│   │   │   └── ActivityFeed.tsx
│   │   ├── Tables/
│   │   │   ├── DataTable.tsx
│   │   │   ├── UserTable.tsx
│   │   │   ├── DoctorTable.tsx
│   │   │   └── AppointmentTable.tsx
│   │   ├── Forms/
│   │   │   ├── UserForm.tsx
│   │   │   ├── DoctorForm.tsx
│   │   │   ├── PromotionForm.tsx
│   │   │   └── SettingsForm.tsx
│   │   ├── Modals/
│   │   │   ├── ConfirmModal.tsx
│   │   │   ├── AddUserModal.tsx
│   │   │   └── AddDoctorModal.tsx
│   │   └── UI/
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       ├── Select.tsx
│   │       ├── Modal.tsx
│   │       ├── Toast.tsx
│   │       └── ...
│   │
│   ├── pages/                          # Page components
│   │   ├── Dashboard.tsx
│   │   ├── Users/
│   │   │   ├── UserList.tsx
│   │   │   ├── UserDetail.tsx
│   │   │   └── AddUser.tsx
│   │   ├── Doctors/
│   │   │   ├── DoctorList.tsx
│   │   │   ├── DoctorDetail.tsx
│   │   │   └── AddDoctor.tsx
│   │   ├── Hospitals/
│   │   │   ├── HospitalList.tsx
│   │   │   └── HospitalDetail.tsx
│   │   ├── Appointments/
│   │   │   ├── AppointmentList.tsx
│   │   │   └── AppointmentDetail.tsx
│   │   ├── Schedules/
│   │   │   ├── ScheduleManagement.tsx
│   │   │   └── BulkSchedule.tsx
│   │   ├── Payments/
│   │   │   ├── PaymentList.tsx
│   │   │   └── PaymentDetail.tsx
│   │   ├── Reports/
│   │   │   ├── RevenueReport.tsx
│   │   │   ├── AppointmentReport.tsx
│   │   │   └── UserAnalytics.tsx
│   │   ├── Promotions/
│   │   │   ├── PromotionList.tsx
│   │   │   └── PromotionAdd.tsx
│   │   ├── Settings/
│   │   │   ├── GeneralSettings.tsx
│   │   │   ├── EmailSettings.tsx
│   │   │   ├── PaymentSettings.tsx
│   │   │   └── IntegrationSettings.tsx
│   │   ├── AuditLogs.tsx
│   │   ├── LoginPage.tsx
│   │   └── NotFoundPage.tsx
│   │
│   ├── hooks/                          # Custom hooks
│   │   ├── useAuth.ts
│   │   ├── useApi.ts
│   │   ├── usePagination.ts
│   │   ├── useTable.ts
│   │   ├── useForm.ts
│   │   └── ...
│   │
│   ├── services/                       # API services
│   │   ├── api.ts
│   │   ├── authService.ts
│   │   ├── userService.ts
│   │   ├── doctorService.ts
│   │   ├── appointmentService.ts
│   │   ├── paymentService.ts
│   │   ├── reportService.ts
│   │   └── ...
│   │
│   ├── store/                          # Redux store
│   │   ├── store.ts
│   │   ├── slices/
│   │   │   ├── authSlice.ts
│   │   │   ├── userSlice.ts
│   │   │   ├── doctorSlice.ts
│   │   │   ├── appointmentSlice.ts
│   │   │   ├── uiSlice.ts
│   │   │   └── ...
│   │   └── thunks/
│   │       ├── authThunks.ts
│   │       ├── userThunks.ts
│   │       └── ...
│   │
│   ├── utils/                          # Utilities
│   │   ├── formatters.ts
│   │   ├── validators.ts
│   │   ├── constants.ts
│   │   ├── permissions.ts
│   │   └── helpers.ts
│   │
│   ├── types/                          # TypeScript types
│   │   ├── index.ts
│   │   ├── api.ts
│   │   ├── domain.ts
│   │   └── forms.ts
│   │
│   ├── constants/                      # App constants
│   │   ├── api.ts
│   │   ├── routes.ts
│   │   └── permissions.ts
│   │
│   ├── contexts/                       # React contexts
│   │   ├── AuthContext.tsx
│   │   └── ThemeContext.tsx
│   │
│   ├── config/                         # Configuration
│   │   ├── api.config.ts
│   │   └── routes.config.ts
│   │
│   └── middleware/                     # Custom middleware
│       ├── authMiddleware.ts
│       └── errorBoundary.tsx
│
├── tests/                              # Test files
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── public/                             # Static files
├── docs/                               # Documentation
├── .env.example                        # Environment template
├── .eslintrc.json                      # ESLint config
├── .prettierrc.json                    # Prettier config
├── vite.config.ts                      # Vite config
├── tsconfig.json                       # TypeScript config
├── vitest.config.ts                    # Vitest config
├── package.json                        # Dependencies
└── README.md                           # This file
```

## 🔌 API Integration

Admin Portal sử dụng API Gateway pada port 5001 untuk tất cả komunikasi backend.

### Main Endpoints

```
GET    /api/users                       # Get all users
POST   /api/users                       # Create user
GET    /api/users/{id}                  # Get user details
PUT    /api/users/{id}                  # Update user
DELETE /api/users/{id}                  # Delete user

GET    /api/doctors                     # Get all doctors
POST   /api/doctors                     # Create doctor
GET    /api/doctors/{id}                # Get doctor details
PUT    /api/doctors/{id}                # Update doctor
DELETE /api/doctors/{id}                # Delete doctor

GET    /api/appointments                # Get all appointments
GET    /api/appointments/{id}           # Get appointment details
PUT    /api/appointments/{id}/confirm   # Confirm appointment
PUT    /api/appointments/{id}/cancel    # Cancel appointment

GET    /api/payments                    # Get all payments
GET    /api/payments/{id}               # Get payment details
POST   /api/payments/{id}/refund        # Process refund

GET    /api/reports/revenue             # Revenue report
GET    /api/reports/appointments        # Appointment report
GET    /api/reports/analytics           # Analytics report

GET    /api/promotions                  # Get promotions
POST   /api/promotions                  # Create promotion
PUT    /api/promotions/{id}             # Update promotion
DELETE /api/promotions/{id}             # Delete promotion

GET    /api/audit-logs                  # Get audit logs
```

## 🧪 Testing

```bash
# Run tests
npm run test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch

# Run specific test
npm run test userService.test.ts
```

## 🐛 Troubleshooting

### Problem: Cannot connect to API

```
Solution:
1. Check .env VITE_API_BASE_URL is correct
2. Verify backend is running on port 5001
3. Check CORS settings on backend
4. Clear browser cache
```

### Problem: Permission denied errors

```
Solution:
1. Check user role in database
2. Verify admin permissions are set
3. Check token is valid (check JWT expiry)
4. Re-login with correct credentials
```

### Problem: Data not loading

```
Solution:
1. Check API response in Network tab
2. Check error logs in browser console
3. Verify API endpoint is correct
4. Check backend service is running
5. Check data in database
```

## 📚 Tài Liệu Thêm

- [Architecture Guide](./docs/architecture.md)
- [Component Documentation](./docs/COMPONENTS.md)
- [API Integration](./docs/API_INTEGRATION.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)

## 📄 License

MIT License © 2025 BookingCare

## 👥 Team

- **Project Manager**: ...
- **Admin UI Lead**: ...
- **UI/UX Designer**: ...
- **Development Team**: ...

---

**Last Updated**: December 2025  
**Version**: 1.0.0  
**Support**: support@bookingcare.com
