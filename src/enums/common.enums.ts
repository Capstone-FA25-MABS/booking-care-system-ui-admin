/**
 * Represents the status of an entity.
 */
export enum Status {
    /**
     * The entity is active.
     */
    ACTIVE,

    /**
     * The entity is inactive.
     */
    INACTIVE,
}

/**
 * Represents the gender of a person.
 */
export enum Gender {
    /**
     * Male gender.
     */
    MALE,

    /**
     * Female gender.
     */
    FEMALE,

    /**
     * Other or unspecified gender.
     */
    OTHER,
}

/**
 * User roles in the system
 */
export enum Role {
    /**
     * Administrator role with full system access.
     */
    ADMIN = 'ADMIN',

    /**
     * Doctor role for medical professionals.
     */
    DOCTOR = 'DOCTOR',

    /**
     * Staff role for hospital/clinic staff.
     */
    STAFF = 'STAFF',

    /**
     * Patient role for end users.
     */
    PATIENT = 'PATIENT',
}
