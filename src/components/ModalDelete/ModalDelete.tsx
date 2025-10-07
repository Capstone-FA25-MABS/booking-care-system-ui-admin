import React from 'react';

interface ModalDeleteProps {
    show: boolean;
    onHide: () => void;
    onConfirm: () => void;
    title?: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
    loading?: boolean;
    itemName?: string;
}

export const ModalDelete: React.FC<ModalDeleteProps> = ({
    show,
    onHide,
    onConfirm,
    title = 'Xác Nhận Xóa',
    message = 'Bạn có chắc chắn muốn xóa mục này không?',
    confirmText = 'Có, Xóa',
    cancelText = 'Hủy',
    loading = false,
    itemName = '',
}) => {
    if (!show) return null;

    return (
        <div
            className={`modal fade ${show ? 'show' : ''}`}
            id="delete_modal"
            style={{ display: show ? 'block' : 'none' }}
        >
            <div className="modal-dialog modal-dialog-centered modal-sm">
                <div className="modal-content">
                    <div className="modal-body text-center position-relative">
                        <div className="mb-3 position-relative z-1">
                            <span className="avatar avatar-lg bg-danger text-white">
                                <i className="ti ti-trash fs-24"></i>
                            </span>
                        </div>
                        <h5 className="fw-bold mb-1 position-relative z-1">{title}</h5>
                        <p className="mb-3 position-relative z-1">
                            {message}
                            {itemName && (
                                <>
                                    {' '}
                                    <strong>{itemName}</strong>
                                </>
                            )}
                            ?
                        </p>
                        <div className="d-flex justify-content-center">
                            <button
                                type="button"
                                className="btn btn-light position-relative z-1 me-3"
                                onClick={onHide}
                                disabled={loading}
                            >
                                {cancelText}
                            </button>
                            <button
                                type="button"
                                className="btn btn-danger position-relative z-1"
                                onClick={onConfirm}
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span
                                            className="spinner-border spinner-border-sm me-2"
                                            role="status"
                                            aria-hidden="true"
                                        ></span>
                                        Đang xóa...
                                    </>
                                ) : (
                                    confirmText
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModalDelete;
