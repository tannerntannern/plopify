import 'mocha';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { reserveTestingDir, cleanTestingGrounds } from '../util';

import * as fg from 'fast-glob';
import * as path from 'path';

import { init } from '../../../src/api';

describe('API: init()', () => {
	let testingDir: string;
	before(() => {
		testingDir = reserveTestingDir();
	});
	after(() => cleanTestingGrounds());

	it('should generate files and report status properly', async () => {
		const output = sinon.fake();

		const result = (await init(testingDir).output(output).promise());
		const actualFileCount = fg.sync(path.resolve(testingDir, '**/*'), { dot: true }).length;

		expect(result.files).to.equal(actualFileCount);
		expect(output.callCount).to.equal(3);
		expect(output.calledWithExactly({ type: 'newTask', task: 'Copying files' })).to.be.true;
		expect(output.calledWithExactly({ type: 'taskComplete', status: true })).to.be.true;
	});
});
