import { useState, useCallback } from 'react';
import { SubscriptionService } from '@/services/subscription.service';
import type {
    SubscriptionPlan,
    HospitalSubscription,
    SubscriptionUsageResponse,
    CreateSubscriptionPlanRequest,
    UpdateSubscriptionPlanRequest,
    SubscriptionPlanFilterRequest,
} from '@/services/subscription.service';

interface UseSubscriptionState {
    subscriptionPlans: SubscriptionPlan[];
    hospitalSubscriptions: HospitalSubscription[];
    usageData: SubscriptionUsageResponse | null;
    loading: boolean;
    error: string | null;
}

interface UseSubscriptionActions {
    // Subscription Plans
    loadSubscriptionPlans: () => Promise<void>;
    loadFilteredSubscriptionPlans: (filter: SubscriptionPlanFilterRequest) => Promise<void>;
    loadActiveSubscriptionPlans: () => Promise<void>;
    createSubscriptionPlan: (data: CreateSubscriptionPlanRequest) => Promise<boolean>;
    updateSubscriptionPlan: (id: string, data: UpdateSubscriptionPlanRequest) => Promise<boolean>;
    deleteSubscriptionPlan: (id: string) => Promise<boolean>;

    // Hospital Subscriptions
    loadHospitalSubscriptions: (hospitalId: string) => Promise<void>;
    loadActiveHospitalSubscription: (hospitalId: string) => Promise<void>;
    createHospitalSubscription: (data: {
        hospitalId: string;
        subscriptionId: string;
        startDate: string;
        endDate: string;
    }) => Promise<boolean>;
    updateHospitalSubscription: (
        id: string,
        data: {
            startDate?: string;
            endDate?: string;
            status?: 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'PENDING' | 'TRIAL';
        }
    ) => Promise<boolean>;
    cancelHospitalSubscription: (id: string, reason?: string) => Promise<boolean>;
    upgradeHospitalSubscription: (currentId: string, newPlanId: string) => Promise<boolean>;
    extendHospitalSubscription: (id: string, months: number) => Promise<boolean>;

    // Usage Tracking
    loadUsageData: (hospitalId: string) => Promise<void>;
    checkDoctorLimit: (hospitalId: string) => Promise<boolean>;
    checkSpecialtyLimit: (hospitalId: string) => Promise<boolean>;
    checkAppointmentLimit: (hospitalId: string, additional?: number) => Promise<boolean>;
    loadUsageAlerts: (hospitalId: string) => Promise<any>;

    // Utility
    clearError: () => void;
    setLoading: (loading: boolean) => void;
}

