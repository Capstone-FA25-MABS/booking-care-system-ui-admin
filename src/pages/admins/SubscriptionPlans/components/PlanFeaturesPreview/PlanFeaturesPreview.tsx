import React from 'react';

interface PlanFeaturesPreviewProps {
    features?: string | null;
    title: React.ReactNode;
    emptyState: React.ReactNode;
}

const parseFeatures = (jsonString?: string | null): any[] | null => {
    if (!jsonString) return null;

    try {
        const parsed = JSON.parse(jsonString);
        return Array.isArray(parsed) ? parsed : null;
    } catch {
        return null;
    }
};

const PlanFeaturesPreview: React.FC<PlanFeaturesPreviewProps> = ({
    features,
    title,
    emptyState,
}) => {
    if (!features) {
        return null;
    }

    const parsedFeatures = parseFeatures(features);

    if (!parsedFeatures || parsedFeatures.length === 0) {
        return <>{emptyState}</>;
    }

    return (
        <div>
            <h6 className="fw-bold mb-2">{title}</h6>
            <ul className="mb-0 ps-3">
                {parsedFeatures.map((feature: any, idx: number) => (
                    <li key={`feature-${idx}-${feature.text}`} className="text-muted mb-1">
                        {feature?.text}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default PlanFeaturesPreview;
