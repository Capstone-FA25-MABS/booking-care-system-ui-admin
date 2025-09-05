import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
    Discount,
    CreateDiscountRequest,
    UpdateDiscountRequest,
    DiscountQueryParams,
    DiscountValidationResult,
    ApplyDiscountRequest,
    DiscountUsageStats,
} from '../../types/discount.types';
import { DiscountStatus } from '../../enums/discount.enums';
import { DiscountService } from '../../services/discount.service';

// State interface
export interface DiscountState {
    discounts: Discount[];
    currentDiscount: Discount | null;
    validationResult: DiscountValidationResult | null;
    usageStats: DiscountUsageStats | null;
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
    loading: {
        discounts: boolean;
        currentDiscount: boolean;
        validation: boolean;
        stats: boolean;
        create: boolean;
        update: boolean;
        delete: boolean;
        bulkActions: boolean;
    };
    error: string | null;
    filters: DiscountQueryParams;
    appliedDiscount: {
        code: string;
        discount: Discount;
        validationResult: DiscountValidationResult;
    } | null;
}

// Initial state
const initialState: DiscountState = {
    discounts: [],
    currentDiscount: null,
    validationResult: null,
    usageStats: null,
    pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
    },
    loading: {
        discounts: false,
        currentDiscount: false,
        validation: false,
        stats: false,
        create: false,
        update: false,
        delete: false,
        bulkActions: false,
    },
    error: null,
    filters: {},
    appliedDiscount: null,
};

// Async thunks
export const fetchDiscounts = createAsyncThunk(
    'discount/fetchDiscounts',
    async (params?: DiscountQueryParams) => {
        const response = await DiscountService.getDiscounts(params);
        return response;
    }
);

export const fetchDiscountById = createAsyncThunk(
    'discount/fetchDiscountById',
    async (id: string) => {
        const response = await DiscountService.getDiscountById(id);
        return response.data;
    }
);

export const fetchDiscountByCode = createAsyncThunk(
    'discount/fetchDiscountByCode',
    async (code: string) => {
        const response = await DiscountService.getDiscountByCode(code);
        return response.data;
    }
);

export const createDiscount = createAsyncThunk(
    'discount/createDiscount',
    async (discountData: CreateDiscountRequest) => {
        const response = await DiscountService.createDiscount(discountData);
        return response.data;
    }
);

export const updateDiscount = createAsyncThunk(
    'discount/updateDiscount',
    async (discountData: UpdateDiscountRequest) => {
        const response = await DiscountService.updateDiscount(discountData);
        return response.data;
    }
);

export const deleteDiscount = createAsyncThunk('discount/deleteDiscount', async (id: string) => {
    await DiscountService.deleteDiscount(id);
    return id;
});

export const validateDiscountCode = createAsyncThunk(
    'discount/validateDiscountCode',
    async ({
        code,
        context,
    }: {
        code: string;
        context: {
            clinicId: number;
            specialtyId?: number;
            doctorId?: number;
            amount: number;
        };
    }) => {
        const result = await DiscountService.validateDiscount(code, context);
        return { code, result };
    }
);

export const applyDiscountCode = createAsyncThunk(
    'discount/applyDiscountCode',
    async (request: ApplyDiscountRequest) => {
        const result = await DiscountService.applyDiscount(request);
        return { request, result };
    }
);

export const fetchDiscountStats = createAsyncThunk(
    'discount/fetchDiscountStats',
    async (filters?: { clinicId?: number; startDate?: string; endDate?: string }) => {
        const stats = await DiscountService.getDiscountStats(filters);
        return stats;
    }
);

export const bulkUpdateDiscountStatus = createAsyncThunk(
    'discount/bulkUpdateStatus',
    async ({ discountIds, status }: { discountIds: string[]; status: DiscountStatus }) => {
        const result = await DiscountService.bulkUpdateStatus(discountIds, status);
        return { discountIds, status, result };
    }
);

export const bulkDeleteDiscounts = createAsyncThunk(
    'discount/bulkDeleteDiscounts',
    async (discountIds: string[]) => {
        const result = await DiscountService.bulkDeleteDiscounts(discountIds);
        return { discountIds, result };
    }
);

export const fetchActiveDiscounts = createAsyncThunk(
    'discount/fetchActiveDiscounts',
    async (context: { clinicId: string; specialtyId?: string; doctorId?: string }) => {
        const discounts = await DiscountService.getActiveDiscounts(context);
        return discounts;
    }
);

export const checkDiscountAvailability = createAsyncThunk(
    'discount/checkDiscountAvailability',
    async (code: string) => {
        const result = await DiscountService.checkDiscountAvailability(code);
        return { code, ...result };
    }
);

