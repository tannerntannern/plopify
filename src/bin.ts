#!/usr/bin/env node
import * as fs from 'fs';
import * as fse from 'fs-extra';
import * as path from 'path';
import * as glob from 'glob';
import * as validUrl from 'valid-url';
import * as hbs from 'handlebars';
import chalk from 'chalk';
import {prompt} from 'inquirer';
import * as program from 'commander';
import {spawnSync} from 'child_process';
import loader from 'rc.ts';

const packageJson = require('../package.json');
import {RCSchema, EjectedRCSchema} from './rc.schema';

const header = chalk.bold.bgBlue(' ' + packageJson.name + ' ') + chalk.bold.bgYellow(' v' + packageJson.version + ' ');

// Helper function that logs ✔/✘ for true/false
const logStatus = (success: boolean) => console.log(success ? chalk.greenBright('✔ ') : chalk.red('✘ '));

/**
 * Cleans up any left over staging artifacts.  Namely, `.staging-*`.
 */
// TODO: this isn't working anymore
const cleanUpStaging = () => fse.removeSync(path.resolve(__dirname, '.staging-*'));

/**
 * ABORT!
 */
const abandonShip = () => {
	cleanUpStaging();
	process.exit(1);
};

/**
 * Quick utility for determining whether the given template is local or remote.
 */
const determineTemplateType = (template: string) => validUrl.isUri(template) ? 'remote' : 'local';

/**
 * A hefty helper function that does all the necessary preparations for staging, including setting up a staging
 * directory, pre-screening, and cloning the template repository if necessary.
 *
 * @returns a path to the template directory if successful.
 */
const prepareForStaging = (template: string): {templateDir: string, stagingDir: string} => {
	let templateDir: string;

	// 0. Clean up any staging data that was orphaned from a previous run
	const orphanRemains = glob.sync(path.resolve(__dirname, '.staging-*'));
	if (orphanRemains.length > 0) {
		console.log(
			chalk.yellow('WARNING:'),
			'Cleaning up old staging data.  This usually means that the previous plopify command did not complete properly.'
		);
		cleanUpStaging();
	}

	// 1. Determine template type
	const templateType = determineTemplateType(template);

	// 2. Make sure template exists
	process.stdout.write('Locating template... ');

	let exists: boolean;
	if (templateType === 'local') {
		templateDir = path.resolve(template);
		exists = fs.existsSync(templateDir);
	} else if (templateType === 'remote') {
		const output = spawnSync('git', ['ls-remote', template, '--exit-code']);
		exists = output.status === 0;
	}

	logStatus(exists);

	if (!exists) {
		if (templateType === 'local') {
			console.log(
				chalk.red('Error: Unable to locate ') +
				chalk.blue.underline(templateDir) +
				chalk.red('.  Please check that the template path is accurate.')
			);
		} else if (templateType === 'remote') {
			console.log(
				chalk.red('Error: The url, ') + chalk.blue.underline(template) +
				chalk.red(', either is not a valid git repository or the given credentials are incorrect.  Please check the url and credentials.')
			);
		}

		abandonShip();
	}

	// 2b. Warn about local templates
	if (templateType === 'local') {
		console.log(chalk.yellow('WARNING:'), 'Using a local template will cause issues for collaborators.  Consider using a repo URL instead.');
	}

	// 3. Generate random directory name for a staging area
	const tempName = '.staging-' + Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);
	const stagingDir = path.resolve(__dirname, tempName);
	fs.mkdirSync(stagingDir);

	// 4. Clone the template repository if necessary
	if (templateType === 'remote') {
		process.stdout.write('Downloading template... ');

		templateDir = path.resolve(stagingDir, 'template');
		fs.mkdirSync(templateDir);
		const result = spawnSync('git', ['clone', template, templateDir]);

		logStatus(result.status === 0);

		if (result.status !== 0) {
			console.log(chalk.red('Error: There was a problem cloning the template repository:\n' + result.stderr));
			abandonShip();
		}
	}

	// 5. Make sure a proper plopify config exists in the templateDir
	if (!fs.existsSync(path.resolve(templateDir, '.plopifyrc.js'))) {
		console.log(chalk.red('Error: The given template has no `.plopifyrc.js` file.  Please inspect your template.'));
		abandonShip();
	}

	// If we make it here, we have succeeded
	return {templateDir, stagingDir};
};

/**
 * Simple function that uses handlebars to render a template string with data.
 */
