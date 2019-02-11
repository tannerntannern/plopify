#!/usr/bin/env node
import * as fs from 'fs';
import * as path from 'path';
import * as glob from 'glob';
import * as walk from 'walk';
import * as mkdirp from 'mkdirp';
import * as rimraf from 'rimraf';
import * as validUrl from 'valid-url';
import * as hbs from 'handlebars';
import chalk from 'chalk';
import {prompt} from 'inquirer';
import * as program from 'commander';
import {spawnSync} from 'child_process';
import loader from 'rc.ts';

const packageJson = require('../package.json');
import {RCSchema} from './rc.schema';

const header = chalk.bold.bgBlue(' ' + packageJson.name + ' ') + chalk.bold.bgYellow(' v' + packageJson.version + ' ');

// Helper function that logs ✔/✘ for true/false
const logStatus = (success: boolean) => console.log(success ? chalk.greenBright('✔ ') : chalk.red('✘ '));

/**
 * Cleans up any left over staging artifacts.  Namely, `.staging-*`.
 */
const cleanUpStaging = () => rimraf.sync(path.resolve(__dirname, '.staging-*'));

/**
 * ABORT!
 */
const abandonShip = () => {
	cleanUpStaging();
	process.exit(1);
};

/**
 * A hefty helper function that does all the necessary preparations for staging, including setting up a staging
 * directory, pre-screening, and cloning the template repository if necessary.
 *
 * @returns a path to the template directory if successful.
 */
const prepareForStaging = (template: string): string => {
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
	const templateType = validUrl.isUri(template) ? 'remote' : 'local';

	// 2. Make sure template exists
	process.stdout.write('Searching for template... ');

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
	return templateDir;
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
const generateTemplate = (templateDir: string, data: {[key: string]: any}, outDir: string): Promise<number> => {
	return new Promise((resolve, reject) => {
		let filesGenerated = 0;
		process.stdout.write('Generating project... ');

		mkdirp.sync(outDir);

		const walker = walk.walk(templateDir);
		walker.on('directory', (root, stats, next) => {
			const relative = path.relative(templateDir, root);
			mkdirp.sync(path.resolve(outDir, relative, renderString(stats.name, data)));
			next();
		});

		walker.on('file', (root, stats, next) => {
			const relative = renderString(path.relative(templateDir, root), data);
			const fileContent = fs.readFileSync(path.resolve(root, stats.name), 'utf8');
			fs.writeFileSync(
				path.resolve(outDir, relative, renderString(stats.name, data)),
				renderString(fileContent, data)
			);
			filesGenerated ++;
			next();
		});

		walker.on('end', () => {
			logStatus(true);
			resolve(filesGenerated);
		});
	});
};

program
	.version(packageJson.version, '-v, --version');

program
	.command('gen <template> <outdir>')
	.description('Generates a new project based on the given template')
	.action(async (template: string, outdir: string, options) => {
		console.log(header);

		let templateDir = prepareForStaging(template);

		const config = loader(RCSchema).loadConfigFile(path.resolve(templateDir, '.plopifyrc.js'));
		const answers = await prompt(config.prompts);

		const fullOutDir = path.resolve(outdir);
		const totalFiles = await generateTemplate(templateDir, answers, path.resolve(fullOutDir));
		cleanUpStaging();

		console.log(
			chalk.bold.bgGreen(' SUCCESS '),
			chalk.yellow('+' + totalFiles), 'files added at', chalk.underline.blue(fullOutDir)
		);
	});

program
	.command('update <project>')
	.description('Updates an existing project based on changes from the template')
	.option('-p --prompts', 'prompt the user for input again instead of using the saved answers')
	.action((project, options) => {
		// TODO: ...
	});

program
	.command('init <dir>')
	.description('Initializes a project template that can be used to generate other projects')
	.action((dir, options) => {
		// TODO: ...
	});

program.parse(process.argv);