export const useSubscription = (): UseSubscriptionState & UseSubscriptionActions => {
    const [state, setState] = useState<UseSubscriptionState>({
        subscriptionPlans: [],
        hospitalSubscriptions: [],
        usageData: null,
        loading: false,
        error: null,
    });

    const setLoading = useCallback((loading: boolean) => {
        setState((prev) => ({ ...prev, loading }));
    }, []);

    const clearError = useCallback(() => {
        setState((prev) => ({ ...prev, error: null }));
    }, []);

    const handleError = useCallback((error: any) => {
        const errorMessage = error.message || 'An error occurred';
        setState((prev) => ({ ...prev, error: errorMessage }));
        console.error('Subscription Service Error:', error);
    }, []);

    // Subscription Plans Actions
    const loadSubscriptionPlans = useCallback(async () => {
        try {
            setLoading(true);
            clearError();

            const response = await SubscriptionService.getAllSubscriptionPlans();

            if (response.success) {
                setState((prev) => ({
                    ...prev,
                    subscriptionPlans: response.data.subscriptionPlans || [],
                }));
            } else {
                handleError(new Error('Failed to load subscription plans'));
            }
        } catch (error) {
            handleError(error);
        } finally {
            setLoading(false);
        }
    }, [setLoading, clearError, handleError]);

    const loadFilteredSubscriptionPlans = useCallback(
        async (filter: SubscriptionPlanFilterRequest) => {
            try {
                setLoading(true);
                clearError();

                const response = await SubscriptionService.getFilteredSubscriptionPlans(filter);

                if (response.success) {
                    setState((prev) => ({
                        ...prev,
                        subscriptionPlans: response.data.subscriptionPlans || [],
                    }));
                } else {
                    handleError(new Error('Failed to load filtered subscription plans'));
                }
            } catch (error) {
                handleError(error);
            } finally {
                setLoading(false);
            }
        },
        [setLoading, clearError, handleError]
    );

    const loadActiveSubscriptionPlans = useCallback(async () => {
        try {
            setLoading(true);
            clearError();

            const response = await SubscriptionService.getActiveSubscriptionPlans();

            if (response.success) {
                setState((prev) => ({
                    ...prev,
                    subscriptionPlans: response.data || [],
                }));
            } else {
                handleError(new Error('Failed to load active subscription plans'));
            }
        } catch (error) {
            handleError(error);
        } finally {
            setLoading(false);
        }
    }, [setLoading, clearError, handleError]);

    const createSubscriptionPlan = useCallback(
        async (data: CreateSubscriptionPlanRequest): Promise<boolean> => {
            try {
                setLoading(true);
                clearError();

                const response = await SubscriptionService.createSubscriptionPlan(data);

                if (response.success) {
                    // Reload plans after creation
                    await loadSubscriptionPlans();
                    return true;
                } else {
                    handleError(new Error('Failed to create subscription plan'));
                    return false;
                }
            } catch (error) {
                handleError(error);
                return false;
            } finally {
                setLoading(false);
            }
        },
        [setLoading, clearError, handleError, loadSubscriptionPlans]
    );

    const updateSubscriptionPlan = useCallback(
        async (id: string, data: UpdateSubscriptionPlanRequest): Promise<boolean> => {
            try {
                setLoading(true);
                clearError();

                const response = await SubscriptionService.updateSubscriptionPlan(id, data);

                if (response.success) {
                    // Reload plans after update
                    await loadSubscriptionPlans();
                    return true;
                } else {
                    handleError(new Error('Failed to update subscription plan'));
                    return false;
                }
            } catch (error) {
                handleError(error);
                return false;
            } finally {
                setLoading(false);
            }
        },
        [setLoading, clearError, handleError, loadSubscriptionPlans]
    );

    const deleteSubscriptionPlan = useCallback(
        async (id: string): Promise<boolean> => {
            try {
                setLoading(true);
                clearError();

                const response = await SubscriptionService.deleteSubscriptionPlan(id);

                if (response.success) {
                    // Reload plans after deletion
                    await loadSubscriptionPlans();
                    return true;
                } else {
                    handleError(new Error('Failed to delete subscription plan'));
                    return false;
                }
            } catch (error) {
                handleError(error);
                return false;
            } finally {
                setLoading(false);
            }
        },
        [setLoading, clearError, handleError, loadSubscriptionPlans]
    );

    // Hospital Subscriptions Actions
    const loadHospitalSubscriptions = useCallback(
        async (hospitalId: string) => {
            try {
                setLoading(true);
                clearError();

                const response = await SubscriptionService.getHospitalSubscriptions(hospitalId);

                if (response.success) {
                    setState((prev) => ({
                        ...prev,
                        hospitalSubscriptions: response.data || [],
                    }));
                } else {
                    handleError(new Error('Failed to load hospital subscriptions'));
                }
            } catch (error) {
                handleError(error);
            } finally {
                setLoading(false);
            }
        },
        [setLoading, clearError, handleError]
    );

    const loadActiveHospitalSubscription = useCallback(
        async (hospitalId: string) => {
            try {
                setLoading(true);
                clearError();

                const response =
                    await SubscriptionService.getActiveHospitalSubscription(hospitalId);

                if (response.success) {
                    setState((prev) => ({
                        ...prev,
                        hospitalSubscriptions: response.data ? [response.data] : [],
                    }));
                } else {
                    // Chỉ set error nếu không phải trường hợp "no active subscription" hoặc "not found"
                    const message = response.message?.toLowerCase() || '';
                    if (
                        !message.includes('no active subscription') &&
                        !message.includes('not found')
                    ) {
                        handleError(
                            new Error(
                                response.message || 'Failed to load active hospital subscription'
                            )
                        );
                    } else {
                        // Hospital chưa có subscription - đây là trạng thái bình thường, không phải lỗi
                        setState((prev) => ({
                            ...prev,
                            hospitalSubscriptions: [],
                        }));
                    }
                }
            } catch (error: any) {
                // Kiểm tra nếu error message chứa "no active subscription" hoặc "not found" thì không xử lý như lỗi
                const errorMessage = error.message?.toLowerCase() || '';
                if (
                    errorMessage.includes('no active subscription') ||
                    errorMessage.includes('not found')
                ) {
                    setState((prev) => ({
                        ...prev,
                        hospitalSubscriptions: [],
                    }));
                } else {
                    // Log error để debug
                    console.error('Error loading active hospital subscription:', error);
                    handleError(error);
                }
            } finally {
                setLoading(false);
            }
        },
        [setLoading, clearError, handleError]
    );

    const createHospitalSubscription = useCallback(
        async (data: {
            hospitalId: string;
            subscriptionId: string;
            startDate: string;
            endDate: string;
        }): Promise<boolean> => {
            try {
                setLoading(true);
                clearError();

                const response = await SubscriptionService.createHospitalSubscription(data);

                if (response.success) {
                    // Reload subscriptions after creation
                    await loadHospitalSubscriptions(data.hospitalId);
                    return true;
                } else {
                    handleError(new Error('Failed to create hospital subscription'));
                    return false;
                }
            } catch (error) {
                handleError(error);
                return false;
            } finally {
                setLoading(false);
            }
        },
        [setLoading, clearError, handleError, loadHospitalSubscriptions]
    );

    const updateHospitalSubscription = useCallback(
        async (
            id: string,
            data: {
                startDate?: string;
                endDate?: string;
                status?: 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'PENDING' | 'TRIAL';
            }
        ): Promise<boolean> => {
            try {
                setLoading(true);
                clearError();

                const response = await SubscriptionService.updateHospitalSubscription(id, data);

                if (response.success) {
                    // Reload subscriptions after update
                    // Note: You might need to pass hospitalId from context or state
                    return true;
                } else {
                    handleError(new Error('Failed to update hospital subscription'));
                    return false;
                }
            } catch (error) {
                handleError(error);
                return false;
            } finally {
                setLoading(false);
            }
        },
        [setLoading, clearError, handleError]
    );

    const cancelHospitalSubscription = useCallback(
        async (id: string, reason?: string): Promise<boolean> => {
            try {
                setLoading(true);
                clearError();

                const response = await SubscriptionService.cancelHospitalSubscription(id, reason);

                if (response.success) {
                    // Reload subscriptions after cancellation
                    return true;
                } else {
                    handleError(new Error('Failed to cancel hospital subscription'));
                    return false;
                }
            } catch (error) {
                handleError(error);
                return false;
            } finally {
                setLoading(false);
            }
        },
        [setLoading, clearError, handleError]
    );

    const upgradeHospitalSubscription = useCallback(
        async (currentId: string, newPlanId: string): Promise<boolean> => {
            try {
                setLoading(true);
                clearError();

                const response = await SubscriptionService.upgradeHospitalSubscription(
                    currentId,
                    newPlanId
                );

                if (response.success) {
                    // Reload subscriptions after upgrade
                    return true;
                } else {
                    const errorMsg = response.message || 'Failed to upgrade hospital subscription';
                    handleError(new Error(errorMsg));
                    return false;
                }
            } catch (error: any) {
                // Pass through the error message from backend
                const errorMsg = error.message || 'Failed to upgrade hospital subscription';
                handleError(new Error(errorMsg));
                throw error; // Re-throw to allow caller to handle
            } finally {
                setLoading(false);
            }
        },
        [setLoading, clearError, handleError]
    );

    const extendHospitalSubscription = useCallback(
        async (id: string, months: number): Promise<boolean> => {
            try {
                setLoading(true);
                clearError();

                const response = await SubscriptionService.extendHospitalSubscription(id, months);

                if (response.success) {
                    // Reload subscriptions after extension
                    return true;
                } else {
                    handleError(new Error('Failed to extend hospital subscription'));
                    return false;
                }
            } catch (error) {
                handleError(error);
                return false;
            } finally {
                setLoading(false);
            }
        },
        [setLoading, clearError, handleError]
    );

    // Usage Tracking Actions
    const loadUsageData = useCallback(
        async (hospitalId: string) => {
            try {
                setLoading(true);
                clearError();

                const response = await SubscriptionService.getSubscriptionUsage(hospitalId);

                if (response.success) {
                    setState((prev) => ({
                        ...prev,
                        usageData: response.data,
                    }));
                } else {
                    handleError(new Error('Failed to load usage data'));
                }
            } catch (error) {
                handleError(error);
            } finally {
                setLoading(false);
            }
        },
        [setLoading, clearError, handleError]
    );

    const checkDoctorLimit = useCallback(
        async (hospitalId: string): Promise<boolean> => {
            try {
                const response = await SubscriptionService.checkDoctorLimit(hospitalId);
                return response.success ? response.data.canAddDoctor : false;
            } catch (error) {
                handleError(error);
                return false;
            }
        },
        [handleError]
    );

    const checkSpecialtyLimit = useCallback(
        async (hospitalId: string): Promise<boolean> => {
            try {
                const response = await SubscriptionService.checkSpecialtyLimit(hospitalId);
                return response.success ? response.data.canAddSpecialty : false;
            } catch (error) {
                handleError(error);
                return false;
            }
        },
        [handleError]
    );

    const checkAppointmentLimit = useCallback(
        async (hospitalId: string, additional: number = 1): Promise<boolean> => {
            try {
                const response = await SubscriptionService.checkAppointmentLimit(
                    hospitalId,
                    additional
                );
                return response.success ? response.data.canAddAppointments : false;
            } catch (error) {
                handleError(error);
                return false;
            }
        },
        [handleError]
    );

    const loadUsageAlerts = useCallback(
        async (hospitalId: string) => {
            try {
                const response = await SubscriptionService.getUsageAlerts(hospitalId);
                return response.success ? response.data : null;
            } catch (error) {
                handleError(error);
                return null;
            }
        },
        [handleError]
    );

    return {
        ...state,
        loadSubscriptionPlans,
        loadFilteredSubscriptionPlans,
        loadActiveSubscriptionPlans,
        createSubscriptionPlan,
        updateSubscriptionPlan,
        deleteSubscriptionPlan,
        loadHospitalSubscriptions,
        loadActiveHospitalSubscription,
        createHospitalSubscription,
        updateHospitalSubscription,
        cancelHospitalSubscription,
        upgradeHospitalSubscription,
        extendHospitalSubscription,
        loadUsageData,
        checkDoctorLimit,
        checkSpecialtyLimit,
        checkAppointmentLimit,
        loadUsageAlerts,
        clearError,
        setLoading,
    };
};

export default useSubscription;
