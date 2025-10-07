import React from 'react';
import styles from './Pagination.module.scss';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
    // Không hiển thị pagination nếu chỉ có 1 trang
    if (totalPages <= 1) {
        return null;
    }

    // Tạo danh sách số trang để hiển thị
    const getPageNumbers = () => {
        const maxVisiblePages = 7; // Số trang tối đa hiển thị

        if (totalPages <= maxVisiblePages) {
            // Nếu tổng số trang <= 7, hiển thị tất cả
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        // Logic hiển thị trang với ellipsis
        if (currentPage <= 4) {
            // Trang hiện tại ở đầu
            return [1, 2, 3, 4, 5, '...', totalPages - 1, totalPages];
        }

        if (currentPage >= totalPages - 3) {
            // Trang hiện tại ở cuối
            return [
                1,
                2,
                '...',
                totalPages - 4,
                totalPages - 3,
                totalPages - 2,
                totalPages - 1,
                totalPages,
            ];
        }

        // Trang hiện tại ở giữa
        return [
            1,
            2,
            '...',
            currentPage - 1,
            currentPage,
            currentPage + 1,
            '...',
            totalPages - 1,
            totalPages,
        ];
    };

    return (
        <div className={styles.paginationContainer}>
            {/* Pagination Controls */}
            <div className={styles.pagination}>
                {/* Nút Previous */}
                <button
                    className={`${styles.pageButton} ${styles.prevButton} ${currentPage === 1 ? styles.disabled : ''}`}
                    onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    aria-label="Trang trước"
                >
                    <i className="ti ti-chevron-left"></i>
                </button>

                {/* Page Numbers */}
                {getPageNumbers().map((page, index) => {
                    if (page === '...') {
                        return (
                            <span
                                key={`ellipsis-${currentPage}-${index}`}
                                className={styles.ellipsis}
                            >
                                ...
                            </span>
                        );
                    }

                    const pageNumber = page as number;
                    const isActive = pageNumber === currentPage;

                    return (
                        <button
                            key={`page-${pageNumber}`}
                            className={`${styles.pageButton} ${isActive ? styles.active : ''}`}
                            onClick={() => onPageChange(pageNumber)}
                            aria-label={`Trang ${pageNumber}`}
                            aria-current={isActive ? 'page' : undefined}
                        >
                            {pageNumber}
                        </button>
                    );
                })}

                {/* Nút Next */}
                <button
                    className={`${styles.pageButton} ${styles.nextButton} ${currentPage === totalPages ? styles.disabled : ''}`}
                    onClick={() => {
                        if (currentPage < totalPages) {
                            onPageChange(currentPage + 1);
                        }
                    }}
                    disabled={currentPage === totalPages}
                    aria-label="Trang tiếp theo"
                >
                    <i className="ti ti-chevron-right"></i>
                </button>
            </div>
        </div>
    );
};

export default Pagination;
