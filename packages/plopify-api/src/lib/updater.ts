import * as fs from 'fs';
import * as path from 'path';
import * as md5 from 'md5-file';
import loader from 'rc.ts';
import { TypeOf } from 'io-ts';

import { EjectedRCSchema, RCSchema } from '../schema/plopifyrc';
import { getFileList, readFileLines } from '../util/files';
import { arrayify, difference, intersection, union } from '../util/arrays';
import { renderTemplate } from '../lib/generator';

/**
 * Given an UpdatePolicy, returns an array of all the files matched by pattern and patternFromFile.
 */
const getPolicyFileList = (newDir: string, oldDir: string, policy: TypeOf<typeof RCSchema>['updatePolicies'][number]): string[] => {
	const pattern = arrayify(policy.pattern);

	// We may need to include content from .gitignore or similar
	const patternInFile: string[] = arrayify(policy.patternFromFile);
	const moreFiles = patternInFile
		.map(file => {
			// TODO: figure out if this even makes sense, or if the new content should just be taken
			// We don't know whether the file content is new, old, or present in both, so we can only load both
			// and merge the lines via intersection
			const newContent = readFileLines(path.resolve(newDir, file)) || [];
			const oldContent = readFileLines(path.resolve(oldDir, file)) || [];

			return intersection(newContent, oldContent);
		})
		.reduce((all, some) => all.concat(some));

	return union(pattern, moreFiles);
};

/**
 * Updates the given project based on the given updatePolicies and freshly-generated copy.
 *
 * @returns stats about what was changed
 */
const updateProject = async (newDir: string, oldDir: string, updatePolicies: TypeOf<typeof RCSchema>['updatePolicies']): Promise<{added: number, removed: number, modified: number, manualMerge: number}> => {
	// Before we start comparing files, check the policies for anything that should be ignored
	let ignore = updatePolicies
		.filter(policy => policy.action === 'ignore' && policy.granularity === 'wholeFile')
		.map(policy => getPolicyFileList(newDir, oldDir, policy))
		.reduce((allFiles, moreFiles) => allFiles.concat(moreFiles));

	ignore.push('.plopifyrc.js');

	// Next, generate lists of all the file changes we need to deal with
	const newFiles = getFileList(newDir, ignore);
	const oldFiles = getFileList(oldDir, ignore);
	const addedFiles = difference(newFiles, oldFiles);
	const removedFiles = difference(oldFiles, newFiles);
	const modifiedFiles = intersection(newFiles, oldFiles).filter(file => {
		const newHash = md5.sync(path.resolve(newDir, file));
		const oldHash = md5.sync(path.resolve(oldDir, file));

		return newHash !== oldHash;
	});

	// TODO: ...
	console.log(' WARNING ', 'This command is not yet fully implemented.  No actions will be taken.');

	console.log('added:', addedFiles);
	console.log('removed:', removedFiles);
	console.log('modified:', modifiedFiles);

	return ({ added: 0, removed: 0, modified: 0, manualMerge: 0 });
};

/**
 * Walks the user through updating their project.
 */
export const updateCmd = async (project: string, options) => {
	// console.log(header);
	//
	// // Make sure project exists
	// if (!project) project = '.';
	// const projectDir = path.resolve(project);
	// if (!fs.existsSync(projectDir)) {
	// 	console.log(chalk.red('Error: Cannot find'), chalk.blue.underline(projectDir));
	// 	process.exit(1);
	// }
	//
	// // Make sure the project has a .plopifyrc.json
	// process.stdout.write('Locating saved data... ');
	// const plopifyJson = path.resolve(projectDir, '.plopifyrc.json');
	// const plopifyJsonExists = fs.existsSync(plopifyJson);
	// logStatus(plopifyJsonExists);
	// if (!plopifyJsonExists) {
	// 	console.log(chalk.red('Error: Cannot find a .plopifyrc.json in'), chalk.blue.underline(projectDir));
	// 	process.exit(1);
	// }
	//
	// // TODO: Make sure the current plopify version is compatible
	// const ejectedConfig = loader(EjectedRCSchema).loadConfigFile(plopifyJson);
	//
	// // Prepare for staging
	// const {templateDir, stagingDir} = setup(ejectedConfig.templateLocation);
	// const templateConfig = loader(RCSchema).loadConfigFile(path.resolve(templateDir, '.plopifyrc.js'));
	//
	// // TODO: detect added or removed questions
	// const answers: {[key: string]: any} = options.prompts ? await inquirer.prompt(templateConfig.prompts) : ejectedConfig.answers;
	// const stagingCopyDir = path.resolve(stagingDir, 'project');
	//
	// // await runHooks(arrayify(templateConfig.hooks.preUpdate), answers, projectDir);
	//
	// // Re-generate temporary copy for comparison, then compare with live project and merge
	// await renderTemplate(ejectedConfig.templateLocation, templateDir, answers, stagingCopyDir);
	// const stats = await updateProject(stagingCopyDir, projectDir, templateConfig.updatePolicies);
	// cleanUpStaging();
	//
	// // await runHooks(arrayify(templateConfig.hooks.postUpdate), answers, projectDir);
	//
	// console.log();
	// console.log(
	// 	(stats.added + stats.removed + stats.modified + stats.manualMerge) ?
	// 		chalk.bold.bgGreen(' SUCCESS ') :
	// 		(chalk.bold.bgYellow(' SUCCESS ') + ' (no changes)')
	// );
	// if (stats.added) console.log(chalk.yellow('+ ' + stats.added), 'files added');
	// if (stats.removed) console.log(chalk.yellow('- ' + stats.removed), 'files removed');
	// if (stats.modified) console.log(chalk.yellow('± ' + stats.modified), 'files modified');
	// if (stats.manualMerge) console.log(chalk.yellowBright('? ' + stats.manualMerge), 'files need manual merging');
};
