import * as fse from 'fs-extra';
import * as fg from 'fast-glob';
import * as path from 'path';

/**
 * path.resolve() without windows separators.
 */
const unixResolve = (...pathSegments: string[]) => path.resolve(...pathSegments).replace(/\\/g, '/');

/**
 * Creates a unique directory within test/integration/testing-grounds and returns the path.
 */
export const reserveTestingDir = (): string => {
	const dirName = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);
	const fullDir = path.resolve(__dirname, 'testing-grounds', dirName);

	fse.mkdirpSync(fullDir);

	return fullDir;
};

/**
 * Clears out any artifacts left in test/integration/testing-grounds.
 */
export const cleanTestingGrounds = () => {
	fg
		.sync(unixResolve(__dirname, 'testing-grounds/*'), {onlyDirectories: true})
		.forEach(dir => fse.removeSync(dir));
};
