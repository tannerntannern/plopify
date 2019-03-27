import 'mocha';
import {expect} from 'chai';
import * as sinon from 'sinon';

import {covenant} from '../../../src/util/covenant';

// TODO: add more tests for the new covenant() API

describe('covenant(...)', () => {
	describe('as "normal" promise', () => {
		const simplePromiseLikeFunction = (succeed: boolean) => covenant<string>((resolve, reject) => {
			if (succeed) resolve('result');
			else reject('somethin aint right');
		});

		it('should resolve properly', async () => {
			const then = sinon.fake();

			await (simplePromiseLikeFunction(true).promise().then(then));

			expect(then.calledOnceWithExactly('result')).to.be.true;
		});

		it('should reject properly', async () => {
			const catcher = sinon.fake();

			await (simplePromiseLikeFunction(false).promise().catch(catcher));

			expect(catcher.calledOnceWithExactly('somethin aint right')).to.be.true;
		});
	});

	describe('with status reporting', () => {
		const buildArray = () => covenant<number[]>(async (resolve, reject, status) => {
			let array = [];
			for (let i = 0; i < 3; i ++) {
				status({msg: 'Pushing data', value: i});
				array.push(i);
			}
			resolve(array);
		});

		it('should resolve properly', async () => {
			const then = sinon.fake();

			await (buildArray().promise().then(then));

			expect(then.calledOnceWithExactly([0, 1, 2])).to.be.true;
		});

		it('should properly report status', async () => {
			const onStatus = sinon.fake();

			await (buildArray().status(onStatus).promise());

			expect(onStatus.callCount).to.equal(3);
			expect(onStatus.calledWith({msg: 'Pushing data', value: 0})).to.be.true;
			expect(onStatus.calledWith({msg: 'Pushing data', value: 1})).to.be.true;
			expect(onStatus.calledWith({msg: 'Pushing data', value: 2})).to.be.true;
		});
	});

	describe('with input requests', () => {
		const postInputSpy = sinon.fake();
		const getPassword = () => covenant<number, string, any>(async (resolve, reject, status, input) => {
			status('asking for password');
			const password = await input('password');
			postInputSpy();
			status('got password');
			const passwordLength = password.length;
			resolve(passwordLength);
		});

		it('should throw an error if no .input() is used', () => {
			getPassword().promise().catch(error => {
				expect(postInputSpy.notCalled).to.be.true;
				expect(error.message).to.equal('Input "password" must be supplied');
			});
		});

		it('should receive the input properly', async () => {
			const inputReceiver = sinon.fake.resolves('pa$$word');
			const statusReceiver = sinon.fake();

			const passwordLength = await (getPassword().input(inputReceiver).status(statusReceiver).promise());

			expect(passwordLength).to.equal(8);
			expect(inputReceiver.calledOnceWithExactly('password')).to.be.true;
			expect(inputReceiver.calledAfter(statusReceiver)).to.be.true;
			expect(inputReceiver.calledBefore(statusReceiver)).to.be.true;
			expect(statusReceiver.callCount).to.equal(2);
			expect(statusReceiver.calledWithExactly('asking for password')).to.be.true;
			expect(statusReceiver.calledWithExactly('got password')).to.be.true;
		});
	});
});
