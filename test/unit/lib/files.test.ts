import * as mock from 'mock-fs';
import 'mocha';
import {expect} from 'chai';

import {readFile, readFileLines, getFileList} from '../../../src/lib/files';

describe('File utilities', () => {
	before(() => mock({
		'real-file.txt': 'a\nb\nc'
	}));

	after(() => mock.restore());

	describe('readFile()', () => {
		it('should return null when the file does not exist', () => {
			expect(readFile('fake-file.txt')).to.equal(null);
		});

		it('should return file contents when the file does exist', () => {
			expect(readFile('real-file.txt')).to.equal('a\nb\nc');
		});
	});

	describe('readFileLines()', () => {
		it('should return null when the file does not exist', () => {
			expect(readFileLines('fake-file.txt')).to.equal(null);
		});

		it('should return the file contents as an array of lines when the file does exist', () => {
			expect(readFileLines('real-file.txt')).to.deep.equal(['a', 'b', 'c']);
		});
	});

	describe('getFileList', () => {
		// TODO: ...
	});
});
