/**
 * Specifies the entities to which a discount can be applied.
 */
export enum DiscountApplicableTo {
    /**
     * The discount is applicable to all entities.
     */
    ALL,

    /**
     * The discount is applicable to a specific specialty.
     */
    SPECIALTY,

    /**
     * The discount is applicable to a specific doctor.
     */
    DOCTOR,
}

/**
 * Represents the status of a discount.
 */
export enum DiscountStatus {
    /**
     * The discount is currently active and can be used.
     */
    ACTIVE,

    /**
     * The discount is currently inactive and cannot be used.
     */
    INACTIVE,

    /**
     * The discount has expired and is no longer valid.
     */
    EXPIRED,
}

/**
 * Specifies the type of discount to be applied.
 */
export enum DiscountType {
    /**
     * A fixed amount discount, which subtracts a specific monetary value from the total.
     */
    FIXED_AMOUNT,

    /**
     * A percentage discount, which subtracts a percentage of the total amount.
     */
    PERCENTAGE,
}
