import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import Pagination from '@/components/Pagination';
import Button from '@/components/Button';
import ModalDelete from '@/components/ModalDelete';
import TableSkeleton from '@/components/TableSkeleton';
import TableActions from '@/components/TableActions';
import { HospitalFaqResponse, HospitalFaqFilterRequest } from '@/types/hospitalFaq.types';
import { HospitalFaqService } from '@/services/hospitalFaq.service';
import { HospitalService } from '@/services/hospital.service';
import { PATHS, buildPath } from '@/routes/paths';
import { useAppSelector } from '@/store/hooks';
import { selectCurrentProfile } from '@/store/selectors/profile.selectors';
import Select from 'react-select';
import { selectCustomStyles } from '@/constants/select.styles';

// Skeleton columns for FAQ table
const faqTableColumns = [
    { label: 'Câu hỏi', hasAvatar: false, type: 'text' as const },
    { label: 'Bệnh viện', hasAvatar: false, type: 'text' as const },
    { label: 'Thứ tự hiển thị', hasAvatar: false, type: 'text' as const },
    { label: 'Ngày tạo', hasAvatar: false, type: 'text' as const },
    { label: 'Hành động', hasAvatar: false, type: 'text' as const },
];

interface HospitalOption {
    value: string;
    label: string;
}

