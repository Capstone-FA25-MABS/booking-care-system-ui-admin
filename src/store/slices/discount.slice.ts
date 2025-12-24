import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
    Discount,
    CreateDiscountRequest,
    UpdateDiscountRequest,
    DiscountQueryParams,
    DiscountValidationResult,
    DiscountUsageStats,
} from '../../types/discount.types';
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
            hospitalId: string;
            totalAmount: number;
        };
    }) => {
        const result = await DiscountService.validateDiscount(code, context);
        return { code, result };
    }
);

export const fetchActiveDiscounts = createAsyncThunk(
    'discount/fetchActiveDiscounts',
    async (hospitalId: string) => {
        const discounts = await DiscountService.getActiveDiscounts(hospitalId);
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
