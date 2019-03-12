import chalk from 'chalk';

import {logStatus} from './misc';
import {ProgressPromise} from './progress-promise';
const packageJson = require('../../package.json');

/**
 * A pretty header to print at the beginning of all plopify commands
 */
export const header = chalk.bold.bgBlue(` ${packageJson.name} `) + chalk.bold.bgYellow(` v${packageJson.version} `);

type Result = {prettyMessage: string, data?: any};
type Status = {task: string, status: 'running' | 'failure' | 'success'};
type APIFunction<A extends Array<any>> = (...args: A) => ProgressPromise<Result, Status>;

/**
 * Converts the given function from the API into a CLI function with pretty status reports and error handling.
 */
export const commandify = <A extends Array<any>>(apiFunction: APIFunction<A>, noHeader: boolean = false) => (
	async (...args: A) => {
		try {
			if (!noHeader) console.log(header);

			// Run the apiFunction, hooking into .status() to print out updates
			const result = await (apiFunction(...args).status(data => {
				switch (data.status) {
				case 'running':
					process.stdout.write(`${data.task}...`);
					break;
				case 'failure':
					logStatus(false);
					break;
				case 'success':
					logStatus(true);
				}
			}));

			// Display the result of the command
			console.log();
			console.log(result.prettyMessage);
		} catch (e) {
			console.log(chalk.red('Error:'), e.message);
			process.exit(1);
		}
	}
);
