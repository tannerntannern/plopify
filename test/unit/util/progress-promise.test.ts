import 'mocha';
import {expect} from 'chai';
import * as sinon from 'sinon';

import {progressPromise} from '../../../src/util/progress-promise';

describe('progressPromise(...)', () => {
	const buildArray = () => progressPromise<number[]>(async (resolve, reject, status) => {
		let array = [];
		for (let i = 0; i < 3; i ++) {
			status({msg: 'Pushing data', value: i});
			array.push(i);
		}
		resolve(array);
	});

	it('should resolve properly', async () => {
		const then = sinon.fake();

		await (buildArray().status(() => {}).then(then));

		expect(then.calledOnceWithExactly([0, 1, 2])).to.be.true;
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
