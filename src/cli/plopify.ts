#!/usr/bin/env node
import * as inquirer from 'inquirer';
import * as inquirerEmoji from 'inquirer-emoji';
import * as program from 'commander';

import commands from './_meta';
const packageJson = require('../../package.json');

// Load the inquirer-emoji plugin
inquirer.registerPrompt('emoji', inquirerEmoji);

program.version(packageJson.version, '-v, --version');

// Load subcommand descriptions from _meta.ts
for (let name in commands) {
	const command = commands[name];
	program.command(`${name} ${command.usage}`, command.description);
}

program.parse(process.argv);

// Simply output help if no subcommand is specified
if (program.args.length === 0) {
	program.outputHelp();
}
