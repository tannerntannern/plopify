import 'mocha';
import { expect } from 'chai';
import { unique, intersection, union, difference, arrayify } from '../../../src/util/arrays';

describe('Array utilities', () => {
	describe('unique()', () => {
		it('should work on empty arrays', () => {
			expect(unique([])).to.deep.equal([]);
		});

		it('should return the same array for an array that is already unique', () => {
			expect(unique([1, 2, 3, 4])).to.deep.equal([1, 2, 3, 4]);
		});

		it('should filter out duplicate values', () => {
			expect(unique([1, 1, 2, 3, 3, 4])).to.deep.equal([1, 2, 3, 4]);
		});
	});

	describe('intersection()', () => {
		it('should return an empty when either of the inputs are empty arrays', () => {
			expect(intersection([], [])).to.deep.equal([]);
			expect(intersection([1, 2, 3], [])).to.deep.equal([]);
			expect(intersection([], [1, 2, 3])).to.deep.equal([]);
		});

		it('should return an empty array when there is no overlap', () => {
			expect(intersection([1, 2, 3], [4, 5, 6])).to.deep.equal([]);
		});

		it('should return the intersection for the standard case', () => {
			expect(intersection([1, 2, 3, 4], [3, 4, 5, 6])).to.deep.equal([3, 4]);
		});
	});

	describe('union()', () => {
		it('should return an empty array for empty-array inputs', () => {
			expect(union([], [])).to.deep.equal([]);
		});

		it('should return the non-empty array when one of the inputs is an empty array', () => {
			expect(union([1, 2, 3], [])).to.deep.equal([1, 2, 3]);
			expect(union([], [1, 2, 3])).to.deep.equal([1, 2, 3]);
		});

		it('should return the union for the standard case', () => {
			expect(union([1, 2, 3], [3, 4, 4, 5, 6])).to.deep.equal([1, 2, 3, 4, 5, 6]);
		});
	});

	describe('difference()', () => {
		it('should return an empty array for empty inputs', () => {
			expect(difference([], [])).to.deep.equal([]);
		});
		
		it('should return the minuend when the subtrahend is empty', () => {
			expect(difference([1, 2, 3], [])).to.deep.equal([1, 2, 3]);
		});

		it('should return an empty array when the subtrahend is empty, regardless of the minuend', () => {
			expect(difference([], [1, 2, 3])).to.deep.equal([]);
			expect(difference([], [1])).to.deep.equal([]);
		});

		it('should return an empty array when both inputs are equal', () => {
			expect(difference([1, 2, 3], [1, 2, 3])).to.deep.equal([]);
		});

		it('should return the difference for the standard case', () => {
			expect(difference([1, 2, 3, 4], [2, 4])).to.deep.equal([1, 3]);
		});
	});

	describe('arrayify()', () => {
		it('should return an empty array for null input', () => {
			expect(arrayify(null)).to.deep.equal([]);
		});

		it('should return an array with one element when a string is passed', () => {
			expect(arrayify('string')).to.deep.equal(['string']);
		});

		it('should return the input if the input is an array', () => {
			expect(arrayify(['a', 'b', 'c'])).to.deep.equal(['a', 'b', 'c']);
		});
	});
});
