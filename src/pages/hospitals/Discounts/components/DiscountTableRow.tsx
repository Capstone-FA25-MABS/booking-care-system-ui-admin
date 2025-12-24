// src/pages/hospitals/Discounts/components/DiscountTableRow.tsx
import React from 'react';
import { Discount } from '@/types/discount.types';
import { DiscountStatus, DiscountType } from '@/enums/discount.enums';
import styles from '../HospitalDiscountManagement.module.scss';

interface DiscountTableRowProps {
    discount: Discount;
    onEdit: (discount: Discount) => void;
    onToggleStatus: (discount: Discount) => void;
    onDelete: (id: string) => void;
    formatDate: (date: string) => string;
    getDiscountTypeText: (type: DiscountType) => string;
    getStatusBadge: (status: DiscountStatus) => React.ReactElement;
}

const DiscountTableRow: React.FC<DiscountTableRowProps> = ({
    discount,
    onEdit,
    onToggleStatus,
    onDelete,
    formatDate,
    getDiscountTypeText,
    getStatusBadge,
}) => {
    const getUsagePercentage = () => {
        if (!discount.maxUses) return 0;
        return (discount.usesCount / discount.maxUses) * 100;
    };

    const getAmountDisplay = () => {
        return discount.discountType === DiscountType.PERCENTAGE
            ? `${discount.amount}%`
            : `${discount.amount.toLocaleString('vi-VN')}₫`;
    };

    const getToggleIcon = () => {
        return discount.status === DiscountStatus.ACTIVE
            ? 'ti ti-toggle-right'
            : 'ti ti-toggle-left';
    };

    const getToggleTitle = () => {
        return discount.status === DiscountStatus.ACTIVE ? 'Vô hiệu hóa' : 'Kích hoạt';
    };

    const getToggleClassName = () => {
        return discount.status === DiscountStatus.ACTIVE
            ? styles.deactivateBtn
            : styles.activateBtn;
    };

    return (
        <tr>
            <td>
                <span className={styles.codeTag}>{discount.code}</span>
            </td>
            <td>
                <div className={styles.nameCell}>
                    <div className={styles.name}>{discount.name}</div>
                    {discount.description && (
                        <div className={styles.description}>{discount.description}</div>
                    )}
                </div>
            </td>
            <td>
                <span className={styles.typeBadge}>
                    {getDiscountTypeText(discount.discountType)}
                </span>
            </td>
            <td>
                <span className={styles.amountValue}>{getAmountDisplay()}</span>
            </td>
            <td>
                <div className={styles.usageCell}>
                    <div className={styles.usageBar}>
                        <div
                            className={styles.usageProgress}
                            style={{ width: `${getUsagePercentage()}%` }}
                        ></div>
                    </div>
                    <div className={styles.usageText}>
                        {discount.usesCount}
                        {discount.maxUses ? ` / ${discount.maxUses}` : ' / ∞'}
                    </div>
                </div>
            </td>
            <td>
                <div className={styles.dateRange}>
                    <div className={styles.dateStart}>
                        <i className="fas fa-play-circle"></i>
                        {formatDate(discount.startDate)}
                    </div>
                    <div className={styles.dateEnd}>
                        <i className="fas fa-stop-circle"></i>
                        {formatDate(discount.endDate)}
                    </div>
                </div>
            </td>
            <td>{getStatusBadge(discount.status)}</td>
            <td>
                <div className={styles.actions}>
                    <button
                        onClick={() => onEdit(discount)}
                        className={styles.editBtn}
                        title="Chỉnh sửa"
                        type="button"
                    >
                        <i className="ti ti-edit"></i>
                    </button>
                    <button
                        onClick={() => onToggleStatus(discount)}
                        className={getToggleClassName()}
                        title={getToggleTitle()}
                        type="button"
                    >
                        <i className={getToggleIcon()}></i>
                    </button>
                    <button
                        onClick={() => onDelete(discount.id)}
                        className={styles.deleteBtn}
                        title="Xóa"
                        type="button"
                    >
                        <i className="ti ti-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    );
};

export default DiscountTableRow;
