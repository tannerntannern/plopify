#!/usr/bin/env node
import * as inquirer from 'inquirer';
import * as inquirerEmoji from 'inquirer-emoji';
import * as program from 'commander';

import {initCmd, genCmd} from '../lib/generator';
import {updateCmd} from '../lib/updater';

const packageJson = require('../../package.json');

// Load the inquirer-emoji plugin
inquirer.registerPrompt('emoji', inquirerEmoji);

program
	.version(packageJson.version, '-v, --version');

program
	.command('init <dir>')
	.description('Generates some starter code to kickstart your template (a "template for your template," if you will)')
	.action(initCmd);

program
	.command('gen <template> <outdir>')
	.description('Generates a new project based on the given template')
	.action(genCmd);

program
	.command('update [project]')
	.description('Updates an existing project based on changes from the template')
	.option('-p --prompts', 'prompt the user for input again instead of using the saved answers')
	.action(updateCmd);

// Note: these commands are implemented in another file, marked by their lack of an `.action(...)` clause
program
	.command('config <action>', 'Displays or modifies the content of plopify\'s global config data')
	.command('svc <service>', 'Calls one of plopify\'s services, such as initializing a remote repo on GitHub');

program
	.parse(process.argv);

// Simply output help if no subcommand is specified
if (program.args.length === 0) {
	program.outputHelp();
}
