import {spawn} from 'child_process';

import {renderString} from '../util/templates';
import {standardAdapter} from '../util/commandify';

/**
 * Executes a shell command and returns a Promise.  If the promise resolves, the command was successful; if it is
 * rejected, it was not.
 *
 * TODO: adapter-ify this?
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
 * TODO
 */
export const runHooks = (hooks: string[], answers: {[key: string]: string}, cwd: string) => standardAdapter(async (resolve, reject, output, input) => {
	// Render any hooks that might have used {{prompt_answers}}
	hooks = hooks.map(hook => renderString(hook, answers));

	for (let hook of hooks) {
		output({type: 'newTask', task: 'Running hook: `' + hook + '`'});

		try {
			await shellCommand(hook, cwd);
			output({type: 'taskComplete', status: true});
		} catch (e) {
			output({type: 'taskComplete', status: false});
			output({type: 'warning', severe: true, message: e.message});

			if (!await input('ignoreError')) reject(e);
		}
	}

	resolve({prettyMessage: 'Hooks complete'});
});
