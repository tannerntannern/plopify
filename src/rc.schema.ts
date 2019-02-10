import * as t from 'io-ts';
import {withDefault} from 'rc.ts';

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

const Question = t.intersection([
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

const ChangeHandler = t.keyof({
	accept: null,
	reject: null,
	ask: null,
	askAccept: null,
	askReject: null
});

const Type = t.keyof({
	ignore: null,
	wholeFile: null,
	lines: null,
	jsonKeys: null,
	blocks: null
});

const UpdatePolicyBase = t.type({
	type: Type,
	files: t.union([t.string, t.array(t.string)]),
});

const UpdatePolicy = t.intersection([
	UpdatePolicyBase,
	t.union([
		t.type({
			type: t.literal('ignore'),
			includeGitignore: withDefault(t.boolean, true)
		}),
		t.intersection([
			t.type({
				defaultHandler: withDefault(ChangeHandler, 'ask')
			}),
			t.union([
				t.type({
					type: t.keyof({
						wholeFile: null,
						lines: null,
					})
				}),
				t.type({
					type: t.literal('jsonKeys'),
					handlers: withDefault(t.record(
						t.string,
						t.union([
							ChangeHandler,
							t.type({
								handler: ChangeHandler,
								children: withDefault(t.boolean, false)
							})
						])
					), {})
				}),
				t.type({
					type: t.literal('blocks'),
					handlers: withDefault(t.record(t.string, ChangeHandler), {})
				})
			])
		])
	])
]);

export let RCSchema = t.type({
	prompts: t.array(Question),
	updatePolicies: t.array(UpdatePolicy),
	hooks: withDefault(t.partial({
		preGenerate: t.string,
		postGenerate: t.string,
		preUpdate: t.string,
		postUpdate: t.string
	}), {})
});

export let EjectedRCSchema = t.intersection([
	RCSchema,
	t.type({
		plopifyVersion: t.string,
		templateLocation: t.string,
		answers: t.record(t.string, t.string)
	})
]);
