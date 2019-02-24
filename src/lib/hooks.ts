import * as path from 'path';
import chalk from 'chalk';
import axios from 'axios';
import * as stringArgv from 'string-argv';
import {Command} from 'commander';
import {spawn} from 'child_process';
import globalConfig from './global-config';

import {confirm} from '../util/prompts';
import {renderString} from '../util/templates';

// Commander.js doesn't appear to respect async functions, so we have to use these external resolve/reject references to
// make it work
const promiseHackery: {resolve: (...args) => any, reject: (...args) => any} = {
	resolve: null,
	reject: null
};

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

			try {
				console.log('Attempting to create repository:', name);

				let res = await (axios.request({
					method: 'POST',
					url: 'https://api.github.com/user/repos',
					headers: {
						'Authorization': 'token ' + token,
					},
					data: {
						name: name,
						private: options.private
					}
				}));

				console.log('Successfully created', chalk.blue.underline(res.data.clone_url));

				promiseHackery.resolve();
			} catch (e) {
				if (e.response) {
					process.stdout.write(chalk.bgRed.bold(' ' + e.response.status + ' ') + ' ');
					switch(e.response.status) {
					case 401:
						console.log('This likely means your GitHub personal access token is invalid.');
						break;
					}
				}

				promiseHackery.reject(e);
			}
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
				// Convert the command string into an argv format that would normally be passed to program.parse()
				const argv = stringArgv(hook.substr(plopifyPrefix.length));
				argv.unshift('node', 'bin');

				// Wrap the program parsing in a promise, injecting the resolve and reject functions into an object that
				// the .action(function) has access to.  It sucks this way, but commander doesn't respect async
				// functions at this time.
				await (new Promise(async (resolve, reject) => {
					promiseHackery.resolve = resolve;
					promiseHackery.reject = reject;

					program.parse(argv);
				}));
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
