import ReviewService from '@/services/review.service';
interface ReviewStatRecord {
    totalReviews?: number;
    averageRating?: number;
    ratingDistribution?: Array<{ rating: number; count?: number }>;
}

interface ReviewEntitySummary {
    id: string;
    name: string;
    rating: number;
    reviews: number;
}

interface ReviewChartPoint {
    label: string;
    value1: number;
    value2: number;
}

interface ReviewInsights {
    totalReviews: number;
    averageRating: number;
    topEntities: ReviewEntitySummary[];
    chartData: ReviewChartPoint[];
    ratingDistributions: Array<{ rating: number; count?: number }>;
}

const sortByRatingThenReviews = (a: ReviewEntitySummary, b: ReviewEntitySummary) => {
    if (b.rating !== a.rating) return b.rating - a.rating;
    return b.reviews - a.reviews;
};

const buildInsights = (
    entities: any[],
    stats: Record<string, ReviewStatRecord>,
    getEntityMeta: (entity: any) => { id: string; name: string }
): ReviewInsights => {
    let totalReviews = 0;
    let ratingSum = 0;
    const ratingDistributions: Array<{ rating: number; count?: number }> = [];

    Object.values(stats).forEach((stat) => {
        const reviews = stat.totalReviews || 0;
        if (reviews > 0) {
            totalReviews += reviews;
            ratingSum += (stat.averageRating || 0) * reviews;
        }
        if (Array.isArray(stat.ratingDistribution)) {
            ratingDistributions.push(...stat.ratingDistribution);
        }
    });

    const summaries: ReviewEntitySummary[] = entities.map((entity) => {
        const { id, name } = getEntityMeta(entity);
        const stat = stats[id] || {};
        return {
            id,
            name,
            rating: stat.averageRating || 0,
            reviews: stat.totalReviews || 0,
        };
    });

    const topEntities = summaries
        .filter((summary) => summary.reviews > 0)
        .sort(sortByRatingThenReviews)
        .slice(0, 5);

    const chartData = summaries
        .filter((summary) => summary.rating > 0)
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 10)
        .map((summary) => ({
            label: summary.name,
            value1: summary.rating,
            value2: summary.reviews,
        }));

    const averageRating = totalReviews > 0 ? ratingSum / totalReviews : 0;

    return {
        totalReviews,
        averageRating,
        topEntities,
        chartData,
        ratingDistributions,
    };
};

export const buildDoctorReviewInsights = (
    doctors: any[],
    doctorsStats: Record<string, ReviewStatRecord>
) =>
    buildInsights(doctors, doctorsStats, (doctor) => ({
        id: doctor.id,
        name: `${doctor.firstName || ''} ${doctor.lastName || ''}`.trim() || 'Bác sĩ',
    }));

export const buildServiceReviewInsights = (
    services: any[],
    servicesStats: Record<string, ReviewStatRecord>
) =>
    buildInsights(services, servicesStats, (service) => ({
        id: service.id,
        name: service.name || 'Dịch vụ',
    }));

export const buildRatingDistribution = (
    sources: Array<Array<{ rating: number; count?: number }>>
) => {
    const ratingDistributionMap: Record<number, { count: number }> = {};

    sources
        .flat()
        .filter((entry) => typeof entry?.rating === 'number')
        .forEach((entry) => {
            const count = entry.count || 0;
            if (!ratingDistributionMap[entry.rating]) {
                ratingDistributionMap[entry.rating] = { count: 0 };
            }
            ratingDistributionMap[entry.rating].count += count;
        });

    const totalRatingCount = Object.values(ratingDistributionMap).reduce(
        (sum, dist) => sum + dist.count,
        0
    );

    return Object.entries(ratingDistributionMap)
        .map(([rating, dist]) => ({
            rating: Number.parseInt(rating, 10),
            count: dist.count,
            percentage: totalRatingCount > 0 ? (dist.count / totalRatingCount) * 100 : 0,
        }))
        .sort((a, b) => b.rating - a.rating);
};

interface FetchReviewInsightsOptions {
    doctors: any[];
    services: any[];
    includeRatingDistribution?: boolean;
    hospitalId?: string;
}

export const fetchReviewInsights = async ({
    doctors,
    services,
    includeRatingDistribution = false,
    hospitalId,
}: FetchReviewInsightsOptions) => {
    const [doctorsStatsRes, servicesStatsRes] = await Promise.all([
        doctors.length > 0
            ? ReviewService.getBatchDoctorsStatistics({
                  doctorIds: doctors.map((doctor: any) => doctor.id),
                  hospitalId,
              }).catch(() => ({ data: { doctorStatistics: {} } }))
            : Promise.resolve({ data: { doctorStatistics: {} } }),
        services.length > 0
            ? ReviewService.getBatchServicesStatistics({
                  serviceIds: services.map((service: any) => service.id),
                  hospitalId,
              }).catch(() => ({ data: { serviceStatistics: {} } }))
            : Promise.resolve({ data: { serviceStatistics: {} } }),
    ]);

    const doctorsStats = doctorsStatsRes.data?.doctorStatistics || {};
    const servicesStats = servicesStatsRes.data?.serviceStatistics || {};

    const doctorInsights = buildDoctorReviewInsights(doctors, doctorsStats);
    const serviceInsights = buildServiceReviewInsights(services, servicesStats);

    const ratingDistribution = includeRatingDistribution
        ? buildRatingDistribution([
              doctorInsights.ratingDistributions,
              serviceInsights.ratingDistributions,
          ])
        : [];

    return {
        doctorInsights,
        serviceInsights,
        ratingDistribution,
    };
};
