import chalk from 'chalk';
import {simplePrompt} from './prompts';
import {makeAdapter, Adapter, AdapterExecutor} from 'adapter';

import {logStatus} from './misc';
const packageJson = require('../../package.json');

/**
 * A pretty header to print at the beginning of all plopify commands
 */
export const header = chalk.bold.bgBlue(` ${packageJson.name} `) + chalk.bold.bgYellow(` v${packageJson.version} `);

type Result = {prettyMessage: string, data?: any};
type Output = {type: 'taskComplete', status: boolean} | {type: 'newTask', task: string} | {type: 'warning', message: string, severe?: boolean};

type OptionsBase = { message: string };
type Input = {
	types: {
		'input': string,
		'confirm': boolean,
	},
	options: {
		'input': OptionsBase,
		'confirm': OptionsBase,
	},
	keys: { [key: string]: string }
};

type StandardAdapter = Adapter<Result, Input, Output>;

/**
 * Shortcut for `makeAdapter<...>(...)` that has all the standard typing setup for you.
 */
export const standardAdapter = (executor: AdapterExecutor<Result, Input, Output>): StandardAdapter =>
	makeAdapter<Result, Input, Output>(executor);

/**
 * Converts the given function from the API into a CLI function with pretty status reports and error handling.
 */
export const commandify = <A extends any[]>(stdFunc: (...args: A) => StandardAdapter, noHeader: boolean = false) => (
	async (...args: A) => {
		try {
			if (!noHeader) console.log(header);

			// Run the apiFunction, hooking into .status() to print out updates
			const result = await (
				stdFunc(...args)
					.output(data => {
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
					.input(async (key, options) => await simplePrompt(options))
					.exec()
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
