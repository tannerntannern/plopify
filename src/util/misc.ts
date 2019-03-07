import chalk from 'chalk';

const packageJson = require('../../package.json');

/**
 * A pretty header to print at the beginning of all plopify commands
 */
export const header = chalk.bold.bgBlue(` ${packageJson.name} `) + chalk.bold.bgYellow(` v${packageJson.version} `);

/**
 * Logs ✔/✘ for true/false
 */
export function logStatus(success: boolean) {
	console.log(success ? chalk.greenBright('✔ ') : chalk.red('✘ '));
}

/**
 * Utility sleep function.  Usage: `await sleep(100);`
 */
export const sleep = (time: number) => new Promise(resolve => setTimeout(resolve, time));
