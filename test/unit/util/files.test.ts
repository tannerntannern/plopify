import * as mock from 'mock-fs';
import 'mocha';
import {expect} from 'chai';

import {readFile, readFileLines, getFileList} from '../../../src/util/files';

describe('File utilities', () => {
	before(() => mock({
		'real-file.txt': 'a\nb\nc',
		'js-dir': {
			'ignored-dir': {
				'file1.js': '12345',
				'file2.js': '12345',
				'file3.js': '12345'
			},
			'included-dir': {
				'file1.js': '12345',
				'file2.js': '12345',
				'file3.js': '12345'
			},
			'file.good.js': 'content',
			'file2.good.js': 'content',
			'file.bad.js': 'content'
		}
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

	describe('getFileList()', () => {
		it('should return files relative to the input base dir', () => {
			const files1 = getFileList('.', ['**/*.txt']);
			expect(files1.length).to.be.greaterThan(0);
			for (let file of files1) {
				expect(file.startsWith('js-dir')).to.be.true;
			}

			const files2 = getFileList('js-dir/', []);
			expect(files2.length).to.be.greaterThan(0);
			for (let file of files2) {
				expect(file.startsWith('js-dir')).to.be.false;
			}
		});

		it('should properly ignore files', () => {
			const files = getFileList('js-dir/', ['*.bad.js', 'ignored-dir/']);

			expect(files).to.have.members([
				'included-dir/file1.js',
				'included-dir/file2.js',
				'included-dir/file3.js',
				'file.good.js',
				'file2.good.js'
			]);
			expect(files).to.not.have.members([
				'ignored-dir/file1.js',
				'ignored-dir/file2.js',
				'ignored-dir/file3.js',
				'file.bad.js'
			]);
		});
	});
});
