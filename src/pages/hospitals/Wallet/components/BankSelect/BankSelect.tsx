import React, { useState, useEffect, useRef } from 'react';
import clsx from 'clsx';

import { Bank } from '@/types/bank.types';
import BankService from '@/services/bank.service';
import styles from './BankSelect.module.scss';

interface BankSelectProps {
    value: string;
    onChange: (bankCode: string, bank?: Bank) => void;
    placeholder?: string;
    required?: boolean;
    id?: string;
    className?: string;
}

const BankSelect: React.FC<BankSelectProps> = ({
    value,
    onChange,
    placeholder = 'Chọn ngân hàng',
    required = false,
    id,
    className,
}) => {
    const [banks, setBanks] = useState<Bank[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const selectRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);

    const selectedBank = banks.find((bank) => bank.code === value);

    useEffect(() => {
        loadBanks();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setSearchTerm('');
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const loadBanks = async () => {
        setLoading(true);
        try {
            const bankData = await BankService.getBanks();
            setBanks(bankData);
        } catch (error) {
            console.error('Failed to load banks:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredBanks = banks.filter(
        (bank) =>
            bank.shortName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            bank.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            bank.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelectBank = (bank: Bank) => {
        onChange(bank.code, bank);
        setIsOpen(false);
        setSearchTerm('');
    };

    const handleToggle = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            setTimeout(() => {
                searchRef.current?.focus();
            }, 100);
        }
    };

    return (
        <div ref={selectRef} className={clsx(styles.bankSelect, className)} id={id}>
            <button
                type="button"
                className={clsx(styles.selectButton, {
                    [styles.open]: isOpen,
                    [styles.hasValue]: selectedBank || value,
                    [styles.required]: required && !selectedBank && !value,
                })}
                onClick={handleToggle}
                aria-label={selectedBank ? selectedBank.shortName : placeholder}
            >
                <div className={styles.selectedContent}>
                    {selectedBank ? (
                        <div className={styles.selectedBank}>
                            <img
                                src={selectedBank.logo}
                                alt={selectedBank.shortName}
                                className={styles.bankLogo}
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = '/placeholder-bank.png';
                                }}
                            />
                            <div className={styles.bankInfo}>
                                <span className={styles.bankName}>{selectedBank.shortName}</span>
                                <span className={styles.bankCode}>{selectedBank.code}</span>
                            </div>
                        </div>
                    ) : (
                        <span className={styles.placeholder}>{placeholder}</span>
                    )}
                </div>

                <div className={styles.arrow}>
                    <i className={`fa-solid fa-chevron-down ${isOpen ? styles.rotate : ''}`}></i>
                </div>
            </button>

            {isOpen && (
                <div className={styles.dropdown}>
                    <div className={styles.searchContainer}>
                        <input
                            ref={searchRef}
                            type="text"
                            placeholder="Tìm kiếm ngân hàng..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={styles.searchInput}
                        />
                        <i className="fa-solid fa-search"></i>
                    </div>

                    <div className={styles.bankList}>
                        {loading && (
                            <div className={styles.loading}>
                                <output className="spinner-border spinner-border-sm">
                                    <span className="visually-hidden">Loading...</span>
                                </output>
                                <span className="ms-2">Đang tải danh sách ngân hàng...</span>
                            </div>
                        )}

                        {!loading && filteredBanks.length === 0 && (
                            <div className={styles.noResults}>Không tìm thấy ngân hàng phù hợp</div>
                        )}

                        {!loading &&
                            filteredBanks.length > 0 &&
                            filteredBanks.map((bank) => (
                                <button
                                    key={bank.code}
                                    type="button"
                                    className={clsx(styles.bankItem, {
                                        [styles.selected]: bank.code === value,
                                    })}
                                    onClick={() => handleSelectBank(bank)}
                                >
                                    <img
                                        src={bank.logo}
                                        alt={bank.shortName}
                                        className={styles.bankLogo}
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src =
                                                '/placeholder-bank.png';
                                        }}
                                    />
                                    <div className={styles.bankInfo}>
                                        <span className={styles.bankName}>{bank.shortName}</span>
                                        <span className={styles.bankFullName}>{bank.name}</span>
                                    </div>
                                    {bank.code === value && (
                                        <i className="fa-solid fa-check text-primary"></i>
                                    )}
                                </button>
                            ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default BankSelect;
