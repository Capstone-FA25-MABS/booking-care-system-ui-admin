import { useState, useEffect } from 'react';
import { Card, Button, Form, Modal, Alert, Spinner, Badge, Row, Col } from 'react-bootstrap';
import { Shield, Copy, Check, X, RefreshCw, Download } from 'lucide-react';
import { toast } from 'react-toastify';
import AuthService from '@/services/auth.service';
import { TwoFactorStatus, TwoFactorSetupData } from '@/types/auth.types';
import './TwoFactorAuthentication.scss';
import SpinnerComponent from '@/components/Spinner';

// Helper function to remove non-digit characters
const removeNonDigits = (str: string): string => {
    return str
        .split('')
        .filter((char) => char >= '0' && char <= '9')
        .join('');
};

const TwoFactorAuthentication = () => {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<TwoFactorStatus | null>(null);
    const [setupData, setSetupData] = useState<TwoFactorSetupData | null>(null);
    const [showSetupModal, setShowSetupModal] = useState(false);
    const [showDisableModal, setShowDisableModal] = useState(false);
    const [showBackupCodesModal, setShowBackupCodesModal] = useState(false);
    const [backupCodes, setBackupCodes] = useState<string[]>([]);
    const [verificationCode, setVerificationCode] = useState('');
    const [password, setPassword] = useState('');
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    useEffect(() => {
        fetchStatus();
    }, []);

    const fetchStatus = async () => {
        setLoading(true);
        try {
            const response = await AuthService.get2FAStatus();
            setStatus(response.data);
        } catch (error: any) {
            console.error('Error fetching 2FA status:', error);
            toast.error(error.message || 'Không thể tải trạng thái 2FA');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateSetup = async () => {
        setLoading(true);
        try {
            const response = await AuthService.generate2FASetup();
            setSetupData(response.data);
            setShowSetupModal(true);
        } catch (error: any) {
            console.error('Error generating 2FA setup:', error);
            toast.error(error.message || 'Không thể tạo thiết lập 2FA');
        } finally {
            setLoading(false);
        }
    };

    const handleEnable2FA = async () => {
        if (!verificationCode || verificationCode?.length !== 6) {
            toast.error('Vui lòng nhập mã xác thực 6 chữ số');
            return;
        }

        setLoading(true);
        try {
            const response = await AuthService.enable2FA({ verificationCode });

            if (response.data.success) {
                setBackupCodes(response.data.backupCodes || []);
                setShowBackupCodesModal(true);
                setShowSetupModal(false);
                setVerificationCode('');
                toast.success('Đã bật xác thực 2 yếu tố thành công!');
                await fetchStatus();
            } else {
                toast.error(response.data.message || 'Không thể bật 2FA');
            }
        } catch (error: any) {
            console.error('Error enabling 2FA:', error);
            toast.error(error.message || 'Có lỗi xảy ra khi bật 2FA');
        } finally {
            setLoading(false);
        }
    };

    const handleDisable2FA = async () => {
        if (!password) {
            toast.error('Vui lòng nhập mật khẩu');
            return;
        }

        setLoading(true);
        try {
            const response = await AuthService.disable2FA({ password });

            if (response.data.success) {
                setShowDisableModal(false);
                setPassword('');
                toast.success('Đã tắt xác thực 2 yếu tố');
                await fetchStatus();
            } else {
                toast.error(response.data.message || 'Không thể tắt 2FA');
            }
        } catch (error: any) {
            console.error('Error disabling 2FA:', error);
            toast.error(error.message || 'Có lỗi xảy ra khi tắt 2FA');
        } finally {
            setLoading(false);
        }
    };

    const handleRegenerateBackupCodes = async () => {
        if (!password) {
            toast.error('Vui lòng nhập mật khẩu');
            return;
        }

        setLoading(true);
        try {
            const response = await AuthService.regenerateBackupCodes({ password });

            if (response.data.success) {
                setBackupCodes(response.data.backupCodes || []);
                setShowBackupCodesModal(true);
                setPassword('');
                toast.success('Đã tạo lại mã dự phòng');
                await fetchStatus();
            } else {
                toast.error(response.data.message || 'Không thể tạo lại mã dự phòng');
            }
        } catch (error: any) {
            console.error('Error regenerating backup codes:', error);
            toast.error(error.message || 'Có lỗi xảy ra khi tạo lại mã dự phòng');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        setCopiedCode(label);
        toast.success(`Đã sao chép ${label}`);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    const downloadBackupCodes = () => {
        const content = backupCodes.join('\n');
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'backup-codes.txt';
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        toast.success('Đã tải xuống mã dự phòng');
    };

    if (loading && !status) {
        return (
            <div className="content">
                <div
                    className="d-flex justify-content-center align-items-center"
                    style={{
                        minHeight: 'calc(100vh - 300px)',
                        width: '100%',
                    }}
                >
                    <div className="text-center">
                        <SpinnerComponent size="medium" variant="primary" />
                        <p className="mt-3 text-muted">Đang tải dữ liệu...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="content">
            {/* Page Header */}
            <div className="mb-3 border-bottom pb-3">
                <h4 className="fw-bold mb-0">Settings</h4>
            </div>

            <div className="card">
                <div className="card-body p-0">
                    <div className="card w-100 mb-0 border-0 bg-light-500 shadow-none">
                        <div className="card-header border-bottom px-0 mx-3">
                            <div className="d-flex align-items-center gap-2">
                                <Shield size={24} className="text-primary" />
                                <h5 className="fw-bold mb-0">Xác thực 2 yếu tố (2FA)</h5>
                            </div>
                            <p className="text-muted mb-0 mt-2">
                                Tăng cường bảo mật tài khoản của bạn với xác thực 2 yếu tố. Bạn sẽ
                                cần nhập mã từ ứng dụng xác thực mỗi khi đăng nhập.
                            </p>
                        </div>
                        <div className="card-body px-0 mx-3">
                            <div className="two-factor-authentication">
                                <Card className="status-card">
                                    <Card.Body>
                                        <div className="status-info mb-3">
                                            <strong className="me-2">Trạng thái:</strong>
                                            {status?.isEnabled ? (
                                                <Badge
                                                    bg="success"
                                                    className="d-inline-flex align-items-center gap-1"
                                                >
                                                    <Check size={14} /> Đã bật
                                                </Badge>
                                            ) : (
                                                <Badge
                                                    bg="secondary"
                                                    className="d-inline-flex align-items-center gap-1"
                                                >
                                                    <X size={14} /> Chưa bật
                                                </Badge>
                                            )}
                                        </div>
                                        {status?.isEnabled && status?.enabledAt && (
                                            <p className="text-muted small mb-3">
                                                Đã bật từ:{' '}
                                                {new Date(status.enabledAt).toLocaleString('vi-VN')}
                                            </p>
                                        )}

                                        {status?.isEnabled ? (
                                            <>
                                                <Alert variant="success">
                                                    <Alert.Heading as="h6">
                                                        Xác thực 2 yếu tố đang hoạt động
                                                    </Alert.Heading>
                                                    <p className="mb-0 small">
                                                        Tài khoản của bạn được bảo vệ bởi xác thực 2
                                                        yếu tố. Bạn sẽ cần nhập mã từ ứng dụng xác
                                                        thực khi đăng nhập.
                                                    </p>
                                                </Alert>

                                                <div className="backup-codes-info mb-3">
                                                    <strong className="me-2">
                                                        Mã dự phòng còn lại:
                                                    </strong>
                                                    <Badge
                                                        bg={
                                                            status.remainingBackupCodes > 3
                                                                ? 'success'
                                                                : 'warning'
                                                        }
                                                    >
                                                        {status.remainingBackupCodes} mã
                                                    </Badge>
                                                    {status.remainingBackupCodes <= 3 && (
                                                        <span className="text-warning ms-2 small">
                                                            - Bạn nên tạo lại mã dự phòng
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="d-flex gap-2">
                                                    <Button
                                                        variant="outline-primary"
                                                        size="sm"
                                                        onClick={() => {
                                                            const passwordInput = prompt(
                                                                'Nhập mật khẩu để xác nhận:'
                                                            );
                                                            if (passwordInput) {
                                                                setPassword(passwordInput);
                                                                handleRegenerateBackupCodes();
                                                            }
                                                        }}
                                                    >
                                                        <RefreshCw size={16} className="me-1" />
                                                        Tạo lại mã dự phòng
                                                    </Button>
                                                    <Button
                                                        variant="danger"
                                                        size="sm"
                                                        onClick={() => setShowDisableModal(true)}
                                                    >
                                                        Tắt xác thực 2 yếu tố
                                                    </Button>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <Alert variant="info">
                                                    <Alert.Heading as="h6">
                                                        Xác thực 2 yếu tố chưa được bật
                                                    </Alert.Heading>
                                                    <p className="mb-0 small">
                                                        Bật xác thực 2 yếu tố để tăng cường bảo mật
                                                        cho tài khoản của bạn.
                                                    </p>
                                                </Alert>

                                                <div className="benefits-section mb-3">
                                                    <h6 className="fw-bold">
                                                        Lợi ích của xác thực 2 yếu tố:
                                                    </h6>
                                                    <ul className="small">
                                                        <li>
                                                            Bảo vệ tài khoản khỏi truy cập trái phép
                                                        </li>
                                                        <li>Thêm một lớp bảo mật ngoài mật khẩu</li>
                                                        <li>
                                                            Nhận cảnh báo khi có người cố gắng đăng
                                                            nhập
                                                        </li>
                                                        <li>Tuân thủ các tiêu chuẩn bảo mật</li>
                                                    </ul>
                                                </div>

                                                <Button
                                                    variant="primary"
                                                    onClick={handleGenerateSetup}
                                                    disabled={loading}
                                                >
                                                    {loading ? (
                                                        <>
                                                            <Spinner
                                                                as="span"
                                                                animation="border"
                                                                size="sm"
                                                                aria-hidden="true"
                                                                className="me-2"
                                                            />
                                                            Đang tải...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Shield size={16} className="me-2" />
                                                            Bật xác thực 2 yếu tố
                                                        </>
                                                    )}
                                                </Button>
                                            </>
                                        )}
                                    </Card.Body>
                                </Card>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Setup Modal */}
            <Modal show={showSetupModal} onHide={() => setShowSetupModal(false)} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>Thiết lập xác thực 2 yếu tố</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {setupData && (
                        <>
                            <Alert variant="info">
                                <strong>Quét mã QR bằng ứng dụng xác thực</strong>
                                <p className="mb-0 small mt-1">
                                    Sử dụng ứng dụng như Google Authenticator, Microsoft
                                    Authenticator, hoặc Authy để quét mã QR bên dưới.
                                </p>
                            </Alert>

                            <div className="qr-code-section text-center my-4">
                                <img
                                    src={setupData.qrCodeUrl}
                                    alt="QR Code"
                                    className="qr-code-image"
                                    style={{ maxWidth: '300px' }}
                                />
                            </div>

                            <hr />
                            <p className="text-center text-muted mb-2">Hoặc nhập thủ công</p>

                            <div className="secret-key mb-4">
                                <strong className="d-block mb-2">Khóa bí mật:</strong>
                                <div className="d-flex align-items-center gap-2">
                                    <code className="flex-grow-1 p-2 bg-light border rounded">
                                        {setupData.manualEntryKey}
                                    </code>
                                    <Button
                                        variant="outline-secondary"
                                        size="sm"
                                        onClick={() =>
                                            copyToClipboard(setupData.manualEntryKey, 'khóa bí mật')
                                        }
                                    >
                                        <Copy size={16} />
                                    </Button>
                                </div>
                            </div>

                            <hr />

                            <Form>
                                <Form.Group className="mb-3">
                                    <Form.Label>Nhập mã xác thực 6 chữ số từ ứng dụng</Form.Label>
                                    <Form.Control
                                        type="text"
                                        maxLength={6}
                                        value={verificationCode}
                                        onChange={(e) =>
                                            setVerificationCode(removeNonDigits(e.target.value))
                                        }
                                        placeholder="000000"
                                        style={{
                                            fontSize: '24px',
                                            textAlign: 'center',
                                            letterSpacing: '8px',
                                        }}
                                    />
                                </Form.Group>
                            </Form>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowSetupModal(false)}>
                        Hủy
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleEnable2FA}
                        disabled={loading || verificationCode.length !== 6}
                    >
                        {loading ? 'Đang xử lý...' : 'Xác nhận và bật 2FA'}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Disable Modal */}
            <Modal show={showDisableModal} onHide={() => setShowDisableModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Tắt xác thực 2 yếu tố</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Alert variant="warning">
                        <strong>Cảnh báo</strong>
                        <p className="mb-0 small mt-1">
                            Tắt xác thực 2 yếu tố sẽ làm giảm bảo mật tài khoản của bạn. Bạn có chắc
                            chắn muốn tiếp tục?
                        </p>
                    </Alert>
                    <Form>
                        <Form.Group>
                            <Form.Label>Nhập mật khẩu để xác nhận</Form.Label>
                            <Form.Control
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Nhập mật khẩu"
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDisableModal(false)}>
                        Hủy
                    </Button>
                    <Button
                        variant="danger"
                        onClick={handleDisable2FA}
                        disabled={loading || !password}
                    >
                        {loading ? 'Đang xử lý...' : 'Tắt 2FA'}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Backup Codes Modal */}
            <Modal
                show={showBackupCodesModal}
                onHide={() => setShowBackupCodesModal(false)}
                size="lg"
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>Mã dự phòng của bạn</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Alert variant="warning">
                        <strong>Lưu trữ mã dự phòng an toàn</strong>
                        <p className="mb-0 small mt-1">
                            Mỗi mã chỉ có thể sử dụng một lần. Lưu trữ chúng ở nơi an toàn. Bạn sẽ
                            cần chúng nếu mất quyền truy cập vào ứng dụng xác thực.
                        </p>
                    </Alert>

                    <Row className="backup-codes-grid g-3">
                        {backupCodes.map((code) => (
                            <Col key={code} xs={12} md={6}>
                                <div className="backup-code-item d-flex align-items-center justify-content-between p-2 bg-light border rounded">
                                    <code className="fw-bold">{code}</code>
                                    <Button
                                        variant="link"
                                        size="sm"
                                        onClick={() => copyToClipboard(code, code)}
                                        className="p-0"
                                    >
                                        {copiedCode === code ? (
                                            <Check size={16} className="text-success" />
                                        ) : (
                                            <Copy size={16} />
                                        )}
                                    </Button>
                                </div>
                            </Col>
                        ))}
                    </Row>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="outline-primary" onClick={downloadBackupCodes}>
                        <Download size={16} className="me-1" />
                        Tải xuống
                    </Button>
                    <Button variant="primary" onClick={() => setShowBackupCodesModal(false)}>
                        Đóng
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default TwoFactorAuthentication;
