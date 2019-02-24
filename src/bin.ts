#!/usr/bin/env node
import * as inquirer from 'inquirer';
import * as inquirerEmoji from 'inquirer-emoji';
import {Command} from 'commander';

const packageJson = require('../package.json');

import initCommand from './cmds/init';
import genCommand from './cmds/gen';
import updateCommand from './cmds/update';
import configCommand from './cmds/config';

// Load the inquirer-emoji plugin
inquirer.registerPrompt('emoji', inquirerEmoji);

const program = new Command();
program
	.version(packageJson.version, '-v, --version');

initCommand(program);
genCommand(program);
updateCommand(program);
configCommand(program);

program.parse(process.argv);
