#!/usr/bin/env node
import * as program from 'commander';
import * as fse from 'fs-extra';
import * as path from 'path';
import * as fg from 'fast-glob';
import chalk from 'chalk';

import {header, logStatus} from '../util/misc';
import _meta from './_meta';
const meta = _meta.init;

program
	.usage(meta.usage)
	.description(meta.description)
	.parse(process.argv);

console.log(header);
process.stdout.write('Copying files... ');

const outDir = path.resolve(program.args[0]);
const templateDir = path.resolve(__dirname, '../../templates/project-template/');
const totalFiles = fg.sync(path.resolve(templateDir, '**/*'), {dot: true}).length;

fse.mkdirpSync(outDir);
fse.copySync(templateDir, outDir);

logStatus(true);
console.log();
console.log(
	chalk.bold.bgGreen(' SUCCESS '),
	chalk.yellow('+' + totalFiles), 'files added at', chalk.underline.blue(outDir)
);
