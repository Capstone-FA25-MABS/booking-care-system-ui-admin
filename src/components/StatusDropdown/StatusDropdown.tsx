import React, { useState } from 'react';

interface StatusDropdownProps {
    statuses: string[];
    selectedStatus: string;
    onSelect: (status: string) => void;
    idPrefix?: string;
    name?: string;
}

const StatusDropdown: React.FC<StatusDropdownProps> = ({
    statuses,
    selectedStatus,
    onSelect,
    idPrefix = 'status',
    name = 'status',
}) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredStatuses = statuses.filter((status) =>
        status.toLowerCase().includes(searchTerm.toLowerCase())
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
                {filteredStatuses.map((status, index) => (
                    <li key={`${idPrefix}-${status}-${index}`}>
                        <label
                            htmlFor={`${idPrefix}-${index}`}
                            className="dropdown-item px-2 d-flex align-items-center text-dark"
                        >
                            <input
                                id={`${idPrefix}-${index}`}
                                className="form-check-input m-0 me-2"
                                type="radio"
                                name={name}
                                value={status}
                                checked={status === selectedStatus}
                                onChange={(e) => onSelect(e.target.value)}
                            />
                            {status}
                        </label>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default StatusDropdown;
