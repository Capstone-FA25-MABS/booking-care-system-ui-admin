import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../index';
import { Discount } from '../../types/discount.types';
import { DiscountStatus, DiscountType } from '../../enums/discount.enums';

// Base selectors
export const selectDiscountState = (state: RootState) => state.discount;

// Simple selectors
export const selectDiscounts = createSelector(
    [selectDiscountState],
    (discount) => discount.discounts
);

export const selectCurrentDiscount = createSelector(
    [selectDiscountState],
    (discount) => discount.currentDiscount
);

export const selectDiscountValidationResult = createSelector(
    [selectDiscountState],
    (discount) => discount.validationResult
);

export const selectDiscountUsageStats = createSelector(
    [selectDiscountState],
    (discount) => discount.usageStats
);

export const selectDiscountPagination = createSelector(
    [selectDiscountState],
    (discount) => discount.pagination
);

export const selectDiscountLoading = createSelector(
    [selectDiscountState],
    (discount) => discount.loading
);

export const selectDiscountError = createSelector(
    [selectDiscountState],
    (discount) => discount.error
);

export const selectDiscountFilters = createSelector(
    [selectDiscountState],
    (discount) => discount.filters
);

export const selectAppliedDiscount = createSelector(
    [selectDiscountState],
    (discount) => discount.appliedDiscount
);

// Complex selectors
export const selectActiveDiscounts = createSelector([selectDiscounts], (discounts) =>
    discounts.filter((discount) => discount.status === DiscountStatus.ACTIVE)
);

export const selectInactiveDiscounts = createSelector([selectDiscounts], (discounts) =>
    discounts.filter((discount) => discount.status === DiscountStatus.INACTIVE)
);

export const selectExpiredDiscounts = createSelector([selectDiscounts], (discounts) =>
    discounts.filter((discount) => discount.status === DiscountStatus.EXPIRED)
);

export const selectValidDiscounts = createSelector([selectDiscounts], (discounts) => {
    const now = new Date();
    return discounts.filter((discount) => {
        if (discount.status !== DiscountStatus.ACTIVE) return false;

        const startDate = new Date(discount.startDate);
        const endDate = new Date(discount.endDate);

        return now >= startDate && now <= endDate;
    });
});

export const selectDiscountsByType = createSelector(
    [selectDiscounts, (_, discountType: DiscountType) => discountType],
    (discounts, discountType) =>
        discounts.filter((discount) => discount.discountType === discountType)
);

export const selectDiscountsByClinic = createSelector(
    [selectDiscounts, (_, clinicId: string) => clinicId],
    (discounts, clinicId) =>
        discounts.filter((discount) => !discount.clinicId || discount.clinicId === clinicId)
);

export const selectDiscountsBySpecialty = createSelector(
    [selectDiscounts, (_, specialtyId: string) => specialtyId],
    (discounts, specialtyId) =>
        discounts.filter(
            (discount) => !discount.specialtyId || discount.specialtyId === specialtyId
        )
);

export const selectDiscountsByDoctor = createSelector(
    [selectDiscounts, (_, doctorId: string) => doctorId],
    (discounts, doctorId) =>
        discounts.filter((discount) => !discount.doctorId || discount.doctorId === doctorId)
);

export const selectAvailableDiscountsForContext = createSelector(
    [
        selectValidDiscounts,
        (
            _,
            context: {
                clinicId: string;
                specialtyId?: string;
                doctorId?: string;
            }
        ) => context,
    ],
    (validDiscounts, context) => {
        return validDiscounts.filter((discount) => {
            // Check clinic constraint
            if (discount.clinicId && discount.clinicId !== context.clinicId) {
                return false;
            }

            // Check specialty constraint
            if (
                discount.specialtyId &&
                context.specialtyId &&
                discount.specialtyId !== context.specialtyId
            ) {
                return false;
            }

            // Check doctor constraint
            if (discount.doctorId && context.doctorId && discount.doctorId !== context.doctorId) {
                return false;
            }

            // Check usage limits
            if (discount.maxUses && discount.usesCount >= discount.maxUses) {
                return false;
            }

            return true;
        });
    }
);

