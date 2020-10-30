/**
 * Returns value if defined, otherwise default value.
 * @param {T} value - Primary value
 * @param {T} defaultValue - Default value for the case if value is undefined
 * @returns {T}
 */
export const get = <T>(value: T, defaultValue: T): T => value !== undefined ? value : defaultValue;
