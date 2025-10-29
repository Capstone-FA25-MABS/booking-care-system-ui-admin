import React from 'react';
import styles from '../DoctorFormFields/DoctorFormFields.module.scss';

interface Language {
    id: string;
    name: string;
}

interface LanguagesSectionProps {
    selectedLanguageIds: string[];
    languages: Language[];
    onLanguageToggle: (languageId: string) => void;
    error?: string;
}

const LanguagesSection: React.FC<LanguagesSectionProps> = ({
    selectedLanguageIds,
    languages,
    onLanguageToggle,
    error,
}) => {
    return (
        <div className="card mb-4">
            <div className={`card-body ${styles.sectionBorder}`}>
                <h5 className="card-title mb-4">
                    <i className="feather-globe me-2"></i> Ngôn ngữ
                </h5>
                <div className="row">
                    <div className="col-12">
                        <div className="d-flex flex-wrap gap-2">
                            {languages.map((language) => (
                                <div
                                    key={language.id}
                                    className={`border rounded p-3 ${selectedLanguageIds.includes(language.id) ? 'border-primary bg-light' : 'border-light bg-white'}`}
                                    style={{
                                        transition: 'all 0.3s ease',
                                        minWidth: '150px',
                                        maxWidth: '200px',
                                    }}
                                >
                                    <div className="form-check d-flex align-items-center">
                                        <input
                                            className="form-check-input me-2"
                                            type="checkbox"
                                            id={`language-${language.id}`}
                                            checked={selectedLanguageIds.includes(language.id)}
                                            onChange={() => onLanguageToggle(language.id)}
                                            style={{ cursor: 'pointer' }}
                                        />
                                        <div>
                                            <label
                                                className="form-check-label fw-bold mb-0 d-block"
                                                htmlFor={`language-${language.id}`}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                {language.name}
                                            </label>
                                            <small
                                                className={`text-muted ${selectedLanguageIds.includes(language.id) ? 'text-primary' : ''}`}
                                            >
                                                {selectedLanguageIds.includes(language.id)
                                                    ? 'Đã chọn'
                                                    : 'Chưa chọn'}
                                            </small>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {error && (
                            <div className="alert alert-danger mt-3 mb-0">
                                <i className="feather-alert-circle me-1"></i>
                                {error}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LanguagesSection;
