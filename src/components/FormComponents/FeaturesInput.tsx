import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Check } from 'lucide-react';

export interface FeatureInput {
    text: string;
    subtext?: string;
    iconType: 'check' | 'plus' | 'star' | 'info';
}

export interface FeaturesInputProps {
    value?: string; // JSON string from formData
    onChange: (jsonString: string) => void;
    validationError?: string;
    styles?: {
        invalidFeedback?: string;
    };
}

const FeaturesInput: React.FC<FeaturesInputProps> = ({
    value,
    onChange,
    validationError,
    styles,
}) => {
    const [features, setFeatures] = useState<FeatureInput[]>([]);

    // Parse JSON string to array when value changes
    useEffect(() => {
        if (value && value.trim()) {
            try {
                const parsed = JSON.parse(value);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    // Validate and map parsed data to FeatureInput type
                    const validatedFeatures: FeatureInput[] = parsed.map((item: any) => ({
                        text: item.text || '',
                        subtext: item.subtext || undefined,
                        iconType: (['check', 'plus', 'star', 'info'].includes(item.iconType)
                            ? item.iconType
                            : 'check') as FeatureInput['iconType'],
                    }));
                    setFeatures(validatedFeatures);
                } else {
                    // If empty array or invalid, show 3 empty rows
                    setFeatures([
                        { text: '', subtext: '', iconType: 'check' },
                        { text: '', subtext: '', iconType: 'check' },
                        { text: '', subtext: '', iconType: 'check' },
                    ]);
                }
            } catch {
                // Invalid JSON, show 3 empty rows
                setFeatures([
                    { text: '', subtext: '', iconType: 'check' },
                    { text: '', subtext: '', iconType: 'check' },
                    { text: '', subtext: '', iconType: 'check' },
                ]);
            }
        } else {
            // No value, show 3 empty rows
            setFeatures([
                { text: '', subtext: '', iconType: 'check' },
                { text: '', subtext: '', iconType: 'check' },
                { text: '', subtext: '', iconType: 'check' },
            ]);
        }
    }, [value]);

    // Update parent when features change
    const updateFeatures = (newFeatures: FeatureInput[]) => {
        setFeatures(newFeatures);
        // Filter out empty features (no text) before converting to JSON
        const validFeatures = newFeatures.filter((f) => f.text.trim().length > 0);
        const jsonString = JSON.stringify(validFeatures);
        onChange(jsonString);
    };

    const handleFeatureChange = (
        index: number,
        field: keyof FeatureInput,
        fieldValue: string | 'check' | 'plus' | 'star' | 'info'
    ) => {
        const newFeatures = [...features];
        newFeatures[index] = {
            ...newFeatures[index],
            [field]: fieldValue === '' ? undefined : fieldValue,
        };
        updateFeatures(newFeatures);
    };

    const handleAddFeature = () => {
        const newFeatures = [
            ...features,
            { text: '', subtext: '', iconType: 'check' as FeatureInput['iconType'] },
        ];
        updateFeatures(newFeatures);
    };

    const handleRemoveFeature = (index: number) => {
        if (features.length > 1) {
            const newFeatures = features.filter((_, i) => i !== index);
            // Ensure at least 3 rows when removing
            while (newFeatures.length < 3) {
                newFeatures.push({
                    text: '',
                    subtext: '',
                    iconType: 'check' as FeatureInput['iconType'],
                });
            }
            updateFeatures(newFeatures);
        }
    };

    const renderIcon = (iconType: FeatureInput['iconType']) => {
        const iconSize = 16;
        switch (iconType) {
            case 'check':
                return <Check size={iconSize} className="text-success" />;
            case 'plus':
                return <Plus size={iconSize} className="text-primary" />;
            case 'star':
                return <span className="text-warning">★</span>;
            case 'info':
                return <span className="text-info">ℹ</span>;
            default:
                return <Check size={iconSize} className="text-success" />;
        }
    };

    return (
        <div>
            <div className="features-input-container">
                {features.map((feature, index) => (
                    <div
                        key={index}
                        className="d-flex align-items-start gap-2 mb-3 p-3 border rounded"
                    >
                        {/* Icon Select */}
                        <div className="flex-shrink-0" style={{ width: '100px' }}>
                            <select
                                className={`form-select form-select-sm ${validationError ? 'is-invalid' : ''}`}
                                value={feature.iconType}
                                onChange={(e) =>
                                    handleFeatureChange(
                                        index,
                                        'iconType',
                                        e.target.value as FeatureInput['iconType']
                                    )
                                }
                                style={{ fontSize: '12px' }}
                            >
                                <option value="check">Check</option>
                                <option value="plus">Plus</option>
                                <option value="star">Star</option>
                                <option value="info">Info</option>
                            </select>
                            <div className="mt-2 d-flex align-items-center justify-content-center">
                                {renderIcon(feature.iconType)}
                            </div>
                        </div>

                        {/* Text and Subtext Inputs */}
                        <div className="flex-grow-1">
                            <input
                                type="text"
                                className={`form-control mb-2 ${validationError ? 'is-invalid' : ''}`}
                                placeholder="Nhập tính năng (VD: Quản lý tối đa 30 bác sĩ)"
                                value={feature.text}
                                onChange={(e) => handleFeatureChange(index, 'text', e.target.value)}
                            />
                            <input
                                type="text"
                                className="form-control form-control-sm"
                                placeholder="Nhập mô tả phụ (tùy chọn)"
                                value={feature.subtext || ''}
                                onChange={(e) =>
                                    handleFeatureChange(index, 'subtext', e.target.value)
                                }
                            />
                        </div>

                        {/* Remove Button */}
                        <div className="flex-shrink-0">
                            <button
                                type="button"
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleRemoveFeature(index)}
                                disabled={features.length <= 1}
                                title="Xóa tính năng"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add Feature Button */}
            <button
                type="button"
                className="btn btn-sm btn-outline-primary d-flex align-items-center gap-2"
                onClick={handleAddFeature}
            >
                <Plus size={16} />
                Thêm Tính Năng
            </button>

            {/* Validation Error */}
            {validationError && (
                <div className={styles?.invalidFeedback || 'invalid-feedback d-block'}>
                    {validationError}
                </div>
            )}

            {/* Helper Text */}
            <small className="text-muted d-block mt-2">
                Mỗi tính năng sẽ được lưu dưới dạng JSON. Bạn có thể thêm/xóa tính năng tùy ý.
            </small>
        </div>
    );
};

export default FeaturesInput;
