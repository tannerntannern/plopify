import * as t from 'io-ts';
import {fallback} from 'io-ts-types';

const Question = t.type({
	type: t.string,
	name: t.string,
});

export let PlopifyRuntimeConfig = t.type({
	templateVersion: t.string,
	stagingDir: t.string,
	prompts: t.array(Question),
	ignore: t.array(t.string)
});

// type ejectedPlopifyRuntimeConfig = {
// 	plopifyVersion: string,
// 	data: {[key: string]: any}
// };
