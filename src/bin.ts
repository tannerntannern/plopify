#!/usr/bin/env node
import * as path from 'path';
import * as program from 'commander';
import chalk from 'chalk';
import loader from 'rc.ts';
import {prompt} from 'inquirer';

const packageJson = require('../package.json');
import {RCSchema} from './rc.schema';

const header = chalk.bold.bgBlue(' ' + packageJson.name + ' ') + chalk.bold.bgYellow(' v' + packageJson.version + ' ');

program
	.version(packageJson.version, '-v, --version');

program
	.command('gen <template> <outdir>')
	.description('Generates a new project based on the given template')
	.action(async (template: string, outdir: string, options) => {
		console.log(header);

		const config = loader(RCSchema).loadConfigFile(path.resolve(template, '.plopifyrc.js'));

		const answers = await prompt(config.prompts);

		console.log(answers);
	});

program
	.command('update <project>')
	.description('Updates an existing project based on changes from the template')
	.option('-p --prompts', 'prompt the user for input again instead of using the saved answers')
	.action((template, output, options) => {
		// TODO: ...
	});

program
	.command('init <dir>')
	.description('Initializes a project template that can be used to generate other projects')
	.action((dir, options) => {
		// TODO: ...
	});

program.parse(process.argv);