// Discount slice
const discountSlice = createSlice({
    name: 'discount',
    initialState,
    reducers: {
        // Clear error
        clearError: (state) => {
            state.error = null;
        },

        // Set filters
        setFilters: (state, action: PayloadAction<DiscountQueryParams>) => {
            state.filters = action.payload;
        },

        // Clear filters
        clearFilters: (state) => {
            state.filters = {};
        },

        // Set current discount
        setCurrentDiscount: (state, action: PayloadAction<Discount | null>) => {
            state.currentDiscount = action.payload;
        },

        // Clear current discount
        clearCurrentDiscount: (state) => {
            state.currentDiscount = null;
        },

        // Clear validation result
        clearValidationResult: (state) => {
            state.validationResult = null;
        },

        // Set applied discount
        setAppliedDiscount: (
            state,
            action: PayloadAction<{
                code: string;
                discount: Discount;
                validationResult: DiscountValidationResult;
            } | null>
        ) => {
            state.appliedDiscount = action.payload;
        },

        // Clear applied discount
        clearAppliedDiscount: (state) => {
            state.appliedDiscount = null;
        },

        // Update discount in list
        updateDiscountInList: (state, action: PayloadAction<Discount>) => {
            const index = state.discounts.findIndex((d) => d.id === action.payload.id);
            if (index !== -1) {
                state.discounts[index] = action.payload;
            }
        },

        // Remove discount from list
        removeDiscountFromList: (state, action: PayloadAction<string>) => {
            state.discounts = state.discounts.filter((d) => d.id !== action.payload);
        },

        // Add discount to list
        addDiscountToList: (state, action: PayloadAction<Discount>) => {
            state.discounts.unshift(action.payload);
            state.pagination.total += 1;
        },
    },
    extraReducers: (builder) => {
        // Fetch discounts
        builder
            .addCase(fetchDiscounts.pending, (state) => {
                state.loading.discounts = true;
                state.error = null;
            })
            .addCase(fetchDiscounts.fulfilled, (state, action) => {
                state.loading.discounts = false;
                state.discounts = action.payload.data.discounts;
                // state.pagination = action.payload.pagination;
            })
            .addCase(fetchDiscounts.rejected, (state, action) => {
                state.loading.discounts = false;
                state.error = action.error.message || 'Failed to fetch discounts';
            });

        // Fetch discount by ID
        builder
            .addCase(fetchDiscountById.pending, (state) => {
                state.loading.currentDiscount = true;
                state.error = null;
            })
            .addCase(fetchDiscountById.fulfilled, (state, action) => {
                state.loading.currentDiscount = false;
                state.currentDiscount = action.payload;
            })
            .addCase(fetchDiscountById.rejected, (state, action) => {
                state.loading.currentDiscount = false;
                state.error = action.error.message || 'Failed to fetch discount';
            });

        // Fetch discount by code
        builder
            .addCase(fetchDiscountByCode.pending, (state) => {
                state.loading.currentDiscount = true;
                state.error = null;
            })
            .addCase(fetchDiscountByCode.fulfilled, (state, action) => {
                state.loading.currentDiscount = false;
                state.currentDiscount = action.payload;
            })
            .addCase(fetchDiscountByCode.rejected, (state, action) => {
                state.loading.currentDiscount = false;
                state.error = action.error.message || 'Failed to fetch discount by code';
            });

        // Create discount
        builder
            .addCase(createDiscount.pending, (state) => {
                state.loading.create = true;
                state.error = null;
            })
            .addCase(createDiscount.fulfilled, (state, action) => {
                state.loading.create = false;
                state.discounts.unshift(action.payload);
                state.pagination.total += 1;
            })
            .addCase(createDiscount.rejected, (state, action) => {
                state.loading.create = false;
                state.error = action.error.message || 'Failed to create discount';
            });

        // Update discount
        builder
            .addCase(updateDiscount.pending, (state) => {
                state.loading.update = true;
                state.error = null;
            })
            .addCase(updateDiscount.fulfilled, (state, action) => {
                state.loading.update = false;
                const index = state.discounts.findIndex((d) => d.id === action.payload.id);
                if (index !== -1) {
                    state.discounts[index] = action.payload;
                }
                if (state.currentDiscount?.id === action.payload.id) {
                    state.currentDiscount = action.payload;
                }
            })
            .addCase(updateDiscount.rejected, (state, action) => {
                state.loading.update = false;
                state.error = action.error.message || 'Failed to update discount';
            });

        // Delete discount
        builder
            .addCase(deleteDiscount.pending, (state) => {
                state.loading.delete = true;
                state.error = null;
            })
            .addCase(deleteDiscount.fulfilled, (state, action) => {
                state.loading.delete = false;
                state.discounts = state.discounts.filter((d) => d.id !== action.payload);
                state.pagination.total -= 1;
                if (state.currentDiscount?.id === action.payload) {
                    state.currentDiscount = null;
                }
            })
            .addCase(deleteDiscount.rejected, (state, action) => {
                state.loading.delete = false;
                state.error = action.error.message || 'Failed to delete discount';
            });

        // Validate discount code
        builder
            .addCase(validateDiscountCode.pending, (state) => {
                state.loading.validation = true;
                state.error = null;
            })
            .addCase(validateDiscountCode.fulfilled, (state, action) => {
                state.loading.validation = false;
                state.validationResult = action.payload.result;
            })
            .addCase(validateDiscountCode.rejected, (state, action) => {
                state.loading.validation = false;
                state.error = action.error.message || 'Failed to validate discount code';
            });

        // Apply discount code
        builder
            .addCase(applyDiscountCode.pending, (state) => {
                state.loading.validation = true;
                state.error = null;
            })
            .addCase(applyDiscountCode.fulfilled, (state, action) => {
                state.loading.validation = false;
                state.validationResult = action.payload.result;
                // Store applied discount if validation was successful
                if (action.payload.result.isValid && action.payload.result.discount) {
                    state.appliedDiscount = {
                        code: action.payload.request.code,
                        discount: action.payload.result.discount,
                        validationResult: action.payload.result,
                    };
                }
            })
            .addCase(applyDiscountCode.rejected, (state, action) => {
                state.loading.validation = false;
                state.error = action.error.message || 'Failed to apply discount code';
            });

        // Fetch discount stats
        builder
            .addCase(fetchDiscountStats.pending, (state) => {
                state.loading.stats = true;
                state.error = null;
            })
            .addCase(fetchDiscountStats.fulfilled, (state, action) => {
                state.loading.stats = false;
                state.usageStats = action.payload;
            })
            .addCase(fetchDiscountStats.rejected, (state, action) => {
                state.loading.stats = false;
                state.error = action.error.message || 'Failed to fetch discount statistics';
            });

        // Bulk update status
        builder
            .addCase(bulkUpdateDiscountStatus.pending, (state) => {
                state.loading.bulkActions = true;
                state.error = null;
            })
            .addCase(bulkUpdateDiscountStatus.fulfilled, (state, action) => {
                state.loading.bulkActions = false;
                // Update status for affected discounts
                action.payload.discountIds.forEach((id) => {
                    const discount = state.discounts.find((d) => d.id === id);
                    if (discount) {
                        discount.status = action.payload.status;
                    }
                });
            })
            .addCase(bulkUpdateDiscountStatus.rejected, (state, action) => {
                state.loading.bulkActions = false;
                state.error = action.error.message || 'Failed to update discount statuses';
            });

        // Bulk delete
        builder
            .addCase(bulkDeleteDiscounts.pending, (state) => {
                state.loading.bulkActions = true;
                state.error = null;
            })
            .addCase(bulkDeleteDiscounts.fulfilled, (state, action) => {
                state.loading.bulkActions = false;
                // Remove deleted discounts from state
                state.discounts = state.discounts.filter(
                    (d) => !action.payload.discountIds.includes(d.id)
                );
                state.pagination.total -= action.payload.result.deletedCount;
            })
            .addCase(bulkDeleteDiscounts.rejected, (state, action) => {
                state.loading.bulkActions = false;
                state.error = action.error.message || 'Failed to delete discounts';
            });

        // Fetch active discounts
        builder
            .addCase(fetchActiveDiscounts.pending, (state) => {
                state.loading.discounts = true;
                state.error = null;
            })
            .addCase(fetchActiveDiscounts.fulfilled, (state, action) => {
                state.loading.discounts = false;
                state.discounts = action.payload;
            })
            .addCase(fetchActiveDiscounts.rejected, (state, action) => {
                state.loading.discounts = false;
                state.error = action.error.message || 'Failed to fetch active discounts';
            });

        // Check discount availability
        builder
            .addCase(checkDiscountAvailability.pending, (state) => {
                state.loading.validation = true;
                state.error = null;
            })
            .addCase(checkDiscountAvailability.fulfilled, (state, action) => {
                state.loading.validation = false;
                if (action.payload.available && action.payload.discount) {
                    state.currentDiscount = action.payload.discount;
                }
            })
            .addCase(checkDiscountAvailability.rejected, (state, action) => {
                state.loading.validation = false;
                state.error = action.error.message || 'Failed to check discount availability';
            });
    },
});

// Export actions
export const {
    clearError,
    setFilters,
    clearFilters,
    setCurrentDiscount,
    clearCurrentDiscount,
    clearValidationResult,
    setAppliedDiscount,
    clearAppliedDiscount,
    updateDiscountInList,
    removeDiscountFromList,
    addDiscountToList,
} = discountSlice.actions;

// Export reducer
export default discountSlice.reducer;
