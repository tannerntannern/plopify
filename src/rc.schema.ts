import * as t from 'io-ts';

const QuestionType = t.keyof({
	input: null,
	confirm: null,
	list: null,
	rawlist: null,
	expand: null,
	checkbox: null,
	password: null,
	editor: null
});

const QuestionChoice = t.union([
	t.string,
	t.type({
		name: t.string,
		value: t.string,
		short: t.string
	}),
]);

const Question = t.union([
	t.type({
		name: t.string,
	}),
	t.partial({
		type: QuestionType,
		message: t.union([t.string, t.Function]),
		default: t.union([t.string, t.number, t.boolean, t.array(t.unknown), t.Function]),
		choices: t.union([
			t.Function,
			t.readonlyArray(QuestionChoice)
		]),
		validate: t.Function,
		filter: t.Function,
		transformer: t.Function,
		when: t.union([t.Function, t.boolean]),
		prefix: t.string,
		suffix: t.string
	})
]);

export let RCSchema = t.type({
	templateVersion: t.string,
	stagingDir: t.string,
	prompts: t.array(Question),
	ignore: t.array(t.string)
});

export let EjectedRCSchema = t.union([
	RCSchema,
	t.type({
		plopifyVersion: t.string,
	})
]);
