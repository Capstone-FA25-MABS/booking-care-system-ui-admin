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

    // Helper functions to reduce cognitive complexity
    const addPageRange = (pages: (number | string)[], start: number, end: number) => {
        for (let i = start; i <= end; i++) {
            pages.push(i);
        }
    };

    const addEllipsis = (pages: (number | string)[]) => {
        pages.push('...');
    };

    const addFirstPages = (pages: (number | string)[]) => {
        pages.push(1);
        pages.push(2);
    };

    const addLastPages = (pages: (number | string)[]) => {
        pages.push(totalPages - 1);
        pages.push(totalPages);
    };

    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const maxVisiblePages = 7;

        if (totalPages <= maxVisiblePages) {
            addPageRange(pages, 1, totalPages);
            return pages;
        }

        if (currentPage <= 4) {
            addPageRange(pages, 1, 5);
            addEllipsis(pages);
            addLastPages(pages);
        } else if (currentPage >= totalPages - 3) {
            addFirstPages(pages);
            addEllipsis(pages);
            addPageRange(pages, totalPages - 4, totalPages);
        } else {
            addFirstPages(pages);
            addEllipsis(pages);
            addPageRange(pages, currentPage - 1, currentPage + 1);
            addEllipsis(pages);
            addLastPages(pages);
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
