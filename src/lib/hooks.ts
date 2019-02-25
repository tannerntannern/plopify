import chalk from 'chalk';
import {spawn} from 'child_process';

import {confirm} from '../util/prompts';
import {renderString} from '../util/templates';

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
 * Processes the given hooks, returning true if all pass.
 */
export async function runHooks(hooks: string[], answers: {[key: string]: string}, cwd: string): Promise<boolean> {
	// Render any hooks that might have used {{prompt_answers}}
	hooks = hooks.map(hook => renderString(hook, answers));

	for (let hook of hooks) {
		console.log(chalk.yellow('Running hook: `' + hook + '`...'));

		try {
			await shellCommand(hook, cwd);
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
