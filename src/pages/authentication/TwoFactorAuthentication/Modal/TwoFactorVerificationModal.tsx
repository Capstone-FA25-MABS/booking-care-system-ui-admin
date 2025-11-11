import React, { useState } from 'react';
import { Modal, Button, Form, Alert, Spinner, Nav, Tab } from 'react-bootstrap';
import { Shield, Key, FileKey } from 'lucide-react';

interface TwoFactorVerificationModalProps {
    show: boolean;
    onHide: () => void;
    onVerify: (code: string) => Promise<void>;
    isLoading?: boolean;
    error?: string | null;
}

type VerificationMethod = 'totp' | 'backup';

const TwoFactorVerificationModal: React.FC<TwoFactorVerificationModalProps> = ({
    show,
    onHide,
    onVerify,
    isLoading = false,
    error = null,
}) => {
    const [verificationCode, setVerificationCode] = useState('');
    const [localError, setLocalError] = useState<string | null>(null);
    const [activeMethod, setActiveMethod] = useState<VerificationMethod>('totp');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError(null);

        // Validate based on method
        if (activeMethod === 'totp') {
            if (!verificationCode || verificationCode?.length !== 6) {
                setLocalError('Vui lòng nhập mã xác thực 6 chữ số');
                return;
            }
        } else if (!verificationCode || verificationCode?.length !== 8) {
            setLocalError('Vui lòng nhập mã dự phòng 8 ký tự');
            return;
        }

        try {
            await onVerify(verificationCode);
            setVerificationCode('');
        } catch (err: any) {
            setLocalError(err.message || 'Mã xác thực không hợp lệ');
        }
    };

    const handleClose = () => {
        setVerificationCode('');
        setLocalError(null);
        setActiveMethod('totp');
        onHide();
    };

    const handleMethodChange = (method: VerificationMethod) => {
        setActiveMethod(method);
        setVerificationCode('');
        setLocalError(null);
    };

    return (
        <Modal show={show} onHide={handleClose} centered backdrop="static" keyboard={false}>
            <Modal.Header closeButton>
                <Modal.Title className="d-flex align-items-center gap-2">
                    <Shield size={24} className="text-primary" />
                    Xác thực 2 yếu tố
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {(error || localError) && (
                    <Alert variant="danger" className="mb-3 text-center">
                        {error || localError}
                    </Alert>
                )}

                <Tab.Container
                    activeKey={activeMethod}
                    onSelect={(k) => handleMethodChange(k as VerificationMethod)}
                >
                    <Nav variant="tabs" className="mb-3">
                        <Nav.Item>
                            <Nav.Link eventKey="totp" className="d-flex align-items-center gap-2">
                                <Key size={16} />
                                Mã xác thực
                            </Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="backup" className="d-flex align-items-center gap-2">
                                <FileKey size={16} />
                                Mã dự phòng
                            </Nav.Link>
                        </Nav.Item>
                    </Nav>

                    <Tab.Content>
                        <Tab.Pane eventKey="totp">
                            <p className="text-muted mb-3">
                                Nhập mã xác thực 6 chữ số từ ứng dụng xác thực của bạn (Google
                                Authenticator, Authy, v.v.)
                            </p>
                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Mã xác thực TOTP</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="000000"
                                        value={verificationCode}
                                        onChange={(e) => {
                                            const value = e.target.value
                                                .replace(/\D/g, '')
                                                .slice(0, 6);
                                            setVerificationCode(value);
                                            setLocalError(null);
                                        }}
                                        maxLength={6}
                                        autoFocus
                                        disabled={isLoading}
                                        className="text-center fs-4 letter-spacing-2"
                                    />
                                    <Form.Text className="text-muted">
                                        Nhập mã 6 chữ số từ ứng dụng xác thực
                                    </Form.Text>
                                </Form.Group>

                                <div className="d-flex gap-2">
                                    <Button
                                        variant="danger"
                                        onClick={handleClose}
                                        disabled={isLoading}
                                        className="flex-fill"
                                    >
                                        Hủy
                                    </Button>
                                    <Button
                                        variant="info"
                                        type="submit"
                                        disabled={isLoading || verificationCode.length !== 6}
                                        className="flex-fill"
                                    >
                                        {isLoading ? (
                                            <>
                                                <Spinner
                                                    as="span"
                                                    animation="border"
                                                    size="sm"
                                                    aria-hidden="true"
                                                    className="me-2"
                                                />
                                                Đang xác thực...
                                            </>
                                        ) : (
                                            'Xác thực'
                                        )}
                                    </Button>
                                </div>
                            </Form>
                        </Tab.Pane>

                        <Tab.Pane eventKey="backup">
                            <Alert variant="info" className="mb-3">
                                <small>
                                    <strong>Lưu ý:</strong> Mỗi mã dự phòng chỉ có thể sử dụng một
                                    lần. Sau khi sử dụng, mã sẽ bị vô hiệu hóa.
                                </small>
                            </Alert>
                            <p className="text-muted mb-3">
                                Nhập một trong các mã dự phòng 8 ký tự mà bạn đã lưu khi thiết lập
                                2FA.
                            </p>
                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Mã dự phòng</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="ABCD1234"
                                        value={verificationCode}
                                        onChange={(e) => {
                                            const value = e.target.value
                                                .toUpperCase()
                                                .replace(/[^A-Z0-9]/g, '')
                                                .slice(0, 8);
                                            setVerificationCode(value);
                                            setLocalError(null);
                                        }}
                                        maxLength={8}
                                        autoFocus
                                        disabled={isLoading}
                                        className="text-center fs-4 letter-spacing-2"
                                    />
                                    <Form.Text className="text-muted">
                                        Nhập mã dự phòng 8 ký tự (chữ và số)
                                    </Form.Text>
                                </Form.Group>

                                <div className="d-flex gap-2">
                                    <Button
                                        variant="danger"
                                        onClick={handleClose}
                                        disabled={isLoading}
                                        className="flex-fill"
                                    >
                                        Hủy
                                    </Button>
                                    <Button
                                        variant="info"
                                        type="submit"
                                        disabled={isLoading || verificationCode.length !== 8}
                                        className="flex-fill"
                                    >
                                        {isLoading ? (
                                            <>
                                                <Spinner
                                                    as="span"
                                                    animation="border"
                                                    size="sm"
                                                    aria-hidden="true"
                                                    className="me-2"
                                                />
                                                Đang xác thực...
                                            </>
                                        ) : (
                                            'Xác thực'
                                        )}
                                    </Button>
                                </div>
                            </Form>
                        </Tab.Pane>
                    </Tab.Content>
                </Tab.Container>
            </Modal.Body>
        </Modal>
    );
};

export default TwoFactorVerificationModal;
