import * as fs from 'fs';
import * as fse from 'fs-extra';
import * as path from 'path';
import chalk from 'chalk';
import * as inquirer from 'inquirer';
import loader from 'rc.ts';

import {getFileList} from '../util/files';
import {renderString} from '../util/templates';
import {header, logStatus} from '../util/misc';
import {cleanUpStaging, determineTemplateType, prepareForStaging} from './staging-env';
import {EjectedRCSchema, RCSchema} from '../schemas';
import {runHooks} from './hooks';
import {arrayify} from '../util/arrays';

const packageJson = require('../../package.json');

/**
 * Takes a templateDir and generates a new instance to outDir using the given data.
 */
export const generateTemplate = (templateLocation: string, templateDir: string, data: { [key: string]: any }, outDir: string): number => {
	process.stdout.write('Generating project... ');

	// Collect the relative file paths/names of every file in the template (excluding .plopifyrc.js)
	const templateFiles = getFileList(templateDir, ['.plopifyrc.js', '.git/', '.idea/']);

	// Render out each file
	for (let file of templateFiles) {
		// Make sure the parent directories exist
		const outFile = path.resolve(outDir, renderString(file, data));
		fse.mkdirpSync(path.dirname(outFile));

		const fileContent = fs.readFileSync(path.resolve(templateDir, file), 'utf8');
		fs.writeFileSync(outFile, renderString(fileContent, data));
	}

	// Render out new .plopifyrc.json
	const plopifyRcData = EjectedRCSchema.encode({
		plopifyVersion: packageJson.version,
		templateLocation: determineTemplateType(templateLocation) === 'remote' ? templateLocation : path.resolve(templateLocation),
		answers: data
	});
	fs.writeFileSync(path.resolve(outDir, '.plopifyrc.json'), JSON.stringify(plopifyRcData, null, 2));

	logStatus(true);
	return templateFiles.length + 1;
};

/**
 * Generates a project in outdir, given a remote or local template.
 */
export const genCmd = async (template: string, outdir: string, options) => {
	console.log(header);

	const {templateDir} = prepareForStaging(template);

	const config = loader(RCSchema).loadConfigFile(path.resolve(templateDir, '.plopifyrc.js'));
	const answers: {[key: string]: any} = await inquirer.prompt(config.prompts);

	const fullOutDir = path.resolve(outdir);
	fse.mkdirpSync(fullOutDir);

	await runHooks(arrayify(config.hooks.preGenerate), answers, fullOutDir);

	const totalFiles = await generateTemplate(template, templateDir, answers, fullOutDir);
	cleanUpStaging();

	await runHooks(arrayify(config.hooks.postGenerate), answers, fullOutDir);

	console.log();
	console.log(
		chalk.bold.bgGreen(' SUCCESS '),
		chalk.yellow('+' + totalFiles), 'files added at', chalk.underline.blue(fullOutDir)
	);
};
