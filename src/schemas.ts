import * as t from 'io-ts';
import {withDefault} from 'rc.ts';

const StringOrArray = t.union([t.string, t.array(t.string)]);

const QuestionType = t.keyof({
	input: null,
	confirm: null,
	list: null,
	rawlist: null,
	expand: null,
	checkbox: null,
	password: null,
	editor: null,
	// Plugins
	emoji: null,
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

const Action = t.keyof({
	accept: null,
	ignore: null,
	ask: null,
});
const Granularity = t.keyof({
	wholeFile: null,
	blocks: null,
	lines: null,
	jsonKeys: null
});

const UpdatePolicy = t.intersection([
	t.type({
		pattern: withDefault(StringOrArray, '**/*'),
		patternFromFile: withDefault(StringOrArray, []),
		action: withDefault(Action, 'ask'),
	}),
	t.union([
		t.type({
			granularity: withDefault(t.keyof({wholeFile: null, lines: null}), 'wholeFile')
		}),
		t.type({
			granularity: t.literal('blocks'),
			exceptions: withDefault(t.record(t.string, Action), {})
		}),
		t.type({
			granularity: t.literal('jsonKeys'),
			exceptions: withDefault(t.record(
				t.string,
				t.union([
					Action,
					t.type({
						action: Action,
						recursive: withDefault(t.boolean, false)
					})
				])
			), {})
		})
	])
]);

export let RCSchema = t.type({
	prompts: t.array(Question),
	updatePolicies: t.array(UpdatePolicy),
	hooks: t.type({
		preGenerate: withDefault(StringOrArray, []),
		postGenerate: withDefault(StringOrArray, []),
		preUpdate: withDefault(StringOrArray, []),
		postUpdate: withDefault(StringOrArray, [])
	})
});

export let EjectedRCSchema = t.type({
	plopifyVersion: t.string,
	templateLocation: t.string,
	answers: t.record(t.string, t.string)
});

export let VisibleGlobalConfigSchema = t.type({
	githubUsername: withDefault(t.string, ''),
	githubPersonalAccessToken: withDefault(t.string, ''),
	travisCiApiToken: withDefault(t.string, ''),
	coverallsPersonalApiToken: withDefault(t.string, ''),
});

export let InvisibleGlobalConfigSchema = t.type({
	// TODO: this should really be called passwordHash to avoid confusion
	password: withDefault(t.string, ''),
});

export let GlobalConfigSchema = t.intersection([VisibleGlobalConfigSchema, InvisibleGlobalConfigSchema]);
