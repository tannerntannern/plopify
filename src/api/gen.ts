import * as fse from 'fs-extra';
import * as path from 'path';
import * as inquirer from 'inquirer';
import chalk from 'chalk';
import loader from 'rc.ts';

import {stdFunction} from '../util/commandify';
import {stagingEnv} from '../lib/staging-env';
import {renderTemplate} from '../lib/generator';
import {arrayify} from '../util/arrays';
import {runHooks} from '../lib/hooks';
import {RCSchema} from '../schemas';

/**
 * Generates a project in outdir, given a remote or local template.
 */
export const gen = stdFunction((template: string, outdir: string) => async (resolve, reject, status) => {
	const staging = stagingEnv(template);

	await (staging.setup().status(status).promise());

	const templateDir = staging.templateDir();
	const config = loader(RCSchema).loadConfigFile(path.resolve(templateDir, '.plopifyrc.js'));
	const answers: {[key: string]: any} = await inquirer.prompt(config.prompts);

	const fullOutDir = path.resolve(outdir);
	fse.mkdirpSync(fullOutDir);

	// TODO: input needed
	await (runHooks(arrayify(config.hooks.preGenerate), answers, fullOutDir).status(status).promise());

	const totalFiles = (await renderTemplate(staging, answers, fullOutDir).status(status).promise()).data.files;
	staging.cleanUp();

	await (runHooks(arrayify(config.hooks.postGenerate), answers, fullOutDir).status(status).promise());

	resolve({
		prettyMessage: `${chalk.bold.bgGreen(' SUCCESS ')} ${chalk.yellow('+' + totalFiles)} files added at ${chalk.underline.blue(fullOutDir)}`,
		data: {
			files: totalFiles
		}
	});
});
