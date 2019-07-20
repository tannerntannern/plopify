import * as fs from 'fs';
import * as fse from 'fs-extra';
import * as path from 'path';

import { getFileList } from '../util/files';
import { renderString } from '../util/templates';
import { EjectedRCSchema, RCSchema } from '../schema/plopifyrc';
import { StagingEnv } from '../lib/staging-env';
import { standardAdapter } from '../util/standardAdapter';

const packageJson = require('../../package.json');

/**
 * Takes a templateDir and generates a new instance to outDir using the given data.
 */
export const renderTemplate = (staging: StagingEnv, data: {[key: string]: any}, outDir: string) => standardAdapter(async (input, output) => {
	output({ type: 'newTask', task: 'Generating project' });

	// Collect the relative file paths/names of every file in the template (excluding .plopifyrc.js)
	const templateDir = staging.templateDir();
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
		templateLocation: staging.templateLocation(),
		answers: data
	});
	fs.writeFileSync(path.resolve(outDir, '.plopifyrc.json'), JSON.stringify(plopifyRcData, null, 2));

	output({ type: 'taskComplete', status: true });

	const totalFiles = templateFiles.length + 1;
	return {
		prettyMessage: totalFiles + ' files generated',
		data: {
			files: totalFiles
		}
	};
});
