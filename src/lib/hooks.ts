import axios from 'axios';
import {Command} from 'commander';
import {spawn} from 'child_process';
import {renderString} from './templates';

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
		action: (name, options) => {
			return axios.request({
				method: 'POST',
				url: 'https://api.github.com/user/repos',
				headers: {
					'Authorization': 'token ' + 'dummy-value',
				},
				data: {
					name: name,
					private: options.private
				}
			});
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
 * Processes the given hooks, returning true if all pass or an Error if one of them fails.
 */
export function runHooks(hooks: string[], answers: {[key: string]: string}) {
	// Render any hooks that might have used {{prompt_answers}}
	hooks = hooks.map(hook => renderString(hook, answers));

	// TODO: ...
}
