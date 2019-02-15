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
		it('should return an empty when either of the inputs are empty arrays', function(){
			expect(intersection([], [])).to.deep.equal([]);
			expect(intersection([1, 2, 3], [])).to.deep.equal([]);
			expect(intersection([], [1, 2, 3])).to.deep.equal([]);
		});

		it('should return an empty array when there is no overlap', function(){
			expect(intersection([1, 2, 3], [4, 5, 6])).to.deep.equal([]);
		});

		it('should return the intersection for the standard case', function(){
			expect(intersection([1, 2, 3, 4], [3, 4, 5, 6])).to.deep.equal([3, 4]);
		});
	});

	describe('union()', function(){
		it('should return an empty array for empty-array inputs', function(){
			expect(union([], [])).to.deep.equal([]);
		});

		it('should return the non-empty array when one of the inputs is an empty array', function(){
			expect(union([1, 2, 3], [])).to.deep.equal([1, 2, 3]);
			expect(union([], [1, 2, 3])).to.deep.equal([1, 2, 3]);
		});

		it('should return the union for the standard case', function(){
			expect(union([1, 2, 3], [3, 4, 4, 5, 6])).to.deep.equal([1, 2, 3, 4, 5, 6]);
		});
	});

	describe('difference()', function(){
		it('should return an empty array for empty inputs', function(){
			expect(difference([], [])).to.deep.equal([]);
		});
		
		it('should return the minuend when the subtrahend is empty', function(){
			expect(difference([1, 2, 3], [])).to.deep.equal([1, 2, 3]);
		});

		it('should return an empty array when the subtrahend is empty, regardless of the minuend', function(){
			expect(difference([], [1, 2, 3])).to.deep.equal([]);
			expect(difference([], [1])).to.deep.equal([]);
		});

		it('should return an empty array when both inputs are equal', function(){
			expect(difference([1, 2, 3], [1, 2, 3])).to.deep.equal([]);
		});

		it('should return the difference for the standard case', function(){
			expect(difference([1, 2, 3, 4], [2, 4])).to.deep.equal([1, 3]);
		});
	});

	describe('arrayify()', function(){
		it('should return an empty array for null input', function(){
			expect(arrayify(null)).to.deep.equal([]);
		});

		it('should return an array with one element when a string is passed', function(){
			expect(arrayify('string')).to.deep.equal(['string']);
		});

		it('should return the input if the input is an array', function(){
			expect(arrayify(['a', 'b', 'c'])).to.deep.equal(['a', 'b', 'c']);
		});
	});
});