const renderString = (templateString: string, data: {[key: string]: any}): string => {
	return hbs.compile(templateString)(data);
};

/**
 * Takes a templateDir and generates a new instance to outDir using the given data.
 */
const generateTemplate = (templateLocation: string, templateDir: string, data: {[key: string]: any}, outDir: string): number => {
	process.stdout.write('Generating project... ');

	// Collect the relative file paths/names of every file in the template (excluding .plopifyrc.js)
	const relativeTrim = templateDir.length + 1;
	const templateFiles = glob.sync(path.resolve(templateDir, '**/*'), {
		dot: true,
		nodir: true,
		ignore: '**/.plopifyrc.js',
	}).map(file => file.substr(relativeTrim));

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
 * Updates the given project based on the given updatePolicies and freshly-generated copy.
 *
 * @returns stats about what was changed
 */
const updateProject = (freshCopyDir: string, projectDir: string, updatePolicies): {added: number, removed: number, modified: number, manualMerge: number} => {
	// TODO: ...
	return {added: 0, removed: 0, modified: 0, manualMerge: 0};
};

program
	.version(packageJson.version, '-v, --version');

program
	.command('gen <template> <outdir>')
	.description('Generates a new project based on the given template')
	.action(async (template: string, outdir: string, options) => {
		console.log(header);

		const {templateDir} = prepareForStaging(template);

		const config = loader(RCSchema).loadConfigFile(path.resolve(templateDir, '.plopifyrc.js'));
		const answers = await prompt(config.prompts);

		const fullOutDir = path.resolve(outdir);
		const totalFiles = await generateTemplate(template, templateDir, answers, fullOutDir);
		cleanUpStaging();

		console.log(
			chalk.bold.bgGreen(' SUCCESS '),
			chalk.yellow('+' + totalFiles), 'files added at', chalk.underline.blue(fullOutDir)
		);
	});

program
	.command('update [project]')
	.description('Updates an existing project based on changes from the template')
	.option('-p --prompts', 'prompt the user for input again instead of using the saved answers')
	.action(async (project, options) => {
		console.log(header);

		// Make sure project exists
		if (!project) project = '.';
		const projectDir = path.resolve(project);
		if (!fs.existsSync(projectDir)) {
			console.log(chalk.red('Error: Cannot find'), chalk.blue.underline(projectDir));
			process.exit(1);
		}

		// Make sure the project has a .plopifyrc.json
		process.stdout.write('Locating saved data... ');
		const plopifyJson = path.resolve(projectDir, '.plopifyrc.json');
		const plopifyJsonExists = fs.existsSync(plopifyJson);
		logStatus(plopifyJsonExists);
		if (!plopifyJsonExists) {
			console.log(chalk.red('Error: Cannot find a .plopifyrc.json in'), chalk.blue.underline(projectDir));
			process.exit(1);
		}

		// TODO: Make sure the current plopify version is compatible
		const ejectedConfig = loader(EjectedRCSchema).loadConfigFile(plopifyJson);

		// Prepare for staging
		const {templateDir, stagingDir} = prepareForStaging(ejectedConfig.templateLocation);
		const templateConfig = loader(RCSchema).loadConfigFile(path.resolve(templateDir, '.plopifyrc.js'));

		// Re-generate temporary copy for comparison, using saved data
		let answers = options.prompts ? await prompt(templateConfig.prompts) : ejectedConfig.answers;
		await generateTemplate(ejectedConfig.templateLocation, templateDir, answers, path.resolve(stagingDir, 'project'));

		// TODO: compare with live project and merge

		cleanUpStaging();

		// TODO: print out stats
	});

program
	.command('init <dir>')
	.description('Initializes a project template that can be used to generate other projects')
	.action((dir, options) => {
		console.log(header);
		process.stdout.write('Copying files... ');

		const outDir = path.resolve(dir);
		const templateDir = path.resolve(__dirname, '../templates/project-template/');
		const totalFiles = glob.sync(path.resolve(templateDir, '**/*'), {dot: true, nodir: true}).length;

		fse.mkdirpSync(outDir);
		fse.copySync(templateDir, outDir);

		logStatus(true);
		console.log(
			chalk.bold.bgGreen(' SUCCESS '),
			chalk.yellow('+' + totalFiles), 'files added at', chalk.underline.blue(outDir)
		);
	});

program.parse(process.argv);
