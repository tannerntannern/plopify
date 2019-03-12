import * as path from 'path';
import * as fg from 'fast-glob';
import * as fse from 'fs-extra';
import chalk from 'chalk';

import {progressPromise} from '../util/progress-promise';

/**
 * Plops a "template template" into the given directory.
 */
export const init = (dir: string) => progressPromise((resolve, reject, status) => {
	status({task: 'Copying files', status: 'running'});

	const outDir = path.resolve(dir);
	const templateDir = path.resolve(__dirname, '../../templates/project-template/');
	const totalFiles = fg.sync(path.resolve(templateDir, '**/*'), {dot: true}).length;

	fse.mkdirpSync(outDir);
	fse.copySync(templateDir, outDir);

	status({task: null, status: 'success'});

	resolve({
		prettyMessage: `${chalk.bold.bgGreen(' SUCCESS ')} ${chalk.yellow('+' + totalFiles)} files added at ${chalk.underline.blue(outDir)}`,
		data: {files: totalFiles, where: outDir}
	});
});
