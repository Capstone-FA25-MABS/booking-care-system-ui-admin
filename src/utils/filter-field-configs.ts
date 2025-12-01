import { AppointmentType } from '@/enums/appointment.enums';

interface FilterFieldOption {
    value: string;
    label: string;
}

interface FilterFieldConfig {
    name: string;
    label: string;
    type: 'multiselect';
    value: string[];
    onChange: (value: unknown) => void;
    options: FilterFieldOption[];
    placeholder: string;
    resetValue: () => void; // Function to reset field value
}

export const createAppointmentTypeFilterField = (
    selectedTypes: AppointmentType[],
    setSelectedTypes: (types: AppointmentType[]) => void
): FilterFieldConfig => {
    return {
        name: 'types',
        label: 'Loại Khám',
        type: 'multiselect',
        value: selectedTypes.map((t) => t.toString()),
        onChange: (value) => {
            const types = (value as string[]).map((v) =>
                v === 'TELEHEALTH' ? AppointmentType.TELEHEALTH : AppointmentType.IN_PERSON
            );
            setSelectedTypes(types);
        },
        options: [
            { value: AppointmentType.TELEHEALTH.toString(), label: 'Trực tuyến' },
            { value: AppointmentType.IN_PERSON.toString(), label: 'Trực tiếp' },
        ],
        placeholder: 'Chọn loại khám...',
        resetValue: () => setSelectedTypes([]), // Reset function
    };
};
