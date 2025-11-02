import React from 'react';
import { Account } from '@/types/auth.types';
import {
    getToggleActiveTitle,
    getLockTitle,
    getUnlockTitle,
    getStatusBadgeClass,
    getStatusLabel,
} from '@/utils/account-management.utils';

interface AccountTableRowProps {
    /**
     * Account data to display
     */
    account: Account;
    /**
     * Whether to show phone column
     * @default false
     */
    showPhoneColumn?: boolean;
    /**
     * Callback when toggle ban/unban is clicked
     */
    onToggleBanUnban: (accountId: string) => void;
    /**
     * Callback when lock account is clicked
     */
    onLockAccount: (accountId: string) => void;
    /**
     * Callback when unlock account is clicked
     */
    onUnlockAccount: (accountId: string) => void;
}

/**
 * Table row component for account management
 * Displays account information with avatar, toggles, and status
 */
const AccountTableRow: React.FC<AccountTableRowProps> = ({
    account,
    showPhoneColumn = false,
    onToggleBanUnban,
    onLockAccount,
    onUnlockAccount,
}) => {
    return (
        <tr key={account.accountId}>
            {/* Column 1: Name with Avatar */}
            <td>
                <div className="d-flex align-items-center">
                    <span className="avatar me-2">
                        {account.avatarUrl ? (
                            <img
                                src={account.avatarUrl}
                                alt={account.fullName}
                                className="rounded-circle"
                            />
                        ) : (
                            <div className="avatar-placeholder bg-primary text-white rounded-circle d-flex align-items-center justify-content-center">
                                {account.fullName.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </span>
                    <div>
                        <h6 className="mb-1 fs-14 fw-semibold">
                            <span className="text-dark">{account.fullName}</span>
                        </h6>
                    </div>
                </div>
            </td>

            {/* Column 2: Email */}
            <td>{account.email}</td>

            {/* Column 3: Phone (conditional) */}
            {showPhoneColumn && <td>{account.phone || '-'}</td>}

            {/* Column 4: Address */}
            <td>{account.address || '-'}</td>

            {/* Column 5: Toggle Active/Inactive */}
            <td>
                <div className="form-check form-switch">
                    <input
                        className="form-check-input"
                        type="checkbox"
                        role="switch"
                        id={`switch-active-${account.accountId}`}
                        checked={account.status === 'ACTIVE'}
                        onChange={() => onToggleBanUnban(account.accountId)}
                        disabled={account.isLocked}
                        title={getToggleActiveTitle(account.isLocked, account.status)}
                    />
                </div>
            </td>

            {/* Column 6: Toggle Lock/Unlock */}
            <td>
                <div className="form-check form-switch">
                    <input
                        className="form-check-input"
                        type="checkbox"
                        role="switch"
                        id={`switch-lock-${account.accountId}`}
                        checked={account.isLocked}
                        onChange={() =>
                            account.isLocked
                                ? onUnlockAccount(account.accountId)
                                : onLockAccount(account.accountId)
                        }
                        title={account.isLocked ? getUnlockTitle() : getLockTitle()}
                    />
                </div>
            </td>

            {/* Column 7: Status Badge */}
            <td>
                <span className={getStatusBadgeClass(account.status)}>
                    {getStatusLabel(account.status)}
                </span>
            </td>
        </tr>
    );
};

export default AccountTableRow;
