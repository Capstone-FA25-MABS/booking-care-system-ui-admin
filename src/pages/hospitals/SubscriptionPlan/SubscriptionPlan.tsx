import { useState, useEffect, useMemo, useCallback } from 'react';
import SubscriptionPlanCard from './components/SubscriptionPlanCard';
import SubscriptionPlanSkeletonCard from './components/SubscriptionPlanSkeletonCard/SubscriptionPlanSkeletonCard';
import { Check, X, Info, Plus } from 'lucide-react';
import { toast } from 'react-toastify';
import styles from './SubscriptionPlan.module.scss';
import { useSubscription } from '@/hooks/useSubscription';
import type { SubscriptionPlan as SubscriptionPlanType } from '@/services/subscription.service';
import { useCurrentUserProfile } from '@/hooks/useCurrentUserProfile';

type BillingPeriod = 'yearly' | 'quarterly' | 'monthly';

interface Feature {
    icon: React.ReactNode;
    text: string;
    subtext?: string;
    iconType?: 'check' | 'plus';
}

const SubscriptionPlan: React.FC = () => {
    const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('yearly');
    const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);

    // Get subscription data and current hospital profile
    const {
        subscriptionPlans,
        loading,
        error,
        loadActiveSubscriptionPlans,
        loadActiveHospitalSubscription,
        hospitalSubscriptions,
        clearError,
        createHospitalSubscription,
        upgradeHospitalSubscription,
    } = useSubscription();
    const { profile, hospitalProfile } = useCurrentUserProfile();
    // Lấy hospital ID từ hospitalProfile (cho STAFF role) hoặc profile
    const hospitalId = hospitalProfile?.id || (profile as any)?.id;

    // Debug log để kiểm tra hospital ID
    useEffect(() => {
        if (hospitalId) {
            console.log('Hospital ID:', hospitalId);
            console.log('Hospital Profile:', hospitalProfile);
            console.log('Profile:', profile);
        }
    }, [hospitalId, hospitalProfile, profile]);

    // Map billing period to API billing cycle
    const getBillingCycle = (period: BillingPeriod): 'MONTHLY' | 'QUARTERLY' | 'YEARLY' => {
        switch (period) {
            case 'monthly':
                return 'MONTHLY';
            case 'quarterly':
                return 'QUARTERLY';
            case 'yearly':
                return 'YEARLY';
        }
    };

    // Load subscription plans and current hospital subscription on mount and when billing period changes
    useEffect(() => {
        loadActiveSubscriptionPlans();
    }, [loadActiveSubscriptionPlans]);

    useEffect(() => {
        if (hospitalId) {
            loadActiveHospitalSubscription(hospitalId);
        }
    }, [hospitalId, loadActiveHospitalSubscription]);

    // Handle errors - bỏ qua error nếu là "No active subscription found" (đây là trạng thái bình thường)
    useEffect(() => {
        if (error && !error.toLowerCase().includes('no active subscription')) {
            toast.error(error);
            clearError();
        } else if (error) {
            // Clear error ngay cả khi là "no active subscription" để không hiển thị lại
            clearError();
        }
    }, [error, clearError]);

    // Get current active subscription
    const currentActiveSubscription = useMemo(() => {
        return hospitalSubscriptions.find((s) => s.status === 'ACTIVE') || null;
    }, [hospitalSubscriptions]);

    // Get current active subscription plan ID
    const currentSubscriptionPlanId = useMemo(() => {
        return currentActiveSubscription?.subscriptionId || null;
    }, [currentActiveSubscription]);

    // Get billing cycle from current subscription's plan
    const currentSubscriptionBillingCycle = useMemo(() => {
        if (!currentActiveSubscription) {
            return null;
        }

        // Try to get from subscriptionPlan property first
        if (currentActiveSubscription.subscriptionPlan?.billingCycle) {
            return currentActiveSubscription.subscriptionPlan.billingCycle.toLowerCase();
        }

        // Fallback: find plan from subscriptionPlans list by subscriptionId
        const plan = subscriptionPlans.find(
            (p) => p.id === currentActiveSubscription.subscriptionId
        );
        if (plan?.billingCycle) {
            return plan.billingCycle.toLowerCase();
        }

        return null;
    }, [currentActiveSubscription, subscriptionPlans]);

    // Helper to get billing cycle value for comparison
    const getBillingCycleValue = (billingCycle: string | null): number => {
        if (!billingCycle) return 0;
        const lower = billingCycle.toLowerCase();
        if (lower === 'monthly') return 1;
        if (lower === 'quarterly') return 3;
        if (lower === 'yearly') return 12;
        return 0;
    };

    // Check if downgrading (from higher billing cycle to lower OR same billing cycle but lower price)
    const isDowngrade = useCallback(
        (newPlanBillingCycle: string, newPlanPrice: number): boolean => {
            if (!currentSubscriptionBillingCycle || !currentActiveSubscription) return false;

            const currentValue = getBillingCycleValue(currentSubscriptionBillingCycle);
            const newValue = getBillingCycleValue(newPlanBillingCycle);

            // Case 1: Downgrade from higher billing cycle to lower (e.g., QUARTERLY -> MONTHLY)
            if (currentValue > newValue) {
                return true;
            }

            // Case 2: Same billing cycle but lower price (e.g., "Gói nâng cao" QUARTERLY -> "Gói cơ bản" QUARTERLY)
            if (currentValue === newValue) {
                // Find current plan to get its price
                const currentPlan = subscriptionPlans.find(
                    (p) => p.id === currentSubscriptionPlanId
                );
                if (currentPlan && currentPlan.price > newPlanPrice) {
                    return true;
                }
            }

            return false;
        },
        [
            currentSubscriptionBillingCycle,
            currentActiveSubscription,
            currentSubscriptionPlanId,
            subscriptionPlans,
        ]
    );

    // Debug: Log subscription data
    useEffect(() => {
        console.log('Subscription data updated:', {
            hospitalSubscriptions: hospitalSubscriptions.length,
            currentActiveSubscription,
            currentSubscriptionBillingCycle,
            subscriptionPlans: subscriptionPlans.length,
            loading,
        });
    }, [
        hospitalSubscriptions,
        currentActiveSubscription,
        currentSubscriptionBillingCycle,
        subscriptionPlans,
        loading,
    ]);

    // Map billing cycle to billing period
    const billingCycleToPeriod = (billingCycle: string | null): BillingPeriod | null => {
        if (!billingCycle) return null;
        const lower = billingCycle.toLowerCase();
        if (lower === 'monthly') return 'monthly';
        if (lower === 'quarterly') return 'quarterly';
        if (lower === 'yearly') return 'yearly';
        return null;
    };

    // Helper function to get period from URL query parameter
    const getPeriodFromUrl = (): BillingPeriod | null => {
        const params = new URLSearchParams(globalThis.location.search);
        const planType = params.get('plan-type');
        if (planType === 'monthly' || planType === 'quarterly' || planType === 'yearly') {
            return planType as BillingPeriod;
        }
        return null;
    };

    // Track if we've initialized to prevent re-running unnecessarily
    const [hasInitialized, setHasInitialized] = useState(false);

    // Update billing period when hospitalSubscriptions loads AFTER initial setup
    // This handles the case where hospitalSubscriptions loads after subscriptionPlans
    useEffect(() => {
        const urlPeriod = getPeriodFromUrl();
        // Only update if: no URL param, data loaded, and we have subscription billing cycle
        if (!urlPeriod && !loading && subscriptionPlans.length > 0) {
            const subscriptionPeriod = billingCycleToPeriod(currentSubscriptionBillingCycle);
            if (subscriptionPeriod && subscriptionPeriod !== billingPeriod) {
                console.log(
                    '🔄 Updating billing period from subscription:',
                    subscriptionPeriod,
                    'Current:',
                    billingPeriod
                );
                setBillingPeriod(subscriptionPeriod);
                // Update URL to match current subscription (replace to avoid adding to history)
                globalThis.history.replaceState(
                    {},
                    '',
                    `${globalThis.location.pathname}?plan-type=${subscriptionPeriod}`
                );
                if (!hasInitialized) {
                    setHasInitialized(true);
                }
            }
        }
    }, [
        hospitalSubscriptions.length,
        currentSubscriptionBillingCycle,
        subscriptionPlans.length,
        loading,
        billingPeriod,
        hasInitialized,
    ]);

    // Initialize billing period from URL query parameter or current subscription
    // This effect runs when subscription data is loaded
    useEffect(() => {
        // Wait until data is loaded
        if (loading) {
            return;
        }

        // Priority 1: URL query parameter (?plan-type=yearly)
        const urlPeriod = getPeriodFromUrl();

        if (urlPeriod) {
            // URL parameter has priority - use it
            if (billingPeriod !== urlPeriod) {
                setBillingPeriod(urlPeriod);
            }
            if (!hasInitialized) {
                setHasInitialized(true);
            }
            return;
        }

        // Only initialize from subscription if not already initialized
        if (hasInitialized) {
            return;
        }

        // Priority 2: Current subscription's billing cycle (when coming from sidebar)
        // IMPORTANT: Wait for subscriptionPlans to load first
        const hasSubscriptionPlansLoaded = subscriptionPlans.length > 0;

        if (hasSubscriptionPlansLoaded) {
            const subscriptionPeriod = billingCycleToPeriod(currentSubscriptionBillingCycle);

            // If we found subscription billing cycle, use it immediately
            if (subscriptionPeriod) {
                console.log('✅ Setting billing period from subscription:', subscriptionPeriod, {
                    currentSubscriptionBillingCycle,
                    currentActiveSubscription,
                    subscriptionPlans: subscriptionPlans.length,
                    hospitalSubscriptions: hospitalSubscriptions.length,
                });
                setBillingPeriod(subscriptionPeriod);
                // Update URL to match current subscription (replace to avoid adding to history)
                globalThis.history.replaceState(
                    {},
                    '',
                    `${globalThis.location.pathname}?plan-type=${subscriptionPeriod}`
                );
                setHasInitialized(true);
                return;
            }

            // Only set default yearly if hospitalSubscriptions has been checked
            // We know it's been checked when hospitalSubscriptions.length is defined (even if 0)
            // AND we don't have a subscription
            // But we should wait a bit to ensure hospitalSubscriptions has had time to load
            // Use a small delay to check if hospitalSubscriptions will load soon
            // For now, only set yearly if we're reasonably sure there's no subscription coming
            // (i.e., we've had subscriptionPlans loaded for a moment and still no subscription)

            // Actually, let's NOT set yearly here - let the update effect above handle it
            // or set a timeout to check again
            if (hospitalSubscriptions.length === 0 && !currentActiveSubscription) {
                // Small delay to allow hospitalSubscriptions to load
                const timeoutId = setTimeout(() => {
                    // Check again after delay
                    if (
                        !currentActiveSubscription &&
                        !billingCycleToPeriod(currentSubscriptionBillingCycle)
                    ) {
                        console.log(
                            '⚠️ Setting default billing period to yearly after delay (no active subscription found)'
                        );
                        setBillingPeriod('yearly');
                        globalThis.history.replaceState(
                            {},
                            '',
                            `${globalThis.location.pathname}?plan-type=yearly`
                        );
                        setHasInitialized(true);
                    }
                }, 500); // Wait 500ms for hospitalSubscriptions to potentially load

                return () => clearTimeout(timeoutId);
            }
        }

        // If subscription plans haven't loaded yet, wait (don't set hasInitialized yet)
    }, [
        loading,
        currentSubscriptionBillingCycle,
        currentActiveSubscription,
        subscriptionPlans.length,
        hospitalSubscriptions.length,
        hasInitialized,
        billingPeriod,
    ]);

    // Listen for URL changes (back/forward button, manual URL edit)
    useEffect(() => {
        const handlePopState = () => {
            const urlPeriod = getPeriodFromUrl();
            if (urlPeriod && urlPeriod !== billingPeriod) {
                setBillingPeriod(urlPeriod);
            }
        };

        globalThis.addEventListener('popstate', handlePopState);

        // Also check on mount if URL changed
        const urlPeriod = getPeriodFromUrl();
        if (urlPeriod && urlPeriod !== billingPeriod) {
            setBillingPeriod(urlPeriod);
        }

        return () => {
            globalThis.removeEventListener('popstate', handlePopState);
        };
    }, [billingPeriod]);

    // Filter plans by billing cycle and sort by price
    const filteredPlans = useMemo(() => {
        const billingCycle = getBillingCycle(billingPeriod);
        return subscriptionPlans
            .filter((plan) => plan.billingCycle === billingCycle && plan.status === 'ACTIVE')
            .sort((a, b) => a.price - b.price)
            .slice(0, 3); // Limit to 3 plans
    }, [subscriptionPlans, billingPeriod]);

    // Parse features from JSON string and map iconType to icon
    const parseFeatures = (featuresJson?: string): Feature[] => {
        if (!featuresJson) return [];
        try {
            const parsed = JSON.parse(featuresJson);
            if (Array.isArray(parsed)) {
                return parsed.map((f: any) => {
                    // Map iconType to icon component
                    let iconComponent: React.ReactNode;
                    switch (f.iconType?.toLowerCase()) {
                        case 'plus':
                            iconComponent = <Plus size={16} />;
                            break;
                        case 'check':
                        default:
                            iconComponent = <Check size={16} />;
                            break;
                    }

                    return {
                        icon: iconComponent,
                        text: f.text || f.description || '',
                        subtext: f.subtext || f.subDescription || undefined,
                        iconType: f.iconType?.toLowerCase() === 'plus' ? 'plus' : 'check',
                    };
                });
            }
        } catch (e) {
            console.error('Error parsing features:', e);
        }
        return [];
    };

    // Format price - không làm tròn, hiển thị đầy đủ số tiền
    const formatPrice = (price: number): string => {
        return `${price.toLocaleString('vi-VN')} VNĐ`;
    };

    // Tính giá gốc dựa trên phần trăm tiết kiệm
    const calculateOriginalPrice = (
        currentPrice: number,
        savingsPercent: number | null
    ): number | null => {
        if (!savingsPercent || savingsPercent <= 0) {
            return null;
        }
        // Giá gốc = giá hiện tại / (1 - savingsPercent/100)
        // Ví dụ: giá hiện tại = 80, savingsPercent = 20%
        // Giá gốc = 80 / (1 - 20/100) = 80 / 0.8 = 100
        return Math.round(currentPrice / (1 - savingsPercent / 100));
    };

    // Get price subtext based on billing period
    const getPriceSubtext = (period: BillingPeriod): string => {
        switch (period) {
            case 'yearly':
                return '/năm';
            case 'quarterly':
                return '/quý';
            default:
                return '/tháng';
        }
    };

    // Parse features from JSON - chỉ hiển thị data từ API, không thêm limits
    const getFeatures = (plan: SubscriptionPlanType): Feature[] => {
        return parseFeatures(plan.features);
    };

    // Tính phần trăm tiết kiệm cho năm dựa trên plans hiện có
    const yearlySavingsPercent = useMemo(() => {
        const yearlyPlans = subscriptionPlans.filter(
            (p) => p.billingCycle === 'YEARLY' && p.status === 'ACTIVE'
        );
        const monthlyPlans = subscriptionPlans.filter(
            (p) => p.billingCycle === 'MONTHLY' && p.status === 'ACTIVE'
        );

        // Tìm plan đầu tiên có cả yearly và monthly để tính
        for (const yPlan of yearlyPlans) {
            const mPlan = monthlyPlans.find((m) => m.name === yPlan.name);
            if (mPlan) {
                const expectedPrice = mPlan.price * 12;
                const savings = Math.round(((expectedPrice - yPlan.price) / expectedPrice) * 100);
                return savings > 0 ? savings : null;
            }
        }
        return null;
    }, [subscriptionPlans]);

    // Tính phần trăm tiết kiệm cho quý dựa trên plans hiện có
    const quarterlySavingsPercent = useMemo(() => {
        const quarterlyPlans = subscriptionPlans.filter(
            (p) => p.billingCycle === 'QUARTERLY' && p.status === 'ACTIVE'
        );
        const monthlyPlans = subscriptionPlans.filter(
            (p) => p.billingCycle === 'MONTHLY' && p.status === 'ACTIVE'
        );

        // Tìm plan đầu tiên có cả quarterly và monthly để tính
        for (const qPlan of quarterlyPlans) {
            const mPlan = monthlyPlans.find((m) => m.name === qPlan.name);
            if (mPlan) {
                const expectedPrice = mPlan.price * 3;
                const savings = Math.round(((expectedPrice - qPlan.price) / expectedPrice) * 100);
                return savings > 0 ? savings : null;
            }
        }
        return null;
    }, [subscriptionPlans]);

    // Tính toán startDate và endDate dựa trên billing cycle
    const calculateSubscriptionDates = (
        billingCycle: 'MONTHLY' | 'QUARTERLY' | 'YEARLY'
    ): { startDate: string; endDate: string } => {
        const now = new Date();
        // Use local date to avoid timezone issues
        const year = now.getFullYear();
        const month = now.getMonth();
        const day = now.getDate();

        // Create startDate using local date (no timezone conversion)
        const startDate = new Date(year, month, day);

        const endDate = new Date(year, month, day);

        switch (billingCycle) {
            case 'MONTHLY':
                endDate.setMonth(endDate.getMonth() + 1);
                break;
            case 'QUARTERLY':
                endDate.setMonth(endDate.getMonth() + 3);
                break;
            case 'YEARLY':
                endDate.setFullYear(endDate.getFullYear() + 1);
                break;
        }

        // Format as YYYY-MM-DD using local timezone to avoid UTC conversion issues
        const formatDate = (date: Date): string => {
            const y = date.getFullYear();
            const m = String(date.getMonth() + 1).padStart(2, '0');
            const d = String(date.getDate()).padStart(2, '0');
            return `${y}-${m}-${d}`;
        };

        return {
            startDate: formatDate(startDate),
            endDate: formatDate(endDate),
        };
    };

    // Helper function to validate hospital ID
    const validateHospitalId = (id: string | undefined): boolean => {
        if (!id) {
            toast.error('Không tìm thấy thông tin bệnh viện. Vui lòng đăng nhập lại.');
            return false;
        }

        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(id)) {
            toast.error('ID bệnh viện không hợp lệ. Vui lòng liên hệ quản trị viên.');
            console.error('Invalid hospital ID format:', id);
            return false;
        }

        return true;
    };

    // Helper function to get billing cycle label for error messages
    const getBillingCycleLabel = (billingCycle: 'MONTHLY' | 'QUARTERLY' | 'YEARLY'): string => {
        if (billingCycle === 'QUARTERLY') return 'quý';
        if (billingCycle === 'YEARLY') return 'năm';
        return 'tháng';
    };

    // Helper function to check and handle downgrade attempt
    const checkDowngradeAndHandle = (
        targetPlan: SubscriptionPlanType | undefined,
        planBillingCycle: 'MONTHLY' | 'QUARTERLY' | 'YEARLY',
        currentPlan: SubscriptionPlanType | undefined
    ): boolean => {
        if (!targetPlan || !isDowngrade(planBillingCycle, targetPlan.price)) {
            return false;
        }

        const billingCycleText = getBillingCycleLabel(planBillingCycle);

        if (
            currentPlan &&
            currentPlan.price > targetPlan.price &&
            currentPlan.billingCycle === planBillingCycle
        ) {
            toast.error(
                `Không thể chuyển từ "${currentPlan.name}" xuống "${targetPlan.name}" (cùng chu kỳ ${billingCycleText}). Vui lòng đợi gói hiện tại hết hạn.`
            );
        } else {
            toast.error(
                'Không thể chuyển từ gói theo quý xuống gói theo tháng. Vui lòng đợi gói hiện tại hết hạn.'
            );
        }
        return true;
    };

    // Helper function to handle upgrade subscription
    const handleUpgradeSubscription = async (
        currentActiveSubscription: any,
        planId: string
    ): Promise<void> => {
        const success = await upgradeHospitalSubscription(
            currentActiveSubscription.hospitalSubscriptionId,
            planId
        );
        if (success) {
            toast.success('Nâng cấp gói dịch vụ thành công!');
            await loadActiveHospitalSubscription(hospitalId!);
        } else {
            toast.error('Nâng cấp gói dịch vụ thất bại. Vui lòng thử lại.');
        }
    };

    // Helper function to handle create subscription
    const handleCreateSubscription = async (
        planId: string,
        planBillingCycle: 'MONTHLY' | 'QUARTERLY' | 'YEARLY'
    ): Promise<void> => {
        const { startDate, endDate } = calculateSubscriptionDates(planBillingCycle);

        const success = await createHospitalSubscription({
            hospitalId: hospitalId!,
            subscriptionId: planId,
            startDate,
            endDate,
        });

        if (success) {
            toast.success('Đăng ký gói dịch vụ thành công!');
            await loadActiveHospitalSubscription(hospitalId!);
        } else {
            toast.error('Đăng ký gói dịch vụ thất bại. Vui lòng thử lại.');
        }
    };

    // Helper function to handle errors
    const handleSubscriptionError = (err: any): void => {
        console.error('Error creating subscription:', err);
        const errorMessage = err.message || 'Có lỗi xảy ra khi đăng ký gói dịch vụ';
        const lowerMessage = errorMessage.toLowerCase();

        if (
            lowerMessage.includes('không thể chuyển') ||
            lowerMessage.includes('chuyển từ gói') ||
            lowerMessage.includes('xuống gói')
        ) {
            toast.error(errorMessage);
        } else if (lowerMessage.includes('hospital') && lowerMessage.includes('not found')) {
            toast.error(
                'Không tìm thấy thông tin bệnh viện trong hệ thống. Vui lòng liên hệ quản trị viên để được hỗ trợ.'
            );
        } else {
            toast.error(errorMessage);
        }
    };

    // Xử lý nâng cấp gói dịch vụ
    const handleUpgradePlan = async (
        planId: string,
        planBillingCycle: 'MONTHLY' | 'QUARTERLY' | 'YEARLY'
    ) => {
        if (!validateHospitalId(hospitalId)) {
            return;
        }

        try {
            const currentActiveSubscription = hospitalSubscriptions.find(
                (s) => s.status === 'ACTIVE'
            );
            const targetPlan = subscriptionPlans.find((p) => p.id === planId);
            const currentPlan = subscriptionPlans.find((p) => p.id === currentSubscriptionPlanId);

            if (currentActiveSubscription) {
                if (checkDowngradeAndHandle(targetPlan, planBillingCycle, currentPlan)) {
                    return;
                }
                await handleUpgradeSubscription(currentActiveSubscription, planId);
            } else {
                await handleCreateSubscription(planId, planBillingCycle);
            }
        } catch (err: any) {
            handleSubscriptionError(err);
        }
    };

    // Render plans content based on loading and data state
    const renderPlansContent = () => {
        if (loading) {
            return (
                <>
                    {[0, 1, 2].map((skeletonIndex) => (
                        <div key={`skeleton-${skeletonIndex}`} className={styles.planColumn}>
                            <SubscriptionPlanSkeletonCard highlighted={skeletonIndex === 1} />
                        </div>
                    ))}
                </>
            );
        }

        if (filteredPlans.length === 0) {
            return (
                <div className={styles.emptyContainer}>
                    <p>Không có gói dịch vụ nào khả dụng cho chu kỳ thanh toán này.</p>
                </div>
            );
        }

        return filteredPlans.map((plan, index) => {
            const isCurrentPlan = plan.id === currentSubscriptionPlanId;
            const isMiddle = index === 1; // Highlight middle plan
            const isDowngradeAttempt = isDowngrade(plan.billingCycle, plan.price);

            // Get subscription dates if this plan is currently subscribed
            const subscriptionForPlan =
                isCurrentPlan && currentActiveSubscription ? currentActiveSubscription : null;

            // Determine button text and behavior
            let buttonText = isCurrentPlan ? 'Gói hiện tại' : `Nâng cấp gói ${plan.name}`;

            if (isDowngradeAttempt && !isCurrentPlan) {
                buttonText = 'Không thể hạ cấp xuống gói này';
            }

            // Tính giá gốc dựa trên phần trăm tiết kiệm
            const getSavingsPercent = (): number | null => {
                if (billingPeriod === 'yearly') return yearlySavingsPercent;
                if (billingPeriod === 'quarterly') return quarterlySavingsPercent;
                return null;
            };
            const savingsPercent = getSavingsPercent();
            const originalPriceNumber = calculateOriginalPrice(plan.price, savingsPercent);
            const originalPriceFormatted = originalPriceNumber
                ? formatPrice(originalPriceNumber)
                : undefined;

            return (
                <div key={plan.id} className={styles.planColumn}>
                    <SubscriptionPlanCard
                        title={plan.name}
                        price={formatPrice(plan.price)}
                        originalPrice={originalPriceFormatted}
                        priceSubtext={getPriceSubtext(billingPeriod)}
                        buttonText={buttonText}
                        buttonVariant={
                            isCurrentPlan || isDowngradeAttempt ? 'secondary' : 'primary'
                        }
                        features={getFeatures(plan)}
                        badge={isMiddle ? 'Phổ biến' : undefined}
                        highlighted={isMiddle}
                        isCurrentPlan={isCurrentPlan}
                        onUpgrade={
                            isCurrentPlan || isDowngradeAttempt
                                ? undefined
                                : () => handleUpgradePlan(plan.id, plan.billingCycle)
                        }
                        startDate={subscriptionForPlan?.startDate}
                        endDate={subscriptionForPlan?.endDate}
                    />
                </div>
            );
        });
    };

    return (
        <div className={styles.subscriptionPlan}>
            <button
                className={styles.closeButton}
                onClick={() => globalThis.history.back()}
                aria-label="Quay lại"
            >
                <X size={24} color="#6c757d" />
            </button>

            <div className={styles.container}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Gói Dịch Vụ</h1>
                    <p className={styles.subtitle}>Lựa chọn gói phù hợp với nhu cầu của bạn</p>
                    <p className={styles.subtitleSecond}>Nâng cao trải nghiệm quản lý bệnh viện</p>

                    <div className={styles.billingToggle}>
                        <button
                            onClick={() => {
                                setBillingPeriod('yearly');
                                globalThis.history.pushState(
                                    {},
                                    '',
                                    `${globalThis.location.pathname}?plan-type=yearly`
                                );
                            }}
                            className={`${styles.billingButton} ${
                                billingPeriod === 'yearly' ? styles.active : styles.inactive
                            }`}
                        >
                            Thanh toán theo năm
                            {billingPeriod === 'yearly' && yearlySavingsPercent !== null && (
                                <span className={styles.savingsText}>
                                    tiết kiệm {yearlySavingsPercent}%
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => {
                                setBillingPeriod('quarterly');
                                globalThis.history.pushState(
                                    {},
                                    '',
                                    `${globalThis.location.pathname}?plan-type=quarterly`
                                );
                            }}
                            className={`${styles.billingButton} ${
                                billingPeriod === 'quarterly' ? styles.active : styles.inactive
                            }`}
                        >
                            Thanh toán theo quý
                            {billingPeriod === 'quarterly' && quarterlySavingsPercent !== null && (
                                <span className={styles.savingsText}>
                                    tiết kiệm {quarterlySavingsPercent}%
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => {
                                setBillingPeriod('monthly');
                                globalThis.history.pushState(
                                    {},
                                    '',
                                    `${globalThis.location.pathname}?plan-type=monthly`
                                );
                            }}
                            className={`${styles.billingButton} ${
                                billingPeriod === 'monthly' ? styles.active : styles.inactive
                            }`}
                        >
                            Thanh toán theo tháng
                        </button>
                    </div>
                </div>

                <div className={styles.plansContainer}>{renderPlansContent()}</div>

                {/* Terms and Conditions Button */}
                <div className="text-center" style={{ marginTop: '2rem' }}>
                    <button
                        className="btn btn-outline-secondary rounded-pill px-4 py-2"
                        style={{ fontWeight: '500' }}
                        onClick={() => setIsTermsModalOpen(true)}
                    >
                        Xem chính sách và điều khoản
                    </button>
                </div>
            </div>

            {/* Terms and Conditions Modal */}
            {isTermsModalOpen && (
                <TermsAndConditionsModal onClose={() => setIsTermsModalOpen(false)} />
            )}
        </div>
    );
};

// Terms and Conditions Modal Component
interface TermsAndConditionsModalProps {
    onClose: () => void;
}

const TermsAndConditionsModal: React.FC<TermsAndConditionsModalProps> = ({ onClose }) => {
    useEffect(() => {
        // Prevent body scroll when modal is open
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    // Handle keyboard events for accessibility
    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClose();
        }
    };

    return (
        <div
            className="modal fade show d-block"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
            onClick={onClose}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            aria-label="Đóng modal"
        >
            <div
                className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable"
                onClick={(e) => e.stopPropagation()}
            >
                <div className={`modal-content ${styles.modalContent}`}>
                    <div className="modal-header border-0 pb-0">
                        <h5 id="terms-modal-title" className="modal-title fw-bold text-dark fs-18">
                            Chính sách và Điều khoản
                        </h5>
                        <button
                            type="button"
                            className="btn-close"
                            onClick={onClose}
                            aria-label="Close"
                        ></button>
                    </div>

                    <div className={`modal-body pt-0 ${styles.modalBody}`}>
                        {/* Notice Section */}
                        <div className={styles.noticeSection}>
                            <div className={styles.noticeIcon}>
                                <Info size={18} />
                            </div>
                            <div className={styles.noticeContent}>
                                <span className={styles.noticeLabel}>Lưu ý:</span>
                                <span className={styles.noticeText}>
                                    Khi nâng cấp gói dịch vụ, hệ thống sẽ tự động tính toán và bù
                                    trừ giá trị còn lại của gói hiện tại. Vui lòng đọc kỹ các điều
                                    khoản dưới đây để hiểu rõ hơn về chính sách nâng cấp, hạ cấp và
                                    các quy định liên quan.
                                </span>
                            </div>
                        </div>

                        <div className={styles.termsContent}>
                            <div className={styles.termItem}>
                                <h3 className={styles.termHeading}>1. Đăng ký gói dịch vụ</h3>
                                <ul className={styles.termList}>
                                    <li>
                                        Bệnh viện chỉ có thể đăng ký một gói dịch vụ tại một thời
                                        điểm.
                                    </li>
                                    <li>
                                        Ngày bắt đầu gói dịch vụ được tính từ thời điểm đăng ký
                                        thành công.
                                    </li>
                                    <li>
                                        Ngày hết hạn được tính tự động dựa trên chu kỳ thanh toán đã
                                        chọn (Tháng/Quý/Năm).
                                    </li>
                                    <li>
                                        Gói dịch vụ sẽ tự động kích hoạt ngay sau khi đăng ký thành
                                        công.
                                    </li>
                                </ul>
                            </div>

                            <div className={styles.termItem}>
                                <h3 className={styles.termHeading}>2. Nâng cấp gói dịch vụ</h3>
                                <ul className={styles.termList}>
                                    <li>
                                        Bệnh viện có thể nâng cấp lên gói dịch vụ cao hơn bất cứ lúc
                                        nào trong thời gian sử dụng.
                                    </li>
                                    <li>
                                        <strong>Bù trừ giá trị còn lại:</strong> Khi nâng cấp, hệ
                                        thống sẽ tự động tính toán và bù trừ giá trị còn lại của gói
                                        hiện tại.
                                        <ul className={styles.termSubList}>
                                            <li>
                                                Hệ thống tính giá trị còn lại dựa trên tỷ lệ
                                                giá/ngày của gói hiện tại.
                                            </li>
                                            <li>
                                                Giá trị còn lại sẽ được chuyển đổi thành số ngày
                                                tương đương trong gói mới.
                                            </li>
                                            <li>
                                                Số ngày bù trừ được làm tròn lên (làm tròn lên) để
                                                có lợi cho bệnh viện.
                                            </li>
                                            <li>
                                                Ví dụ: Nếu gói hiện tại (3.240.000 VNĐ/quý) còn 20
                                                ngày, giá trị còn lại là 720.000 VNĐ. Khi nâng cấp
                                                lên gói mới (10.260.000 VNĐ/quý), sẽ được bù khoảng
                                                6-7 ngày tương đương.
                                            </li>
                                        </ul>
                                    </li>
                                    <li>
                                        Gói cũ sẽ tự động bị hủy và gói mới sẽ có hiệu lực ngay lập
                                        tức.
                                    </li>
                                    <li>
                                        Thời gian sử dụng gói mới = Thời gian chu kỳ thanh toán của
                                        gói mới + Số ngày bù trừ từ gói cũ.
                                    </li>
                                </ul>
                            </div>

                            <div className={styles.termItem}>
                                <h3 className={styles.termHeading}>3. Hạ cấp gói dịch vụ</h3>
                                <ul className={styles.termList}>
                                    <li>
                                        <strong>Không được phép hạ cấp:</strong> Bệnh viện không thể
                                        hạ cấp xuống gói dịch vụ thấp hơn trong thời gian gói hiện
                                        tại còn hiệu lực.
                                    </li>
                                    <li>
                                        Các trường hợp không được phép hạ cấp:
                                        <ul className={styles.termSubList}>
                                            <li>
                                                Chuyển từ gói có chu kỳ thanh toán dài hơn xuống chu
                                                kỳ ngắn hơn (ví dụ: từ Quý xuống Tháng, từ Năm xuống
                                                Quý hoặc Tháng).
                                            </li>
                                            <li>
                                                Chuyển từ gói có giá cao hơn xuống gói có giá thấp
                                                hơn trong cùng chu kỳ thanh toán (ví dụ: từ "Gói
                                                nâng cao" xuống "Gói cơ bản" cùng chu kỳ Quý).
                                            </li>
                                        </ul>
                                    </li>
                                    <li>
                                        Bệnh viện chỉ có thể đăng ký gói thấp hơn sau khi gói hiện
                                        tại đã hết hạn.
                                    </li>
                                    <li>
                                        Để hạ cấp, bệnh viện cần đợi đến ngày hết hạn của gói hiện
                                        tại, sau đó mới có thể đăng ký gói dịch vụ mới.
                                    </li>
                                </ul>
                            </div>

                            <div className={styles.termItem}>
                                <h3 className={styles.termHeading}>4. Chu kỳ thanh toán</h3>
                                <ul className={styles.termList}>
                                    <li>
                                        Hệ thống hỗ trợ 3 chu kỳ thanh toán: <strong>Tháng</strong>,{' '}
                                        <strong>Quý</strong> (3 tháng), và <strong>Năm</strong> (12
                                        tháng).
                                    </li>
                                    <li>
                                        Mỗi chu kỳ có mức giá khác nhau tương ứng với gói dịch vụ.
                                    </li>
                                    <li>
                                        Thanh toán theo Quý và Năm thường có mức giá ưu đãi hơn so
                                        với thanh toán theo Tháng.
                                    </li>
                                </ul>
                            </div>

                            <div className={styles.termItem}>
                                <h3 className={styles.termHeading}>5. Gia hạn gói dịch vụ</h3>
                                <ul className={styles.termList}>
                                    <li>
                                        Bệnh viện có thể gia hạn gói dịch vụ hiện tại trước khi hết
                                        hạn.
                                    </li>
                                    <li>
                                        Khi gia hạn, thời gian sử dụng sẽ được cộng thêm vào ngày
                                        hết hạn hiện tại.
                                    </li>
                                    <li>
                                        Nếu gia hạn trước khi hết hạn, thời gian mới sẽ bắt đầu từ
                                        ngày hết hạn của gói hiện tại.
                                    </li>
                                </ul>
                            </div>

                            <div className={styles.termItem}>
                                <h3 className={styles.termHeading}>6. Hủy gói dịch vụ</h3>
                                <ul className={styles.termList}>
                                    <li>Bệnh viện có thể hủy gói dịch vụ bất cứ lúc nào.</li>
                                    <li>
                                        Khi hủy gói, bệnh viện sẽ mất quyền truy cập vào các tính
                                        năng của gói từ thời điểm hủy.
                                    </li>
                                    <li>
                                        Không có hoàn tiền cho phần thời gian còn lại khi hủy gói
                                        giữa chừng.
                                    </li>
                                </ul>
                            </div>

                            <div className={styles.termItem}>
                                <h3 className={styles.termHeading}>7. Lưu ý quan trọng</h3>
                                <ul className={styles.termList}>
                                    <li>
                                        Tất cả các giao dịch nâng cấp, hạ cấp, và đăng ký gói đều
                                        được ghi lại trong lịch sử.
                                    </li>
                                    <li>
                                        Hệ thống sẽ tự động tính toán và áp dụng chính sách bù trừ
                                        khi nâng cấp.
                                    </li>
                                    <li>
                                        Mọi thay đổi về gói dịch vụ sẽ có hiệu lực ngay lập tức sau
                                        khi xác nhận.
                                    </li>
                                    <li>
                                        Nếu có bất kỳ thắc mắc nào, vui lòng liên hệ bộ phận hỗ trợ
                                        khách hàng để được giải đáp.
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionPlan as React.FC;
