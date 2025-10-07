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
        const pages: (number | string)[] = [];
        const maxVisiblePages = 7; // Số trang tối đa hiển thị

        if (totalPages <= maxVisiblePages) {
            // Nếu tổng số trang <= 7, hiển thị tất cả
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Logic hiển thị trang với ellipsis
            if (currentPage <= 4) {
                // Trang hiện tại ở đầu
                for (let i = 1; i <= 5; i++) {
                    pages.push(i);
                }
                pages.push('...');
                pages.push(totalPages - 1);
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 3) {
                // Trang hiện tại ở cuối
                pages.push(1);
                pages.push(2);
                pages.push('...');
                for (let i = totalPages - 4; i <= totalPages; i++) {
                    pages.push(i);
                }
            } else {
                // Trang hiện tại ở giữa
                pages.push(1);
                pages.push(2);
                pages.push('...');
                for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                    pages.push(i);
                }
                pages.push('...');
                pages.push(totalPages - 1);
                pages.push(totalPages);
            }
        }

        return pages;
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
                            <span key={`ellipsis-${index}`} className={styles.ellipsis}>
                                ...
                            </span>
                        );
                    }

                    const pageNumber = page as number;
                    const isActive = pageNumber === currentPage;

                    return (
                        <button
                            key={pageNumber}
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
                    onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
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
