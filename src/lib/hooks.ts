import * as path from 'path';
import chalk from 'chalk';
import axios from 'axios';
import * as stringArgv from 'string-argv';
import {Command} from 'commander';
import {spawn} from 'child_process';
import globalConfig from './global-config';

import {confirm} from './prompts';
import {renderString} from './templates';

// Where the dist directory is from this file
const distDir = path.resolve(__dirname, '..');

/**
 * Executes a shell command and returns a Promise.  If the promise resolves, the command was successful; if it is
 * rejected, it was not.
 *
 * @param command - shell command to be executed
 * @param cwd - working directory for the command to execute in
 */
const shellCommand = (command: string, cwd: string): Promise<any> => {
	return new Promise((resolve, reject) => {
		const process = spawn(command, {stdio: 'inherit', shell: true, cwd: cwd});
		process.on('exit', (code) => code === 0 ? resolve() : reject());
		process.on('error', () => reject());
	});
};

/**
 * Contains all the builtin 'plopify:xxx' commands.
 */
const plopifyCommands: {[command: string]: {args: string, options: string[], action: (...input) => Promise<any>}} = {
	'github-init': {
		args: '<name>',
		options: ['-p --private'],
		action: async (name, options) => {
			const token = await globalConfig(distDir).read('githubPersonalAccessToken');

			const status = (await axios.request({
				method: 'POST',
				url: 'https://api.github.com/user/repos',
				headers: {
					'Authorization': 'token ' + token,
				},
				data: {
					name: name,
					private: options.private
				}
			})).status;

			if (status === 201)
				return;
			else
				throw new Error('Unable to create remote repository');  // TODO: add more detailed message
		}
	}
};

// Init a program with plopifyCommands
const program = new Command();
for (let command in plopifyCommands) {
	const data = plopifyCommands[command];

	let comm = program.command(command + ' ' + data.args);
	for (let option of data.options) comm.option(option);
	comm.action(data.action);
}

/**
 * Processes the given hooks, returning true if all pass.
 */
export async function runHooks(hooks: string[], answers: {[key: string]: string}, cwd: string): Promise<boolean> {
	// Render any hooks that might have used {{prompt_answers}}
	hooks = hooks.map(hook => renderString(hook, answers));

	const plopifyPrefix = 'plopify ';
	for (let hook of hooks) {
		console.log(chalk.yellow('Running hook: `' + hook + '`...'));

		try {
			if (hook.startsWith(plopifyPrefix)) {
				// TODO: figure out how to capture this one
				await program.parse(stringArgv(hook));
			} else {
				await shellCommand(hook, cwd);
			}
		} catch (e) {
			console.log(e.message);
			console.log(chalk.red('Error in hook `' + hook + '`'));
			if (!await confirm('Would you like to ignore this error and continue?')) {
				return false;
			}
		}
	}

	// If we make it here, everything was successful
	return true;
}
