/**
 * Gender enumeration
 * Based on API specification: integer enum values
 * Assumption: 0 = Unknown/Not Specified, 1 = Male, 2 = Female
 */
export enum Gender {
  Unknown = 0,
  Male = 1,
  Female = 2
}

/**
 * Gender display labels
 */
export const GenderLabels: Record<Gender, string> = {
  [Gender.Unknown]: 'Not Specified',
  [Gender.Male]: 'Male',
  [Gender.Female]: 'Female'
};

