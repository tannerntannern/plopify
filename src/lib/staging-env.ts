import * as fs from 'fs';
import * as fse from 'fs-extra';
import * as fg from 'fast-glob';
import * as path from 'path';
import * as validUrl from 'valid-url';
import chalk from 'chalk';
import {spawnSync} from 'child_process';

import {stdFunction} from '../util/commandify';

/**
 * Manages everything that has to do with the staging environment.
 */
export const stagingEnv = (template: string) => {
	const _templateType = validUrl.isUri(template) ? 'remote' : 'local';

	let _templateDir = _templateType === 'local' ? path.resolve(template) : undefined;

	/**
	 * Returns whether the template we're working with is local or remote.
	 */
	const templateType = () => _templateType;

	/**
	 * Gets the local directory of the template, whether the template is local or cloned from a remote.
	 */
	const templateDir = (): string | never => {
		if (_templateDir === undefined)
			throw new Error('setup() must be called before getting the local directory of a remote template');
		else
			return _templateDir;
	};

	/**
	 * Returns the fully resolved location of the template.
	 */
	const templateLocation = () => _templateType === 'remote' ? template : _templateDir;

	/**
	 * Cleans up any left over staging artifacts.  Namely, `.staging-*`.
	 */
	const cleanUp = () => {
		fse.removeSync(path.resolve(__dirname, '.staging'));
	};

	/**
	 * Something went wrong.  Attempt clean up and exit with a non-zero code.
	 */
	const abandonShip = () => {
		cleanUp();
		process.exit(1);
	};

	/**
	 * Provisions a staging environment given a template.
	 */
	const setup = stdFunction(() => (resolve, reject, status) => {
		// 1. Clean up any staging data that was orphaned from a previous run
		const orphanRemains = fg.sync(path.resolve(__dirname, '.staging'), {dot: true, onlyDirectories: true});
		if (orphanRemains.length > 0) {
			status({
				type: 'warning',
				message: 'Cleaning up old staging data.  This usually means that the previous plopify command did not complete properly.'
			});
			cleanUp();
		}

		// 2. Make sure template exists
		status({type: 'newTask', task: 'Locating template'});

		let exists: boolean;
		if (_templateType === 'local') {
			exists = fs.existsSync(_templateDir);
		} else if (_templateType === 'remote') {
			const output = spawnSync('git', ['ls-remote', template, '--exit-code']);
			exists = output.status === 0;
		}

		status({type: 'taskComplete', status: exists});

		if (!exists) {
			let message;
			if (_templateType === 'local') {
				message = `Unable to locate ${chalk.blue.underline(_templateDir)}.  Please check that the template path is accurate.`;
			} else if (_templateType === 'remote') {
				message = `The url, ${chalk.blue.underline(template)}, either is not a valid git repository or the given credentials are incorrect.  Please check the url and credentials.`;
			}

			reject(new Error(message));
			abandonShip();
		}

		// 2b. Warn about local templates
		if (_templateType === 'local') {
			status({
				type: 'warning',
				message: 'Using a local template will cause issues for collaborators.  Consider using a repo URL instead.'
			});
		}

		// 3. Create the staging environment
		let stagingDir = path.resolve(__dirname, '.staging');
		fs.mkdirSync(stagingDir);

		// 4. Clone the template repository if necessary
		if (_templateType === 'remote') {
			status({type: 'newTask', task: 'Downloading template'});

			_templateDir = path.resolve(stagingDir, 'template');
			fs.mkdirSync(_templateDir);
			const result = spawnSync('git', ['clone', template, _templateDir]);

			status({type: 'taskComplete', status: result.status === 0});

			if (result.status !== 0) {
				reject(new Error('There was a problem cloning the template repository:\n' + result.stderr));
				abandonShip();
			}
		}

		// 5. Make sure a proper plopify config exists in the templateDir
		if (!fs.existsSync(path.resolve(_templateDir, '.plopifyrc.js'))) {
			reject(new Error('The given template has no `.plopifyrc.js` file.  Please inspect your template.'));
			abandonShip();
		}

		// If we make it here, we have succeeded
		resolve({prettyMessage: 'Staging environment created.'});
	});

	return {templateType, templateLocation, templateDir, cleanUp, setup};
};

/**
 * Convenience type.
 */
export type StagingEnv = ReturnType<typeof stagingEnv>;
