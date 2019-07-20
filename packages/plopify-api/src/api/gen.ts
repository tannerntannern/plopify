import * as fse from 'fs-extra';
import * as path from 'path';
import * as inquirer from 'inquirer';
import loader from 'rc.ts';

import { standardAdapter } from '../util/standardAdapter';
import { stagingEnv } from '../lib/staging-env';
import { renderTemplate } from '../lib/generator';
import { arrayify } from '../util/arrays';
import { runHooks } from '../lib/hooks';
import { RCSchema } from '../schema/plopifyrc';

/**
 * Generates a project in outdir, given a remote or local template.
 */
export const gen = (template: string, outdir: string) => standardAdapter(async (input, output) => {
	const staging = stagingEnv(template);

	await (staging.setup().output(output).promise());

	const templateDir = staging.templateDir();
	const config = loader(RCSchema).loadConfigFile(path.resolve(templateDir, '.plopifyrc.js'));
	const answers: {[key: string]: any} = await inquirer.prompt(config.prompts);

	const fullOutDir = path.resolve(outdir);
	fse.mkdirpSync(fullOutDir);

	await (runHooks(arrayify(config.hooks.preGenerate), answers, fullOutDir).output(output).promise());

	const totalFiles = (await renderTemplate(staging, answers, fullOutDir).output(output).promise()).data.files;
	staging.cleanUp();

	await (runHooks(arrayify(config.hooks.postGenerate), answers, fullOutDir).output(output).promise());

	output({ type: 'info', message: `+${totalFiles} added at ${fullOutDir}` });

	return { files: totalFiles };
});
