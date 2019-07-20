/**
 * Quick, dirty utility to convert 'camelCase' to 'non case'.
 */
export const unCamel = (input: string) => input.replace(/([A-Z])/g, ' $1').toLowerCase();
