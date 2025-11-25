import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import SignatureCanvas from 'react-signature-canvas';
import { AdminSignatureService } from '@/services/admin-signature.service';
import type { AdminSignature } from '@/types/admin-signature.types';
import ModalDelete from '@/components/ModalDelete';

// Validation helper functions - extracted to reduce cognitive complexity
const validateFullName = (name: string): boolean => {
    if (!name.trim()) {
        toast.error('Vui lòng nhập tên đầy đủ');
        return false;
    }
    return true;
};

const validatePosition = (pos: string): boolean => {
    if (!pos.trim()) {
        toast.error('Vui lòng nhập chức vụ');
        return false;
    }
    return true;
};

const validateSignature = (
    signature: AdminSignature | null,
    signatureFile: File | null,
    signatureMethod: 'upload' | 'draw'
): boolean => {
    if (!signature && !signatureFile) {
        const errorMsg =
            signatureMethod === 'draw'
                ? 'Vui lòng vẽ chữ ký và nhấn "Lưu chữ ký vẽ"'
                : 'Vui lòng chọn file chữ ký';
        toast.error(errorMsg);
        return false;
    }
    return true;
};

// Helper component for signature preview - extracted to reduce cognitive complexity
const SignaturePreview: React.FC<{
    previewUrl: string;
    fullName: string;
    position: string;
}> = ({ previewUrl, fullName, position }) => {
    if (previewUrl) {
        return (
            <div className="text-center">
                <img
                    src={previewUrl}
                    alt="Signature Preview"
                    className="img-fluid"
                    style={{ maxHeight: '250px' }}
                />
                <div className="mt-3">
                    <p className="mb-1 fw-semibold">{fullName}</p>
                    <p className="text-muted mb-0">{position}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="d-flex align-items-center justify-content-center h-100">
            <div className="text-center text-muted">
                <i className="ti ti-photo fs-1" aria-hidden="true" />
                <p className="mt-2">Chưa có chữ ký</p>
            </div>
        </div>
    );
};

// Helper component for status badge - extracted to reduce cognitive complexity
const StatusBadge: React.FC<{ isActive?: boolean }> = ({ isActive }) => (
    <span className={`badge ${isActive ? 'bg-success' : 'bg-secondary'}`}>
        {isActive ? 'Đang hoạt động' : 'Không hoạt động'}
    </span>
);

const AdminSignatureManagement: React.FC = () => {
    const [signature, setSignature] = useState<AdminSignature | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // Form state
    const [fullName, setFullName] = useState('');
    const [position, setPosition] = useState('');
    const [signatureFile, setSignatureFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>('');

    // Signature method state
    const [signatureMethod, setSignatureMethod] = useState<'upload' | 'draw'>('upload');
    const signaturePadRef = useRef<SignatureCanvas>(null);

    // Delete modal state
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    useEffect(() => {
        fetchActiveSignature();
    }, []);

    const fetchActiveSignature = async () => {
        setIsLoading(true);
        try {
            const response = await AdminSignatureService.getActiveSignature();
            if (response.success && response.data) {
                setSignature(response.data);
                setFullName(response.data.fullName);
                setPosition(response.data.position);
                setPreviewUrl(response.data.signatureImageUrl);
            }
        } catch (error) {
            console.error('Error fetching signature:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                toast.error('Vui lòng chọn file ảnh');
                return;
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Kích thước file không được vượt quá 5MB');
                return;
            }

            setSignatureFile(file);

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleClearSignature = () => {
        if (signaturePadRef.current) {
            signaturePadRef.current.clear();
            setPreviewUrl('');
            setSignatureFile(null);
        }
    };

    const handleSaveDrawnSignature = () => {
        if (signaturePadRef.current && !signaturePadRef.current.isEmpty()) {
            const dataUrl = signaturePadRef.current.toDataURL('image/png');
            setPreviewUrl(dataUrl);

            // Convert data URL to File
            fetch(dataUrl)
                .then((res) => res.blob())
                .then((blob) => {
                    const file = new File([blob], 'signature.png', { type: 'image/png' });
                    setSignatureFile(file);
                })
                .catch((error) => {
                    console.error('Error converting signature to file:', error);
                    toast.error('Có lỗi khi lưu chữ ký');
                });
        } else {
            toast.error('Vui lòng vẽ chữ ký trước khi lưu');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Use extracted validation helpers
        if (!validateFullName(fullName)) return;
        if (!validatePosition(position)) return;
        if (!validateSignature(signature, signatureFile, signatureMethod)) return;

        setIsLoading(true);

        try {
            const response = signature
                ? await AdminSignatureService.updateAdminSignature(signature.id, {
                      fullName: fullName.trim(),
                      position: position.trim(),
                      signatureFile: signatureFile || undefined,
                  })
                : await AdminSignatureService.createAdminSignature({
                      fullName: fullName.trim(),
                      position: position.trim(),
                      signatureFile: signatureFile!,
                  });

            if (response.success) {
                toast.success(response.message || 'Lưu chữ ký thành công');
                setIsEditing(false);
                setSignatureFile(null);
                setSignatureMethod('upload');
                signaturePadRef.current?.clear();
                await fetchActiveSignature();
            } else {
                toast.error(response.message || 'Có lỗi xảy ra');
            }
        } catch (error) {
            console.error('Error saving signature:', error);
            toast.error('Có lỗi xảy ra khi lưu chữ ký');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!signature) return;

        setIsLoading(true);
        try {
            const response = await AdminSignatureService.deleteAdminSignature(signature.id);
            if (response.success) {
                toast.success(response.message || 'Xóa chữ ký thành công');
                setSignature(null);
                setFullName('');
                setPosition('');
                setPreviewUrl('');
                setShowDeleteModal(false);
            } else {
                toast.error(response.message || 'Có lỗi xảy ra');
            }
        } catch (error) {
            console.error('Error deleting signature:', error);
            toast.error('Có lỗi xảy ra khi xóa chữ ký');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        if (signature) {
            setFullName(signature.fullName);
            setPosition(signature.position);
            setPreviewUrl(signature.signatureImageUrl);
        } else {
            setFullName('');
            setPosition('');
            setPreviewUrl('');
        }
        setSignatureFile(null);
        setSignatureMethod('upload');
        if (signaturePadRef.current) {
            signaturePadRef.current.clear();
        }
        setIsEditing(false);
    };

    return (
        <>
            <div className="content">
                {/* Page Header */}
                <div className="d-flex align-items-sm-center flex-sm-row flex-column gap-2 pb-3 mb-3 border-1 border-bottom">
                    <div className="flex-grow-1">
                        <h4 className="fw-semibold mb-0">Quản lý chữ ký</h4>
                        <p className="text-muted mb-0">
                            Quản lý chữ ký điện tử dùng cho hợp đồng hợp tác
                        </p>
                    </div>
                </div>

                {/* Info Alert */}
                <div className="alert alert-info d-flex align-items-center mb-4">
                    <i className="ti ti-info-circle fs-4 me-2"></i>
                    <div>
                        <strong>Lưu ý:</strong> Chữ ký này sẽ được sử dụng để ký các hợp đồng hợp
                        tác với bệnh viện. Vui lòng đảm bảo chữ ký rõ ràng và chính xác.
                    </div>
                </div>

                {/* Signature Card */}
                <div className="card">
                    <div className="card-header bg-light">
                        <div className="d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">
                                <i className="ti ti-writing-sign me-2"></i>
                                {signature ? 'Chữ ký hiện tại' : 'Tạo chữ ký mới'}
                            </h5>
                            {signature && !isEditing && (
                                <div className="d-flex gap-2">
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-primary"
                                        onClick={() => {
                                            setIsEditing(true);
                                            setSignatureMethod('upload');
                                            if (signaturePadRef.current) {
                                                signaturePadRef.current.clear();
                                            }
                                        }}
                                    >
                                        <i className="ti ti-edit me-1"></i> Chỉnh sửa
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-danger"
                                        onClick={() => setShowDeleteModal(true)}
                                    >
                                        <i className="ti ti-trash me-1"></i> Xóa
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="card-body">
                        {isLoading && !signature ? (
                            <div className="row">
                                {/* Left Column - Form Fields Skeleton */}
                                <div className="col-md-6">
                                    <div className="mb-3">
                                        <div
                                            className="bg-light rounded placeholder-glow mb-2"
                                            style={{
                                                height: '16px',
                                                width: '30%',
                                                animation: 'pulse 1.5s ease-in-out infinite',
                                            }}
                                        />
                                        <div
                                            className="bg-light rounded placeholder-glow"
                                            style={{
                                                height: '38px',
                                                width: '100%',
                                                animation: 'pulse 1.5s ease-in-out infinite',
                                            }}
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <div
                                            className="bg-light rounded placeholder-glow mb-2"
                                            style={{
                                                height: '16px',
                                                width: '25%',
                                                animation: 'pulse 1.5s ease-in-out infinite',
                                            }}
                                        />
                                        <div
                                            className="bg-light rounded placeholder-glow"
                                            style={{
                                                height: '38px',
                                                width: '100%',
                                                animation: 'pulse 1.5s ease-in-out infinite',
                                            }}
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <div
                                            className="bg-light rounded placeholder-glow mb-2"
                                            style={{
                                                height: '16px',
                                                width: '50%',
                                                animation: 'pulse 1.5s ease-in-out infinite',
                                            }}
                                        />
                                        <div className="d-flex gap-2 mb-3">
                                            <div
                                                className="bg-light rounded placeholder-glow"
                                                style={{
                                                    height: '32px',
                                                    width: '80px',
                                                    animation: 'pulse 1.5s ease-in-out infinite',
                                                }}
                                            />
                                            <div
                                                className="bg-light rounded placeholder-glow"
                                                style={{
                                                    height: '32px',
                                                    width: '80px',
                                                    animation: 'pulse 1.5s ease-in-out infinite',
                                                }}
                                            />
                                        </div>
                                        <div
                                            className="bg-light rounded placeholder-glow"
                                            style={{
                                                height: '200px',
                                                width: '100%',
                                                animation: 'pulse 1.5s ease-in-out infinite',
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Right Column - Preview Skeleton */}
                                <div className="col-md-6">
                                    <div
                                        className="bg-light rounded placeholder-glow mb-2"
                                        style={{
                                            height: '16px',
                                            width: '40%',
                                            animation: 'pulse 1.5s ease-in-out infinite',
                                        }}
                                    />
                                    <div
                                        className="border rounded p-4 bg-light"
                                        style={{ minHeight: '300px' }}
                                    >
                                        <div className="text-center">
                                            <div
                                                className="bg-light rounded mx-auto mb-3"
                                                style={{
                                                    height: '150px',
                                                    width: '70%',
                                                    animation: 'pulse 1.5s ease-in-out infinite',
                                                }}
                                            />
                                            <div
                                                className="bg-light rounded mx-auto mb-2"
                                                style={{
                                                    height: '16px',
                                                    width: '60%',
                                                    animation: 'pulse 1.5s ease-in-out infinite',
                                                }}
                                            />
                                            <div
                                                className="bg-light rounded mx-auto"
                                                style={{
                                                    height: '14px',
                                                    width: '40%',
                                                    animation: 'pulse 1.5s ease-in-out infinite',
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit}>
                                <div className="row">
                                    {/* Left Column - Form Fields */}
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label htmlFor="fullName" className="form-label">
                                                Tên đầy đủ <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="fullName"
                                                value={fullName}
                                                onChange={(e) => setFullName(e.target.value)}
                                                disabled={!!signature && !isEditing}
                                                placeholder="Ví dụ: Nguyễn Văn A"
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label htmlFor="position" className="form-label">
                                                Chức vụ <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="position"
                                                value={position}
                                                onChange={(e) => setPosition(e.target.value)}
                                                disabled={!!signature && !isEditing}
                                                placeholder="Ví dụ: Giám đốc"
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label d-block">
                                                Phương thức tạo chữ ký{' '}
                                                {!signature && (
                                                    <span className="text-danger">*</span>
                                                )}
                                            </label>
                                            <fieldset
                                                className="btn-group mb-3"
                                                style={{ display: 'inline-flex' }}
                                            >
                                                <button
                                                    type="button"
                                                    className={`btn btn-sm ${signatureMethod === 'upload' ? 'btn-primary' : 'btn-outline-primary'}`}
                                                    onClick={() => setSignatureMethod('upload')}
                                                    disabled={!!signature && !isEditing}
                                                    style={{ minWidth: '140px' }}
                                                >
                                                    <i
                                                        className="ti ti-upload me-2"
                                                        aria-hidden="true"
                                                    />{' '}
                                                    Tải lên ảnh
                                                </button>
                                                <button
                                                    type="button"
                                                    className={`btn btn-sm ${signatureMethod === 'draw' ? 'btn-primary' : 'btn-outline-primary'}`}
                                                    onClick={() => setSignatureMethod('draw')}
                                                    disabled={!!signature && !isEditing}
                                                    style={{ minWidth: '140px' }}
                                                >
                                                    <i
                                                        className="ti ti-pencil me-2"
                                                        aria-hidden="true"
                                                    />{' '}
                                                    Vẽ chữ ký
                                                </button>
                                            </fieldset>

                                            {signatureMethod === 'upload' ? (
                                                <>
                                                    <input
                                                        type="file"
                                                        className="form-control"
                                                        id="signatureFile"
                                                        accept="image/*"
                                                        onChange={handleFileChange}
                                                        disabled={!!signature && !isEditing}
                                                    />
                                                    <div className="form-text">
                                                        Định dạng: PNG, JPG, JPEG, GIF, SVG. Tối đa
                                                        5MB.
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="border rounded p-3 bg-white">
                                                    <SignatureCanvas
                                                        ref={signaturePadRef}
                                                        canvasProps={{
                                                            className: 'signature-canvas w-100',
                                                            style: {
                                                                border: '2px dashed #dee2e6',
                                                                borderRadius: '4px',
                                                                height: '200px',
                                                            },
                                                        }}
                                                    />
                                                    <div className="d-flex gap-2 mt-2">
                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-outline-secondary"
                                                            onClick={handleClearSignature}
                                                            disabled={!!signature && !isEditing}
                                                        >
                                                            <i
                                                                className="ti ti-eraser me-1"
                                                                aria-hidden="true"
                                                            />{' '}
                                                            Xóa
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-primary"
                                                            onClick={handleSaveDrawnSignature}
                                                            disabled={!!signature && !isEditing}
                                                        >
                                                            <i
                                                                className="ti ti-check me-1"
                                                                aria-hidden="true"
                                                            />{' '}
                                                            Lưu chữ ký vẽ
                                                        </button>
                                                    </div>
                                                    <div className="form-text mt-2">
                                                        Vẽ chữ ký của bạn trong khung trên và nhấn
                                                        "Lưu chữ ký vẽ"
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {(signature || isEditing) && (
                                            <div className="mb-3">
                                                <span className="form-label d-block">
                                                    Trạng thái
                                                </span>
                                                <div>
                                                    <StatusBadge isActive={signature?.isActive} />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Right Column - Preview */}
                                    <div className="col-md-6">
                                        <span className="form-label d-block">Xem trước chữ ký</span>
                                        <div
                                            className="border rounded p-4 bg-light"
                                            style={{ minHeight: '300px' }}
                                        >
                                            <SignaturePreview
                                                previewUrl={previewUrl}
                                                fullName={fullName}
                                                position={position}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                {(!signature || isEditing) && (
                                    <div className="mt-4 d-flex gap-2">
                                        <button
                                            type="submit"
                                            className="btn btn-primary"
                                            disabled={isLoading}
                                        >
                                            {isLoading ? (
                                                <>
                                                    <output className="spinner-border spinner-border-sm me-2" />{' '}
                                                    Đang lưu...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="ti ti-device-floppy me-1"></i>
                                                    {signature ? 'Cập nhật' : 'Tạo chữ ký'}
                                                </>
                                            )}
                                        </button>
                                        {signature && isEditing && (
                                            <button
                                                type="button"
                                                className="btn btn-secondary"
                                                onClick={handleCancel}
                                                disabled={isLoading}
                                            >
                                                <i className="ti ti-x me-1"></i> Hủy
                                            </button>
                                        )}
                                    </div>
                                )}
                            </form>
                        )}
                    </div>
                </div>

                {/* Usage Info */}
                {signature && (
                    <div className="card mt-4">
                        <div className="card-header bg-light">
                            <h5 className="mb-0">
                                <i className="ti ti-info-circle me-2" aria-hidden="true" /> Thông
                                tin sử dụng
                            </h5>
                        </div>
                        <div className="card-body">
                            <ul className="list-unstyled mb-0">
                                <li className="mb-2">
                                    <i
                                        className="ti ti-check text-success me-2"
                                        aria-hidden="true"
                                    />{' '}
                                    Chữ ký này sẽ tự động được thêm vào hợp đồng khi bạn tạo hợp
                                    đồng mới
                                </li>
                                <li className="mb-2">
                                    <i
                                        className="ti ti-check text-success me-2"
                                        aria-hidden="true"
                                    />{' '}
                                    Chữ ký sẽ xuất hiện ở phần "Đại diện Bên A" trong hợp đồng
                                </li>
                                <li className="mb-2">
                                    <i
                                        className="ti ti-check text-success me-2"
                                        aria-hidden="true"
                                    />{' '}
                                    Bạn có thể cập nhật chữ ký bất kỳ lúc nào
                                </li>
                                <li className="mb-0">
                                    <i
                                        className="ti ti-alert-triangle text-warning me-2"
                                        aria-hidden="true"
                                    />{' '}
                                    Chữ ký cũ sẽ vẫn được giữ trong các hợp đồng đã tạo trước đó
                                </li>
                            </ul>
                        </div>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            <ModalDelete
                show={showDeleteModal}
                onHide={() => setShowDeleteModal(false)}
                onConfirm={handleDelete}
                title="Xóa chữ ký"
                message="Bạn có chắc chắn muốn xóa chữ ký này?"
                itemName={signature?.fullName || ''}
                confirmText="Có, xóa"
                cancelText="Hủy"
            />
        </>
    );
};

export default AdminSignatureManagement;
