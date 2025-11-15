import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { RootState, AppDispatch } from '@/store';
import {
    fetchNotificationSummary,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    deleteAllNotifications,
    fetchNotificationCountsByType,
} from '@/store/slices/notificationSlice';
import { NotificationService } from '@/services/notification.service';
import {
    NotificationCategory,
    NotificationCategoryLabels,
    getTypesByCategory,
} from '@/enums/notification.enums';
import { getLocalizedNotification, Notification } from '@/types/notification.types';
import TableSkeleton from '@/components/TableSkeleton/TableSkeleton';
import ModalDelete from '@/components/ModalDelete/ModalDelete';

const NotificationManagement: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { unreadCount, countsByType } = useSelector((state: RootState) => state.notification);

    // Local state for notifications (không ảnh hưởng Redux state dùng cho MainHeader)
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [totalNotifications, setTotalNotifications] = useState(0); // Tổng số thông báo của user
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<NotificationCategory>(
        NotificationCategory.Registration
    );
    const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 20;

    // Modal states
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteModalType, setDeleteModalType] = useState<'selected' | 'all'>('selected');
    const [isDeleting, setIsDeleting] = useState(false);

    // Load total notifications count for user
    const loadTotalNotifications = useCallback(async () => {
        try {
            // Load all notifications to get total count
            const response = await NotificationService.getNotifications(1, 1000); // Large page size to get all
            // Check if response has pagination info or just use data length
            const total =
                (response as { pagination?: { total: number } }).pagination?.total ||
                response.data?.length ||
                0;
            setTotalNotifications(total);
        } catch (error) {
            toast.error('Không thể tải tổng số thông báo');
            console.error(
                '[NotificationManagement] Failed to load total notifications count:',
                error
            );

            setTotalNotifications(0);
        }
    }, []);

    // Load notifications data
    const loadNotifications = useCallback(async () => {
        setIsLoading(true);
        try {
            // Load summary and counts (for Redux state used by MainHeader)
            dispatch(fetchNotificationSummary());
            dispatch(fetchNotificationCountsByType(undefined));

            // Load total notifications count
            await loadTotalNotifications();

            // Get types for current category
            const types = getTypesByCategory(activeTab);

            if (types.length === 0) {
                // If no specific types, load all notifications
                const response = await NotificationService.getNotifications(currentPage, pageSize);
                setNotifications(response.data || []);
            } else {
                // Load notifications for each type in category
                const promises = types.map((type) =>
                    NotificationService.getNotifications(currentPage, pageSize, undefined, type)
                );

                const responses = await Promise.all(promises);

                // Merge all notifications from different types
                const allNotifications = responses.flatMap((response) => response.data || []);

                // Remove duplicates by id
                const uniqueNotifications = Array.from(
                    new Map(allNotifications.map((n) => [n.id, n])).values()
                );

                // Sort by date (newest first)
                uniqueNotifications.sort(
                    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );

                setNotifications(uniqueNotifications);
            }
        } catch (error) {
            console.error('[NotificationManagement] Failed to load notifications:', error);
            toast.error('Không thể tải thông báo');
            setNotifications([]);
        } finally {
            setIsLoading(false);
        }
    }, [dispatch, currentPage, pageSize, activeTab, loadTotalNotifications]);

    useEffect(() => {
        loadNotifications();
    }, [activeTab, loadNotifications]);

    const handleTabChange = (category: NotificationCategory) => {
        setActiveTab(category);
        setCurrentPage(1);
        setSelectedNotifications([]);
    };

    const handleNotificationClick = async (notification: Notification) => {
        if (!notification.isRead) {
            try {
                await dispatch(markNotificationAsRead(notification.id)).unwrap();
                dispatch(fetchNotificationCountsByType(false));

                // Update local state
                setNotifications((prev) =>
                    prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n))
                );
            } catch (error) {
                console.error('Failed to mark notification as read:', error);
                toast.error('Không thể đánh dấu thông báo đã đọc');
            }
        }

        // Navigate to action URL if available
        if (notification.actionUrl) {
            globalThis.open(notification.actionUrl, '_blank');
        }
    };

    const handleSelectNotification = (notificationId: string) => {
        setSelectedNotifications((prev) =>
            prev.includes(notificationId)
                ? prev.filter((id) => id !== notificationId)
                : [...prev, notificationId]
        );
    };

    const handleSelectAll = () => {
        const filteredNotifications = getFilteredNotifications();
        const allIds = filteredNotifications.map((n) => n.id);
        setSelectedNotifications(selectedNotifications.length === allIds.length ? [] : allIds);
    };

    const handleMarkSelectedAsRead = async () => {
        try {
            await Promise.all(
                selectedNotifications.map((id) => dispatch(markNotificationAsRead(id)).unwrap())
            );
            dispatch(fetchNotificationCountsByType(false));

            // Update local state
            setNotifications((prev) =>
                prev.map((n) => (selectedNotifications.includes(n.id) ? { ...n, isRead: true } : n))
            );

            setSelectedNotifications([]);
            toast.success('Đã đánh dấu các thông báo đã chọn là đã đọc');
        } catch {
            toast.error('Không thể đánh dấu thông báo');
        }
    };

    const handleDeleteSelected = () => {
        setDeleteModalType('selected');
        setShowDeleteModal(true);
    };

    const handleMarkAllAsRead = async () => {
        try {
            await dispatch(markAllNotificationsAsRead()).unwrap();
            dispatch(fetchNotificationCountsByType(false));

            // Update local state
            setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));

            toast.success('Đã đánh dấu tất cả thông báo là đã đọc');
        } catch {
            toast.error('Không thể đánh dấu tất cả thông báo');
        }
    };

    const handleDeleteAll = () => {
        setDeleteModalType('all');
        setShowDeleteModal(true);
    };

    // Modal handlers
    const handleCloseDeleteModal = () => {
        setShowDeleteModal(false);
        setIsDeleting(false);
    };

    const handleConfirmDelete = async () => {
        setIsDeleting(true);
        try {
            if (deleteModalType === 'selected') {
                await Promise.all(
                    selectedNotifications.map((id) => dispatch(deleteNotification(id)).unwrap())
                );
                // Update total count immediately
                setTotalNotifications((prev) => prev - selectedNotifications.length);
                setSelectedNotifications([]);
                toast.success('Đã xóa các thông báo đã chọn');
            } else {
                await dispatch(deleteAllNotifications()).unwrap();
                // Reset total count to 0
                setTotalNotifications(0);
                toast.success('Đã xóa tất cả thông báo');
            }
            // Refresh data after delete
            loadNotifications();
            handleCloseDeleteModal();
        } catch {
            toast.error(
                deleteModalType === 'selected'
                    ? 'Không thể xóa thông báo'
                    : 'Không thể xóa tất cả thông báo'
            );
            setIsDeleting(false);
        }
    };

    const getFilteredNotifications = () => {
        // Notifications are already filtered by category in loadNotifications
        return notifications;
    };

    const formatNotificationTime = (createdAt: string) => {
        const formatted = formatDistanceToNow(new Date(createdAt), {
            addSuffix: true,
            locale: vi,
        });
        return formatted.replace('khoảng ', '');
    };

    const getNotificationIcon = (notification: Notification) => {
        if (notification.icon) return notification.icon;

        switch (notification.type) {
            case 'HospitalRegistration':
                return 'ti ti-building-hospital';
            case 'DoctorRegistration':
                return 'ti ti-user-plus';
            case 'BookingConfirmation':
                return 'ti ti-calendar-check';
            case 'PaymentSuccess':
            case 'PaymentFailed':
                return 'ti ti-credit-card';
            case 'SystemAlert':
            case 'AdminAlert':
                return 'ti ti-alert-triangle';
            default:
                return 'ti ti-bell';
        }
    };

    const filteredNotifications = getFilteredNotifications();

    // Calculate counts for tabs (similar to UserProfile pattern)
    const getCategoryCount = (category: NotificationCategory): number => {
        const types = getTypesByCategory(category);
        return Object.entries(countsByType)
            .filter(([type]) => types.includes(type as any))
            .reduce((sum, [, count]) => sum + count, 0);
    };

    // Helper function to render table body content
    const renderTableBody = () => {
        if (isLoading) {
            return (
                <TableSkeleton
                    rows={5}
                    columns={[
                        { type: 'text', width: 30 }, // Checkbox column
                        { type: 'avatar', width: 300 }, // Notification content
                        { type: 'badge', width: 80 }, // Status
                        { type: 'text', width: 120 }, // Time
                        { type: 'actions', items: 3 }, // Actions
                    ]}
                />
            );
        }

        if (filteredNotifications.length === 0) {
            return (
                <tr>
                    <td colSpan={5} className="text-center py-4">
                        <i className="ti ti-bell-off fs-48 text-muted mb-2 d-block"></i>
                        <p className="text-muted mb-0">Không có thông báo nào trong danh mục này</p>
                    </td>
                </tr>
            );
        }

        return filteredNotifications.map((notification) => {
            const localizedNotification = getLocalizedNotification(notification, 'vi');
            return (
                <tr
                    key={notification.id}
                    className={notification.isRead ? '' : 'table-light'}
                    style={{
                        backgroundColor: notification.isRead ? 'transparent' : '#f8f9fa',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s ease',
                        borderLeft: notification.isRead
                            ? '3px solid transparent'
                            : '3px solid #0d6efd',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#e9ecef';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = notification.isRead
                            ? 'transparent'
                            : '#f8f9fa';
                    }}
                    onClick={() => handleNotificationClick(notification)}
                >
                    <td onClick={(e) => e.stopPropagation()}>
                        <input
                            type="checkbox"
                            className="form-check-input"
                            checked={selectedNotifications.includes(notification.id)}
                            onChange={() => handleSelectNotification(notification.id)}
                        />
                    </td>
                    <td>
                        <div className="d-flex align-items-start">
                            <div className="me-3">
                                <div
                                    className="avatar-sm rounded-circle d-flex align-items-center justify-content-center"
                                    style={{
                                        backgroundColor: notification.isRead
                                            ? '#f8f9fa'
                                            : '#e3f2fd',
                                        border: notification.isRead
                                            ? '1px solid #e9ecef'
                                            : '2px solid #0d6efd',
                                    }}
                                >
                                    <i
                                        className={`${getNotificationIcon(notification)} fs-18`}
                                        style={{
                                            color: notification.isRead ? '#6c757d' : '#0d6efd',
                                        }}
                                    ></i>
                                </div>
                            </div>
                            <div className="flex-grow-1">
                                <h6 className={`mb-1 ${notification.isRead ? '' : 'fw-bold'}`}>
                                    {localizedNotification.title}
                                </h6>
                                <p className="text-muted mb-0 fs-13">
                                    {localizedNotification.content}
                                </p>
                            </div>
                        </div>
                    </td>
                    <td>
                        {notification.isRead ? (
                            <span className="badge bg-success">Đã đọc</span>
                        ) : (
                            <span className="badge bg-warning">Chưa đọc</span>
                        )}
                    </td>
                    <td>
                        <span className="fs-13 text-muted">
                            {formatNotificationTime(notification.createdAt)}
                        </span>
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                        <div className="btn-group btn-group-sm">
                            <button
                                className="btn btn-outline-primary"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleNotificationClick(notification);
                                }}
                                title="Xem chi tiết"
                            >
                                <i className="ti ti-eye"></i>
                            </button>
                            {!notification.isRead && (
                                <button
                                    className="btn btn-outline-success"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        dispatch(markNotificationAsRead(notification.id));
                                    }}
                                    title="Đánh dấu đã đọc"
                                >
                                    <i className="ti ti-check"></i>
                                </button>
                            )}
                            <button
                                className="btn btn-outline-danger"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    dispatch(deleteNotification(notification.id));
                                }}
                                title="Xóa thông báo"
                            >
                                <i className="ti ti-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            );
        });
    };

    return (
        <div className="content">
            {/* Page Header */}
            <div className="d-flex align-items-sm-center flex-sm-row flex-column gap-2 pb-3 mb-3 border-1 border-bottom">
                <div className="flex-grow-1">
                    <h4 className="fw-semibold mb-0">Quản lý thông báo</h4>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="row">
                <div className="col-xl-3 col-sm-6 col-12">
                    <div className="card">
                        <div className="card-body">
                            <div className="dash-widget-header">
                                <span className="dash-widget-icon text-primary border-primary">
                                    <i className="ti ti-bell"></i>
                                </span>
                                <div className="dash-count">
                                    <h3>{totalNotifications}</h3>
                                </div>
                            </div>
                            <div className="dash-widget-info">
                                <h6 className="text-muted">Tổng thông báo</h6>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-xl-3 col-sm-6 col-12">
                    <div className="card">
                        <div className="card-body">
                            <div className="dash-widget-header">
                                <span className="dash-widget-icon text-warning border-warning">
                                    <i className="ti ti-bell-ringing"></i>
                                </span>
                                <div className="dash-count">
                                    <h3>{unreadCount}</h3>
                                </div>
                            </div>
                            <div className="dash-widget-info">
                                <h6 className="text-muted">Chưa đọc</h6>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-xl-3 col-sm-6 col-12">
                    <div className="card">
                        <div className="card-body">
                            <div className="dash-widget-header">
                                <span className="dash-widget-icon text-success border-success">
                                    <i className="ti ti-bell-check"></i>
                                </span>
                                <div className="dash-count">
                                    <h3>{totalNotifications - unreadCount}</h3>
                                </div>
                            </div>
                            <div className="dash-widget-info">
                                <h6 className="text-muted">Đã đọc</h6>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-xl-3 col-sm-6 col-12">
                    <div className="card">
                        <div className="card-body">
                            <div className="dash-widget-header">
                                <span className="dash-widget-icon text-info border-info">
                                    <i className="ti ti-check"></i>
                                </span>
                                <div className="dash-count">
                                    <h3>{selectedNotifications.length}</h3>
                                </div>
                            </div>
                            <div className="dash-widget-info">
                                <h6 className="text-muted">Đã chọn</h6>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="row">
                <div className="col-sm-12">
                    <div className="card">
                        <div className="card-header">
                            <div className="row align-items-center">
                                <div className="col">
                                    <h4 className="card-title">Danh sách thông báo</h4>
                                </div>
                                <div className="col-auto">
                                    <fieldset className="btn-group">
                                        <button
                                            type="button"
                                            className="btn btn-outline-primary btn-sm"
                                            onClick={handleMarkAllAsRead}
                                            disabled={unreadCount === 0}
                                        >
                                            <i className="ti ti-check-all me-1"></i> Đọc tất cả
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-outline-danger btn-sm"
                                            onClick={handleDeleteAll}
                                            disabled={notifications.length === 0}
                                        >
                                            <i className="ti ti-trash me-1"></i> Xóa tất cả
                                        </button>
                                    </fieldset>
                                </div>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="card-body">
                            <ul className="nav nav-tabs nav-tabs-solid nav-tabs-rounded">
                                {Object.values(NotificationCategory).map((category) => (
                                    <li className="nav-item" key={category}>
                                        <button
                                            className={`nav-link ${
                                                activeTab === category ? 'active' : ''
                                            }`}
                                            onClick={() => handleTabChange(category)}
                                        >
                                            {NotificationCategoryLabels[category]}
                                            {getCategoryCount(category) > 0 && (
                                                <span className="badge bg-primary ms-2">
                                                    {getCategoryCount(category)}
                                                </span>
                                            )}
                                        </button>
                                    </li>
                                ))}
                            </ul>

                            {/* Bulk Actions */}
                            {selectedNotifications.length > 0 && (
                                <div className="alert alert-info mt-3">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <span>
                                            Đã chọn {selectedNotifications.length} thông báo
                                        </span>
                                        <div className="btn-group btn-group-sm">
                                            <button
                                                className="btn btn-outline-primary"
                                                onClick={handleMarkSelectedAsRead}
                                            >
                                                <i className="ti ti-check me-1"></i> Đánh dấu đã đọc
                                            </button>
                                            <button
                                                className="btn btn-outline-danger"
                                                onClick={handleDeleteSelected}
                                            >
                                                <i className="ti ti-trash me-1"></i> Xóa
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Notifications List */}
                            <div className="table-responsive mt-3">
                                <table className="table table-hover">
                                    <thead>
                                        <tr>
                                            <th>
                                                <input
                                                    type="checkbox"
                                                    className="form-check-input"
                                                    checked={
                                                        filteredNotifications.length > 0 &&
                                                        selectedNotifications.length ===
                                                            filteredNotifications.length
                                                    }
                                                    onChange={handleSelectAll}
                                                />
                                            </th>
                                            <th>Thông báo</th>
                                            <th>Trạng thái</th>
                                            <th>Thời gian</th>
                                            <th>Hành động</th>
                                        </tr>
                                    </thead>
                                    <tbody>{renderTableBody()}</tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <ModalDelete
                show={showDeleteModal}
                onHide={handleCloseDeleteModal}
                onConfirm={handleConfirmDelete}
                title={
                    deleteModalType === 'selected'
                        ? 'Xác nhận xóa thông báo đã chọn'
                        : 'Xác nhận xóa tất cả thông báo'
                }
                message={
                    deleteModalType === 'selected'
                        ? `Bạn có chắc chắn muốn xóa ${selectedNotifications.length} thông báo đã chọn không`
                        : 'Bạn có chắc chắn muốn xóa tất cả thông báo không'
                }
                confirmText="Có, xóa"
                cancelText="Hủy"
                loading={isDeleting}
            />
        </div>
    );
};

export default NotificationManagement;
