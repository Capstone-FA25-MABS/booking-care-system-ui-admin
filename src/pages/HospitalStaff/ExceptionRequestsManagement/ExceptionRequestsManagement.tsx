import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import ExceptionRequestCard from '@/components/Schedule/ExceptionRequestCard';
import ReviewExceptionModal from '@/components/Schedule/ReviewExceptionModal';
import {
    DoctorScheduleExceptionDto,
    ServiceMedicalScheduleExceptionDto,
    ExceptionRequestStatus,
    ReviewExceptionRequest,
} from '@/types/schedule.types';
import { ScheduleService } from '@/services/schedule.service';
import styles from './ExceptionRequestsManagement.module.scss';

const ExceptionRequestsManagement: React.FC = () => {
    const [doctorExceptions, setDoctorExceptions] = useState<DoctorScheduleExceptionDto[]>([]);
    const [serviceExceptions, setServiceExceptions] = useState<
        ServiceMedicalScheduleExceptionDto[]
    >([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'doctor' | 'service'>('doctor');

    // Modal states
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [selectedExceptionId, setSelectedExceptionId] = useState<string>('');
    const [selectedExceptionType, setSelectedExceptionType] = useState<'doctor' | 'service'>(
        'doctor'
    );
    const [selectedExceptionDate, setSelectedExceptionDate] = useState('');
    const [selectedRequesterName, setSelectedRequesterName] = useState('');

    useEffect(() => {
        loadExceptions();
    }, []);

    const loadExceptions = async () => {
        try {
            setLoading(true);

            // Load doctor exceptions
            const doctorResponse = await ScheduleService.getPendingDoctorExceptions();
            setDoctorExceptions(doctorResponse.data || []);

            // Load service exceptions
            const serviceResponse = await ScheduleService.getPendingServiceMedicalExceptions();
            setServiceExceptions(serviceResponse.data || []);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Không thể tải danh sách yêu cầu');
        } finally {
            setLoading(false);
        }
    };

    const handleReviewClick = (
        exceptionId: string,
        type: 'doctor' | 'service',
        requesterName: string,
        exceptionDate: string
    ) => {
        setSelectedExceptionId(exceptionId);
        setSelectedExceptionType(type);
        setSelectedRequesterName(requesterName);
        setSelectedExceptionDate(exceptionDate);
        setShowReviewModal(true);
    };

    const handleReviewSubmit = async (status: ExceptionRequestStatus, comments: string) => {
        const reviewRequest: ReviewExceptionRequest = {
            exceptionId: selectedExceptionId,
            status,
            reviewComments: comments,
        };

        try {
            setLoading(true);

            if (selectedExceptionType === 'doctor') {
                await ScheduleService.reviewDoctorException(reviewRequest);
            } else {
                await ScheduleService.reviewServiceMedicalException(reviewRequest);
            }

            toast.success(
                status === ExceptionRequestStatus.APPROVED
                    ? 'Đã phê duyệt yêu cầu'
                    : 'Đã từ chối yêu cầu'
            );

            setShowReviewModal(false);
            loadExceptions();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Không thể xử lý yêu cầu');
        } finally {
            setLoading(false);
        }
    };

    const pendingDoctorCount = doctorExceptions.filter(
        (e) => e.status === ExceptionRequestStatus.PENDING
    ).length;

    const pendingServiceCount = serviceExceptions.filter(
        (e) => e.status === ExceptionRequestStatus.PENDING
    ).length;

    return (
        <div className={styles.exceptionRequestsManagement}>
            <div className="card">
                <div className="card-header">
                    <h4 className="mb-0">
                        <i className="ti ti-file-alert me-2"></i>
                        Quản lý yêu cầu nghỉ/thay đổi lịch
                    </h4>
                </div>

                <div className="card-body">
                    {/* Tabs */}
                    <ul className="nav nav-tabs mb-4">
                        <li className="nav-item">
                            <button
                                className={`nav-link ${activeTab === 'doctor' ? 'active' : ''}`}
                                onClick={() => setActiveTab('doctor')}
                            >
                                <i className="ti ti-user-heart me-1"></i>
                                Yêu cầu từ Bác sĩ
                                {pendingDoctorCount > 0 && (
                                    <span className="badge bg-danger ms-2">
                                        {pendingDoctorCount}
                                    </span>
                                )}
                            </button>
                        </li>
                        <li className="nav-item">
                            <button
                                className={`nav-link ${activeTab === 'service' ? 'active' : ''}`}
                                onClick={() => setActiveTab('service')}
                            >
                                <i className="ti ti-medical-cross me-1"></i>
                                Yêu cầu từ Dịch vụ
                                {pendingServiceCount > 0 && (
                                    <span className="badge bg-danger ms-2">
                                        {pendingServiceCount}
                                    </span>
                                )}
                            </button>
                        </li>
                    </ul>

                    {/* Loading */}
                    {loading && (
                        <div className="text-center py-5">
                            <div className="spinner-border" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    )}

                    {/* Doctor Exceptions Tab */}
                    {!loading && activeTab === 'doctor' && (
                        <div className={styles.exceptionsGrid}>
                            {doctorExceptions.length === 0 ? (
                                <div className="alert alert-info">
                                    <i className="ti ti-info-circle me-2"></i>
                                    Không có yêu cầu nào từ bác sĩ
                                </div>
                            ) : (
                                doctorExceptions.map((exception) => (
                                    <ExceptionRequestCard
                                        key={exception.id}
                                        type="doctor"
                                        exception={exception}
                                        requesterName={`Bác sĩ ${exception.doctorId}`}
                                        onApprove={() =>
                                            handleReviewClick(
                                                exception.id,
                                                'doctor',
                                                `Bác sĩ ${exception.doctorId}`,
                                                exception.exceptionDate
                                            )
                                        }
                                        onReject={() =>
                                            handleReviewClick(
                                                exception.id,
                                                'doctor',
                                                `Bác sĩ ${exception.doctorId}`,
                                                exception.exceptionDate
                                            )
                                        }
                                    />
                                ))
                            )}
                        </div>
                    )}

                    {/* Service Exceptions Tab */}
                    {!loading && activeTab === 'service' && (
                        <div className={styles.exceptionsGrid}>
                            {serviceExceptions.length === 0 ? (
                                <div className="alert alert-info">
                                    <i className="ti ti-info-circle me-2"></i>
                                    Không có yêu cầu nào từ dịch vụ
                                </div>
                            ) : (
                                serviceExceptions.map((exception) => (
                                    <ExceptionRequestCard
                                        key={exception.id}
                                        type="service"
                                        exception={exception}
                                        requesterName={`Dịch vụ ${exception.serviceMedicalId}`}
                                        onApprove={() =>
                                            handleReviewClick(
                                                exception.id,
                                                'service',
                                                `Dịch vụ ${exception.serviceMedicalId}`,
                                                exception.exceptionDate
                                            )
                                        }
                                        onReject={() =>
                                            handleReviewClick(
                                                exception.id,
                                                'service',
                                                `Dịch vụ ${exception.serviceMedicalId}`,
                                                exception.exceptionDate
                                            )
                                        }
                                    />
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Review Modal */}
            <ReviewExceptionModal
                show={showReviewModal}
                onClose={() => setShowReviewModal(false)}
                onSubmit={handleReviewSubmit}
                requesterName={selectedRequesterName}
                exceptionDate={selectedExceptionDate}
                isLoading={loading}
            />
        </div>
    );
};

export default ExceptionRequestsManagement;