const ListHospitalFaqs: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [faqs, setFaqs] = useState<HospitalFaqResponse[]>([]);
    const [pagination, setPagination] = useState({
        totalItems: 0,
        page: 1,
        pageSize: 10,
        totalPages: 0,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [faqToDelete, setFaqToDelete] = useState<HospitalFaqResponse | null>(null);
    const [selectedHospitalId, setSelectedHospitalId] = useState<string | undefined>(undefined);
    const [hospitalOptions, setHospitalOptions] = useState<HospitalOption[]>([]);
    const [isLoadingHospitals, setIsLoadingHospitals] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const faqBasePath = useMemo(() => {
        if (location.pathname.startsWith(PATHS.HOSPITAL.ROOT)) {
            return PATHS.HOSPITAL.ROOT;
        }
        return PATHS.ADMIN.ROOT;
    }, [location.pathname]);

    const currentProfile = useAppSelector(selectCurrentProfile);

    // If we're in hospital area, default filter to current hospital
    useEffect(() => {
        if (location.pathname.startsWith(PATHS.HOSPITAL.ROOT) && currentProfile?.hospitalId) {
            setSelectedHospitalId(currentProfile.hospitalId);
        }
    }, [location.pathname, currentProfile?.hospitalId]);

    const buildFaqPath = useCallback(
        (suffix: string) => {
            const base = location.pathname.startsWith(PATHS.HOSPITAL.ROOT)
                ? PATHS.HOSPITAL.HOSPITAL_FAQS
                : PATHS.ADMIN.HOSPITAL_FAQS;
            if (suffix) {
                return buildPath(faqBasePath, base.ROOT, suffix);
            }
            return buildPath(faqBasePath, base.ROOT);
        },
        [faqBasePath, location.pathname]
    );

    // Fetch hospitals for filter
    const fetchHospitals = useCallback(async () => {
        setIsLoadingHospitals(true);
        try {
            const response = await HospitalService.getHospitals({ pageNumber: 1, pageSize: 100 });
            const hospitals = response.data?.hospitals || [];
            setHospitalOptions(
                hospitals.map((h: any) => ({
                    value: h.id,
                    label: h.name,
                }))
            );
        } catch (err: any) {
            console.error('Error fetching hospitals:', err);
        } finally {
            setIsLoadingHospitals(false);
        }
    }, []);

    // Fetch FAQs
    const fetchFaqs = useCallback(
        async (page: number = 1) => {
            setIsLoading(true);
            setError(null);

            try {
                const isHospitalArea = location.pathname.startsWith(PATHS.HOSPITAL.ROOT);
                const filter: HospitalFaqFilterRequest = {
                    pageNumber: page,
                    pageSize: itemsPerPage,
                    // If in hospital area, always use currentProfile.hospitalId
                    hospitalId:
                        isHospitalArea && currentProfile?.hospitalId
                            ? currentProfile.hospitalId
                            : selectedHospitalId,
                };

                const response = await HospitalFaqService.getFaqs(filter);
                const data = response.data;

                setFaqs(data.items || []);
                setPagination({
                    totalItems: data.totalCount || 0,
                    page: data.pageNumber || page,
                    pageSize: data.pageSize || itemsPerPage,
                    totalPages: data.totalPages || 0,
                });
            } catch (err: any) {
                setError(err.message || 'Không thể tải danh sách câu hỏi thường gặp');
                toast.error(err.message || 'Không thể tải danh sách câu hỏi thường gặp');
            } finally {
                setIsLoading(false);
            }
        },
        [selectedHospitalId, itemsPerPage]
    );

    // Initial fetch
    useEffect(() => {
        fetchHospitals();
        fetchFaqs(currentPage);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, currentProfile?.hospitalId, location.pathname]);

    // Refetch when hospital filter changes
    useEffect(() => {
        setCurrentPage(1);
        fetchFaqs(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedHospitalId]);

    // Handle page change
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    // Handle delete
    const handleDeleteClick = (faq: HospitalFaqResponse) => {
        setFaqToDelete(faq);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        if (!faqToDelete) return;

        try {
            await HospitalFaqService.deleteFaq(faqToDelete.id);
            toast.success('Xóa câu hỏi thường gặp thành công!');
            setShowDeleteModal(false);
            setFaqToDelete(null);
            fetchFaqs(currentPage);
        } catch (err: any) {
            toast.error(err.message || 'Không thể xóa câu hỏi thường gặp');
        }
    };

    const handleDeleteCancel = () => {
        setShowDeleteModal(false);
        setFaqToDelete(null);
    };

    // Get hospital name by ID
    const getHospitalName = (hospitalId: string) => {
        const hospital = hospitalOptions.find((h) => h.value === hospitalId);
        return hospital?.label || hospitalId;
    };

    // Render table body
    const renderTableBody = () => {
        if (isLoading) {
            return <TableSkeleton rows={itemsPerPage} columns={faqTableColumns} />;
        }

        if (error) {
            return (
                <tr>
                    <td colSpan={5} className="text-center py-4">
                        <div className="alert alert-danger" role="alert">
                            <strong>Lỗi:</strong> {error}
                            <button
                                type="button"
                                className="btn-close ms-2"
                                onClick={() => setError(null)}
                                aria-label="Close"
                            ></button>
                        </div>
                    </td>
                </tr>
            );
        }

        if (faqs.length === 0) {
            return (
                <tr>
                    <td colSpan={5} className="text-center py-4">
                        <p className="text-muted">Không có FAQ nào được tìm thấy.</p>
                    </td>
                </tr>
            );
        }

        return faqs.map((faq) => (
            <tr key={faq.id}>
                <td style={{ maxWidth: '420px', width: '420px', verticalAlign: 'top' }}>
                    <div>
                        <h6
                            className="mb-1 fs-14 fw-semibold"
                            style={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                wordBreak: 'break-word',
                                whiteSpace: 'normal',
                                margin: 0,
                            }}
                        >
                            {faq.question}
                        </h6>
                        <p
                            className="text-muted fs-13 mb-0"
                            style={{
                                maxWidth: '400px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                wordBreak: 'break-word',
                                whiteSpace: 'normal',
                                margin: 0,
                            }}
                        >
                            {faq.answer}
                        </p>
                    </div>
                </td>
                <td>
                    <span className="fs-14">{getHospitalName(faq.hospitalId)}</span>
                </td>
                <td>
                    <span className="badge badge-soft-info fs-13">{faq.displayOrder}</span>
                </td>
                <td>
                    <span className="text-muted fs-14">
                        {new Date(faq.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                </td>
                <td className="action-item">
                    <div className="d-flex align-items-center gap-2">
                        <TableActions
                            id={faq.id}
                            onEdit={() => {
                                const editPath = location.pathname.startsWith(PATHS.HOSPITAL.ROOT)
                                    ? PATHS.HOSPITAL.HOSPITAL_FAQS.EDIT.replace(':id', faq.id)
                                    : PATHS.ADMIN.HOSPITAL_FAQS.EDIT.replace(':id', faq.id);
                                navigate(buildFaqPath(editPath));
                            }}
                            onDelete={() => handleDeleteClick(faq)}
                            showEdit={true}
                            showDelete={true}
                            showHide={false}
                            showView={false}
                        />
                    </div>
                </td>
            </tr>
        ));
    };

    return (
        <div className="content">
            <div className="d-flex align-items-sm-center flex-sm-row flex-column gap-2 mb-3 pb-3 border-bottom">
                <div className="flex-grow-1">
                    <h4 className="fw-bold mb-0">
                        Quản lý câu hỏi thường gặp bệnh viện{' '}
                        <span className="badge badge-soft-primary fs-13 fw-medium ms-2">
                            Tổng câu hỏi thường gặp: {pagination.totalItems}
                        </span>
                    </h4>
                </div>
                <div className="text-end d-flex">
                    <Button
                        variant="primary"
                        size="md"
                        className="ms-2 fs-13"
                        icon="ti ti-plus"
                        onClick={() => {
                            const addPath = location.pathname.startsWith(PATHS.HOSPITAL.ROOT)
                                ? PATHS.HOSPITAL.HOSPITAL_FAQS.ADD
                                : PATHS.ADMIN.HOSPITAL_FAQS.ADD;
                            navigate(buildFaqPath(addPath));
                        }}
                    >
                        Thêm câu hỏi thường gặp
                    </Button>
                </div>
            </div>

            {/* Hospital Filter */}
            <div className="row mb-3">
                {!location.pathname.startsWith(PATHS.HOSPITAL.ROOT) && (
                    <div className="col-md-4">
                        <label htmlFor="hospitalFilter" className="form-label">
                            Lọc theo bệnh viện
                        </label>
                        <Select
                            inputId="hospitalFilter"
                            options={hospitalOptions}
                            value={hospitalOptions.find((opt) => opt.value === selectedHospitalId)}
                            onChange={(option) => setSelectedHospitalId(option?.value)}
                            placeholder="Chọn bệnh viện..."
                            isClearable
                            isLoading={isLoadingHospitals}
                            styles={selectCustomStyles}
                        />
                    </div>
                )}
            </div>

            <div className="table-responsive">
                <table className="table table-nowrap datatable">
                    <thead className="thead-light">
                        <tr>
                            <th>Câu hỏi / Câu trả lời</th>
                            <th>Bệnh viện</th>
                            <th>Thứ tự hiển thị</th>
                            <th>Ngày tạo</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>{renderTableBody()}</tbody>
                </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="d-flex justify-content-center mt-3">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={pagination.totalPages}
                        onPageChange={handlePageChange}
                    />
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <ModalDelete
                show={showDeleteModal}
                onHide={handleDeleteCancel}
                onConfirm={handleDeleteConfirm}
                title="Xóa câu hỏi thường gặp"
                message={`Bạn có chắc chắn muốn xóa câu hỏi thường gặp "${faqToDelete?.question}"? Hành động này không thể hoàn tác.`}
                confirmText="Có, Xóa"
            />
        </div>
    );
};

export default ListHospitalFaqs;
