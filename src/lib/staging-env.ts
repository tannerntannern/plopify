import * as fs from 'fs';
import * as fse from 'fs-extra';
import * as fg from 'fast-glob';
import * as path from 'path';
import * as validUrl from 'valid-url';
import chalk from 'chalk';
import {spawnSync} from 'child_process';

import {logStatus} from '../util/misc';

/**
 * TODO: ...
 */
export const StagingEnv = {
	cleanUp: () => {
		// TODO: ...
	}
};

// TODO: this is temporary
/**
 * Quick utility for determining whether the given template is local or remote.
 */
export const determineTemplateType = (template: string) => validUrl.isUri(template) ? 'remote' : 'local';

// TODO: this is temporary
/**
 * Cleans up any left over staging artifacts.  Namely, `.staging-*`.
 */
export const cleanUpStaging = () => {
	fg
		.sync(path.resolve(__dirname, '.staging-*'), {dot: true, onlyDirectories: true})
		.forEach(file => fse.removeSync(file));
};

// TODO: this is temporary
/**
 * ABORT!
 */
export const abandonShip = () => {
	cleanUpStaging();
	process.exit(1);
};

// TODO: this is temporary
/**
 * A hefty helper function that does all the necessary preparations for staging, including setting up a staging
 * directory, pre-screening, and cloning the template repository if necessary.
 *
 * @returns a path to the template directory if successful.
 */
export const prepareForStaging = (template: string): {templateDir: string, stagingDir: string} => {
	let templateDir: string;

	// 0. Clean up any staging data that was orphaned from a previous run
	const orphanRemains = fg.sync(path.resolve(__dirname, '.staging-*'), {dot: true, onlyDirectories: true});
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
