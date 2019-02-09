#!/usr/bin/env node
import * as path from 'path';
import * as program from 'commander';
const packageJson = require('../package.json');

import loader from 'rc.ts';
import {RCSchema} from './rc.schema';

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

program
	.command('read <name>')
	.description('Temporary testing command for parsing a config')
	.action((name, options) => {
		const data = loader(RCSchema).loadConfigFile(path.resolve(name));
		console.log(data);
	});

program.parse(process.argv);
