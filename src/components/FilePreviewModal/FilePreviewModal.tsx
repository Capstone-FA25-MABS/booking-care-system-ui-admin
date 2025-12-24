import React, { useEffect } from 'react';

interface FilePreviewModalProps {
    isOpen: boolean;
    fileUrl: string;
    fileName: string;
    onClose: () => void;
}

const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
    isOpen,
    fileUrl,
    fileName,
    onClose,
}) => {
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const isImage = /\.(jpg|jpeg|png|gif|webp)(\?|$)/i.test(fileUrl);
    const isPdf = /\.pdf(\?|$)/i.test(fileUrl);
    const isDoc = /\.(doc|docx)(\?|$)/i.test(fileUrl);

    const docViewerUrl = isDoc
        ? `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`
        : '';

    return (
        <div
            className="modal fade show"
            style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
            <div
                className="modal-dialog modal-lg modal-dialog-centered"
                aria-modal="true"
                aria-labelledby="file-preview-modal-title"
            >
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title" id="file-preview-modal-title">
                            {fileName}
                        </h5>
                        <button
                            type="button"
                            className="btn-close"
                            onClick={onClose}
                            aria-label="Close"
                        ></button>
                    </div>
                    <div className="modal-body">
                        {isImage && (
                            <img
                                src={fileUrl}
                                alt={fileName}
                                className="img-fluid w-100"
                                style={{ maxHeight: '70vh', objectFit: 'contain' }}
                            />
                        )}
                        {isPdf && (
                            <iframe
                                src={fileUrl}
                                title={fileName}
                                style={{ width: '100%', height: '70vh', border: 'none' }}
                            />
                        )}
                        {isDoc && (
                            <div>
                                <iframe
                                    src={docViewerUrl}
                                    title={fileName}
                                    style={{ width: '100%', height: '70vh', border: 'none' }}
                                />
                                <div className="alert alert-info mt-3 mb-0">
                                    <i className="ti ti-info-circle me-2"></i> Preview được cung cấp
                                    bởi Google Docs Viewer. Nếu không hiển thị, vui lòng{' '}
                                    <a
                                        href={fileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="alert-link"
                                    >
                                        tải xuống file
                                    </a>{' '}
                                    .
                                </div>
                            </div>
                        )}
                        {!isImage && !isPdf && !isDoc && (
                            <div className="text-center py-5">
                                <i className="ti ti-file-unknown fs-1 text-muted"></i>
                                <p className="mt-3">Không thể preview file này</p>
                                <a
                                    href={fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-primary"
                                >
                                    <i className="ti ti-download me-2"></i> Tải xuống
                                </a>
                            </div>
                        )}
                    </div>
                    <div className="modal-footer">
                        <a
                            href={fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-primary"
                        >
                            <i className="ti ti-external-link me-2"></i> Mở trong tab mới
                        </a>
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Đóng
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FilePreviewModal;
