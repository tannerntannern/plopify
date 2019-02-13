/**
 * Collection of utility functions.  If this file grows large enough, I'll just include lodash, but that doesn't seem
 * necessary at the moment.
 */
import chalk from 'chalk';

/**
 * Filters out array duplicates.
 */
export function unique(array: any[]): any[] {
	return array.filter((el, i, arr) => arr.indexOf(el) === i);
}

/**
 * Computes the intersection of two arrays.
 */
export function intersection(array1: any[], array2: any[]): any[] {
	return unique(
		array1.filter(el => -1 !== array2.indexOf(el))
	);
}

/**
 * Computes the union of two arrays.
 */
export function union(array1: any[], array2: any[]): any[] {
	return unique(array1.concat(array2));
}

/**
 * Computes the difference of the two arrays, namely array1 - array2.
 */
export function difference(array1: any[], array2: any): any[] {
	return array1.filter(el => !array2.includes(el));
}

/**
 * Logs ✔/✘ for true/false
 */
export function logStatus(success: boolean) {
	console.log(success ? chalk.greenBright('✔ ') : chalk.red('✘ '));
}