export const selectHighValueDiscounts = createSelector([selectValidDiscounts], (discounts) =>
    discounts.filter((discount) => {
        if (discount.discountType === DiscountType.PERCENTAGE) {
            return discount.amount >= 10; // 10% or more
        } else {
            return discount.amount >= 50000; // 50,000 VND or more
        }
    })
);

export const selectDiscountByCode = createSelector(
    [selectDiscounts, (_, code: string) => code],
    (discounts, code) =>
        discounts.find((discount) => discount.code.toLowerCase() === code.toLowerCase())
);

export const selectDiscountById = createSelector(
    [selectDiscounts, (_, id: string) => id],
    (discounts, id) => discounts.find((discount) => discount.id === id)
);

export const selectSortedDiscounts = createSelector(
    [
        selectDiscounts,
        (_, sortBy?: keyof Discount, sortOrder?: 'asc' | 'desc') => ({ sortBy, sortOrder }),
    ],
    (discounts, { sortBy = 'createdAt', sortOrder = 'desc' }) => {
        const sorted = [...discounts].sort((a, b) => {
            const aValue = a[sortBy];
            const bValue = b[sortBy];

            // Handle undefined values
            if (aValue === undefined && bValue === undefined) return 0;
            if (aValue === undefined) return 1;
            if (bValue === undefined) return -1;

            if (aValue === bValue) return 0;

            const comparison = aValue < bValue ? -1 : 1;
            return sortOrder === 'desc' ? -comparison : comparison;
        });

        return sorted;
    }
);

export const selectDiscountStatsCalculated = createSelector([selectDiscounts], (discounts) => {
    const now = new Date();

    return {
        total: discounts.length,
        active: discounts.filter((d) => d.status === DiscountStatus.ACTIVE).length,
        inactive: discounts.filter((d) => d.status === DiscountStatus.INACTIVE).length,
        expired: discounts.filter((d) => d.status === DiscountStatus.EXPIRED).length,
        validNow: discounts.filter((d) => {
            if (d.status !== DiscountStatus.ACTIVE) return false;
            const start = new Date(d.startDate);
            const end = new Date(d.endDate);
            return now >= start && now <= end;
        }).length,
        percentageDiscounts: discounts.filter((d) => d.discountType === DiscountType.PERCENTAGE)
            .length,
        fixedAmountDiscounts: discounts.filter((d) => d.discountType === DiscountType.FIXED_AMOUNT)
            .length,
        averageDiscountValue:
            discounts.length > 0
                ? discounts.reduce((sum, d) => sum + d.amount, 0) / discounts.length
                : 0,
        totalUsage: discounts.reduce((sum, d) => sum + d.usesCount, 0),
    };
});

export const selectIsDiscountLoading = createSelector([selectDiscountLoading], (loading) =>
    Object.values(loading).some(Boolean)
);

export const selectHasDiscountError = createSelector([selectDiscountError], (error) => !!error);

export const selectDiscountMetadata = createSelector(
    [selectDiscountPagination, selectDiscountFilters, selectDiscountError],
    (pagination, filters, error) => ({
        pagination,
        filters,
        hasError: !!error,
        hasActiveFilters: Object.keys(filters).length > 0,
    })
);

// Applied discount selectors
export const selectHasAppliedDiscount = createSelector(
    [selectAppliedDiscount],
    (appliedDiscount) => !!appliedDiscount
);

export const selectAppliedDiscountAmount = createSelector(
    [selectAppliedDiscount],
    (appliedDiscount) => appliedDiscount?.validationResult.appliedAmount || 0
);

export const selectAppliedDiscountCode = createSelector(
    [selectAppliedDiscount],
    (appliedDiscount) => appliedDiscount?.code || ''
);

export const selectAppliedDiscountSavings = createSelector(
    [selectAppliedDiscount],
    (appliedDiscount) => {
        if (!appliedDiscount) return 0;
        const { validationResult } = appliedDiscount;
        return validationResult.appliedAmount;
    }
);
