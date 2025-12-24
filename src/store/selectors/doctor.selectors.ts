import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../index';

// Base selector
const selectDoctorState = (state: RootState) => state.doctor;

// Basic selectors
export const selectDoctors = createSelector(
    [selectDoctorState],
    (doctorState) => doctorState.doctors
);

export const selectCurrentDoctor = createSelector(
    [selectDoctorState],
    (doctorState) => doctorState.currentDoctor
);

export const selectDoctorPagination = createSelector(
    [selectDoctorState],
    (doctorState) => doctorState.pagination
);

export const selectIsDoctorLoading = createSelector(
    [selectDoctorState],
    (doctorState) => doctorState.isLoading
);

export const selectIsFilterOptionsLoading = createSelector(
    [selectDoctorState],
    (doctorState) => doctorState.isFilterOptionsLoading
);

export const selectDoctorError = createSelector(
    [selectDoctorState],
    (doctorState) => doctorState.error
);

export const selectFilterOptionsError = createSelector(
    [selectDoctorState],
    (doctorState) => doctorState.filterOptionsError
);

// Filter options selectors
export const selectSpecialties = createSelector(
    [selectDoctorState],
    (doctorState) => doctorState.specialties
);

export const selectPositions = createSelector(
    [selectDoctorState],
    (doctorState) => doctorState.positions
);

export const selectServiceTypes = createSelector(
    [selectDoctorState],
    (doctorState) => doctorState.serviceTypes
);

export const selectLanguages = createSelector(
    [selectDoctorState],
    (doctorState) => doctorState.languages
);

// Computed selectors
export const selectDoctorsCount = createSelector([selectDoctors], (doctors) => doctors.length);

export const selectTotalDoctorsCount = createSelector(
    [selectDoctorPagination],
    (pagination) => pagination.totalCount
);

export const selectHasDoctors = createSelector([selectDoctors], (doctors) => doctors.length > 0);

export const selectHasMorePages = createSelector(
    [selectDoctorPagination],
    (pagination) => pagination.pageNumber < pagination.totalPages
);

export const selectIsFirstPage = createSelector(
    [selectDoctorPagination],
    (pagination) => pagination.pageNumber === 1
);

export const selectIsLastPage = createSelector(
    [selectDoctorPagination],
    (pagination) => pagination.pageNumber === pagination.totalPages
);

// Filter options computed selectors
export const selectSpecialtiesOptions = createSelector([selectSpecialties], (specialties) =>
    specialties.map((specialty: { id: string; name: string; imageUrl: string }) => ({
        value: specialty.id,
        label: specialty.name,
        key: specialty.id,
    }))
);

export const selectPositionsOptions = createSelector([selectPositions], (positions) =>
    positions.map((position: { id: string; name: string; doctorCount: number }) => ({
        value: position.id,
        label: position.name,
        key: position.id,
    }))
);

export const selectServiceTypesOptions = createSelector([selectServiceTypes], (serviceTypes) =>
    serviceTypes.map((serviceType: { id: string; name: string }) => ({
        value: serviceType.id,
        label: serviceType.name,
        key: serviceType.id,
    }))
);

export const selectLanguagesOptions = createSelector([selectLanguages], (languages) =>
    languages.map((language: { id: string; name: string }) => ({
        value: language.id,
        label: language.name,
        key: language.id,
    }))
);

// Doctor by ID selector
export const selectDoctorById = createSelector(
    [selectDoctors, (_: RootState, doctorId: string) => doctorId],
    (doctors, doctorId) => doctors.find((doctor: any) => doctor.id === doctorId)
);

// Doctors by specialty selector
export const selectDoctorsBySpecialty = createSelector(
    [selectDoctors, (_: RootState, specialtyId: string) => specialtyId],
    (doctors, specialtyId) => doctors.filter((doctor: any) => doctor.specialty?.id === specialtyId)
);

// Doctors by position selector
export const selectDoctorsByPosition = createSelector(
    [selectDoctors, (_: RootState, positionId: string) => positionId],
    (doctors, positionId) => doctors.filter((doctor: any) => doctor.position?.id === positionId)
);

// Active doctors selector
export const selectActiveDoctors = createSelector([selectDoctors], (doctors) =>
    doctors.filter((doctor: any) => doctor.status === 'ACTIVE')
);

// Inactive doctors selector
export const selectInactiveDoctors = createSelector([selectDoctors], (doctors) =>
    doctors.filter((doctor: any) => doctor.status === 'INACTIVE')
);

// Loading state selectors
export const selectIsAnyLoading = createSelector(
    [selectIsDoctorLoading, selectIsFilterOptionsLoading],
    (isDoctorLoading, isFilterOptionsLoading) => isDoctorLoading || isFilterOptionsLoading
);

// Error state selectors
export const selectHasAnyError = createSelector(
    [selectDoctorError, selectFilterOptionsError],
    (doctorError, filterOptionsError) => !!(doctorError || filterOptionsError)
);

// Combined error message selector
export const selectCombinedErrorMessage = createSelector(
    [selectDoctorError, selectFilterOptionsError],
    (doctorError, filterOptionsError) => {
        const errors = [doctorError, filterOptionsError].filter(Boolean);
        return errors.length > 0 ? errors.join('; ') : null;
    }
);
