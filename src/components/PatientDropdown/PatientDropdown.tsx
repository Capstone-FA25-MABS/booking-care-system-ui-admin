import React, { useState } from 'react';

export interface Patient {
    id: string;
    name: string;
    avatar: string;
    phone?: string;
}

interface PatientDropdownProps {
    patients: Patient[];
    selectedPatient: string;
    onSelect: (patientName: string) => void;
    idPrefix?: string;
    name?: string;
}

const PatientDropdown: React.FC<PatientDropdownProps> = ({
    patients,
    selectedPatient,
    onSelect,
    idPrefix = 'patient',
    name = 'patient',
}) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredPatients = patients.filter((patient) =>
        patient.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="dropdown-menu shadow-lg w-100 dropdown-info">
            <div className="mb-3">
                <div className="input-icon-start position-relative">
                    <span className="input-icon-addon fs-12">
                        <i className="ti ti-search"></i>
                    </span>
                    <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="Search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>
            <ul className="mb-3 list-style-none">
                {filteredPatients.map((patient) => (
                    <li key={patient.id}>
                        <label
                            htmlFor={`${idPrefix}-${patient.id}`}
                            className="dropdown-item px-2 d-flex align-items-center text-dark"
                        >
                            <input
                                id={`${idPrefix}-${patient.id}`}
                                className="form-check-input m-0 me-2"
                                type="radio"
                                name={name}
                                value={patient.name}
                                checked={patient.name === selectedPatient}
                                onChange={(e) => onSelect(e.target.value)}
                            />
                            <span className="avatar avatar-sm rounded-circle me-2">
                                <img
                                    src={patient.avatar}
                                    className="flex-shrink-0 rounded-circle"
                                    alt={`Avatar của ${patient.name}`}
                                />
                            </span>
                            {patient.name}
                        </label>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default PatientDropdown;
