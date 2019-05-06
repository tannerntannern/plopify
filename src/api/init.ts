import * as path from 'path';
import * as fg from 'fast-glob';
import * as fse from 'fs-extra';
import chalk from 'chalk';

import {standardAdapter} from '../util/commandify';

/**
 * Plops a "template template" into the given directory.
 */
export const init = (dir: string) => standardAdapter((resolve, reject, output) => {
	output({type: 'newTask', task: 'Copying files'});

	const outDir = path.resolve(dir);
	const templateDir = path.resolve(__dirname, '../../templates/project-template/');
	const totalFiles = fg.sync(path.resolve(templateDir, '**/*'), {dot: true}).length;

	try {
		fse.mkdirpSync(outDir);
		fse.copySync(templateDir, outDir);
		output({type: 'taskComplete', status: true});
	} catch (e) {
		output({type: 'taskComplete', status: false});
		reject(e);
	}

	resolve({
		prettyMessage: `${chalk.bold.bgGreen(' SUCCESS ')} ${chalk.yellow('+' + totalFiles)} files added at ${chalk.underline.blue(outDir)}`,
		data: {files: totalFiles, where: outDir}
	});
});
