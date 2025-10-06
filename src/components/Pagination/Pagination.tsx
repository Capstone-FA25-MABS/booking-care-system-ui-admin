import React from 'react';
import styles from './Pagination.module.scss';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    itemsPerPage?: number;
    showInfo?: boolean;
    onItemsPerPageChange?: (itemsPerPage: number) => void;
    showItemsPerPage?: boolean;
    itemsPerPageOptions?: number[];
}

const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    onPageChange,
    itemsPerPage = 10,
    showInfo: _showInfo = true,
    onItemsPerPageChange,
    showItemsPerPage = true,
    itemsPerPageOptions = [10, 25, 50, 100],
}) => {
    // Không hiển thị pagination nếu chỉ có 1 trang
    if (totalPages <= 1) {
        return null;
    }

    return (
        <div className={styles.paginationContainer}>
            {/* Row Per Page Selector */}
            {showItemsPerPage && onItemsPerPageChange && (
                <div className={styles.itemsPerPageSection}>
                    <span className={styles.itemsPerPageLabel}>Hiển thị</span>
                    <select
                        className={styles.itemsPerPageSelect}
                        value={itemsPerPage}
                        onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
                    >
                        {itemsPerPageOptions.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                    <span className={styles.entriesLabel}></span>
                </div>
            )}

            {/* Pagination Controls */}
            <div className={styles.pagination}>
                {/* Nút Previous */}
                <button
                    className={`${styles.pageButton} ${styles.prevButton} ${currentPage === 1 ? styles.disabled : ''}`}
                    onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    aria-label="Trang trước"
                >
                    <i className="fa-solid fa-chevron-left"></i>
                </button>

                {/* Current Page Button */}
                <button
                    className={`${styles.pageButton} ${styles.currentPageButton} ${styles.active}`}
                    aria-label={`Trang ${currentPage}`}
                    aria-current="page"
                >
                    {currentPage}
                </button>

                {/* Nút Next */}
                <button
                    className={`${styles.pageButton} ${styles.nextButton} ${currentPage === totalPages ? styles.disabled : ''}`}
                    onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    aria-label="Trang tiếp theo"
                >
                    <i className="fa-solid fa-chevron-right"></i>
                </button>
            </div>
        </div>
    );
};

export default Pagination;
