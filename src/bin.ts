#!/usr/bin/env node
import * as program from 'commander';
const packageJson = require('../package.json');

program
	.version(packageJson.version, '-v, --version');

// TODO: THIS COMMAND SHOULD TOTALLY UTILIZE ITSELF
program
	.command('init <name>')
	.description('Initializes a project scaffold')
	.action((name, options) => {
		// TODO:
		console.log('Calling `init` with', name);
	});

program.parse(process.argv);
