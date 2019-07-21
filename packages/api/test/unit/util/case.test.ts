import 'mocha';
import { expect } from 'chai';
import {unCamel} from '../../../src/util/case';

describe('Case Utilities', () => {
	describe('unCamel()', () => {
		describe('edge cases', () => {
			it('should work with an empty string', () => {
				expect(unCamel('')).to.equal('');
			});

			it('should work with a single word', () => {
				expect(unCamel('apple')).to.equal('apple');
			});
		});

		describe('typical use cases', () => {
			it('should work with regular input', () => {
				expect(unCamel('thisIsCamelCase')).to.equal('this is camel case');
			});
		});
	});
});
