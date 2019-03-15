import chalk from 'chalk';

import {logStatus} from './misc';
import {progressPromise, ProgressPromise, ProgressPromiseExecutor} from './progress-promise';
const packageJson = require('../../package.json');

/**
 * A pretty header to print at the beginning of all plopify commands
 */
export const header = chalk.bold.bgBlue(` ${packageJson.name} `) + chalk.bold.bgYellow(` v${packageJson.version} `);

type Result = {prettyMessage: string, data?: any};
type Status = {type: 'taskComplete', status: boolean} | {type: 'newTask', task: string} | {type: 'warning', message: string, severe?: boolean};
type Input = {[key: string]: any};

type StandarizableFunction<A extends Array<any>> = (...args: A) => ProgressPromiseExecutor<Result, Status, Input>;
type StandardFunction<A extends Array<any>> = (...args: A) => ProgressPromise<Result, Status, Input>;

/**
 * Takes a function and returns a new one that is safe to give to commandify().  This helps keep the various API
 * functions consistent.
 */
export const stdFunction = <A extends Array<any>>(func: StandarizableFunction<A>): StandardFunction<A> =>
	(...args: A) => progressPromise<Result, Status, Input>(func(...args));

/**
 * Converts the given function from the API into a CLI function with pretty status reports and error handling.
 */
export const commandify = <A extends Array<any>>(stdFunc: StandardFunction<A>, noHeader: boolean = false) => (
	async (...args: A) => {
		try {
			if (!noHeader) console.log(header);

			// Run the apiFunction, hooking into .status() to print out updates
			const result = await (
				stdFunc(...args)
					.status(data => {
						switch (data.type) {
						case 'newTask':
							process.stdout.write(`${data.task}... `);
							break;
						case 'taskComplete':
							logStatus(data.status);
							break;
						case 'warning':
							console.log();
							console.log(chalk[data.severe ? 'red' : 'yellow']('WARNING:'), data.message);
							console.log();
							break;
						}
					})
					.promise()
			);

			// Display the result of the command
			console.log();
			console.log(result.prettyMessage);
		} catch (e) {
			console.log();
			console.log(chalk.red('ERROR:'), e);
			process.exit(1);
		}
	}
);
