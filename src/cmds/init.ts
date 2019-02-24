import * as fse from 'fs-extra';
import * as path from 'path';
import * as fg from 'fast-glob';
import chalk from 'chalk';
import {Command} from 'commander';

import {header, logStatus} from '../util/misc';

export default function(program: Command) {
	program
		.command('init <dir>')
		.description('Initializes a project template that can be used to generate other projects')
		.action((dir, options) => {
			console.log(header);
			process.stdout.write('Copying files... ');

			const outDir = path.resolve(dir);
			const templateDir = path.resolve(__dirname, '../templates/project-template/');
			const totalFiles = fg.sync(path.resolve(templateDir, '**/*'), {dot: true}).length;

			fse.mkdirpSync(outDir);
			fse.copySync(templateDir, outDir);

			logStatus(true);
			console.log();
			console.log(
				chalk.bold.bgGreen(' SUCCESS '),
				chalk.yellow('+' + totalFiles), 'files added at', chalk.underline.blue(outDir)
			);
		});
}
