import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Alert } from 'react-bootstrap';
import Calendar from '@/components/Calendar';
import { useHospitalPayouts } from '@/hooks/useHospitalPayouts';
import { GeneratePayoutsRequest } from '@/types/hospitalPayout.types';
import { formatDateToLocalString } from '@/utils/formatDate';

interface GeneratePayoutsModalProps {
    show: boolean;
    onHide: () => void;
    onSuccess: () => void;
    hospitalId?: string;
    hospitalName?: string;
}

const GeneratePayoutsModal: React.FC<GeneratePayoutsModalProps> = ({
    show,
    onHide,
    onSuccess,
    hospitalId,
    hospitalName,
}) => {
    const { generatePayouts, loading } = useHospitalPayouts();

    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [startDateAnchor, setStartDateAnchor] = useState<HTMLElement | null>(null);
    const [endDateAnchor, setEndDateAnchor] = useState<HTMLElement | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        if (show) {
            // Reset form when modal opens
            setStartDate(null);
            setEndDate(null);
            setStartDateAnchor(null);
            setEndDateAnchor(null);
            setError(null);
            setSuccess(null);
        }
    }, [show]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (!startDate || !endDate) {
            setError('Vui lòng chọn ngày bắt đầu và ngày kết thúc');
            return;
        }

        if (!hospitalId) {
            setError('Không tìm thấy thông tin bệnh viện');
            return;
        }

        if (!hospitalName) {
            setError('Không tìm thấy tên bệnh viện');
            return;
        }

        try {
            const requestData: GeneratePayoutsRequest = {
                periodStartDate: formatDateToLocalString(startDate),
                periodEndDate: formatDateToLocalString(endDate),
                hospitalId: hospitalId,
                hospitalName: hospitalName,
            };

            await generatePayouts(requestData);

            const successMessage = `Tạo yêu cầu thanh toán thành công. Vui lòng chờ admin xác nhận.`;

            setSuccess(successMessage);
            setTimeout(() => {
                onSuccess();
            }, 2000);
        } catch (err) {
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : 'Không thể tạo yêu cầu thanh toán. Vui lòng thử lại.';
            setError(errorMessage);
        }
    };

    return (
        <Modal show={show} onHide={onHide} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Yêu cầu thanh toán</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    {error && <Alert variant="danger">{error}</Alert>}
                    {success && <Alert variant="success">{success}</Alert>}

                    <Alert variant="info">
                        <small>
                            Tạo yêu cầu thanh toán cho các cuộc hẹn đã hoàn thành trong khoảng thời
                            gian bạn chọn. Admin sẽ xem xét và chuyển khoản vào tài khoản ngân hàng
                            mặc định của bạn.
                        </small>
                    </Alert>

                    <Form.Group className="mb-3">
                        <Form.Label>Ngày bắt đầu</Form.Label>
                        <Form.Control
                            type="text"
                            value={startDate ? startDate.toLocaleDateString('vi-VN') : ''}
                            onClick={(e) => setStartDateAnchor(e.currentTarget)}
                            placeholder="Chọn ngày bắt đầu"
                            readOnly
                            required
                            disabled={loading}
                            style={{ cursor: 'pointer' }}
                        />
                        <Calendar
                            value={startDate}
                            onChange={setStartDate}
                            anchorEl={startDateAnchor}
                            open={Boolean(startDateAnchor)}
                            onClose={() => setStartDateAnchor(null)}
                            maxDate={endDate || new Date()}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Ngày kết thúc</Form.Label>
                        <Form.Control
                            type="text"
                            value={endDate ? endDate.toLocaleDateString('vi-VN') : ''}
                            onClick={(e) => setEndDateAnchor(e.currentTarget)}
                            placeholder="Chọn ngày kết thúc"
                            readOnly
                            required
                            disabled={loading}
                            style={{ cursor: 'pointer' }}
                        />
                        <Calendar
                            value={endDate}
                            onChange={setEndDate}
                            anchorEl={endDateAnchor}
                            open={Boolean(endDateAnchor)}
                            onClose={() => setEndDateAnchor(null)}
                            minDate={startDate || undefined}
                            maxDate={new Date()}
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={onHide} disabled={loading}>
                        Hủy
                    </Button>
                    <Button variant="primary" type="submit" disabled={loading || !!success}>
                        {loading ? 'Đang xử lý...' : 'Tạo yêu cầu'}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default GeneratePayoutsModal;
