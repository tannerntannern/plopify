import * as fs from 'fs';
import * as fg from 'fast-glob';
import * as path from 'path';

/**
 * Attempts to read a file if it exists and returns its string content.  Otherwise returns null.
 */
export const readFile = (file: string): string | null => {
	if (fs.existsSync(file)) return fs.readFileSync(file, 'utf8');
	else return null;
};

/**
 * Like readFile(), but returns an array of lines.
 */
export const readFileLines = (file: string): string[] | null => {
	const content = readFile(file);

	if (content)
		return content.split(/[\r\n]+/).filter(line => line.trim() !== '');
	else
		return null;
};

/**
 * Gets a (relative) list of all the files in a given directory, excluding those in the given ignore list.
 */
export const getFileList = (dir: string, ignore: string[]) => {
	const trim = path.resolve(dir).length + 1; // path must be resolved because the input dir might not be
	const absoluteIgnore = ignore.map(file => path.resolve(dir, file));

	const files = fg
		.sync(path.resolve(dir, '**/*'), {dot: true, ignore: absoluteIgnore})
		.map((file: string) => file.substr(trim));

	return files;
};
