import 'mocha';
import {expect} from 'chai';
import * as sinon from 'sinon';

import {sleep} from '../../../src/util/misc';
import {progressPromise} from '../../../src/util/progress-promise';

describe('progressPromise(...)', () => {
	describe('using it as a regular Promise', () => {
		const asyncTask = (success: boolean) => progressPromise<string>((resolve, reject) => {
			if (success) resolve('value'); else reject();
		});

		it('should resolve properly', async () => {
			let resolver = sinon.fake();

			await asyncTask(true).then(resolver);

			expect(resolver.calledOnceWith('value')).to.be.true;
		});

		it('should reject properly', async () => {
			let rejector = sinon.fake();

			await asyncTask(false).catch(rejector);

			expect(rejector.calledOnce).to.be.true;
		});
	});

	describe('using it with `.status(...)`', () => {
		const buildArray = () => progressPromise<number[]>(async (resolve, reject, status) => {
			// Simulate computational delay so the `.status(...)` call has enough time to actually override the default
			await sleep(10);

			let array = [];
			for (let i = 0; i < 3; i ++) {
				status({msg: 'Pushing data', value: i});
				array.push(i);
			}
			resolve(array);
		});

		it('should properly report status', async () => {
			const onStatus = sinon.fake();

			await (buildArray().status(onStatus));

			expect(onStatus.callCount).to.equal(3);
			expect(onStatus.calledWith({msg: 'Pushing data', value: 0})).to.be.true;
			expect(onStatus.calledWith({msg: 'Pushing data', value: 1})).to.be.true;
			expect(onStatus.calledWith({msg: 'Pushing data', value: 2})).to.be.true;
		});
	});
});
