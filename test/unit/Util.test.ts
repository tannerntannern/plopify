import 'mocha';
import {expect} from 'chai';
import {unique, intersection, union, difference, arrayify} from '../../src/util';

describe('Utility functions', function(){
	describe('unique()', function(){
		it('should work on empty arrays', function(){
			expect(unique([])).to.deep.equal([]);
		});

		it('should return the same array for an array that is already unique', function(){
			expect(unique([1, 2, 3, 4])).to.deep.equal([1, 2, 3, 4]);
		});

		it('should filter out duplicate values', function(){
			expect(unique([1, 1, 2, 3, 3, 4])).to.deep.equal([1, 2, 3, 4]);
		});
	});

	describe('intersection()', function(){
		// TODO: ...
	});

	describe('union()', function(){
		// TODO: ...
	});

	describe('difference()', function(){
		// TODO: ...
	});

	describe('arrayify()', function(){
		// TODO: ...
	});
});
