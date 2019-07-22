#!/usr/bin/env node
import * as path from 'path';
import * as program from 'commander';

import {header} from '../util/misc';
// import globalConfig from '../lib/global-config';

// const conf = globalConfig(path.resolve(__dirname, '..'));

// program
// 	.command('init')
// 	.description('Initializes a global config file if it doesn\'t exist')
// 	.action(commandify(conf.init));

// program
// 	.command('view')
// 	.description('Displays the content of the global config data')
// 	.action(commandify(conf.view));

// program
// 	.command('where')
// 	.description('Prints out the location of the global config file')
// 	.action(commandify(conf.where, true));

// program
// 	.command('flush')
// 	.alias('delete')
// 	.description('Deletes all of the global config data')
// 	.action(commandify(conf.flush));

// program
// 	.command('set [key] [value]')
// 	.description('Sets a value in the global config file')
// 	.action(commandify(conf.set));

program
	.parse(process.argv);

// Simply output help if no subcommand is specified
if (program.args.length === 0) {
	program.outputHelp();
}
