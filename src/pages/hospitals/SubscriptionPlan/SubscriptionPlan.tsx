import { useState } from 'react';
import SubscriptionPlanCard from './components/SubscriptionPlanCard';
import { Check, Plus, X } from 'lucide-react';
import styles from './SubscriptionPlan.module.scss';

type BillingPeriod = 'yearly' | 'quarterly' | 'monthly';

interface Feature {
    icon: React.ReactNode;
    text: string;
    subtext?: string;
}

const SubscriptionPlan = () => {
    const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('yearly');

    const basicFeatures: Feature[] = [
        {
            icon: <Check size={16} />,
            text: 'Hiển thị thông tin cơ sở y tế và dịch vụ cơ bản trên nền tảng',
        },
        { icon: <Check size={16} />, text: 'Quản lý tối đa 12 bác sĩ' },
        { icon: <Check size={16} />, text: 'Quản lý tối đa 4 chuyên khoa' },
        { icon: <Check size={16} />, text: 'Hỗ trợ quản lý lịch hẹn trực tuyến' },
        {
            icon: <Check size={16} />,
            text: 'Gửi nhắc nhở tự động cho bệnh nhân',
            subtext: 'Email/SMS cơ bản',
        },
        { icon: <Check size={16} />, text: 'Tư vấn y tế từ xa giới hạn 20 lượt/tháng' },
    ];

    const advancedFeatures: Feature[] = [
        { icon: <Check size={16} />, text: 'Quản lý tối đa 30 bác sĩ' },
        { icon: <Check size={16} />, text: 'Quản lý tối đa 10 chuyên khoa' },
        { icon: <Check size={16} />, text: 'Hiển thị ưu tiên trong kết quả tìm kiếm' },
        { icon: <Check size={16} />, text: 'Tư vấn y tế từ xa không giới hạn' },
        {
            icon: <Check size={16} />,
            text: 'Quản lý & thống kê lịch sử đặt hẹn',
            subtext: 'Theo tháng/quý',
        },
        {
            icon: <Check size={16} />,
            text: 'Hỗ trợ kênh trao đổi trực tuyến giữa bệnh nhân & nhân viên y tế',
        },
        { icon: <Plus size={16} />, text: 'Bao gồm toàn bộ tính năng của gói Cơ bản' },
    ];

    const professionalFeatures: Feature[] = [
        { icon: <Check size={16} />, text: 'Không giới hạn số lượng bác sĩ & chuyên khoa' },
        { icon: <Check size={16} />, text: 'Được hiển thị nổi bật nhất trong kết quả tìm kiếm' },
        {
            icon: <Check size={16} />,
            text: 'Trang hồ sơ bệnh viện chuyên biệt',
            subtext: 'Thương hiệu, banner, hình ảnh/video',
        },
        { icon: <Check size={16} />, text: 'Báo cáo nâng cao', subtext: 'Doanh thu, lượt khám' },
        { icon: <Check size={16} />, text: 'Hỗ trợ khách hàng VIP 24/7' },
        { icon: <Plus size={16} />, text: 'Bao gồm toàn bộ tính năng của gói Nâng cao' },
    ];

    return (
        <div className={styles.subscriptionPlan}>
            <button className={styles.closeButton} onClick={() => window.history.back()}>
                <X size={24} color="#6c757d" />
            </button>

            <div className={styles.container}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Gói Dịch Vụ</h1>
                    <p className={styles.subtitle}>Lựa chọn gói phù hợp với nhu cầu của bạn</p>
                    <p className={styles.subtitleSecond}>Nâng cao trải nghiệm quản lý bệnh viện</p>

                    <div className={styles.billingToggle}>
                        <button
                            onClick={() => setBillingPeriod('yearly')}
                            className={`${styles.billingButton} ${
                                billingPeriod === 'yearly' ? styles.active : styles.inactive
                            }`}
                        >
                            Thanh toán theo năm
                            {billingPeriod === 'yearly' && (
                                <span className={styles.savingsText}>tiết kiệm 30%</span>
                            )}
                        </button>
                        <button
                            onClick={() => setBillingPeriod('quarterly')}
                            className={`${styles.billingButton} ${
                                billingPeriod === 'quarterly' ? styles.active : styles.inactive
                            }`}
                        >
                            Thanh toán theo quý
                            {billingPeriod === 'quarterly' && (
                                <span className={styles.savingsText}>tiết kiệm 15%</span>
                            )}
                        </button>
                        <button
                            onClick={() => setBillingPeriod('monthly')}
                            className={`${styles.billingButton} ${
                                billingPeriod === 'monthly' ? styles.active : styles.inactive
                            }`}
                        >
                            Thanh toán theo tháng
                        </button>
                    </div>
                </div>

                <div className={styles.plansContainer}>
                    <div className={styles.planColumn}>
                        <SubscriptionPlanCard
                            title="Gói Cơ bản"
                            price={
                                billingPeriod === 'yearly'
                                    ? '11 triệu VNĐ'
                                    : billingPeriod === 'quarterly'
                                      ? '3 triệu VNĐ'
                                      : '1.2 triệu VNĐ'
                            }
                            priceSubtext={
                                billingPeriod === 'yearly'
                                    ? '/năm'
                                    : billingPeriod === 'quarterly'
                                      ? '/quý'
                                      : '/tháng'
                            }
                            buttonText="Gói hiện tại"
                            buttonVariant="secondary"
                            features={basicFeatures}
                            isCurrentPlan
                        />
                    </div>

                    <div className={styles.planColumn}>
                        <SubscriptionPlanCard
                            title="Gói Nâng cao"
                            price={
                                billingPeriod === 'yearly'
                                    ? '36 triệu VNĐ'
                                    : billingPeriod === 'quarterly'
                                      ? '10 triệu VNĐ'
                                      : '3.8 triệu VNĐ'
                            }
                            priceSubtext={
                                billingPeriod === 'yearly'
                                    ? '/năm'
                                    : billingPeriod === 'quarterly'
                                      ? '/quý'
                                      : '/tháng'
                            }
                            buttonText="Nâng cấp gói Nâng cao"
                            buttonVariant="primary"
                            features={advancedFeatures}
                            badge="Phổ biến"
                            highlighted
                        />
                    </div>

                    <div className={styles.planColumn}>
                        <SubscriptionPlanCard
                            title="Gói Chuyên nghiệp"
                            price={
                                billingPeriod === 'yearly'
                                    ? '72 triệu VNĐ'
                                    : billingPeriod === 'quarterly'
                                      ? '20 triệu VNĐ'
                                      : '7.5 triệu VNĐ'
                            }
                            priceSubtext={
                                billingPeriod === 'yearly'
                                    ? '/năm'
                                    : billingPeriod === 'quarterly'
                                      ? '/quý'
                                      : '/tháng'
                            }
                            buttonText="Nâng cấp gói Chuyên nghiệp"
                            buttonVariant="primary"
                            features={professionalFeatures}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionPlan;
