import chalk from 'chalk';
import {Command} from 'commander';

import {header} from '../util/misc';
import globalConfig from '../lib/global-config';

export default function(program: Command) {
	program
		.command('config <action> [key] [value]')
		.alias('conf')
		.description('Displays or modifies the content of plopify\'s global config data')
		.action(async (action, key, value) => {
			if (action !== 'where') console.log(header);

			const actions = ['init', 'view', 'where', 'flush', 'set'];
			if (actions.indexOf(action) === -1) {
				console.log(chalk.red('Invalid Operation: the action argument must be one of the following: ' + actions.join(', ')));
				process.exit(1);
			}

			try {
				await globalConfig(__dirname)[action](key, value);
			} catch (e) {
				console.log(chalk.red('Error:'), e.message);
				process.exit(1);
			}
		});
}
